/**
 * gloveStorage.ts — Supabase-backed cloud sync
 *
 * Strategy:
 *  - PIN logic stays local (device-level lock, no server round-trip needed)
 *  - GloveSettings + GloveProfiles sync to Supabase when a user is logged in
 *  - Falls back to localStorage when not authenticated (guest mode)
 *
 * DB table (run once in Supabase SQL editor):
 *
 *   create table glove_settings (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid references auth.users(id) on delete cascade not null unique,
 *     settings jsonb not null default '{}',
 *     profiles jsonb not null default '[]',
 *     updated_at timestamptz default now()
 *   );
 *
 *   alter table glove_settings enable row level security;
 *
 *   create policy "Own settings only" on glove_settings
 *     for all using (auth.uid() = user_id);
 */

import { supabase } from "./supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GloveSettings {
  vibrationIntensity: number; // 0–100
  detectionRangeM: number;    // 0.3–5
  sensitivityCurve: "linear" | "soft" | "aggressive";
  activeProfile: string;
}

export interface GloveProfile {
  name: string;
  settings: GloveSettings;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: GloveSettings = {
  vibrationIntensity: 70,
  detectionRangeM: 2,
  sensitivityCurve: "linear",
  activeProfile: "default",
};

export const DEFAULT_PROFILES: GloveProfile[] = [
  { name: "default", settings: DEFAULT_SETTINGS },
  {
    name: "indoor",
    settings: { vibrationIntensity: 55, detectionRangeM: 1.2, sensitivityCurve: "soft", activeProfile: "indoor" },
  },
  {
    name: "outdoor",
    settings: { vibrationIntensity: 80, detectionRangeM: 3, sensitivityCurve: "linear", activeProfile: "outdoor" },
  },
  {
    name: "crowded",
    settings: { vibrationIntensity: 90, detectionRangeM: 1.5, sensitivityCurve: "aggressive", activeProfile: "crowded" },
  },
];

// ─── Local storage keys (guest / PIN) ────────────────────────────────────────

const PIN_KEY        = "sg-pin-hash";
const PIN_SALT_KEY   = "sg-pin-salt";
const SETTINGS_KEY   = "sg-glove-settings";
const PROFILES_KEY   = "sg-glove-profiles";
const LOCKOUT_KEY    = "sg-pin-lockout";
const FAILS_KEY      = "sg-pin-fails";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getOrCreateSalt(): string {
  let salt = localStorage.getItem(PIN_SALT_KEY);
  if (!salt) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    salt = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(PIN_SALT_KEY, salt);
  }
  return salt;
}

async function getAuthUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

// ─── PIN (always local) ───────────────────────────────────────────────────────

export function hasPin(): boolean {
  return !!localStorage.getItem(PIN_KEY);
}

export async function setPin(pin: string): Promise<void> {
  const salt = getOrCreateSalt();
  const hash = await sha256Hex(salt + ":" + pin);
  localStorage.setItem(PIN_KEY, hash);
  localStorage.removeItem(FAILS_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return false;
  const salt = getOrCreateSalt();
  const hash = await sha256Hex(salt + ":" + pin);
  const ok = hash === stored;
  if (ok) {
    localStorage.removeItem(FAILS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  } else {
    const fails = Number(localStorage.getItem(FAILS_KEY) || "0") + 1;
    localStorage.setItem(FAILS_KEY, String(fails));
    if (fails >= 5) {
      localStorage.setItem(LOCKOUT_KEY, String(Date.now() + 30_000));
      localStorage.setItem(FAILS_KEY, "0");
    }
  }
  return ok;
}

export function getLockoutRemainingMs(): number {
  const until = Number(localStorage.getItem(LOCKOUT_KEY) || "0");
  const rem = until - Date.now();
  return rem > 0 ? rem : 0;
}

// ─── Settings (cloud when logged in, localStorage as fallback) ────────────────

/** Load settings. Prefers Supabase; falls back to localStorage. */
export async function getSettings(): Promise<GloveSettings> {
  const userId = await getAuthUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("glove_settings")
      .select("settings")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data?.settings) {
      return { ...DEFAULT_SETTINGS, ...(data.settings as GloveSettings) };
    }
  }

  // Guest fallback
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

/** Save settings. Upserts to Supabase when logged in, localStorage otherwise. */
export async function saveSettings(s: GloveSettings): Promise<void> {
  const userId = await getAuthUserId();

  if (userId) {
    await supabase
      .from("glove_settings")
      .upsert(
        { user_id: userId, settings: s, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
  }

  // Always mirror locally so the Settings page works offline / while loading
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ─── Profiles (cloud when logged in, localStorage as fallback) ────────────────

export async function getProfiles(): Promise<GloveProfile[]> {
  const userId = await getAuthUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("glove_settings")
      .select("profiles")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && Array.isArray(data?.profiles) && data.profiles.length > 0) {
      return data.profiles as GloveProfile[];
    }
  }

  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  await saveProfiles(DEFAULT_PROFILES);
  return [...DEFAULT_PROFILES];
}

export async function saveProfiles(p: GloveProfile[]): Promise<void> {
  const userId = await getAuthUserId();

  if (userId) {
    await supabase
      .from("glove_settings")
      .upsert(
        { user_id: userId, profiles: p, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
  }

  localStorage.setItem(PROFILES_KEY, JSON.stringify(p));
}

// ─── Reset ───────────────────────────────────────────────────────────────────

/** Clears local PIN + cached data. Does NOT delete the Supabase row. */
export function resetAll(): void {
  [PIN_KEY, PIN_SALT_KEY, SETTINGS_KEY, PROFILES_KEY, LOCKOUT_KEY, FAILS_KEY]
    .forEach((k) => localStorage.removeItem(k));
}

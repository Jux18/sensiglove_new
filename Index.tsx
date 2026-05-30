import { supabase } from "./supabase";

/** Sign up with email + password. Supabase can send a confirmation email. */
export async function registerUser(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      throw new Error("USER_EXISTS");
    }
    throw new Error(error.message);
  }
}

/** Sign in with email + password. */
export async function loginUser(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("invalid login") ||
      error.message.toLowerCase().includes("invalid credentials")
    ) {
      throw new Error("WRONG_PASSWORD");
    }
    throw new Error(error.message);
  }
}

/** Sign out. */
export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Returns the email of the currently signed-in user, or null. */
export async function getCurrentUser(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user.email ?? null;
}

/** Send a password-reset email. */
export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: window.location.origin,
  });
  if (error) throw new Error(error.message);
}

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function.
 */
export function onAuthChange(callback: (email: string | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user.email ?? null);
  });

  return () => subscription.unsubscribe();
}

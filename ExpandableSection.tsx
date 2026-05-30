import { useState, useEffect } from "react";
import { Eye, EyeOff, Wifi } from "lucide-react";
import ReadAloudButton from "@/components/ReadAloudButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lang, t } from "@/lib/translations";
import { loginUser, registerUser, sendPasswordReset } from "@/lib/auth";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: Lang;
  onAuthenticated?: (email: string) => void;
}

const AuthDialog = ({ open, onOpenChange, lang, onAuthenticated }: AuthDialogProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showWifi, setShowWifi] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const T = (k: string) => t(k, lang);

  const isLogin = mode === "login";
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordIsValid = password.length >= 8;
  const canSubmit = emailIsValid && passwordIsValid;

  useEffect(() => {
    if (!open) {
      setShowWifi(false);
      setShowReset(false);
      setResetSent(false);
      setResetError(null);
      setConfirmationSent(false);
    }
  }, [open]);

  useEffect(() => {
    setAuthError(null);
  }, [mode, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    setBusy(true);
    setAuthError(null);
    try {
      if (isLogin) {
        await loginUser(email, password);
        onAuthenticated?.(email.trim().toLowerCase());
        setShowWifi(true);
      } else {
        await registerUser(email, password);
        // Supabase sends a confirmation email — show info instead of wifi dialog
        setConfirmationSent(true);
      }
    } catch (err) {
      const code = (err as Error)?.message;
      if (code === "USER_EXISTS") setAuthError(T("authUserExists"));
      else if (code === "NO_USER") setAuthError(T("authNoUser"));
      else if (code === "WRONG_PASSWORD") setAuthError(T("authWrongPassword"));
      else setAuthError(code || "Error");
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) return;
    setResetBusy(true);
    setResetError(null);
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetSent(true);
    } catch (err) {
      setResetError((err as Error)?.message || "Error");
    } finally {
      setResetBusy(false);
    }
  };

  // ── Confirmation screen (after register) ──────────────────────────────────
  if (confirmationSent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{T("authConfirmTitle")}</DialogTitle>
            <DialogDescription>{T("authConfirmDescription")}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{T("authConfirmHint")}</p>
          <button
            type="button"
            onClick={() => { setConfirmationSent(false); setMode("login"); setPassword(""); }}
            className="w-full rounded-md bg-primary text-primary-foreground font-semibold py-2.5 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {T("authBackToLogin")}
          </button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* ── Main login / register dialog ─────────────────────────────────── */}
      <Dialog open={open && !showWifi && !showReset} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 pr-8">
              <DialogTitle>{isLogin ? T("authLoginTitle") : T("authRegisterTitle")}</DialogTitle>
              <ReadAloudButton
                lang={lang}
                label={isLogin ? T("authLoginTitle") : T("authRegisterTitle")}
                text={`${isLogin ? T("authLoginTitle") : T("authRegisterTitle")}. ${T("authEmail")}. ${T("authPassword")}. ${T("authPasswordPlaceholder")}. ${isLogin ? T("authNoAccount") : T("authHasAccount")} ${isLogin ? T("authSwitchRegister") : T("authSwitchLogin")}.`}
              />
            </div>
            <DialogDescription>
              {isLogin ? T("authNoAccount") : T("authHasAccount")}{" "}
              <button
                type="button"
                onClick={() => setMode(isLogin ? "register" : "login")}
                className="text-primary underline underline-offset-4 hover:opacity-80"
              >
                {isLogin ? T("authSwitchRegister") : T("authSwitchLogin")}
              </button>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="auth-email" className="block text-sm font-medium">
                {T("authEmail")}
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder={T("authEmailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={submitted && !emailIsValid}
                aria-describedby="auth-email-error"
                className="w-full rounded-md border-2 border-border bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
              />
              {!emailIsValid && (email.length > 0 || submitted) && (
                <p id="auth-email-error" className="text-sm font-medium text-destructive">
                  {T("authEmailError")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="auth-password" className="block text-sm font-medium">
                {T("authPassword")}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={T("authPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={submitted && !passwordIsValid}
                  aria-describedby="auth-password-error"
                  className="w-full rounded-md border-2 border-border bg-background px-3 py-2 pr-12 text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? T("authHidePassword") : T("authShowPassword")}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              {!passwordIsValid && (password.length > 0 || submitted) && (
                <p id="auth-password-error" className="text-sm font-medium text-destructive">
                  {T("authPasswordError")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="w-full rounded-md bg-primary text-primary-foreground font-semibold py-2.5 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "…" : isLogin ? T("authLogin") : T("authRegister")}
            </button>

            {authError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {authError}
              </p>
            )}

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setResetEmail(email); setResetSent(false); setResetError(null); }}
                  className="text-sm text-primary underline underline-offset-4 hover:opacity-80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring rounded"
                >
                  {T("authForgotPassword")}
                </button>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Password reset dialog ─────────────────────────────────────────── */}
      <Dialog open={showReset} onOpenChange={(o) => { if (!o) setShowReset(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{T("authResetTitle")}</DialogTitle>
            <DialogDescription>
              {resetSent ? T("authResetEmailSent") : T("authResetDescription")}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <button
              type="button"
              onClick={() => { setShowReset(false); setResetSent(false); }}
              className="w-full rounded-md bg-primary text-primary-foreground font-semibold py-2.5 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {T("authBackToLogin")}
            </button>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <input
                type="email"
                autoComplete="email"
                placeholder={T("authEmailPlaceholder")}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full rounded-md border-2 border-border bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
              />
              {resetError && (
                <p role="alert" className="text-sm font-medium text-destructive">{resetError}</p>
              )}
              <button
                type="submit"
                disabled={resetBusy}
                className="w-full rounded-md bg-primary text-primary-foreground font-semibold py-2.5 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {resetBusy ? "…" : T("authResetButton")}
              </button>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="w-full rounded-md border-2 border-border bg-background text-foreground font-semibold py-2.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {T("authResetCancel")}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Wifi connect dialog (shown after successful login) ────────────── */}
      <Dialog open={showWifi} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 pr-8 mb-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Wifi size={24} />
                </div>
                <DialogTitle>{T("wifiTitle")}</DialogTitle>
              </div>
              <ReadAloudButton
                lang={lang}
                label={T("wifiTitle")}
                text={`${T("wifiTitle")}. ${T("wifiInstruction")} ${T("wifiNetwork")}: SensiGlove.`}
              />
            </div>
            <DialogDescription>{T("wifiInstruction")}</DialogDescription>
          </DialogHeader>

          <div className="rounded-md border-2 border-border bg-muted px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{T("wifiNetwork")}</span>
            <span className="font-mono font-semibold">SensiGlove</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              window.open("http://192.168.4.1", "_blank", "noopener");
            }}
            className="w-full rounded-md bg-primary text-primary-foreground font-semibold py-2.5 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {T("wifiDone")}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthDialog;

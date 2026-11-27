import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";
import { resellerApi, type ResellerLanguage } from "../../lib/reseller-api";
import { normalizeLanguage, translator } from "../../lib/reseller-i18n";
import {
  CodeField,
  CopyButton,
  Field,
  LanguageSelect,
  Notice,
  ResellerContext,
  SecretCodes,
  errorText,
} from "./shared";
export default function ResellerLogin() {
  const [language, setLanguage] = useState<ResellerLanguage>("es");
  const t = translator(language);
  const [step, setStep] = useState<
    "login" | "totp" | "enrollment" | "setup" | "recovery"
  >("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<{ secret: string; otpAuthUri: string }>();
  const [qr, setQr] = useState("");
  const [qrFailed, setQrFailed] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    setLanguage(
      normalizeLanguage(
        new URLSearchParams(window.location.search).get("lang") ||
          navigator.language,
      ),
    );
  }, []);
  useEffect(() => {
    document.documentElement.lang = language === "pt-br" ? "pt-BR" : language;
  }, [language]);
  useEffect(() => {
    if (!setup) return;
    let active = true;
    setQrFailed(false);
    QRCode.toDataURL(setup.otpAuthUri, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#090a0b", light: "#ffffff" },
    })
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() => {
        if (active) setQrFailed(true);
      });
    return () => {
      active = false;
    };
  }, [setup]);
  function enter() {
    window.location.replace("/panelreseller");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      if (step === "login") {
        const result = await resellerApi("login", {
          username: username.trim(),
          password,
        });
        setPassword("");
        setVisible(false);
        setChallenge(result.challenge);
        setStep(result.step);
      } else if (step === "enrollment") {
        const result = await resellerApi("enroll/verify", {
          challenge,
          code: code.trim(),
        });
        setSetup(result);
        setStep("setup");
      } else if (step === "setup") {
        const result = await resellerApi("enroll/confirm", {
          challenge,
          code: code.trim(),
        });
        setSetup(undefined);
        setQr("");
        setChallenge("");
        setRecoveryCodes(result.recoveryCodes || []);
        if (result.recoveryCodes?.length) setStep("recovery");
        else enter();
      } else if (step === "totp") {
        await resellerApi("verify", { challenge, code: code.trim() });
        setChallenge("");
        enter();
      }
      setCode("");
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  const title =
    step === "login"
      ? t("login")
      : step === "totp"
        ? t("totpTitle")
        : step === "enrollment"
          ? t("telegramTitle")
          : t("setupTitle");
  return (
    <ResellerContext.Provider value={{ language, t }}>
      <div className="rs-root rs-auth">
        <header className="rs-auth-header">
          <a href="/" className="rs-brand">
            <img
              src="/pngs/arepatool-logo-mark.webp"
              width="36"
              height="36"
              alt=""
            />
            <span>ArepaTool</span>
          </a>
          <LanguageSelect
            language={language}
            onChange={setLanguage}
            disabled={busy}
          />
        </header>
        <main className="rs-auth-main">
          <section className="rs-auth-story">
            <span className="rs-brand-label">{t("workspace")}</span>
            <p>{t("loginIntro")}</p>
            <div className="rs-auth-note">
              <ShieldCheck aria-hidden="true" size={22} />
              <span>{t("loginHelp")}</span>
            </div>
          </section>
          <section className="rs-auth-card" aria-busy={busy}>
            {step === "recovery" ? (
              <SecretCodes
                codes={recoveryCodes}
                onDone={() => {
                  setRecoveryCodes([]);
                  enter();
                }}
              />
            ) : (
              <>
                <div className="rs-auth-symbol">
                  <KeyRound aria-hidden="true" size={24} />
                </div>
                <h1>{title}</h1>
                <p className="rs-muted">
                  {t(
                    step === "login"
                      ? "loginHelp"
                      : step === "totp"
                        ? "totpHelp"
                        : step === "enrollment"
                          ? "telegramHelp"
                          : "setupHelp",
                  )}
                </p>
                <Notice>{error ? errorText(error, t) : null}</Notice>
                <form className="rs-stack" onSubmit={submit}>
                  <fieldset disabled={busy}>
                    {step === "login" ? (
                      <>
                        <Field label={t("username")}>
                          <input
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </Field>
                        <Field label={t("password")}>
                          <span className="rs-password">
                            <input
                              type={visible ? "text" : "password"}
                              autoComplete="current-password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              className="rs-icon-button"
                              aria-label={t(
                                visible ? "hidePassword" : "showPassword",
                              )}
                              aria-pressed={visible}
                              onClick={() => setVisible(!visible)}
                            >
                              {visible ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </span>
                        </Field>
                      </>
                    ) : (
                      <>
                        {step === "setup" && setup && (
                          <div className="rs-setup">
                            {qr && (
                              <img
                                className="rs-qr"
                                src={qr}
                                alt={t("qrAlt")}
                                width="240"
                                height="240"
                              />
                            )}
                            {qrFailed && (
                              <Notice tone="warning">{t("qrFailed")}</Notice>
                            )}
                            <span className="rs-muted">{t("setupKey")}</span>
                            <code className="rs-secret">{setup.secret}</code>
                            <CopyButton text={setup.secret} />
                          </div>
                        )}
                        <CodeField
                          label={
                            step === "enrollment"
                              ? t("telegramCode")
                              : undefined
                          }
                          value={code}
                          onChange={setCode}
                          recovery={step === "totp"}
                        />
                      </>
                    )}
                    <button className="rs-button rs-full" type="submit">
                      {busy
                        ? t("loading")
                        : t(step === "login" ? "login" : "verify")}
                    </button>
                    {step !== "login" && (
                      <button
                        type="button"
                        className="rs-button rs-quiet"
                        onClick={() => {
                          setStep("login");
                          setChallenge("");
                          setCode("");
                          setSetup(undefined);
                          setQr("");
                          setError(undefined);
                        }}
                      >
                        {t("back")}
                      </button>
                    )}
                  </fieldset>
                </form>
                <p className="rs-small rs-muted">{t("loginRecoveryHelp")}</p>
              </>
            )}
          </section>
        </main>
        <footer className="rs-auth-footer">
          <a href="/">
            <ArrowLeft size={15} aria-hidden="true" />
            {t("home")}
          </a>
        </footer>
      </div>
    </ResellerContext.Provider>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import { getClientSafeRedirectPath } from "~/lib/client-safe-redirect";
import { requestEmailOtp, verifyEmailOtp } from "~/lib/auth-api";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath = "/app" }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "verified" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const result = await requestEmailOtp(email);
      setStatus("sent");
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      setMessage(getLoginErrorMessage(error));
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("verifying");
    setMessage("");

    try {
      await verifyEmailOtp(email, otpToken);
      setStatus("verified");
      navigate(getClientSafeRedirectPath(nextPath), { replace: true });
    } catch (error) {
      setStatus("error");
      setMessage(getLoginErrorMessage(error));
    }
  }

  const hasRequestedOtp = status === "sent" || status === "verifying" || status === "verified";

  return (
    <form className="auth-form" onSubmit={hasRequestedOtp ? handleVerifyOtp : handleRequestOtp}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="mads@example.com"
        readOnly={hasRequestedOtp}
      />
      {hasRequestedOtp ? (
        <>
          <label htmlFor="otp-token">Email OTP</label>
          <input
            id="otp-token"
            name="token"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            required
            value={otpToken}
            onChange={(event) => setOtpToken(event.target.value)}
            placeholder="123456"
          />
        </>
      ) : null}
      <Button disabled={status === "sending" || status === "verifying"} type="submit" variant="primary">
        {status === "sending" ? "Sending…" : status === "verifying" ? "Verifying…" : hasRequestedOtp ? "Verify OTP" : "Send email OTP"}
      </Button>
      {message ? <p className={status === "error" ? "error-text" : "success-text"}>{message}</p> : null}
    </form>
  );
}

function getLoginErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Authentication request failed.";
}

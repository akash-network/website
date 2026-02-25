import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";

const PORTAL_ID = "47519938";
const FORM_ID = "2d808d3b-402c-4b34-a9aa-36ffe5026063";

function getCookie(name: string) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    if (!email) {
      setError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setIsSubmitting(true);

    const submission = {
      fields: [{ name: "email", value: email }],
      context: {
        hutk: getCookie("hubspotutk"),
        pageUri: window.location.href,
        pageName: document.title,
      },
    };

    try {
      const res = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submission),
        },
      );

      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError("Submission failed. Please try again.");
      }
    } catch {
      setSubmitError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            You're subscribed!
          </h3>
          <p className="mt-2 text-sm text-para">
            Thank you for signing up. You'll start receiving the latest updates
            from Akash Network shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Newsletter
          </span>
        </div>
        <h2 className="text-2xl font-bold leading-tight text-foreground">
          Sign up for Akash Network's Newsletter
        </h2>
        <p className="text-sm leading-relaxed text-para">
          Enter your email below to stay up to date with the latest from Akash
          Network.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {submitError && (
          <div className="rounded-md bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="subscribe-email"
            className="text-sm font-medium text-foreground/80"
          >
            Email address <span className="text-primary">*</span>
          </label>
          <Input
            id="subscribe-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="h-11 border border-border bg-background text-foreground placeholder:text-para/50 focus:border-primary focus:ring-primary"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing...
            </span>
          ) : (
            "Subscribe Now"
          )}
        </Button>

        <p className="text-center text-xs text-para/60">
          No spam, ever. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}

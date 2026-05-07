import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

const PORTAL_ID = "47519938";
const FORM_ID = "2d808d3b-402c-4b34-a9aa-36ffe5026063";

function getCookie(name: string) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export function FooterInlineNewsletter() {
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
      <div className="flex items-center gap-3 py-1">
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        <p className="text-sm text-zinc-400">
          You're subscribed! Thanks for signing up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className="h-10 min-w-0 w-full max-w-xs bg-transparent border-zinc-300 dark:border-zinc-700 text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 shrink-0 bg-zinc-900 text-white dark:bg-white dark:text-black font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 px-5"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
      {(error || submitError) && (
        <p className="text-xs text-red-400">{error || submitError}</p>
      )}
      <p className="text-xs text-zinc-500">
        By subscribing, you agree to our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-zinc-300 transition-colors">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}

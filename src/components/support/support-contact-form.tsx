import { PhoneInput } from "@/components/blackwell/phone-number-select";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import * as z from "zod";

declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      params?: Record<string, any>,
    ) => void;
  }
}

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const formSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  company: z.string().min(1, "Company / Project Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().optional(),
  support_request_info: z.string().min(1, "Please describe how we can help"),
});

interface ApiError {
  message: string;
  errorType: string;
}

interface ApiErrorResponse {
  status: string;
  message: string;
  correlationId?: string;
  errors?: ApiError[];
}

export function SupportContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const [generalError, setGeneralError] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      company: "",
      phone: "",
      support_request_info: "",
    },
  });

  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  };

  function getUtmParams() {
    if (typeof window === "undefined") return {};

    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];

    utmKeys.forEach((key) => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });

    return utmParams;
  }

  function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }

  function buildHSContext() {
    const utmParams = getUtmParams();

    return {
      hutk: getCookie("hubspotutk"),
      pageUri: window.location.href,
      pageName: "Support Contact Form",
      ...utmParams,
    };
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      setApiErrors([]);
      setGeneralError("");

      const hubspotEndpoint =
        "https://api.hsforms.com/submissions/v3/integration/submit/47519938/c80cb5e6-d7c0-48a1-88a1-8e67db65f1ac";

      const formData = {
        fields: [
          { name: "firstname", value: values.firstname },
          { name: "lastname", value: values.lastname },
          { name: "email", value: values.email },
          { name: "company", value: values.company },
          { name: "phone", value: values.phone || "" },
          {
            name: "support_request_info",
            value: values.support_request_info,
          },
        ],
        context: buildHSContext(),
      };

      const response = await fetch(hubspotEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        trackEvent("form_submission_success", {
          event_category: "Support Contact Form",
          event_label: "Form Submitted Successfully",
        });

        setIsSubmitted(true);
        form.reset();
      } else {
        const errorData: ApiErrorResponse = await response.json();

        trackEvent("form_submission_error", {
          event_category: "Support Contact Form",
          event_label: "Form Submission Failed",
          error_type: errorData.errors?.length
            ? "validation_error"
            : "general_error",
        });

        if (errorData.errors && errorData.errors.length > 0) {
          setApiErrors(errorData.errors);
        } else {
          setGeneralError(errorData.message || "Failed to submit form");
        }

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (error) {
      trackEvent("form_submission_error", {
        event_category: "Support Contact Form",
        event_label: "Unexpected Error",
        error_type: "exception",
      });

      setGeneralError("An unexpected error occurred. Please try again.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="j flex w-full flex-col items-center  overflow-hidden rounded-[8px] border bg-background2 ">
        <div className="space-y-4 p-6 md:p-14">
          <h2 className="text-lg font-bold text-foreground md:text-3xl">
            Thank you for reaching out to Akash Network
          </h2>

          <p className="text-sm leading-relaxed md:text-base ">
            Our team will get back to you shortly. For urgent questions, please
            join the{" "}
            <a
              href="https://discord.com/invite/akash"
              target="_blank"
              className="text-primary underline"
            >
              Akash Network Discord
            </a>
            .
          </p>
        </div>
        <img
          src="/images/thanksformimage.webp"
          alt="Thank you"
          className="h-auto w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 overflow-hidden rounded-[8px] border bg-background p-6 md:p-14">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Contact Akash Support
        </h2>
        <p className="mt-2 text-sm text-para">
          Please complete the information below so we can help.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {(apiErrors.length > 0 || generalError) && (
            <div className="rounded-lg border !border-primary/50 bg-primary/10 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-primary">
                    {apiErrors.length > 0
                      ? "Validation Error"
                      : "Submission Error"}
                  </h3>
                  <div className="mt-2 text-sm text-primary">
                    {generalError && <p>{generalError}</p>}
                    {apiErrors.length > 0 && (
                      <ul className="list-disc space-y-1 pl-5">
                        {apiErrors.map((error, index) => (
                          <li key={index}>{error.message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  Company / Project Name
                  <span className="ml-1 text-primary">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Email
                    <span className="ml-1 text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start gap-2.5">
                  <FormLabel className="text-foreground">
                    Phone Number
                  </FormLabel>
                  <FormControl className="w-full">
                    <PhoneInput placeholder="+1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="support_request_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  How can we help?
                  <span className="ml-1 text-primary">*</span>
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder=""
                    rows={4}
                    className="w-full resize-none  rounded-md border border-primary/30 bg-transparent p-2 text-sm focus:border-primary focus:outline-none focus:ring-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end pt-4">
            <Button
              type="submit"
              className="h-auto rounded-md bg-primary px-8 py-3 text-white hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

import { PhoneInput } from "@/components/blackwell/phone-number-select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ExternalLink, X } from "lucide-react";

const formSchema = z
  .object({
    firstname: z.string().min(1, "First name is required*"),
    lastname: z.string().min(1, "Last name is required*"),
    phone: z.string().optional(),
    email: z
      .string()
      .email("Invalid business email")
      .min(1, "Business email is required*"),
    company: z.string().min(1, "Company name is required*"),
    website: z.string().optional(),
    project_details: z
      .string()
      .min(10, "Please provide at least 10 characters about your project"),
    lead_type: z.string().min(1, "Please select an option"),
    current_amount_spent_on_computer: z.string().optional().nullable(),
    provider_gpu_type: z.array(z.string()).optional().nullable(),
    gpu_quantity_available: z.string().optional().nullable(),
    support_request_info: z.string().optional(),
  })
  .refine(
    (data) => {
      // If user wants to provide GPUs, provider_gpu_type is required
      if (data.lead_type === "Provide GPUs") {
        return data.provider_gpu_type && data.provider_gpu_type.length > 0;
      }
      return true;
    },
    {
      message: "Please select at least one GPU type",
      path: ["provider_gpu_type"],
    },
  )
  .refine(
    (data) => {
      // If user wants to provide GPUs, gpu_quantity_available is required
      if (data.lead_type === "Provide GPUs") {
        return (
          data.gpu_quantity_available &&
          data.gpu_quantity_available.trim() !== ""
        );
      }
      return true;
    },
    {
      message: "Please select GPU quantity",
      path: ["gpu_quantity_available"],
    },
  )
  .refine(
    (data) => {
      // If user wants technical support, support_request_info is required
      if (data.lead_type === "Get technical support") {
        return (
          data.support_request_info && data.support_request_info.trim() !== ""
        );
      }
      return true;
    },
    {
      message: "Please describe your support request",
      path: ["support_request_info"],
    },
  );

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

export function GpuContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showMeetingSuccess, setShowMeetingSuccess] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showEmbeddedMeeting, setShowEmbeddedMeeting] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const [generalError, setGeneralError] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      email: "",
      company: "",
      website: "",
      project_details: "",
      lead_type: "",
      current_amount_spent_on_computer: null,
      provider_gpu_type: [],
      gpu_quantity_available: null,
      support_request_info: "",
    },
  });

  const watchedUseCases = form.watch("lead_type");

  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  };

  const shouldShowRedirectDialog = () => {
    return redirectUri !== null;
  };

  const isMeetingLink = (url: string | null) => {
    if (!url) return false;
    return url.includes("meetings.hubspot.com");
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (showSuccessDialog && shouldShowRedirectDialog()) {
      setIsLoading(true);

      timeout = setTimeout(() => {
        setIsLoading(false);
        window.open(redirectUri!, "_blank");
        setShowSuccessDialog(false);
        setRedirectUri(null);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showSuccessDialog, redirectUri]);

  useEffect(() => {
    if (showMeetingDialog || showEmbeddedMeeting) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
      script.async = true;
      document.head.appendChild(script);

      return () => {
        const existingScript = document.querySelector(
          'script[src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"]',
        );
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [showMeetingDialog, showEmbeddedMeeting]);

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
      pageName: "GPU Contact Form",
      ...utmParams,
    };
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      setApiErrors([]);
      setGeneralError("");

      const hubspotEndpoint =
        "https://api.hsforms.com/submissions/v3/integration/submit/47519938/f6d48b8a-55fd-4327-b947-1ae5b33ed63f";

      const formData = {
        fields: [
          { name: "firstname", value: values.firstname },
          { name: "lastname", value: values.lastname },
          { name: "email", value: values.email },
          { name: "company", value: values.company },
          { name: "website", value: values.website },
          { name: "project_details", value: values.project_details },
          {
            name: "lead_type",
            value: values.lead_type,
          },
          {
            name: "current_amount_spent_on_computer",
            value: values.current_amount_spent_on_computer || "null",
          },
          {
            name: "provider_gpu_type",
            value:
              Array.isArray(values.provider_gpu_type) &&
              values.provider_gpu_type.length > 0
                ? values.provider_gpu_type.join(", ")
                : "null",
          },
          {
            name: "gpu_quantity_available",
            value: values.gpu_quantity_available || "null",
          },
          {
            name: "support_request_info",
            value: values.support_request_info,
          },
          { name: "phone", value: values.phone },
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
        const responseData = await response.json();

        trackEvent("form_submission_success", {
          event_category: "GPU Contact Form",
          event_label: "Form Submitted Successfully",
          lead_type: values.lead_type,
          has_meeting_link: !!responseData.redirectUri,
          is_meeting_embedded: isMeetingLink(responseData.redirectUri),
        });

        if (responseData.redirectUri) {
          setRedirectUri(responseData.redirectUri);

          if (isMeetingLink(responseData.redirectUri)) {
            // Show embedded meeting in form instead of dialog
            setShowEmbeddedMeeting(true);
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } else {
            setShowSuccessDialog(true);
          }
        } else {
          setShowSuccessDialog(true);
        }

        form.reset();
      } else {
        const errorData: ApiErrorResponse = await response.json();

        trackEvent("form_submission_error", {
          event_category: "GPU Contact Form",
          event_label: "Form Submission Failed",
          lead_type: values.lead_type,
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
        event_category: "GPU Contact Form",
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

  const handleNextStep = () => {
    const currentValues = form.getValues();

    setApiErrors([]);
    setGeneralError("");

    const requiredFields = ["lead_type"];
    if (currentValues.lead_type === "Rent GPUs") {
      requiredFields.push(
        "firstname",
        "lastname",
        "email",
        "company",
        "current_amount_spent_on_computer",
      );
    } else {
      requiredFields.push("firstname", "lastname", "email", "company");
    }

    const hasErrors = requiredFields.some((field) => {
      const value = currentValues[field as keyof typeof currentValues];
      return !value || value === "";
    });

    if (!hasErrors) {
      trackEvent("form_step_completed", {
        event_category: "GPU Contact Form",
        event_label: "Step 1 Completed",
        step: 1,
        lead_type: currentValues.lead_type,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setCurrentStep(2);
    } else {
      form.trigger(requiredFields as any);
    }
  };

  return (
    <>
      {showEmbeddedMeeting ? (
        <div className="flex w-full flex-col overflow-hidden">
          <div
            className="meetings-iframe-container w-full"
            data-src="https://meetings.hubspot.com/connect-akash-network?embed=true"
            style={{ minHeight: "600px" }}
          ></div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .meetings-iframe-container {
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .meetings-iframe-container iframe {
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .meetings-iframe-container * {
                  max-width: 100% !important;
                }
              `,
            }}
          />

          <Button
            onClick={() => {
              trackEvent("continue_to_console_click", {
                event_category: "GPU Contact Form",
                event_label: "Continue To Console Button",
                page_location: window.location.href,
              });
              window.open("https://console.akash.network", "_blank");
            }}
            className="h-auto w-full rounded-md bg-primary px-8 py-4 text-lg font-semibold text-white hover:bg-primary/90"
          >
            Continue To Console
          </Button>
        </div>
      ) : (
        <div className=" flex w-full flex-col gap-8 rounded-lg border p-6 md:p-14">
          <h2 className="text-2xl font-medium">Tell Us What You Need</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
              {(apiErrors.length > 0 || generalError) && (
                <div className="rounded-lg border !border-primary/50  bg-primary/10 p-4">
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

              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="lead_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          What would you like to do on Akash?
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-3">
                            {[
                              "Rent GPUs",
                              "Provide GPUs",
                              "Get technical support",
                              "Other",
                            ].map((option) => (
                              <label
                                key={option}
                                className="group relative flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                              >
                                <div className="relative hidden h-5 w-5 items-center justify-center">
                                  <input
                                    type="radio"
                                    name="lead_type"
                                    value={option}
                                    checked={field.value === option}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        field.onChange(option);

                                        trackEvent("form_started", {
                                          event_category: "GPU Contact Form",
                                          event_label: "Lead Type Selected",
                                          lead_type: option,
                                        });

                                        setTimeout(() => {
                                          window.scrollTo({
                                            top:
                                              (document.getElementById("step-1")
                                                ?.offsetTop ?? 0) - 95,
                                            behavior: "smooth",
                                          });
                                        }, 100);
                                      }
                                    }}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-300 transition-all duration-200 checked:border-primary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                  <div className="pointer-events-none absolute h-2 w-2 rounded-full bg-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100" />
                                </div>
                                <span className="text-sm font-medium transition-colors duration-200 group-hover:text-primary">
                                  {option}
                                </span>
                                {field.value === option && (
                                  <div className="ml-auto">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                  </div>
                                )}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedUseCases && (
                    <>
                      <div
                        className="grid  grid-cols-1 gap-4 md:grid-cols-2"
                        id="step-1"
                      >
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                First Name
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
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
                              <FormLabel>
                                Last Name{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="business@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Company / Project Name{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedUseCases === "Rent GPUs" && (
                        <FormField
                          control={form.control}
                          name="current_amount_spent_on_computer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                How much are you currently spending on compute?
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="cursor-pointer transition-colors duration-200 hover:text-primary">
                                    <SelectValue placeholder="Select your current spending" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem
                                    value="<$1000/mo"
                                    className="hover:text-primary"
                                  >
                                    &lt;$1000/mo
                                  </SelectItem>
                                  <SelectItem
                                    value="$1,000-$5,000"
                                    className="hover:text-primary"
                                  >
                                    $1,000-$5,000
                                  </SelectItem>
                                  <SelectItem
                                    value="$5,000-$25,000"
                                    className="hover:text-primary"
                                  >
                                    $5,000-$25,000
                                  </SelectItem>
                                  <SelectItem
                                    value="$25,000+"
                                    className="hover:text-primary"
                                  >
                                    $25,000+
                                  </SelectItem>
                                  <SelectItem
                                    value="No Spend Currently"
                                    className="hover:text-primary"
                                  >
                                    No Spend Currently
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="!mt-8 h-auto w-auto rounded-md px-6 py-3"
                      >
                        Next
                      </Button>
                    </>
                  )}
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="mb-6">
                    <h3 className="mb-2 text-lg font-semibold">
                      Share any additional details about your project
                    </h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Project Details{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Tell us about your project (minimum 10 characters)"
                            rows={4}
                            className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedUseCases === "Provide GPUs" && (
                    <>
                      <FormField
                        control={form.control}
                        name="provider_gpu_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              What type of GPUs do you want to provide?
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {[
                                  "H200",
                                  "H100",
                                  "A100",
                                  "RTX4090",
                                  "A6000",
                                  "Other",
                                ].map((gpuType) => (
                                  <div
                                    key={gpuType}
                                    className="flex items-center space-x-3"
                                  >
                                    <Checkbox
                                      checked={
                                        field.value?.includes(gpuType) || false
                                      }
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...currentValues,
                                            gpuType,
                                          ]);
                                        } else {
                                          field.onChange(
                                            currentValues.filter(
                                              (value) => value !== gpuType,
                                            ),
                                          );
                                        }
                                      }}
                                      id={`gpu-${gpuType}`}
                                    />
                                    <label
                                      htmlFor={`gpu-${gpuType}`}
                                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {gpuType}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gpu_quantity_available"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              How many total GPUs do you want to provide?
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger className="cursor-pointer transition-colors duration-200 hover:text-primary">
                                  <SelectValue placeholder="Select quantity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem
                                  value="1"
                                  className="hover:text-primary"
                                >
                                  1
                                </SelectItem>
                                <SelectItem
                                  value="2-5"
                                  className="hover:text-primary"
                                >
                                  2-5
                                </SelectItem>
                                <SelectItem
                                  value="5-10"
                                  className="hover:text-primary"
                                >
                                  5-10
                                </SelectItem>
                                <SelectItem
                                  value="10+"
                                  className="hover:text-primary"
                                >
                                  10+
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {watchedUseCases === "Get technical support" && (
                    <FormField
                      control={form.control}
                      name="support_request_info"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Support Request Info
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <textarea
                              placeholder="Describe your support request"
                              rows={3}
                              className="w-full rounded border bg-background2 px-3 py-2 text-sm focus:outline-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-start">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl className="w-full">
                          <PhoneInput placeholder="+1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="!mt-8 text-xs text-para md:text-sm">
                    By clicking submit below, you consent to allow Akash Network
                    to store and process the personal information submitted
                    above to provide you the content requested. Please review
                    our{" "}
                    <a
                      target="_blank"
                      href="/privacy"
                      className="text-primary underline"
                    >
                      privacy policy
                    </a>{" "}
                    for more information.
                  </p>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        trackEvent("form_step_back", {
                          event_category: "GPU Contact Form",
                          event_label: "Back to Step 1",
                          from_step: 2,
                          lead_type: form.getValues().lead_type,
                        });
                        setCurrentStep(1);
                      }}
                      variant="outline"
                      className="!mt-8 h-auto w-auto rounded-md px-6 py-3"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="!mt-8 h-auto w-auto rounded-md px-6 py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </div>
      )}

      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) {
            setCurrentStep(1);
          }
        }}
      >
        <DialogContent
          className="animate-fade-in  border-none bg-background shadow-2xl sm:max-w-md"
          hideCloseButton
        >
          <button
            onClick={() => {
              setShowSuccessDialog(false);
              setCurrentStep(1);
            }}
            className="absolute right-2 top-2 rounded-full border  p-2  backdrop-blur-sm hover:bg-gray-50 dark:bg-background2 hover:dark:bg-background2/50"
          >
            <X className="size-5" />
          </button>
          <DialogHeader className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 ">
              <CheckCircle2 className="h-10 w-10  text-white" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="bg-gradient-to-r   text-center text-3xl font-bold">
                {shouldShowRedirectDialog() && isLoading
                  ? "Processing..."
                  : "Success"}
              </DialogTitle>

              <DialogDescription className="mx-auto max-w-sm  text-center text-lg leading-relaxed text-para">
                {shouldShowRedirectDialog()
                  ? isLoading
                    ? "Thank you for your interest! Preparing your meeting scheduler..."
                    : "Ready to schedule your meeting!"
                  : "Thank you for your interest! We've received your information and will be in touch soon with exciting updates."}
              </DialogDescription>
            </div>

            {shouldShowRedirectDialog() && (
              <div className="space-y-6 pt-4">
                {isLoading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-green-200"></div>
                      <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-green-500"></div>
                    </div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-500">
                      Redirecting to Akash Console...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center  border-t bg-background p-4 backdrop-blur-sm">
                      <p className="mb-3 text-sm font-medium">
                        Redirecting to Akash Console...
                      </p>
                      <Button
                        onClick={() => {
                          window.open(redirectUri!, "_blank");
                          setShowSuccessDialog(false);
                          setRedirectUri(null);
                          setCurrentStep(1);
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          Redirecting...
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showMeetingDialog}
        onOpenChange={(open) => {
          setShowMeetingDialog(open);
          if (!open) {
            setCurrentStep(1);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-none p-0">
          <DialogHeader className="sr-only  p-6 pb-0">
            <DialogTitle className="text-center text-2xl font-bold">
              Schedule Your Meeting
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              Let's discuss your GPU compute needs
            </DialogDescription>
          </DialogHeader>
          <div className=" md:pt-7">
            <div
              className="meetings-iframe-container "
              data-src="https://meetings.hubspot.com/connect-akash-network?embed=true"
              style={{ minHeight: "600px" }}
            ></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

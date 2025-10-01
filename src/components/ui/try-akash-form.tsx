import { PhoneInput } from "@/components/blackwell/phone-number-select";
import { speakToExpertVariants } from "@/components/pricing-page/SpeakToExpert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TryAkashFormProps extends VariantProps<typeof speakToExpertVariants> {
  type:
    | "hero"
    | "header"
    | "speckToExpert"
    | "speakToExpertHeader"
    | "linkButton"
    | "customButton";
  fullWidth?: boolean;
  className?: string;
  linkText?: string;
}

export default function TryAkashForm({
  type,
  fullWidth,
  size,
  variant,
  className,
  linkText,
}: TryAkashFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  // 1. Add country data for select and flag
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);

  // Fetch country data from a public API (on mount)
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data
          .filter((c: any) => c.idd?.root && c.idd?.suffixes && c.cca2)
          .map((c: any) => ({
            code: c.cca2,
            name: c.name.common,
            dial: c.idd.root + (c.idd.suffixes[0] || ""),
            flag: c.flags.svg,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(mapped);
      });
  }, []);

  const [formData, setFormData] = useState<{
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    country: string;
    lead_type: string;
    company: string;
    website: string;
    project_details: string;
    current_amount_spent_on_computer: string;
    provider_gpu_type: string[];
    gpu_quantity_available: string;
    support_request_info: string;
  }>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    country: "IN",
    lead_type: "",
    company: "",
    website: "",
    project_details: "",
    current_amount_spent_on_computer: "",
    provider_gpu_type: [],
    gpu_quantity_available: "",
    support_request_info: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function formFieldsToHSJSON() {
    const result = [];
    for (const [name, value] of Object.entries(formData)) {
      if (name === "provider_gpu_type") {
        const fieldValue =
          Array.isArray(value) && value.length > 0 ? value.join(", ") : "null";
        result.push({
          name: "provider_gpu_type",
          value: fieldValue,
        });
      } else {
        const fieldValue = value === "" ? "null" : value;
        result.push({ name, value: fieldValue });
      }
    }
    return result;
  }

  function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }

  function buildHSContext() {
    return {
      hutk: getCookie("hubspotutk"),
      pageUri: window.location.href,
      pageName: document.title,
    };
  }

  function validateStep1() {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstname) newErrors.firstname = "First Name is required";
    if (!formData.lastname) newErrors.lastname = "Last Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.lead_type) newErrors.lead_type = "Please select an option";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2() {
    const newErrors: { [key: string]: string } = {};
    if (!formData.company)
      newErrors.company = "Company / Project Name is required";

    // Rent GPUs validation
    if (
      formData.lead_type === "Developer" &&
      !formData.current_amount_spent_on_computer
    ) {
      newErrors.current_amount_spent_on_computer =
        "Please select your current compute spend";
    }
    // Provide GPUs validation
    if (formData.lead_type === "Provider") {
      if (
        !formData.provider_gpu_type ||
        formData.provider_gpu_type.length === 0
      ) {
        newErrors.provider_gpu_type = "Please select at least one GPU type";
      }
      if (!formData.gpu_quantity_available) {
        newErrors.gpu_quantity_available = "Please select GPU quantity";
      }
    }
    // Support validation
    if (
      formData.lead_type === "technical support" &&
      !formData.support_request_info
    ) {
      newErrors.support_request_info = "Please provide support request info";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }
    if (!validateStep2()) return;
    setIsSubmitting(true);
    const submission = {
      fields: formFieldsToHSJSON(),
      context: buildHSContext(),
    };
    try {
      const res = await fetch(
        "https://api.hsforms.com/submissions/v3/integration/submit/47519938/f6d48b8a-55fd-4327-b947-1ae5b33ed63f",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submission),
        },
      );
      if (res.ok) {
        setSubmitError("");

        try {
          const responseData = await res.json();
          if (responseData.redirectUri) {
            window.location.href = responseData.redirectUri;
            return;
          } else {
            setSubmitted(true);
          }
        } catch (err) {}
      } else {
        setSubmitError("Submission failed. Please try again.");
      }
    } catch (error) {
      setSubmitError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handlePhoneChange(value: string | undefined) {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    setErrors((prev) => ({ ...prev, phone: "" }));
  }

  function handleRadioChange(option: string) {
    // Map display labels to CRM values
    let leadTypeValue = "";
    if (option === "Rent GPUs") {
      leadTypeValue = "Developer";
    } else if (option === "Provide GPUs") {
      leadTypeValue = "Provider";
    } else if (option === "Get technical support") {
      leadTypeValue = "technical support";
    } else {
      leadTypeValue = "Other";
    }

    setFormData((prev) => ({
      ...prev,
      lead_type: leadTypeValue,
    }));
    setErrors((prev) => ({ ...prev, lead_type: "" }));
  }

  function handleGpuTypeChange(option: string) {
    setFormData((prev) => {
      const arr = prev.provider_gpu_type;
      if (arr.includes(option)) {
        return {
          ...prev,
          provider_gpu_type: arr.filter((o) => o !== option),
        };
      } else {
        return {
          ...prev,
          provider_gpu_type: [...arr, option],
        };
      }
    });
    setErrors((prev) => ({ ...prev, provider_gpu_type: "" }));
  }

  function handleBack() {
    setStep(1);
  }

  function resetForm() {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      country: "IN",
      lead_type: "",
      company: "",
      website: "",
      project_details: "",
      current_amount_spent_on_computer: "",
      provider_gpu_type: [],
      gpu_quantity_available: "",
      support_request_info: "",
    });
    setErrors({});
    setSubmitError("");
    setSubmitted(false);
    setStep(1);
  }

  const defaultButton = (
    <button
      type="button"
      className={buttonVariants({
        variant: "default",
        size: "sm",
        className: "!h-auto !rounded px-[11px] py-[7px] text-xs",
      })}
    >
      Get in Touch
    </button>
  );

  const heroButton = (
    <button
      type="button"
      className={clsx(
        " cursor-pointer rounded-md bg-primary px-10 py-2.5  !font-medium  transition-all hover:bg-primary/90 md:px-[60px] md:py-5 lg:text-xl",
        fullWidth ? "w-full" : "mx-auto",
      )}
    >
      Contact Sales to Get Started
    </button>
  );

  const linkButton = (
    <button
      type="button"
      className={clsx(
        buttonVariants({ variant: "link", size: "sm" }),
        className,
      )}
    >
      {linkText}
    </button>
  );

  const CustomButton = (
    <button type="button" className={clsx(className)}>
      {linkText}
    </button>
  );

  const speckToExpertButton = (
    <button
      type="button"
      className="group mx-auto flex w-fit items-center gap-2 rounded-full border bg-gray-50 px-8 py-2 hover:bg-gray-100 dark:bg-background2 dark:hover:bg-white/10"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 18.25C15.5 18.25 19.25 16.5 19.25 12C19.25 7.5 15.5 5.75 12 5.75C8.5 5.75 4.75 7.5 4.75 12C4.75 13.0298 4.94639 13.9156 5.29123 14.6693C5.50618 15.1392 5.62675 15.6573 5.53154 16.1651L5.26934 17.5635C5.13974 18.2547 5.74527 18.8603 6.43651 18.7307L9.64388 18.1293C9.896 18.082 10.1545 18.0861 10.4078 18.1263C10.935 18.2099 11.4704 18.25 12 18.25Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M9.5 12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12C8.5 11.7239 8.72386 11.5 9 11.5C9.27614 11.5 9.5 11.7239 9.5 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M12.5 12C12.5 12.2761 12.2761 12.5 12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M15.5 12C15.5 12.2761 15.2761 12.5 15 12.5C14.7239 12.5 14.5 12.2761 14.5 12C14.5 11.7239 14.7239 11.5 15 11.5C15.2761 11.5 15.5 11.7239 15.5 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>

      <p className="line-clamp-2 flex-1 text-center text-xs font-semibold text-foreground lg:text-sm">
        Speak To An Expert
      </p>
      <svg
        width="24"
        height="24"
        className="hidden group-hover:block"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.25 15.25V6.75H8.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M17 7L6.75 17.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </button>
  );

  const speakToExpertHeaderButton = (
    <button
      className={clsx(speakToExpertVariants({ size, variant }), className)}
    >
      <svg
        className={clsx("h-5 w-5")}
        viewBox="0 0 20 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.6561 11.7018C14.2325 11.7018 14.6998 11.2345 14.6998 10.658C14.6998 10.0816 14.2325 9.61426 13.6561 9.61426C13.0796 9.61426 12.6123 10.0816 12.6123 10.658C12.6123 11.2345 13.0796 11.7018 13.6561 11.7018Z"
          fill="currentColor"
        />
        <path
          d="M9.90605 11.7018C10.4825 11.7018 10.9498 11.2345 10.9498 10.658C10.9498 10.0816 10.4825 9.61426 9.90605 9.61426C9.32961 9.61426 8.8623 10.0816 8.8623 10.658C8.8623 11.2345 9.32961 11.7018 9.90605 11.7018Z"
          fill="currentColor"
        />

        <path
          d="M6.16875 11.7018C6.7452 11.7018 7.2125 11.2345 7.2125 10.658C7.2125 10.0816 6.7452 9.61426 6.16875 9.61426C5.5923 9.61426 5.125 10.0816 5.125 10.658C5.125 11.2345 5.5923 11.7018 6.16875 11.7018Z"
          fill="currentColor"
        />

        <path
          d="M9.99984 19.0724C14.6022 19.0724 18.3332 15.3415 18.3332 10.7391C18.3332 6.13672 14.6022 2.40576 9.99984 2.40576C5.39746 2.40576 1.6665 6.13672 1.6665 10.7391C1.6665 12.257 2.07231 13.68 2.78136 14.9058L2.08317 18.6558L5.83317 17.9576C7.05889 18.6666 8.48197 19.0724 9.99984 19.0724Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="font-medium text-inherit ">Speak to an expert</p>
    </button>
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {type === "hero"
          ? heroButton
          : type === "speckToExpert"
            ? speckToExpertButton
            : type === "speakToExpertHeader"
              ? speakToExpertHeaderButton
              : type === "linkButton"
                ? linkButton
                : type === "customButton"
                  ? CustomButton
                  : defaultButton}
      </DialogTrigger>
      <DialogContent
        overlayClassName="z-[99]"
        hideCloseButton
        className="hide-scrollbar  z-[101] max-h-[95vh] overflow-hidden overflow-y-auto !border-none  bg-transparent p-0 shadow-none sm:max-w-[600px]"
      >
        <DialogTitle className="sr-only">Form</DialogTitle>

        {submitted ? (
          <div className="mx-auto w-full max-w-xl rounded-xl bg-background pt-16 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="absolute right-6 top-4 z-10 rounded-full bg-white p-2 text-black hover:bg-white/90"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="px-6 pb-6 md:px-10">
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                Thank you for reaching out to Akash Network.
              </h2>
              <div className="space-y-4 text-foreground">
                <p>
                  For projects looking to rent multiple GPUs or provide GPUs go
                  ahead and book a call with our Akash Expert Team:{" "}
                  <a
                    href="https://hubs.ly/Q03F6xHP0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    Book A Call
                  </a>
                </p>
                <p>
                  For other inquiries, we will be in touch shortly. For urgent
                  questions, please join the{" "}
                  <a
                    href="https://discord.com/invite/akash"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    Akash Network Discord
                  </a>{" "}
                  for 24/7 support.
                </p>
              </div>
            </div>
            <img
              src="https://47519938.fs1.hubspotusercontent-na1.net/hub/47519938/hubfs/akash-dustparticles-1-1.png?width=800&height=204.75914103308185"
              className="aspect-[16/6] w-full rounded-b-xl object-cover object-center"
              alt="Akash Network"
            />
          </div>
        ) : (
          <form
            id="custom-hs-form"
            ref={formRef}
            className="relative mx-auto w-full max-w-xl space-y-6 rounded-xl bg-background px-6 pb-8 pt-16 shadow-lg md:px-10 "
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="absolute right-6 top-4 z-10 rounded-full bg-white p-2 text-black hover:bg-white/90"
            >
              <X className="h-4 w-4" />
            </button>
            {submitError && (
              <div className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {step === 1 && (
              <>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="mb-8 text-3xl font-bold text-foreground">
                      Get Started With Akash
                    </h2>
                  </div>
                  <p className="mb-10  text-lg text-foreground">
                    Please complete the information below to help guide you to
                    the right place.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm ">First Name</label>
                    <Input
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      className="w-full border  bg-background2 text-foreground"
                    />
                    {errors.firstname && (
                      <span className="text-xs text-red-400">
                        {errors.firstname}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Last Name</label>
                    <Input
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className="w-full border  bg-background2 "
                    />
                    {errors.lastname && (
                      <span className="text-xs text-red-400">
                        {errors.lastname}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">
                      Email<span className="text-red-400">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border  bg-background2 "
                    />
                    {errors.email && (
                      <span className="text-xs text-red-400">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Phone Number</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      modal={true}
                    />
                    {errors.phone && (
                      <span className="text-xs text-red-400">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-3 block text-sm">
                    What would you like to do on Akash?
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-col gap-3">
                    {[
                      "Rent GPUs",
                      "Provide GPUs",
                      "Get technical support",
                      "Other",
                    ].map((option) => (
                      <label
                        key={option}
                        className="group flex cursor-pointer items-center gap-3"
                      >
                        <div className="relative">
                          <input
                            type="radio"
                            name="lead_type"
                            value={option}
                            checked={
                              (option === "Rent GPUs" &&
                                formData.lead_type === "Developer") ||
                              (option === "Provide GPUs" &&
                                formData.lead_type === "Provider") ||
                              (option === "Get technical support" &&
                                formData.lead_type === "technical support") ||
                              (option === "Other" &&
                                formData.lead_type === "Other")
                            }
                            onChange={() => handleRadioChange(option)}
                            className="sr-only"
                          />
                          <div
                            className={`h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                              (option === "Rent GPUs" &&
                                formData.lead_type === "Developer") ||
                              (option === "Provide GPUs" &&
                                formData.lead_type === "Provider") ||
                              (option === "Get technical support" &&
                                formData.lead_type === "technical support") ||
                              (option === "Other" &&
                                formData.lead_type === "Other")
                                ? "border-primary bg-primary"
                                : "border-gray-300 group-hover:border-primary/50"
                            }`}
                          >
                            {((option === "Rent GPUs" &&
                              formData.lead_type === "Developer") ||
                              (option === "Provide GPUs" &&
                                formData.lead_type === "Provider") ||
                              (option === "Get technical support" &&
                                formData.lead_type === "technical support") ||
                              (option === "Other" &&
                                formData.lead_type === "Other")) && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium leading-none">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.lead_type && (
                    <span className="mt-2 block text-xs text-red-400">
                      {errors.lead_type}
                    </span>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className=" w-min px-10"
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="mb-1 block text-sm">
                    Company / Project Name
                    <span className="text-red-400">*</span>
                  </label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full border  bg-background2 "
                  />
                  {errors.company && (
                    <span className="text-xs text-red-400">
                      {errors.company}
                    </span>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm">Website URL</label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full border  bg-background2 "
                  />
                </div>
                {/* Rent GPUs conditional field */}
                {formData.lead_type === "Developer" && (
                  <div>
                    <label className="mb-3 block text-sm">
                      How much are you currently spending on compute?
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      {[
                        { value: "<$1000/mo", label: "$0-$1,000/mo" },
                        { value: "$1,000-$5,000", label: "$1,000-$5,000" },
                        { value: "$5,000-$25,000", label: "$5,000-$25,000" },
                        { value: "$25,000+", label: "$25,000+" },
                        {
                          value: "No Spend Currently",
                          label: "No Spend Currently",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="group flex cursor-pointer items-center gap-3"
                        >
                          <div className="relative">
                            <input
                              type="radio"
                              name="current_amount_spent_on_computer"
                              value={option.value}
                              checked={
                                formData.current_amount_spent_on_computer ===
                                option.value
                              }
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  current_amount_spent_on_computer:
                                    e.target.value,
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  current_amount_spent_on_computer: "",
                                }));
                              }}
                              className="sr-only"
                            />
                            <div
                              className={`h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                                formData.current_amount_spent_on_computer ===
                                option.value
                                  ? "border-primary bg-primary"
                                  : "border-gray-300 group-hover:border-primary/50"
                              }`}
                            >
                              {formData.current_amount_spent_on_computer ===
                                option.value && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-medium leading-none">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.current_amount_spent_on_computer && (
                      <span className="mt-2 block text-xs text-red-400">
                        {errors.current_amount_spent_on_computer}
                      </span>
                    )}
                  </div>
                )}
                {/* Provide GPUs conditional fields */}
                {formData.lead_type === "Provider" && (
                  <>
                    <div>
                      <label className="mb-3 block text-sm">
                        What type of GPUs do you want to provide?
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="space-y-3">
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
                              id={`gpu-type-${gpuType}`}
                              checked={formData.provider_gpu_type.includes(
                                gpuType,
                              )}
                              onCheckedChange={() =>
                                handleGpuTypeChange(gpuType)
                              }
                            />
                            <label
                              htmlFor={`gpu-type-${gpuType}`}
                              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {gpuType}
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.provider_gpu_type && (
                        <span className="mt-2 block text-xs text-red-400">
                          {errors.provider_gpu_type}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm">
                        How many total GPUs do you want to provide?
                        <span className="text-red-400">*</span>
                      </label>
                      <Select
                        value={formData.gpu_quantity_available}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            gpu_quantity_available: value,
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            gpu_quantity_available: "",
                          }));
                        }}
                      >
                        <SelectTrigger className="bg-background2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[102]">
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2-5">2-5</SelectItem>
                          <SelectItem value="5-10">5-10</SelectItem>
                          <SelectItem value="10+">10+</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gpu_quantity_available && (
                        <span className="text-xs text-red-400">
                          {errors.gpu_quantity_available}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {/* Support Request conditional field */}
                {formData.lead_type === "technical support" && (
                  <div>
                    <label className="mb-1 block text-sm">
                      Support Request Info
                      <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="support_request_info"
                      value={formData.support_request_info}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded border bg-background2 px-3 py-2 text-sm focus:outline-none"
                      required
                    />
                    {errors.support_request_info && (
                      <span className="text-xs text-red-400">
                        {errors.support_request_info}
                      </span>
                    )}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm">Project Details</label>
                  <textarea
                    name="project_details"
                    value={formData.project_details}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded border bg-background2  px-3 py-2 text-sm  focus:outline-none"
                  />
                </div>
                <div className="mt-4 flex justify-between  gap-2">
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="w-min px-10"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className=" w-min px-10"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

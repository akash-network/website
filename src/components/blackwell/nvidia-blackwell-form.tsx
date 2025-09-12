import { PhoneInput } from "@/components/blackwell/phone-number-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

interface NvidiaBlackwellFormProps {
  children?: React.ReactNode;
  className?: string;
}

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gpu_type_interest: string[];
  current_amount_spent_on_computer: string;
  website: string;
}

export default function NvidiaBlackwellForm({
  children,
  className,
}: NvidiaBlackwellFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    gpu_type_interest: [],
    current_amount_spent_on_computer: "",
    website: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState("");

  function validateForm() {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstname) newErrors.firstname = "First Name is required";
    if (!formData.lastname) newErrors.lastname = "Last Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.gpu_type_interest || formData.gpu_type_interest.length === 0)
      newErrors.gpu_type_interest = "Please select at least one GPU type";
    if (!formData.current_amount_spent_on_computer)
      newErrors.current_amount_spent_on_computer =
        "Current spending selection is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function formFieldsToHSJSON() {
    const result = [];
    for (const [name, value] of Object.entries(formData)) {
      if (name === "gpu_type_interest") {
        result.push({
          name: "gpu_type_interest",
          value: Array.isArray(value) ? value.join(", ") : value,
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    const submission = {
      fields: formFieldsToHSJSON(),
      context: buildHSContext(),
    };

    try {
      const res = await fetch(
        "https://api.hsforms.com/submissions/v3/integration/submit/47519938/2d95f20c-cd65-4648-94f1-df0732aa60e6",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submission),
        },
      );

      if (res.ok) {
        setSubmitted(true);
        setSubmitError("");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handlePhoneChange(value: string | undefined) {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    setErrors((prev) => ({ ...prev, phone: "" }));
  }

  function handleSelectChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleCheckboxChange(option: string) {
    setFormData((prev) => {
      const arr = prev.gpu_type_interest;
      if (arr.includes(option)) {
        return {
          ...prev,
          gpu_type_interest: arr.filter((o) => o !== option),
        };
      } else {
        return {
          ...prev,
          gpu_type_interest: [...arr, option],
        };
      }
    });
    setErrors((prev) => ({ ...prev, gpu_type_interest: "" }));
  }

  function resetForm() {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      gpu_type_interest: [],
      current_amount_spent_on_computer: "",
      website: "",
    });
    setErrors({});
    setSubmitError("");
    setSubmitted(false);
  }

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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        hideCloseButton
        overlayClassName="z-[99]"
        className="hide-scrollbar z-[100]  max-h-[95vh] overflow-hidden overflow-y-auto !border-none bg-transparent p-0 shadow-none sm:max-w-[600px]"
      >
        <DialogTitle className="sr-only">
          NVIDIA Blackwell Early Access Form
        </DialogTitle>

        {submitted ? (
          <div className="mx-auto w-full max-w-xl rounded-xl bg-background  pt-16 shadow-lg">
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
            <div>
              <h2 className="mb-6 px-6 text-3xl font-bold text-foreground md:mb-14 md:px-10">
                Thanks for requesting early access, we'll be in touch.
              </h2>
              <img
                src="https://47519938.fs1.hubspotusercontent-na1.net/hub/47519938/hubfs/akash-dustparticles-1-1.png?width=800&height=204.75914103308185"
                className="aspect-[16/6] w-full rounded-b-2xl object-cover object-center"
              />
            </div>
          </div>
        ) : (
          <form
            ref={formRef}
            className="mx-auto flex w-full max-w-[600px] flex-col gap-6 rounded-xl bg-background px-6 pb-10 pt-16 shadow-lg md:px-10"
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

            <h2 className=" mb-4 text-3xl font-bold text-foreground">
              Akash - NVIDIA Blackwell Early Access
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  First Name<span className="text-red-400">*</span>
                </label>
                <Input
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="w-full border bg-background2 text-foreground"
                />
                {errors.firstname && (
                  <span className="text-xs text-red-400">
                    {errors.firstname}
                  </span>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Last Name<span className="text-red-400">*</span>
                </label>
                <Input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="w-full border bg-background2"
                />
                {errors.lastname && (
                  <span className="text-xs text-red-400">
                    {errors.lastname}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Email<span className="text-red-400">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border bg-background2"
              />
              {errors.email && (
                <span className="text-xs text-red-400">{errors.email}</span>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Phone Number
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={handlePhoneChange}
                modal={true}
              />
              {errors.phone && (
                <span className="text-xs text-red-400">{errors.phone}</span>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">
                What type of GPUs are you interested in renting?
                <span className="text-red-400">*</span>
              </label>
              <div className="space-y-3">
                {[
                  "B300",
                  "B200",
                  "H200",
                  "H100",
                  "Other (A100, 4090..etc)",
                ].map((gpuType) => (
                  <div key={gpuType} className="flex items-center space-x-3">
                    <Checkbox
                      id={`gpu-${gpuType}`}
                      checked={formData.gpu_type_interest.includes(gpuType)}
                      onCheckedChange={() => handleCheckboxChange(gpuType)}
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
              {errors.gpu_type_interest && (
                <span className="mt-2 block text-xs text-red-400">
                  {errors.gpu_type_interest}
                </span>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">
                How much are you currently spending on compute?
                <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-col gap-3">
                {[
                  { value: "<$1000/mo", label: "<$1000/mo" },
                  { value: "$1,000-$5,000", label: "$1,000-$5,000" },
                  { value: "$5,000-$25,000", label: "$5,000-$25,000" },
                  { value: "$25,000+", label: "$25,000+" },
                  { value: "No Spend Currently", label: "No Spend Currently" },
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
                        onChange={(e) =>
                          handleSelectChange(
                            "current_amount_spent_on_computer",
                            e.target.value,
                          )
                        }
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

            <div>
              <label className="mb-2 block text-sm font-medium">
                Company / Project Website URL
              </label>
              <Input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border bg-background2"
              />
            </div>

            <Button
              type="submit"
              className="ml-auto w-min px-10"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className=" flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

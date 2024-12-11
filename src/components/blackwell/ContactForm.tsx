import { PhoneInput } from "@/components/blackwell/phone-number-select";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
import { CheckCircle2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { db } from "./firebase";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .min(1, "First name is required*"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .min(1, "Last name is required*"),
  phone: z
    .string()
    .min(10, "Invalid phone number")
    .min(1, "Phone number is required*"),
  jobType: z
    .string()
    .min(1, "Please select a job role")
    .min(1, "Job role is required*"),
  jobTitle: z.string().min(1, "Job title is required*"),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .min(1, "Company name is required*"),
  businessEmail: z
    .string()
    .email("Invalid business email")
    .min(1, "Business email is required*"),
  check: z
    .boolean()
    .refine((value) => value === true, "You must agree to the terms*"),
});

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      jobType: "other",
      jobTitle: "",
      companyName: "",
      businessEmail: "",
      check: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      const formData = {
        ...values,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "contacts"), formData);

      setShowSuccessDialog(true);

      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name*</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="businessEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email*</FormLabel>
                <FormControl>
                  <Input placeholder="business@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel>Phone Number*</FormLabel>
                <FormControl className="w-full">
                  <PhoneInput placeholder="+1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Role*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title*</FormLabel>
                <FormControl>
                  <Input placeholder="Your job title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="!mt-8 text-xs text-para md:text-sm">
            By clicking submit below, you consent to allow Akash Network to
            store and process the personal information submitted above to
            provide you the content requested. Please review our{" "}
            <a href="/privacy-policy" className="text-primary underline">
              privacy policy
            </a>{" "}
            for more information.
          </p>
          <FormField
            control={form.control}
            name="check"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      onCheckedChange={field.onChange}
                      checked={field.value}
                    />
                    <FormLabel>
                      I agree to receive other communications from Akash
                      Network.
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="!mt-8 h-auto w-auto rounded-md px-6 py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Sign up now"}
          </Button>
        </form>
      </Form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="animate-fade-in rounded-xl bg-white shadow-2xl sm:max-w-md">
          <DialogHeader className="space-y-4">
            <div className="animate-bounce-in flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 " />
            </div>

            <DialogTitle
              className="flex items-center justify-center gap-2 
            text-center text-2xl font-bold tracking-tight text-gray-800"
            >
              Success!
            </DialogTitle>

            <DialogDescription
              className="px-4 text-center text-base leading-relaxed 
            text-gray-600 opacity-90"
            >
              Thank you for your interest! We've received your information and
              will be in touch soon with exciting updates.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

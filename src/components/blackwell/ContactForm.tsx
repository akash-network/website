import { PhoneInput } from "@/components/blackwell/phone-number-select"; // Updated import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import * as z from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "../ui/checkbox";

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
  jobRole: z
    .string()
    .min(1, "Please select a job role")
    .min(1, "Job role is required*"), // Changed from businessType to jobRole
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .min(1, "Company name is required*"),
  businessEmail: z
    .string()
    .email("Invalid business email")
    .min(1, "Business email is required*"), // Added businessEmail
  check: z
    .boolean()
    .refine((value) => value === true, "You must agree to the terms*"),
});

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",

      phone: "",
      jobRole: "other",
      companyName: "",
      businessEmail: "",
      check: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
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
          name="jobRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Role*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <p className="!mt-8 text-xs text-gray-500 md:text-sm">
          By clicking submit below, you consent to allow Akash Network to store
          and process the personal information submitted above to provide you
          the content requested. Please review our{" "}
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
                    I agree to receive other communications from Akash Network.
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
        >
          Sign up now
        </Button>
      </form>
    </Form>
  );
}

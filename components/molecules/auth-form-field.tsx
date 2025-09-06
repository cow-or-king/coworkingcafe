"use client";

// React/Next imports
import { ReactNode } from "react";

// Third-party libraries
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

// Internal absolute imports
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { PasswordInput } from "@/components/atoms/password-input";

// Types
interface AuthFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  type?: "email" | "text" | "password";
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

/**
 * Composant molécule pour champs de formulaire d'authentification
 * Encapsule la logique de validation et le style cohérent
 */
export function AuthFormField<T extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  autoComplete,
  className,
}: AuthFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-gray-700">{label}</FormLabel>
          <FormControl>
            {type === "password" ? (
              <PasswordInput
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
              />
            ) : (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className="h-12 min-h-[44px]"
                disabled={disabled}
                autoComplete={autoComplete}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
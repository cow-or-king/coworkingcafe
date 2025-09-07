"use client";

// React/Next imports
import { ReactNode } from "react";
import Link from "next/link";

// Third-party libraries
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "@/lib/icons";

// Internal absolute imports
import {
  Button,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
} from "@/components/ui";

// Types
interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isLoading?: boolean;
  alternativeAction?: {
    text: string;
    linkText: string;
    href: string;
  };
  form?: UseFormReturn;
}

/**
 * Composant organisme pour cartes d'authentification
 * Template réutilisable pour login, register, forgot-password
 */
export function AuthCard({
  title,
  description,
  children,
  onSubmit,
  submitLabel,
  isLoading = false,
  alternativeAction,
  form,
}: AuthCardProps) {
  return (
    <>
      <CardHeader className="space-y-1 pb-4 text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        {form ? (
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              {children}

              <Button 
                type="submit" 
                className="h-12 min-h-[44px] w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submitLabel}...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {children}

            <Button 
              type="submit" 
              className="h-12 min-h-[44px] w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {submitLabel}...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </form>
        )}

        {alternativeAction && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">Ou</span>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">{alternativeAction.text} </span>
              <Link
                href={alternativeAction.href}
                className="text-coffee-accent hover:text-coffee-primary font-medium hover:underline min-h-[44px] inline-flex items-center"
              >
                {alternativeAction.linkText}
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </>
  );
}
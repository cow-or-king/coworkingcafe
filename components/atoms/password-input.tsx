"use client";

// React/Next imports
import { useState, forwardRef } from "react";

// Third-party libraries
import { Eye, EyeOff } from "@/lib/icons";

// Internal absolute imports
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

// Types
interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  className?: string;
}

/**
 * Composant atome pour input de mot de passe avec toggle de visibilité
 * Respecte les standards mobile-first avec touch targets 44x44px
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("h-12 min-h-[44px] pr-12", className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 h-full min-h-[44px] min-w-[44px] px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={props.disabled}
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? (
            <EyeOff className="text-coffee-accent hover:text-coffee-primary h-4 w-4" />
          ) : (
            <Eye className="text-coffee-accent hover:text-coffee-primary h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
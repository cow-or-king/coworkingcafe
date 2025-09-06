import { Card } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Force dynamic rendering pour toutes les pages auth
export const dynamic = 'force-dynamic';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="from-coffee-light via-coffee-light/80 to-coffee-light/60 relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br px-4 py-8 sm:px-6 lg:px-8">
      {/* Background decorative elements - Mobile first */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-coffee-primary/10 absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl sm:-top-40 sm:-right-40 sm:h-80 sm:w-80"></div>
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl sm:-bottom-40 sm:-left-40 sm:h-80 sm:w-80"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-sm space-y-4 sm:max-w-md sm:space-y-6">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link href="/" className="group inline-block min-h-[44px] min-w-[44px]">
            <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
              <div className="from-coffee-primary to-coffee-accent rounded-full bg-gradient-to-r p-2 transition-transform group-hover:scale-105 sm:p-3">
                <Image
                  src="/logo.svg"
                  alt="Logo Cow or King Café"
                  width={32}
                  height={32}
                  className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16"
                  priority
                />
              </div>
            </div>
            <div className="from-coffee-primary via-coffee-accent to-coffee-primary bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl lg:text-3xl">
              Cow or King Café
            </div>
          </Link>
        </div>

        {/* Main Auth Content */}
        <Card className="border-coffee-primary/20 border bg-white/90 shadow-lg backdrop-blur-sm">
          {children}
        </Card>

        {/* Footer - Mobile first links with proper touch targets */}
        <div className="text-coffee-accent text-center text-xs sm:text-sm">
          <p>
            En continuant, vous acceptez nos{" "}
            <Link 
              href="/terms" 
              className="hover:text-coffee-primary underline min-h-[44px] inline-flex items-center"
            >
              conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link
              href="/privacy"
              className="hover:text-coffee-primary underline min-h-[44px] inline-flex items-center"
            >
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

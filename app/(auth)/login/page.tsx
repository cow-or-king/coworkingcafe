"use client";

// Force dynamic rendering pour useSearchParams
export const dynamic = 'force-dynamic';

// React/Next imports
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

// Third-party libraries
import { zodResolver } from "@hookform/resolvers/zod";

// Internal absolute imports
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { AuthCard } from "@/components/organisms/auth-card";
import { AuthFormField } from "@/components/molecules/auth-form-field";
import { loginSchema, type LoginInput } from "@/lib/auth/validation";

type LoginFormData = LoginInput;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  // Récupérer le callbackUrl depuis les paramètres de l'URL
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
        variant: "success",
      });

      router.push(callbackUrl);
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthCard
      title="Connexion"
      description="Connectez-vous à votre compte pour accéder à votre espace"
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Se connecter"
      isLoading={isLoading}
      alternativeAction={{
        text: "Pas encore de compte ?",
        linkText: "Créer un compte",
        href: "/register"
      }}
    >
      <AuthFormField
        form={form}
        name="email"
        label="Email"
        type="email"
        placeholder="votre@email.com"
        disabled={isLoading}
        autoComplete="email"
      />

      <AuthFormField
        form={form}
        name="password"
        label="Mot de passe"
        type="password"
        placeholder="Votre mot de passe"
        disabled={isLoading}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-coffee-accent hover:text-coffee-primary hover:underline min-h-[44px] inline-flex items-center"
        >
          Mot de passe oublié ?
        </Link>
      </div>
    </AuthCard>
  );
}

"use client";

// React/Next imports
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// Third-party libraries
import { zodResolver } from "@hookform/resolvers/zod";

// Internal absolute imports
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { AuthCard } from "@/components/organisms/auth-card";
import { AuthFormField } from "@/components/molecules/auth-form-field";
import { 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { registerClientSchema, type RegisterClientInput } from "@/lib/auth/validation";

type RegisterFormData = RegisterClientInput;

export default function RegisterPage() {
  const router = useRouter();
  const { register, login, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerClientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data.firstName, data.lastName, data.email, data.password);
      
      toast({
        title: "Compte créé avec succès",
        description: "Connexion automatique en cours...",
        variant: "success",
      });

      // Connexion automatique après création de compte
      try {
        await login(data.email, data.password);
        router.push("/");
      } catch {
        toast({
          title: "Compte créé",
          description: "Veuillez vous connecter manuellement",
          variant: "info",
        });
        router.push("/login");
      }
    } catch (error) {
      toast({
        title: "Erreur de création de compte",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthCard
      title="Créer un compte"
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Créer mon compte"
      isLoading={isLoading}
      alternativeAction={{
        text: "Déjà un compte ?",
        linkText: "Se connecter",
        href: "/login"
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthFormField
          form={form}
          name="firstName"
          label="Prénom"
          placeholder="Votre prénom"
          disabled={isLoading}
          autoComplete="given-name"
        />

        <AuthFormField
          form={form}
          name="lastName"
          label="Nom"
          placeholder="Votre nom"
          disabled={isLoading}
          autoComplete="family-name"
        />
      </div>

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
        placeholder="Créer un mot de passe"
        disabled={isLoading}
        autoComplete="new-password"
      />

      <AuthFormField
        form={form}
        name="confirmPassword"
        label="Confirmer le mot de passe"
        type="password"
        placeholder="Confirmer votre mot de passe"
        disabled={isLoading}
        autoComplete="new-password"
      />

      <FormField
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-y-0 space-x-3">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                disabled={isLoading}
                className="mt-1 min-h-[20px] min-w-[20px]"
              />
            </FormControl>
            <div className="space-y-1 leading-none w-full">
              <FormLabel className="text-sm font-normal text-black block cursor-pointer">
                J&apos;accepte les{" "}
                <Link
                  href="/terms"
                  className="text-coffee-accent hover:text-coffee-primary hover:underline min-h-[44px] inline-flex items-center"
                  target="_blank"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/privacy"
                  className="text-coffee-accent hover:text-coffee-primary hover:underline min-h-[44px] inline-flex items-center"
                  target="_blank"
                >
                  politique de confidentialité
                </Link>
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </AuthCard>
  );
}

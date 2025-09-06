'use client'

// React/Next imports
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

// Third-party libraries
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail } from '@/lib/icons'

// Internal absolute imports
import { Alert, AlertDescription } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { AuthCard } from '@/components/organisms/auth-card'
import { AuthFormField } from '@/components/molecules/auth-form-field'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/validation'

type ForgotPasswordFormData = ForgotPasswordInput

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setSuccess(null)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        setSuccess(
          'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes. Vérifiez également votre dossier de courriers indésirables.'
        )
        form.reset()
        toast({
          title: 'Email envoyé',
          description: 'Vérifiez votre boîte email',
          variant: 'success',
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Erreur',
          description: errorData.message || 'Une erreur est survenue',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue s\'est produite',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthCard
        title="Email envoyé"
        description="Vérifiez votre boîte email pour continuer"
        onSubmit={() => {}}
        submitLabel=""
        isLoading={false}
      >
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <Mail className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="ml-2">{success}</AlertDescription>
        </Alert>

        <div className="border-coffee-primary/20 bg-coffee-primary/5 mt-6 rounded-lg border p-4">
          <div className="text-coffee-accent text-sm">
            <p className="mb-2 font-medium">Que faire ensuite ?</p>
            <ul className="space-y-1 text-xs">
              <li>• Vérifiez votre boîte email (y compris les spams)</li>
              <li>• Cliquez sur le lien dans l&apos;email reçu</li>
              <li>• Créez un nouveau mot de passe sécurisé</li>
              <li>• Le lien expire dans 24 heures</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <Link
            href="/login"
            className="text-coffee-accent hover:text-coffee-primary inline-flex items-center text-sm hover:underline min-h-[44px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Mot de passe oublié"
      description="Entrez votre adresse email pour recevoir un lien de réinitialisation"
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Envoyer le lien de réinitialisation"
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
        label="Adresse email"
        type="email"
        placeholder="votre@email.com"
        disabled={isLoading}
        autoComplete="email"
      />

      <div className="space-y-2 text-center">
        <Link
          href="/login"
          className="text-coffee-accent hover:text-coffee-primary inline-flex items-center text-sm hover:underline min-h-[44px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </AuthCard>
  )
}

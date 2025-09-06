/**
 * Composant de statut de sécurité
 * Affiche l'état de la sécurité et les informations de session
 */

'use client'

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/lib/models/user/types'

interface SecurityStatusProps {
  showDetails?: boolean
  className?: string
}

export function SecurityStatus({
  showDetails = false,
  className = '',
}: SecurityStatusProps) {
  const auth = useAuth()

  if (!auth.isAuthenticated) {
    return null
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'staff':
        return 'bg-green-100 text-green-800'
      case 'client':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '👑'
      case 'manager':
        return '👤'
      case 'staff':
        return '👷'
      case 'client':
        return '👋'
      default:
        return '❓'
    }
  }

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-900">Connecté</span>
          </div>

          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(auth.user!.role)}`}
          >
            <span className="mr-1">{getRoleIcon(auth.user!.role)}</span>
            {auth.user!.role}
          </div>
        </div>

        {showDetails && (
          <div className="text-xs text-gray-500">
            Redux: ✅
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-gray-700">Utilisateur:</span>
              <div className="text-gray-600">
                {auth.user!.firstName} {auth.user!.lastName}
              </div>
              <div className="text-gray-500">{auth.user!.email}</div>
            </div>

            <div>
              <span className="font-medium text-gray-700">Sécurité:</span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Session active:</span>
                  <span className="text-green-600">✅</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compte actif:</span>
                  <span
                    className={
                      auth.user!.isActive ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {auth.user!.isActive ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Redux Store:</span>
                  <span className="text-green-600">
                    ✅
                  </span>
                </div>
              </div>
            </div>
          </div>

          {auth.user!.permissions && auth.user!.permissions.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <span className="text-xs font-medium text-gray-700">
                Permissions:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {auth.user!.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-block rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Composant d'indicateur de sécurité simple
 */
export function SecurityIndicator() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
        <span className="text-xs text-gray-500">Chargement...</span>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
        <span className="text-xs text-red-600">Non connecté</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
      <span className="text-xs text-green-600">Sécurisé</span>
    </div>
  )
}

/**
 * Hook pour vérifier l'état de sécurité
 */
export function useSecurityStatus() {
  const auth = useAuth()

  return {
    isSecure: auth.isAuthenticated && auth.user?.isActive,
    hasRedux: true, // Redux is always available
    isActive: auth.user?.isActive || false,
    isAuthenticated: auth.isAuthenticated,
    role: auth.user?.role,
    permissions: auth.user?.permissions || [],
  }
}

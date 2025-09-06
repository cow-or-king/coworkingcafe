import type { Schema } from "mongoose";
import type { IUser } from "./types";

export function addIndexes(schema: Schema<IUser>): void {
  // Index pour les recherches fréquentes
  schema.index({ email: 1 }, { unique: true, name: "email_unique" });
  schema.index({ role: 1, isActive: 1 }, { name: "role_active" });
  schema.index({ status: 1, createdAt: -1 }, { name: "status_created" });
  schema.index({ lastLoginAt: -1 }, { name: "last_login" });
  schema.index({ isOnline: 1, lastActive: -1 }, { name: "online_presence" });

  // Index de texte pour la recherche
  schema.index(
    {
      firstName: "text",
      lastName: "text",
      email: "text",
      name: "text",
    },
    { name: "user_text_search" }
  );

  // Index TTL pour supprimer automatiquement les comptes non vérifiés après 7 jours
  schema.index(
    { createdAt: 1 },
    {
      name: "unverified_accounts_ttl",
      expireAfterSeconds: 7 * 24 * 60 * 60, // 7 jours
      partialFilterExpression: {
        emailVerified: null,
        status: "pending",
      },
    }
  );
}
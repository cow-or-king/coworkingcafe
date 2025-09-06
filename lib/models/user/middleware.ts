import type { Schema } from "mongoose";
import type { IUser } from "./types";

export function addMiddleware(schema: Schema<IUser>): void {
  // Middleware pre-save pour des validations personnalisées
  schema.pre("save", function (next) {
    // S'assurer que firstName et lastName sont définis si name l'est
    if (this.name && !this.firstName && !this.lastName) {
      const nameParts = this.name.split(" ");
      this.firstName = nameParts[0] || "";
      this.lastName = nameParts.slice(1).join(" ") || "";
    }

    // S'assurer que name est défini si firstName et lastName le sont
    if (this.firstName && this.lastName && !this.name) {
      this.name = `${this.firstName} ${this.lastName}`;
    }

    next();
  });

  // Middleware pour gérer la limite de l'historique de connexion
  schema.pre("save", function (next) {
    if (this.loginHistory && this.loginHistory.length > 100) {
      // Garder seulement les 100 dernières tentatives
      this.loginHistory = this.loginHistory
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 100);
    }
    next();
  });
}
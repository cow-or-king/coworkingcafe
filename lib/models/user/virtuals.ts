import type { Schema } from "mongoose";
import type { IUser } from "./types";

export function addVirtuals(schema: Schema<IUser>): void {
  // Méthodes virtuelles
  schema.virtual("fullName").get(function (this: IUser) {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.name || this.firstName || this.lastName || "";
  });

  schema.virtual("displayName").get(function (this: IUser) {
    return this.fullName || this.email.split("@")[0];
  });

  schema.virtual("isEmailVerified").get(function (this: IUser) {
    return !!this.emailVerified;
  });

  schema.virtual("daysSinceLastLogin").get(function (this: IUser) {
    if (!this.lastLoginAt) return null;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastLoginAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });
}
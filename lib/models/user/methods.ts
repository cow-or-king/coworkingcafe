import type { Schema } from "mongoose";
import type { IUser, UserRole } from "./types";

export function addInstanceMethods(schema: Schema<IUser>): void {
  // Méthodes d'instance
  schema.methods.hasPermission = function (
    this: IUser,
    permission: string
  ): boolean {
    return this.permissions.includes(permission) || this.role === "admin";
  };

  schema.methods.hasRole = function (
    this: IUser,
    roles: UserRole | UserRole[]
  ): boolean {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(this.role);
  };

  schema.methods.canManage = function (this: IUser): boolean {
    return ["admin", "manager"].includes(this.role);
  };

  schema.methods.isAccountLocked = function (this: IUser): boolean {
    return this.status === "suspended" || !this.isActive;
  };

  schema.methods.getRecentLoginAttempts = function (
    this: IUser,
    hours: number = 1
  ): number {
    if (!this.loginHistory || this.loginHistory.length === 0) return 0;

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.loginHistory.filter(
      (attempt) => attempt.timestamp > cutoff && !attempt.success
    ).length;
  };
}
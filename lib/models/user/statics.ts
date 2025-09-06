import type { Schema } from "mongoose";
import type { 
  IUser, 
  UserRole, 
  ActiveUsersQuery, 
  SearchUsersQuery 
} from "./types";

export function addStaticMethods(schema: Schema<IUser>): void {
  // Méthodes statiques avec types explicites
  schema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase().trim() });
  };

  schema.statics.findActiveUsers = function (role?: UserRole) {
    const query: ActiveUsersQuery = { isActive: true, status: "active" };
    if (role) {
      (query as ActiveUsersQuery & { role: UserRole }).role = role;
    }
    return this.find(query).sort({ lastLoginAt: -1 });
  };

  schema.statics.findByRole = function (role: UserRole) {
    return this.find({ role, isActive: true }).sort({ createdAt: -1 });
  };

  schema.statics.searchUsers = function (
    searchTerm: string,
    role?: UserRole,
    limit: number = 20
  ) {
    const query: SearchUsersQuery = {
      $or: [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
      ],
    };

    if (role) {
      (query as SearchUsersQuery & { role: UserRole }).role = role;
    }

    return this.find(query)
      .select(
        "-password -resetPasswordToken -emailVerificationToken -twoFactorSecret"
      )
      .sort({ lastLoginAt: -1 })
      .limit(limit);
  };
}
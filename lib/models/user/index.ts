import { model, models } from "mongoose";
import { userSchema } from "./schema";
import { addIndexes } from "./indexes";
import { addVirtuals } from "./virtuals";
import { addInstanceMethods } from "./methods";
import { addStaticMethods } from "./statics";
import { addMiddleware } from "./middleware";
import type { IUser } from "./types";

// Ajouter tous les éléments au schéma
addIndexes(userSchema);
addVirtuals(userSchema);
addInstanceMethods(userSchema);
addStaticMethods(userSchema);
addMiddleware(userSchema);

// Exporter le modèle
export const User = models.User || model<IUser>("User", userSchema);

// Export par défaut (requis pour la compatibilité)
export { User as default };

// Re-export des types pour faciliter les imports
export type * from "./types";
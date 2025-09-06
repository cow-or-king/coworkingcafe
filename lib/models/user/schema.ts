import { Schema } from "mongoose";
import type { IUser } from "./types";

export const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "L'adresse email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (value: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Format d'adresse email invalide",
      },
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
      // Le mot de passe est déjà hashé avec bcrypt
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "Le prénom ne peut dépasser 50 caractères"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Le nom ne peut dépasser 50 caractères"],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Le nom complet ne peut dépasser 100 caractères"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "La bio ne peut dépasser 500 caractères"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "manager", "staff", "client"],
        message: "Rôle invalide",
      },
      required: [true, "Le rôle utilisateur est obligatoire"],
      default: "client",
      index: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended", "pending"],
        message: "Statut invalide",
      },
      default: "active",
      index: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          return !value || /^(https?:\/\/|\/|data:image\/)/.test(value);
        },
        message: "Format d'image invalide",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          return !value || /^[+]?[\d\s()-]{10,}$/.test(value);
        },
        message: "Format de numéro de téléphone invalide",
      },
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      language: { type: String, default: "fr" },
      timezone: { type: String, default: "Europe/Paris" },
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    loginHistory: [
      {
        timestamp: { type: Date, required: true },
        ip: { type: String, required: true },
        userAgent: { type: String, required: true },
        success: { type: Boolean, required: true },
      },
    ],
    resetPasswordToken: {
      type: String,
      select: false, // Ne pas inclure par défaut dans les requêtes
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    twoFactorSecret: {
      type: String,
      select: false, // Très sensible - ne jamais exposer
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true, // Index pour les requêtes de présence
    },
    lastActive: {
      type: Date,
      default: null,
      index: true, // Index pour le nettoyage des sessions
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        // Supprimer les champs sensibles lors de la sérialisation JSON
        const {
          password: _password,
          resetPasswordToken: _resetPasswordToken,
          resetPasswordExpires: _resetPasswordExpires,
          emailVerificationToken: _emailVerificationToken,
          emailVerificationExpires: _emailVerificationExpires,
          twoFactorSecret: _twoFactorSecret,
          ...sanitized
        } = ret;
        return sanitized;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        // Supprimer les champs sensibles lors de la conversion en objet
        const {
          password: _password,
          resetPasswordToken: _resetPasswordToken,
          resetPasswordExpires: _resetPasswordExpires,
          emailVerificationToken: _emailVerificationToken,
          emailVerificationExpires: _emailVerificationExpires,
          twoFactorSecret: _twoFactorSecret,
          ...sanitized
        } = ret;
        return sanitized;
      },
    },
  }
);
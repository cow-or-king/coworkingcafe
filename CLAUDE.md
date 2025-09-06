# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with Turbopack (fast reload)
- `pnpm build` - Build production application (stable, Northflank-ready)
- `pnpm build:turbo` - Build with Turbopack (experimental, dev only)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Package Management
This project uses pnpm with packageManager constraint set to "pnpm@10.10.0"

### Deployment
- **Northflank/Heroku Ready**: Uses `heroku-postbuild` script for automatic builds
- **Standalone Output**: Configured with `output: 'standalone'` for containerized deployments
- **Dynamic Rendering**: Auth pages force dynamic rendering (`export const dynamic = 'force-dynamic'`)
- **Bundle Size**: ~102KB first load, individual pages 3-4KB (mobile-first optimized)

## Architecture & Structure

This is a Next.js 15 coworking café application built with the App Router, TypeScript, and React 19.

### Key Architectural Patterns

**Authentication & Authorization**
- NextAuth.js v4 for authentication with custom user roles (admin, manager, staff, client)
- Role-based access control with hierarchical permissions system in `types/auth.ts`
- Client-safe auth utilities in `lib/auth-utils-client.ts`
- Route protection with conditional navigation/footer rendering

**Database & Models**  
- MongoDB with Mongoose ODM
- User model (`lib/models/user`) includes comprehensive role system, security features (2FA, login history), and automatic cleanup of unverified accounts
- Additional type definitions for reservations, spaces, bookings, blog, and time entries

**UI Architecture**
- Radix UI components with custom variants using class-variance-authority
- Tailwind CSS v4 with custom utilities (tw-animate-css)
- Component structure: `/components/ui/` for base components, `/components/auth/` for auth-specific components
- Conditional rendering patterns for navigation and footer based on routes
- Toast notifications and theme provider setup

**State Management**
- React Hook Form with Zod validation for forms
- Next-themes for dark/light theme switching
- Auth state managed through NextAuth SessionProvider

### File Organization
- `/app/` - Next.js App Router pages with auth routes in `(auth)` group
- `/components/` - Reusable React components organized by function
- `/lib/` - Utility functions and database models
- `/types/` - TypeScript type definitions
- French language used for UI text and validation messages

### Key Features
- Multi-role user management system
- Coworking space booking and reservation system  
- Blog/content management capabilities
- Real-time presence tracking with Socket.IO client
- Comprehensive security features (account lockout, login history, email verification)
- Cookie consent and legal compliance components
- @consigne.md
/**
 * Redux hooks
 * Typed hooks following consigne.md best practices
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';

// Typed hooks for better developer experience
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Auth-specific selectors
export const useAuth = () => useAppSelector((state) => state.auth);

// Convenience hooks
export const useCurrentUser = () => useAppSelector((state) => state.auth.user);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);
export const useAuthLoading = () => useAppSelector((state) => state.auth.isLoading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);
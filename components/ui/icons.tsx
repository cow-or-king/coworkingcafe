// Lazy-loaded icon components for better code splitting
// Following consigne.md performance standards

import dynamic from 'next/dynamic'

// Loading skeleton for icons
const IconSkeleton = ({ className = "h-4 w-4" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

// Commonly used icons - loaded immediately
export { 
  Menu, 
  X, 
  User, 
  LogIn, 
  LogOut 
} from 'lucide-react'

// Less common icons - lazy loaded
export const LazyIcons = {
  Cookie: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Cookie })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  Settings: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Settings })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  Check: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Check })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  Shield: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Shield })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  Mail: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Mail })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  ArrowLeft: dynamic(() => import('lucide-react').then(mod => ({ default: mod.ArrowLeft })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  Eye: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Eye })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  EyeOff: dynamic(() => import('lucide-react').then(mod => ({ default: mod.EyeOff })), {
    loading: () => <IconSkeleton />,
    ssr: false
  }),
  
  Loader2: dynamic(() => import('lucide-react').then(mod => ({ default: mod.Loader2 })), {
    loading: () => <IconSkeleton className="h-4 w-4 animate-spin" />,
    ssr: false
  }),
  
  AlertTriangle: dynamic(() => import('lucide-react').then(mod => ({ default: mod.AlertTriangle })), {
    loading: () => <IconSkeleton />,
    ssr: false
  })
}

// Icon bundle loader for specific features
export const IconBundles = {
  auth: () => Promise.all([
    import('lucide-react').then(mod => mod.Eye),
    import('lucide-react').then(mod => mod.EyeOff), 
    import('lucide-react').then(mod => mod.Loader2),
    import('lucide-react').then(mod => mod.ArrowLeft)
  ]),
  
  legal: () => Promise.all([
    import('lucide-react').then(mod => mod.Cookie),
    import('lucide-react').then(mod => mod.Settings),
    import('lucide-react').then(mod => mod.Shield),
    import('lucide-react').then(mod => mod.Check)
  ])
}
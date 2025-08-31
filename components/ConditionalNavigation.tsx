"use client";

import Navigation from "./Navigation";
import { usePathname } from "next/navigation";

export default function ConditionalNavigation() {
  const pathname = usePathname();

  // Ne pas afficher la navigation sur les pages du dashboard
  const isDashboardPage = pathname?.startsWith("/dashboard");

  if (isDashboardPage) {
    return null;
  }

  return <Navigation />;
}

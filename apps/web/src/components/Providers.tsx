"use client";

import React, { type ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";

/**
 * Client-side providers wrapper.
 * Place all `"use client"` context providers here and import into app/layout.tsx.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

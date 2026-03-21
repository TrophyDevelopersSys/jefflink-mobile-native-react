"use client";

import React from "react";
import { CmsSubNav } from "../../../src/components/admin/cms/CmsSubNav";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CmsSubNav />
      {children}
    </div>
  );
}

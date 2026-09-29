"use client";
import React, { useState } from "react";
import scss from "./layout.module.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toaster from "@/components/ui/toast/Toaster";
import { useServerThemeSync } from "@/lib/theme/useTheme";
import type { Locale } from "@/i18n/config";
import { I18nProvider } from "@/i18n/I18nProvider";

interface IChildrenProps {
  children: React.ReactNode;
  /** From the server (cookie / Accept-Language) */
  locale: Locale;
}

/** Applies the signed-in account's theme (needs the query client, so it lives inside it) */
const ServerThemeSync = () => {
  useServerThemeSync();
  return null;
};

const LayoutClient = ({ children, locale }: IChildrenProps) => {
  // One client per browser session — not re-created on every render
  const [qc] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={qc}>
      <I18nProvider locale={locale}>
        <ServerThemeSync />
        <div className={scss.layout}>{children}</div>
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
};

export default LayoutClient;

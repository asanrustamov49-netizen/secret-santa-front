"use client";
import BrandLoader from "@/components/ui/brandLoader/BrandLoader";
import { useI18n } from "@/i18n/I18nProvider";

// A page of the signed-in area that is still rendering: shown inside the app shell
// (sidebar and tab bar stay), and only if it takes a moment (delayed) — fast
// navigations never flash it. Pages that are already here show their own skeletons.
// A client component: the fallback stays static, so Next can prefetch it.
export default function AppLoading() {
  const { m } = useI18n();
  return <BrandLoader label={m.loader.page} delayed />;
}

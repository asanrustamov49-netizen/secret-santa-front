import { Suspense } from "react";
import { pageTitle } from "@/i18n/server";
import Settings from "@/components/pages/settings/Settings";

export const generateMetadata = pageTitle("settings");

export default function SettingsPage() {
  return (
    // useSearchParams (?reauth= after confirming with Google) needs a Suspense boundary
    <Suspense>
      <Settings />
    </Suspense>
  );
}

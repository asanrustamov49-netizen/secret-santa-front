import { Suspense } from "react";
import { pageTitle } from "@/i18n/server";
import AiAssistant from "@/components/pages/ai/AiAssistant";

export const generateMetadata = pageTitle("ai");

export default function AiPage() {
  return (
    // useSearchParams (?c= — the open conversation) needs a Suspense boundary
    <Suspense>
      <AiAssistant />
    </Suspense>
  );
}

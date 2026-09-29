import { pageTitle } from "@/i18n/server";
import SantaReveal from "@/components/pages/events/SantaReveal";

export const generateMetadata = pageTitle("mySanta");

export default function SantaRevealPage() {
  return <SantaReveal />;
}

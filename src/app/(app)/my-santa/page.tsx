import { pageTitle } from "@/i18n/server";
import MySanta from "@/components/pages/events/MySanta";

export const generateMetadata = pageTitle("mySanta");

export default function MySantaPage() {
  return <MySanta />;
}

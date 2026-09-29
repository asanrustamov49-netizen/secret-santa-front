import { pageTitle } from "@/i18n/server";
import JoinEvent from "@/components/pages/join/JoinEvent";

export const generateMetadata = pageTitle("invited");

export default function JoinEventPage() {
  return <JoinEvent />;
}

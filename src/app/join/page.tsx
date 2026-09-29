import { pageTitle } from "@/i18n/server";
import JoinStart from "@/components/pages/join/JoinStart";

export const generateMetadata = pageTitle("joinStart");

export default function JoinStartPage() {
  return <JoinStart />;
}

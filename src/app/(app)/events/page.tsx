import { pageTitle } from "@/i18n/server";
import MyEvents from "@/components/pages/events/MyEvents";

export const generateMetadata = pageTitle("myEvents");

export default function MyEventsPage() {
  return <MyEvents />;
}

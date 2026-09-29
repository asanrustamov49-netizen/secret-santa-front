import { pageTitle } from "@/i18n/server";
import EventPage from "@/components/pages/events/EventPage";

export const generateMetadata = pageTitle("event");

export default function EventRoute() {
  return <EventPage />;
}

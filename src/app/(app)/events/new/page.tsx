import { pageTitle } from "@/i18n/server";
import CreateEvent from "@/components/pages/events/CreateEvent";

export const generateMetadata = pageTitle("createEvent");

export default function CreateEventPage() {
  return <CreateEvent />;
}

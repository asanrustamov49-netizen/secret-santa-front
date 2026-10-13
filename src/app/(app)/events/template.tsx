import { ViewTransition, type ReactNode } from "react";
import { PAGE_TRANSITION } from "@/lib/ui/pageTransition";

// Inside My Events: the list ↔ one event ↔ the new-event wizard
export default function EventsTemplate({ children }: { children: ReactNode }) {
  return <ViewTransition {...PAGE_TRANSITION}>{children}</ViewTransition>;
}

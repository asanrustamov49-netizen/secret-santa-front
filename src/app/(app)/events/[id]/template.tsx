import { ViewTransition, type ReactNode } from "react";
import { PAGE_TRANSITION } from "@/lib/ui/pageTransition";

// One event ↔ its Secret Santa reveal ↔ the anonymous chat
export default function EventTemplate({ children }: { children: ReactNode }) {
  return <ViewTransition {...PAGE_TRANSITION}>{children}</ViewTransition>;
}

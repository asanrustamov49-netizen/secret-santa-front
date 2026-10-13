import { ViewTransition } from "react";
import { PAGE_TRANSITION } from "@/lib/ui/pageTransition";

// Remounts on every top-level section change (dashboard → events…): the page content
// animates out and in, the shell around it (sidebar, tab bar) stays put
export default function AppTemplate({ children }: LayoutProps<"/">) {
  return <ViewTransition {...PAGE_TRANSITION}>{children}</ViewTransition>;
}

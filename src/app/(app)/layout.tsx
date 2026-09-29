import AppShell from "@/components/layout/appShell/AppShell";

// Signed-in area. proxy.ts sends guests to /login before this even renders;
// AppShell handles a session that expires while the page is open.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}

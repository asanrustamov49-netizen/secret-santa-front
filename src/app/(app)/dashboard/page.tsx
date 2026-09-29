import { pageTitle } from "@/i18n/server";
import Dashboard from "@/components/pages/dashboard/Dashboard";

export const generateMetadata = pageTitle("dashboard");

export default function DashboardPage() {
  return <Dashboard />;
}

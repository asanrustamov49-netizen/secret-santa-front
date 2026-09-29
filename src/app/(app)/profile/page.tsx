import { pageTitle } from "@/i18n/server";
import Profile from "@/components/pages/profile/Profile";

export const generateMetadata = pageTitle("profile");

export default function ProfilePage() {
  return <Profile />;
}

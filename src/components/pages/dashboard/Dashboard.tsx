"use client";
import { useState } from "react";
import type { SantaEvent } from "@/lib/api/events";
import { useSession } from "@/lib/auth/useSession";
import { useEvents, useMyMatches } from "@/lib/events/useEvents";
import { useWishlist } from "@/lib/profile/useProfile";
import ActiveSantaCard from "./ActiveSantaCard";
import CountdownCard from "./CountdownCard";
import EventsSection from "./EventsSection";
import ProfileCard from "./ProfileCard";
import QuickActions from "./QuickActions";
import WelcomeSection from "./WelcomeSection";
import scss from "./dashboard.module.scss";

/** What needs me most: a gift to unwrap → a recipient to shop for → a group still forming */
function urgency(event: SantaEvent) {
  if (event.status === "drawn" && !event.revealed) return 0;
  if (event.status === "drawn") return 1;
  return 2;
}

/** Most urgent first; within the same urgency, the nearest date (undated last) */
function byUrgency(a: SantaEvent, b: SantaEvent) {
  return (
    urgency(a) - urgency(b) ||
    (a.eventDate ?? "9999").localeCompare(b.eventDate ?? "9999") ||
    b.createdAt.localeCompare(a.createdAt)
  );
}

const Dashboard = () => {
  const { data: user } = useSession();
  const events = useEvents();
  const matches = useMyMatches();
  const wishlist = useWishlist();
  const [joinOpen, setJoinOpen] = useState(false);

  // AppShell shows its own loader until the session exists
  if (!user) return null;

  const all = events.data ?? [];
  const active = all.filter((e) => e.status !== "completed").sort(byUrgency);
  const pastCount = all.length - active.length;
  const unopened = active.filter((e) => e.status === "drawn" && !e.revealed).length;
  const featured = active[0] ?? null;

  // The API only fills recipientName after I revealed my match — nothing is worked out here
  const recipientName = featured
    ? matches.isPending
      ? undefined
      : (matches.data?.find((m) => m.eventId === featured.id)?.recipientName ?? null)
    : null;

  const openJoin = () => {
    setJoinOpen(true);
    document.getElementById("quick-actions")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className={scss.page}>
      <WelcomeSection name={user.name} />

      <div className={scss.topGrid}>
        <ActiveSantaCard
          event={featured}
          recipientName={recipientName}
          moreToReveal={Math.max(0, unopened - (featured && urgency(featured) === 0 ? 1 : 0))}
          isPending={events.isPending}
          isError={events.isError}
          onRetry={() => events.refetch()}
          onJoin={openJoin}
        />
        <CountdownCard events={active} isPending={events.isPending} isError={events.isError} />
      </div>

      <QuickActions joinOpen={joinOpen} onToggleJoin={() => setJoinOpen((open) => !open)} unopened={unopened} />

      <div className={scss.mainGrid}>
        <EventsSection
          active={active}
          pastCount={pastCount}
          isPending={events.isPending}
          isError={events.isError}
          onRetry={() => events.refetch()}
        />
        <ProfileCard
          user={user}
          wishlistCount={wishlist.data?.length}
          wishlistError={wishlist.isError}
          onRetry={() => wishlist.refetch()}
        />
      </div>
    </div>
  );
};

export default Dashboard;

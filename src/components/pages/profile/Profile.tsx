"use client";
import { useSession } from "@/lib/auth/useSession";
import { useWishlist } from "@/lib/profile/useProfile";
import InterestsCard from "./InterestsCard";
import ProfileHero from "./ProfileHero";
import WishlistCard from "./WishlistCard";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./profile.module.scss";

const Profile = () => {
  const { data: user } = useSession();
  const wishlist = useWishlist();
  const { m } = useI18n();
  if (!user) return null;

  const items = wishlist.data ?? [];

  return (
    <div className={scss.page}>
      <header>
        <h1 className={scss.title}>{m.profile.title}</h1>
        <p className={scss.subtitle}>{m.profile.subtitle}</p>
      </header>

      <ProfileHero user={user} wishlistCount={items.length} />

      <div className={scss.grid}>
        <InterestsCard user={user} />
        <WishlistCard
          items={items}
          isLoading={wishlist.isPending}
          loadError={wishlist.error}
          onRetry={() => wishlist.refetch()}
        />
      </div>
    </div>
  );
};

export default Profile;

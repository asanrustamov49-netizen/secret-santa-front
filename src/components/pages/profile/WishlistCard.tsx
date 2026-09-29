"use client";
import { useEffect, useState } from "react";
import { PiArrowSquareOutBold, PiGiftFill, PiPencilSimpleBold, PiPlusBold, PiTrashBold } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { getErrorMessage } from "@/lib/api/client";
import { MAX_WISHLIST_ITEMS, type WishlistItem } from "@/lib/api/profile";
import { formatPrice } from "@/lib/profile/readiness";
import { useAddWishlistItem, useRemoveWishlistItem, useUpdateWishlistItem } from "@/lib/profile/useProfile";
import WishlistItemForm from "./WishlistItemForm";
import { useI18n } from "@/i18n/I18nProvider";
import scss from "./profile.module.scss";

/** "shop.example.com/very/long/path" → "shop.example.com" */
function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** First click arms the button, a second click within 3 s deletes — no modal, no accidents */
const DeleteButton = ({ title, onConfirm }: { title: string; onConfirm: () => void }) => {
  const [armed, setArmed] = useState(false);
  const { m } = useI18n();

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  return armed ? (
    <button type="button" className={`${scss.iconButton} ${scss.confirmDelete}`} onClick={onConfirm} autoFocus>
      {m.profile.wishlist.deleteConfirm}
    </button>
  ) : (
    <button type="button" className={scss.iconButton} onClick={() => setArmed(true)} aria-label={m.profile.wishlist.delete(title)}>
      <PiTrashBold />
    </button>
  );
};

interface WishlistCardProps {
  items: WishlistItem[];
  isLoading: boolean;
  loadError: unknown;
  onRetry: () => void;
}

const WishlistCard = ({ items, isLoading, loadError, onRetry }: WishlistCardProps) => {
  const add = useAddWishlistItem();
  const update = useUpdateWishlistItem();
  const remove = useRemoveWishlistItem();
  const { m, locale } = useI18n();
  const t = m.profile.wishlist;

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isFull = items.length >= MAX_WISHLIST_ITEMS;
  // An empty wishlist opens straight into the form: one less click
  const showAddForm = !isFull && (isAdding || (!isLoading && !loadError && items.length === 0));

  const startEditing = (id: string) => {
    update.reset();
    setEditingId(id);
    setIsAdding(false);
  };

  return (
    <section className={`surface-card ${scss.card} ${scss.wishlistCard}`} aria-labelledby="wishlist-title">
      <header className={scss.cardHeader}>
        <span className={`${scss.cardIcon} ${scss.iconGold}`} aria-hidden="true">
          <PiGiftFill />
        </span>
        <div>
          <h2 id="wishlist-title" className={scss.cardTitle}>
            {t.title}
          </h2>
          <p className={scss.cardText}>{t.text}</p>
        </div>
        <span className={scss.counter}>
          {items.length}/{MAX_WISHLIST_ITEMS}
        </span>
      </header>

      {isLoading && (
        <ul className={scss.gifts} aria-busy="true" aria-label={t.loading}>
          {[0, 1].map((i) => (
            <li key={i} className={`${scss.gift} ${scss.skeleton}`} />
          ))}
        </ul>
      )}

      {Boolean(loadError) && (
        <div className={scss.loadError} role="alert">
          <p>{getErrorMessage(loadError, m, t.loadError)}</p>
          <button type="button" className="btn btn-outline" onClick={onRetry}>
            {m.common.tryAgain}
          </button>
        </div>
      )}

      {!isLoading && !loadError && items.length === 0 && (
        <div className={scss.emptyGifts}>
          <GiftBox size={72} sparkles />
          <p>
            <strong>{t.emptyStrong}</strong> {t.emptyText}
          </p>
        </div>
      )}

      {items.length > 0 && (
        <ul className={scss.gifts}>
          {items.map((item, i) =>
            item.id === editingId ? (
              <li key={item.id} className={scss.giftEditing}>
                <WishlistItemForm
                  item={item}
                  isPending={update.isPending}
                  serverError={update.isError ? getErrorMessage(update.error, m) : undefined}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(payload) =>
                    update.mutate({ id: item.id, ...payload }, { onSuccess: () => setEditingId(null) })
                  }
                />
              </li>
            ) : (
              <li key={item.id} className={scss.gift} data-tone={i % 3}>
                <div className={scss.giftBody}>
                  <p className={scss.giftTitle}>{item.title}</p>
                  <div className={scss.giftMeta}>
                    {item.priceApprox != null && <span className={scss.price}>{formatPrice(item.priceApprox, locale)}</span>}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={`touch-target ${scss.giftLink}`}>
                        {hostOf(item.url)}
                        <PiArrowSquareOutBold aria-hidden="true" />
                        <span className="visually-hidden">{m.common.opensInNewTab}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className={scss.giftActions}>
                  <button
                    type="button"
                    className={scss.iconButton}
                    onClick={() => startEditing(item.id)}
                    aria-label={t.edit(item.title)}
                  >
                    <PiPencilSimpleBold />
                  </button>
                  <DeleteButton title={item.title} onConfirm={() => remove.mutate(item.id)} />
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {remove.isError && (
        <p className={scss.fieldError} role="alert">
          {getErrorMessage(remove.error, m, t.deleteError)}
        </p>
      )}

      {showAddForm ? (
        <div className={scss.addPanel}>
          <WishlistItemForm
            key={items.length /* fresh, empty form after each added gift */}
            isPending={add.isPending}
            serverError={add.isError ? getErrorMessage(add.error, m) : undefined}
            onCancel={items.length > 0 ? () => setIsAdding(false) : undefined}
            onSubmit={(payload) => add.mutate(payload)}
          />
        </div>
      ) : (
        !isLoading &&
        !loadError && (
          <button
            type="button"
            className={`btn btn-outline ${scss.addButton}`}
            disabled={isFull}
            onClick={() => {
              add.reset();
              setIsAdding(true);
              setEditingId(null);
            }}
          >
            <PiPlusBold aria-hidden="true" />
            {isFull ? t.full(MAX_WISHLIST_ITEMS) : t.add}
          </button>
        )
      )}
    </section>
  );
};

export default WishlistCard;

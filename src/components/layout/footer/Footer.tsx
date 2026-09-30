import Link from "next/link";
import { PiArrowUpRight, PiHeartFill } from "react-icons/pi";
import GiftBox from "@/components/ui/giftBox/GiftBox";
import { getI18n } from "@/i18n/server";
import scss from "./footer.module.scss";

const Footer = async () => {
  const { m } = await getI18n();
  const t = m.footer;
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t.product,
      links: [
        { href: "/#how-it-works", label: t.howItWorks },
        { href: "/#features", label: t.features },
        { href: "/#gift-ideas", label: t.giftIdeas },
      ],
    },
    {
      title: t.company,
      links: [{ href: "/#about", label: t.about }],
    },
    {
      title: t.legal,
      links: [
        { href: "/privacy", label: t.privacy },
        { href: "/terms", label: t.terms },
      ],
    },
  ];

  return (
    <footer className={scss.footer} data-theme="dark">
      <div className={`container ${scss.top}`}>
        <div className={scss.brand}>
          <Link href="/" className={scss.logo} aria-label={m.common.logo}>
            <span className={scss.logoIcon}>
              <GiftBox size={32} />
            </span>

            <span className={scss.logoText}>{m.common.logo}</span>
          </Link>

          <p className={scss.tagline}>{t.tagline}</p>

          <Link href="/signup" className={scss.cta}>
            <span>{t.giftIdeas}</span>
            <PiArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        <nav className={scss.columns} aria-label={t.nav}>
          {columns.map((column) => (
            <div className={scss.column} key={column.title}>
              <p className={scss.columnTitle}>{column.title}</p>

              <ul className={scss.links}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={scss.link}>
                      <span>{link.label}</span>
                      <PiArrowUpRight
                        className={scss.linkIcon}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={`container ${scss.bottom}`}>
        <p className={scss.copyright}>{t.rights(year)}</p>

        <p className={scss.love}>
          {t.madeWith}
          <PiHeartFill className={scss.heart} aria-label={t.love} />
          {t.forHolidays}
        </p>
      </div>
    </footer>
  );
};

export default Footer;

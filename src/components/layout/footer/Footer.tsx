import Link from "next/link";
import { PiHeartFill } from "react-icons/pi";
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
      links: [
        { href: "/#about", label: t.about },
        { href: "/contact", label: t.contact },
      ],
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
          <Link href="/" className={scss.logo}>
            <GiftBox size={30} />
            <span>{m.common.logo}</span>
          </Link>
          <p className={scss.tagline}>{t.tagline}</p>
        </div>

        <nav className={scss.columns} aria-label={t.nav}>
          {columns.map((column) => (
            <div key={column.title}>
              <p className={scss.columnTitle}>{column.title}</p>
              <ul className={scss.links}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={scss.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={`container ${scss.bottom}`}>
        <p>{t.rights(year)}</p>
        <p className={scss.love}>
          {t.madeWith} <PiHeartFill className={scss.heart} aria-label={t.love} /> {t.forHolidays}
        </p>
      </div>
    </footer>
  );
};

export default Footer;

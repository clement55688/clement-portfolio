"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/site.module.css";

const links = [
  { href: "/tools", label: "Tools" },
  { href: "/play", label: "Play" },
  { href: "/#experience", label: "Experience" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <Link href="/" className={styles.wordmark} aria-label="Clement Lin home">Clement Lin<span>.</span></Link>
      <nav aria-label="Primary">
        {links.map((link) => {
          const active = !link.href.includes("#") && pathname.startsWith(link.href);
          return <Link key={link.href} href={link.href} className={active ? styles.navActive : undefined} aria-current={active ? "page" : undefined} data-secondary={link.href.includes("#") || undefined}>{link.label}</Link>;
        })}
      </nav>
      <div className={styles.navEnd}>
        <a className={styles.navGhost} href="https://github.com/clement55688" target="_blank" rel="noreferrer">GitHub ↗</a>
        <Link className={styles.navCta} href="/tools/dj-intake">Get DJ Intake</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} Clement Lin</span>
      <nav aria-label="Footer">
        <Link href="/tools">Tools</Link>
        <Link href="/play">Play</Link>
        <Link href="/tools/dj-intake">DJ Intake</Link>
        <a href="https://github.com/clement55688" target="_blank" rel="noreferrer">GitHub ↗</a>
      </nav>
    </footer>
  );
}

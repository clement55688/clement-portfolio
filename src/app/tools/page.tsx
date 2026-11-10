import type { Metadata } from "next";
import Link from "next/link";
import styles from "../site.module.css";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { FeaturedDjIntake, ToolGrid } from "@/components/project-cards";

export const metadata: Metadata = {
  title: "Tools",
  description: "Software by Clement Lin — starting with DJ Intake, a local download queue for DJs on macOS.",
};

export default function ToolsPage() {
  return (
    <main className={styles.page}>
      <SiteNav />
      <header className={styles.pageHead}>
        <div className={styles.wrap}>
          <span className={styles.eyebrow}>Tools · Projects directory</span>
          <h1>Things I&apos;ve built to be used.</h1>
          <p>Focused software for real workflows. Each one runs where it makes sense — DJ Intake stays on your Mac, the rest run in your browser.</p>
        </div>
      </header>
      <div className={styles.wrap}>
        <section className={styles.section} aria-label="All tools">
          <FeaturedDjIntake />
          <ToolGrid />
        </section>
        <section className={styles.section} aria-labelledby="play-link">
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>Looking for the games?</span><h2 id="play-link">They live in Play.</h2></div>
            <p>Neon Snake and the seven-game Arcade. <Link href="/play">Go to Play →</Link></p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

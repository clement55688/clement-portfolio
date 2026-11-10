import type { Metadata } from "next";
import styles from "../site.module.css";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { GameGrid } from "@/components/project-cards";

export const metadata: Metadata = {
  title: "Play",
  description: "Browser games by Clement Lin: Neon Snake with a global leaderboard, and a seven-game arcade.",
};

export default function PlayPage() {
  return (
    <main className={styles.page}>
      <SiteNav />
      <header className={styles.pageHead}>
        <div className={styles.wrap}>
          <span className={styles.eyebrow}>Play · Browser games</span>
          <h1>Take a break.</h1>
          <p>Small games with real leaderboards. They run in any modern browser, on desktop or phone — no install, no login.</p>
        </div>
      </header>
      <div className={styles.wrap}>
        <section className={styles.section} aria-label="Games">
          <GameGrid />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

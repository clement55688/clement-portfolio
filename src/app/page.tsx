import Link from "next/link";
import styles from "./site.module.css";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { FeaturedDjIntake, GameGrid, ToolGrid } from "@/components/project-cards";
import { djIntake } from "@/lib/projects";

const experience = [
  { company: "Rhombus Power", period: "2023 — 2026", role: "Software Engineer", detail: "Built full-stack product capabilities and applied AI features to real operational workflows." },
  { company: "OCBridge", period: "2021 — 2022", role: "Software Engineer", detail: "Shipped web experiences with a focus on reliable implementation and clear user journeys." },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <SiteNav />

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroPhoto} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroMain}>
            <div className={styles.tag}><span className={styles.tagBox}><i className={styles.dot} />Software engineer · Full stack · AI</span><span className={styles.tagLine} aria-hidden="true" /></div>
            <h1 id="hero-title" className={styles.heroTitle}><span>Tools for people</span> <span>who make things.</span></h1>
            <Link href="/tools/dj-intake" className={styles.liveCard}>
              <span><span className={styles.bars} aria-hidden="true"><i /><i /><i /><i /></span>New release · v{djIntake.version}</span>
              <strong>DJ Intake for macOS</strong>
              <span>Paste a link, get a checked, named file →</span>
            </Link>
          </div>
          <aside className={styles.heroSide}>
            <p>I&apos;m Clement Lin — a software engineer with 4+ years building full-stack products and AI features that make complex work feel clear.</p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/tools">Explore tools</Link>
              <Link className={styles.ghost} href="/play">Play a game</Link>
            </div>
          </aside>
        </div>
      </section>

      <div className={styles.wrap}>
        <section id="tools" className={styles.section} aria-labelledby="tools-title">
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>Tools</span><h2 id="tools-title">Things I&apos;ve built to be used.</h2></div>
            <p>Small, focused software — starting with a download queue I use before every set. <Link href="/tools">See all tools →</Link></p>
          </div>
          <FeaturedDjIntake />
          <ToolGrid />
        </section>

        <section id="play" className={styles.section} aria-labelledby="play-title">
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>Play</span><h2 id="play-title">Take a break.</h2></div>
            <p>Browser games I made for fun, with real leaderboards. <Link href="/play">All games →</Link></p>
          </div>
          <GameGrid />
        </section>

        <section id="experience" className={styles.section} aria-labelledby="experience-title">
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>Experience</span><h2 id="experience-title">A practical, product-first engineer.</h2></div>
            <p>I enjoy the work between a promising idea and a dependable feature: shaping the details, making tradeoffs, and shipping.</p>
          </div>
          <div className={styles.timeline}>{experience.map((job) => <article className={styles.role} key={job.company}><p>{job.period}</p><div><h3>{job.company}</h3><span>{job.role}</span></div><p>{job.detail}</p></article>)}</div>
        </section>

        <section className={`${styles.section} ${styles.education}`} aria-labelledby="education-title">
          <div className={styles.sectionHead}><div><span className={styles.eyebrow}>Education</span><h2 id="education-title">Strong technical foundations.</h2></div></div>
          <div className={styles.eduList}>
            <article><span>2025</span><div><h3>Master of Computer Science</h3><p>University of Illinois Urbana-Champaign</p></div></article>
            <article><span>2020</span><div><h3>Master of Science</h3><p>San José State University</p></div></article>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, FileText, Sparkles } from "lucide-react";
import styles from "./page.module.css";

const projects = [
  {
    title: "Clement's Gaming Room",
    eyebrow: "Featured build · Live",
    description: "A collection of browser games with persistent scores, playful interaction, and a production Cloudflare deployment.",
    tags: ["JavaScript", "Cloudflare Workers", "SQLite"],
    href: "https://hoof-game.a2040404.workers.dev/",
    source: "https://github.com/clement55688/clement-arcade",
    external: true,
  },
  {
    title: "JD Fit Checker",
    eyebrow: "In progress",
    description: "An AI-assisted tool for matching experience to job descriptions and turning a job search into a focused workflow.",
    tags: ["Next.js", "TypeScript", "AI features"],
    href: "/fit",
    source: "https://github.com/clement55688/clement-portfolio",
    comingSoon: true,
  },
  {
    title: "React Library Practice",
    eyebrow: "Practice repository",
    description: "A browser-ready React catalog built around mock APIs, testable UI states, and practical frontend problem solving.",
    tags: ["React", "JavaScript", "Testing"],
    href: "https://github.com/clement55688/react-library-oa-practice",
    source: "https://github.com/clement55688/react-library-oa-practice",
    external: true,
  },
];

const experience = [
  { company: "Rhombus Power", period: "2023 — 2026", role: "Software Engineer", detail: "Built full-stack product capabilities and applied AI features to real operational workflows." },
  { company: "OCBridge", period: "2021 — 2022", role: "Software Engineer", detail: "Shipped web experiences with a focus on reliable implementation and clear user journeys." },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.nav}>
        <Link href="/" className={styles.wordmark} aria-label="Clement Lin home">CLEMENT LIN<span>.</span></Link>
        <nav aria-label="Primary navigation">
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="https://github.com/clement55688" target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.availability}><span /> Open to thoughtful product work</div>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.eyebrow}>Software engineer · Full stack · AI</p>
            <h1 id="hero-title">Clement Lin <span>— Software Engineer</span></h1>
            <p className={styles.intro}>4+ years building full-stack products and AI-powered features that make complex work feel clear and useful.</p>
            <div className={styles.actions}>
              <a className={styles.primaryAction} href="#projects">View projects <ArrowDownRight aria-hidden="true" /></a>
              <a className={styles.secondaryAction} href="#experience"><FileText aria-hidden="true" /> Résumé</a>
              <a className={styles.secondaryAction} href="https://github.com/clement55688" target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <aside className={styles.heroPanel} aria-label="Professional focus">
            <Sparkles aria-hidden="true" />
            <p>Currently focused on</p>
            <strong>Human-centered AI products, polished web apps, and practical developer tools.</strong>
            <div className={styles.focusList}><span>Product engineering</span><span>Modern web platforms</span><span>AI integrations</span></div>
          </aside>
        </div>
        <p className={styles.scrollCue}>Scroll to explore <span>↓</span></p>
      </section>

      <section id="projects" className={styles.section} aria-labelledby="projects-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Selected work</p><h2 id="projects-title">Things I&apos;ve built to be used.</h2></div>
          <p>Three projects that show how I approach product thinking, frontend detail, and production-ready delivery.</p>
        </div>
        <div className={styles.projectGrid}>
          {projects.map((project, index) => (
            <article className={styles.projectCard} key={project.title}>
              <div className={styles.cardTopline}><span>0{index + 1}</span><span className={project.comingSoon ? styles.comingSoon : undefined}>{project.eyebrow}</span></div>
              <div><h3>{project.title}</h3><p>{project.description}</p></div>
              <ul className={styles.tags} aria-label={`${project.title} technologies`}>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              <div className={styles.cardLinks}>
                {project.external ? <a href={project.href} target="_blank" rel="noreferrer">Open project <ArrowUpRight aria-hidden="true" /></a> : <Link href={project.href}>Explore project <ArrowUpRight aria-hidden="true" /></Link>}
                <a href={project.source} target="_blank" rel="noreferrer" aria-label={`View ${project.title} source on GitHub`}><ArrowUpRight aria-hidden="true" /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className={`${styles.section} ${styles.experience}`} aria-labelledby="experience-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Experience</p><h2 id="experience-title">A practical, product-first engineer.</h2></div>
          <p>I enjoy the work between a promising idea and a dependable feature: shaping the details, making tradeoffs, and shipping.</p>
        </div>
        <div className={styles.timeline}>{experience.map((job) => <article className={styles.role} key={job.company}><p>{job.period}</p><div><h3>{job.company}</h3><span>{job.role}</span></div><p>{job.detail}</p></article>)}</div>
      </section>

      <section className={`${styles.section} ${styles.education}`} aria-labelledby="education-title">
        <div><p className={styles.eyebrow}>Education</p><h2 id="education-title">Built on strong technical foundations.</h2></div>
        <div className={styles.educationList}>
          <article><span>2025</span><div><h3>Master of Computer Science</h3><p>University of Illinois Urbana-Champaign</p></div></article>
          <article><span>2020</span><div><h3>Master of Science</h3><p>San José State University</p></div></article>
        </div>
      </section>

      <footer className={styles.footer}><span>© {new Date().getFullYear()} Clement Lin</span><a href="https://github.com/clement55688" target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a></footer>
    </main>
  );
}

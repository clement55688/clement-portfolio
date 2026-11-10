import type { Metadata } from "next";
import Link from "next/link";
import styles from "../../site.module.css";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { djIntake } from "@/lib/projects";

export const metadata: Metadata = {
  title: "DJ Intake for macOS",
  description: "A local download queue for DJs. Paste a link or type a song, identify what's playing, and find every finished file in your staging folder.",
  openGraph: { title: "DJ Intake for macOS — Clement Lin", description: "Your next set starts here. A local download queue for DJs.", images: [{ url: "/projects/dj-intake/app-library.jpg", width: 2000, height: 1250, alt: "DJ Intake library" }] },
};

const jobs = [
  { n: "01", title: "Add a track", body: <>Paste a YouTube, SoundCloud or Bandcamp link, a Spotify track for lookup, or just type <code>Artist — Song</code>. Trim to timestamps when you only need a section. Follow every step from Queued to Checking.</> },
  { n: "02", title: "Identify a song", body: <>What&apos;s that track? Play it on your Mac or nearby and click <strong>Identify song</strong>. Shazam — built into macOS through Apple Shortcuts — names it, and DJ Intake saves it to Saved finds. Pick the version to download later; nothing downloads until you choose.</> },
  { n: "03", title: "Find the file", body: <>Finished files are checked, tagged and named <code>Artist_Song (Version)</code> in your staging folder. <strong>Show in Finder</strong> takes you straight there. Failures keep their reason and a Retry button.</> },
];

export default function DjIntakePage() {
  return (
    <main className={styles.page}>
      <SiteNav />

      <section className={styles.hero} aria-labelledby="dj-title">
        <div className={styles.heroPhoto} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroMain}>
            <div className={styles.tag}><span className={styles.tagBox}><i className={styles.dot} />{djIntake.platform} · <b>v{djIntake.version}</b> · Free</span><span className={styles.tagLine} aria-hidden="true" /></div>
            <h1 id="dj-title" className={styles.heroTitle}><span>Your next set</span> <span>starts here.</span></h1>
            <div className={styles.liveCard}>
              <span><span className={styles.bars} aria-hidden="true"><i /><i /><i /><i /></span>DJ Intake</span>
              <strong>Paste a link. Get a checked, named file.</strong>
              <span>Runs on your Mac — no account, no cloud queue.</span>
            </div>
          </div>
          <aside className={styles.heroSide}>
            <p>A local download queue for DJs. Add a track, let Shazam identify the song that&apos;s playing, and find every finished file — ready for Serato or rekordbox.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href={djIntake.downloadUrl}>Download for macOS ↓</a>
              <a className={styles.ghost} href={djIntake.sourceUrl} target="_blank" rel="noreferrer">View on GitHub ↗</a>
            </div>
            <small>v{djIntake.version} · {djIntake.artifact} · No login needed</small>
          </aside>
        </div>
      </section>

      <div className={styles.wrap}>
        <section className={styles.section} aria-labelledby="jobs-title">
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>What it does</span><h2 id="jobs-title">Three jobs. One quiet app.</h2></div>
            <p>A record icon in your menu bar for quick adds, and a full library in your browser at <code className={styles.mono}>127.0.0.1</code> when you want the whole picture.</p>
          </div>
          <div className={styles.cols}>
            {jobs.map((job) => <article className={styles.col} key={job.n}><span className={styles.eyebrow}>{job.n}</span><h3>{job.title}</h3><p>{job.body}</p></article>)}
          </div>
        </section>

        <section className={styles.section} aria-label="Screenshots">
          <div className={styles.screens}>
            <figure className={styles.screen}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot, no image optimizer on Workers */}
              <img src="/projects/dj-intake/app-library.jpg" alt="DJ Intake: add box, what's in the queue now, and Identify a song" width={2000} height={1250} loading="lazy" />
              <figcaption>Add · paste a link or song name, see what&apos;s happening now</figcaption>
            </figure>
            <figure className={styles.screen}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot */}
              <img src="/projects/dj-intake/app-queue.jpg" alt="DJ Intake queue: counts, recent downloads with Show in Finder, and a recording picker" width={2000} height={1222} loading="lazy" />
              <figcaption>Queue · progress, recording picker, recent downloads, retry</figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.section} aria-label="Privacy">
          <div className={styles.stats}>
            <div className={styles.stat}><strong>100%</strong><span>local — the queue, your files and your library stay on your Mac</span></div>
            <div className={styles.stat}><strong>0</strong><span>accounts — no login, no cloud queue, nothing to sync</span></div>
            <div className={styles.stat}><strong>3 + 1</strong><span>sources — YouTube, SoundCloud, Bandcamp, plus Spotify lookup</span></div>
          </div>
        </section>

        <section id="install" className={styles.section} aria-labelledby="install-title">
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>Install &amp; update</span><h2 id="install-title">Set up in a few minutes.</h2></div>
            <p>The website and GitHub link to the same official build: <a href={djIntake.releasesUrl} target="_blank" rel="noreferrer">latest release ↗</a></p>
          </div>
          <div className={styles.install}>
            <div>
              <ol className={styles.steps}>
                <li><span><strong>Download</strong> <a href={djIntake.downloadUrl}>{djIntake.artifact}</a>, unzip it, and double-click <strong>Install DJ Intake.command</strong>. If Finder won&apos;t launch it, you can read the script, then run <code>bash</code> followed by its path in Terminal.</span></li>
                <li><span>The installer checks your tools, puts the source in <code>~/Library/Application Support/DJ Intake Source</code>, and builds <strong>DJ Intake.app</strong> on your Desktop.</span></li>
                <li><span>Open <strong>DJ Intake.app</strong>. The library opens in your browser and a record icon appears in the menu bar.</span></li>
                <li><span>Pick your staging folder in <strong>Preferences</strong>. To identify songs, open <strong>Identify → Set up recognition</strong> once and allow the microphone when macOS asks.</span></li>
              </ol>
              <p className={styles.note}><strong>Updating:</strong> let current jobs finish, quit the menu-bar icon and choose <strong>Preferences → Quit app</strong>, then run this in Terminal. Your settings and queue are kept. Updates are manual for now.</p>
              <pre className={styles.code}>{djIntake.updateCommand}</pre>
            </div>
            <div>
              <dl className={styles.specs}>
                <div><dt>Version</dt><dd>v{djIntake.version} · {djIntake.artifactType}</dd></div>
                {djIntake.requirements.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
              </dl>
              <div className={styles.actions} style={{ marginTop: "1.75rem" }}>
                <a className={styles.primary} href={djIntake.downloadUrl}>Download for macOS ↓</a>
                <a className={styles.ghost} href={djIntake.feedbackUrl} target="_blank" rel="noreferrer">Report a bug ↗</a>
              </div>
              <p className={styles.note}>Use sources you&apos;re entitled to download. Keep your Mac awake while the queue is working. Feedback goes to public <a href={djIntake.feedbackUrl} target="_blank" rel="noreferrer">GitHub Issues</a> — leave out private links and paths.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="more-title">
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>More</span><h2 id="more-title">See what else I&apos;ve built.</h2></div>
            <p><Link href="/tools">All tools →</Link> &nbsp; <Link href="/play">Play a game →</Link></p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

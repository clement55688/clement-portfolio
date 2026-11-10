import Link from "next/link";
import styles from "@/app/site.module.css";
import { djIntake, games, tools, type Game } from "@/lib/projects";

export function FeaturedDjIntake() {
  return (
    <article className={styles.feature} aria-labelledby="feature-dj-intake">
      <Link href="/tools/dj-intake" className={styles.featureShot} aria-label="DJ Intake details">
        {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot, no image optimizer on Workers */}
        <img src="/projects/dj-intake/app-library.jpg" alt="DJ Intake library: paste a link, follow the queue, identify a song" loading="lazy" />
      </Link>
      <div className={styles.featureBody}>
        <span className={styles.eyebrow}>01 · Featured tool</span>
        <h3 id="feature-dj-intake">{djIntake.name}</h3>
        <p>A local download queue for DJs. Paste a link or type a song, identify what&apos;s playing, and find every finished file in your staging folder — ready for Serato or rekordbox.</p>
        <ul className={styles.chips} aria-label="Release details">
          <li>{djIntake.platform}</li>
          <li>v{djIntake.version}</li>
          <li>{djIntake.artifactType}</li>
          <li>Runs locally</li>
        </ul>
        <div className={styles.actions}>
          <a className={styles.primary} href={djIntake.downloadUrl}>Download for macOS ↓</a>
          <Link className={styles.ghost} href="/tools/dj-intake">Details →</Link>
        </div>
        <div className={styles.featureLinks}>
          <a href={djIntake.sourceUrl} target="_blank" rel="noreferrer">View on GitHub ↗</a>
          <Link href="/tools/dj-intake#install">Install &amp; update guide</Link>
        </div>
      </div>
    </article>
  );
}

export function ToolGrid() {
  return (
    <div className={styles.toolGrid}>
      {tools.map((tool, index) => (
        <article className={styles.tool} key={tool.slug}>
          <div className={styles.toolTop}><span>0{index + 2} · {tool.platform}</span><b>{tool.status}</b></div>
          <h3>{tool.title}</h3>
          <p>{tool.description}</p>
          <ul className={styles.chips} aria-label={`${tool.title} technologies`}>{tool.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
          {tool.href
            ? (tool.external
              ? <a className={styles.toolLink} href={tool.href} target="_blank" rel="noreferrer">Open ↗</a>
              : <Link className={styles.toolLink} href={tool.href}>Open →</Link>)
            : <span className={styles.soon}>Coming soon</span>}
        </article>
      ))}
    </div>
  );
}

function GameArt({ game }: { game: Game }) {
  if (game.slug === "snake") {
    const body = [[6, 5], [5, 5], [4, 5], [4, 6], [4, 7], [3, 7], [2, 7]];
    return (
      <div className={`${styles.gameArt} ${styles.snakeArt}`} aria-hidden="true">
        {body.map(([x, y], i) => <i key={i} style={{ left: x * 24 + 2 + 170, top: y * 24 + 2 - 24, opacity: 1 - i * 0.11 }} />)}
        <i className={styles.food} style={{ left: 10 * 24 + 2 + 170, top: 5 * 24 + 2 - 24 }} />
      </div>
    );
  }
  return <div className={`${styles.gameArt} ${styles.arcadeArt}`} aria-hidden="true">{game.games?.map((name) => <span key={name}>{name}</span>)}</div>;
}

export function GameGrid() {
  return (
    <div className={styles.gameGrid}>
      {games.map((game) => (
        <article className={styles.game} key={game.slug}>
          <GameArt game={game} />
          <div className={styles.gameBody}>
            <span className={styles.eyebrow}>{game.kicker}</span>
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <div className={styles.actions}>
              {game.external
                ? <a className={styles.primary} href={game.play} target="_blank" rel="noreferrer">Play ↗</a>
                : <Link className={styles.primary} href={game.play}>Play →</Link>}
              {game.extra && <Link className={styles.ghost} href={game.extra.href}>{game.extra.label}</Link>}
              {game.source && <a className={styles.ghost} href={game.source} target="_blank" rel="noreferrer">Source ↗</a>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

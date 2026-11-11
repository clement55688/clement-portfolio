/**
 * Everything the Tools and Play pages list. Add a project by adding an entry;
 * the pages lay themselves out from this data.
 */

const RELEASES = "https://github.com/clement55688/dj-intake-app/releases";

/** The official DJ Intake build. The website and GitHub both point at this asset. */
export const djIntake = {
  name: "DJ Intake",
  version: "0.4.3",
  platform: "macOS",
  artifact: "DJ-Intake-macOS-installer.zip",
  artifactType: "ZIP installer",
  // `latest/download/<asset>` always resolves to the newest published release asset.
  downloadUrl: `${RELEASES}/latest/download/DJ-Intake-macOS-installer.zip`,
  releasesUrl: `${RELEASES}/latest`,
  sourceUrl: "https://github.com/clement55688/dj-intake-app",
  feedbackUrl: "https://github.com/clement55688/dj-intake-app/issues/new/choose",
  updateCommand: 'bash "$HOME/Library/Application Support/DJ Intake Source/scripts/update.command"',
  requirements: [
    { label: "Platform", value: "macOS 12 Monterey or later" },
    { label: "Download", value: "DJ-Intake-macOS-installer.zip — a small installer script" },
    { label: "Needs", value: "Git, Python 3.10 or newer, Apple Command Line Tools" },
    { label: "Audio tools", value: "FFmpeg and ffprobe — setup installs them with Homebrew if you have it" },
    { label: "YouTube", value: "Deno — setup can install it with Homebrew" },
    { label: "Account", value: "None. No GitHub login, no cloud sign-in" },
  ],
} as const;

export type Tool = {
  slug: string;
  title: string;
  status: string;
  platform: string;
  description: string;
  tags: string[];
  /** Internal page or external link. Omit for work that is not public yet. */
  href?: string;
  external?: boolean;
  source?: string;
};

/** Listed under the featured DJ Intake card on /tools. */
export const tools: Tool[] = [
  {
    slug: "snow-signal",
    title: "Snow Signal",
    status: "Live",
    platform: "Web",
    description: "A live snowfall map for riders chasing the next storm, with pass-aware mountain picks.",
    tags: ["Next.js", "MapLibre", "Open-Meteo"],
    href: "/snow-signal",
  },
  {
    slug: "jd-fit-checker",
    title: "JD Fit Checker",
    status: "In progress",
    platform: "Web",
    description: "Matches your experience to a job description and turns a job search into a focused workflow.",
    tags: ["Next.js", "TypeScript", "AI"],
  },
  {
    slug: "react-library",
    title: "React Library Practice",
    status: "Open source",
    platform: "Browser",
    description: "A React catalog built around mock APIs, testable UI states and practical frontend problems.",
    tags: ["React", "Testing"],
    href: "https://github.com/clement55688/react-library-oa-practice",
    external: true,
  },
];

export type Game = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  play: string;
  external?: boolean;
  extra?: { label: string; href: string };
  source?: string;
  games?: string[];
};

export const games: Game[] = [
  {
    slug: "snake",
    title: "Neon Snake",
    kicker: "Playground / 001",
    description: "Eat the signal, don't touch the edges — or yourself. Arrow keys, WASD or swipe. Global top-ten board.",
    play: "/playground/snake",
    extra: { label: "Leaderboard", href: "/playground/leaderboard" },
  },
  {
    slug: "arcade",
    title: "Clement's Arcade",
    kicker: "Seven browser games",
    description: "A whole room of small games with persistent scores, from merging cats to keeping a wobbly horse on its feet.",
    play: "https://hoof-game.a2040404.workers.dev/",
    external: true,
    source: "https://github.com/clement55688/clement-arcade",
    games: ["Catvolution", "HOOF", "Mochi Drop", "Frog", "Cabin Chaos", "Sneaky Scratch", "Ten Seconds"],
  },
];

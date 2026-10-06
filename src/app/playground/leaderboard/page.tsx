import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardList } from "@/components/leaderboard-list";
export const metadata: Metadata = { title: "Snake Leaderboard", description: "The top ten scores from Clement's neon Snake experiment.", openGraph: { title: "Snake Leaderboard — Clement Lin", description: "Can you take the top spot?" } };
export default function LeaderboardPage() { return <main className="leaderboard"><Link href="/playground/snake">← Back to game</Link><p className="kicker">GLOBAL SIGNAL</p><h1>Top <em>10.</em></h1><LeaderboardList /></main>; }

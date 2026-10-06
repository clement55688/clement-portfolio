"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Score = { name: string; score: number; createdAt: string };
export default function LeaderboardPage() { const [scores, setScores] = useState<Score[]>([]); useEffect(() => { fetch("/api/scores").then((r) => r.json()).then((data) => setScores(data.scores ?? [])); }, []); return <main className="leaderboard"><Link href="/playground/snake">← Back to game</Link><p className="kicker">GLOBAL SIGNAL</p><h1>Top <em>10.</em></h1><ol>{scores.length ? scores.map((entry, index) => <li key={`${entry.name}-${entry.createdAt}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{entry.name}</strong><b>{entry.score}</b></li>) : <li><span>—</span><strong>No scores yet. Go first.</strong><b>0</b></li>}</ol></main>; }

import type { Metadata } from "next";
import Link from "next/link";
import { SnowMap } from "@/components/snow-map";
export const metadata: Metadata = { title: "Snow Signal", description: "A live 3D snowfall intelligence map for snowboarders." };
export default function SnowSignalPage() { return <main className="snow-page"><header><Link href="/">CLEMENT / PORTFOLIO</Link><span>EXPERIMENT 002 · LIVE WEATHER</span></header><section className="snow-intro"><p className="kicker">SNOW SIGNAL / GLOBAL</p><h1>Follow the<br /><em>fall line.</em></h1><p>Live snowfall intelligence for riders. Explore 3D mountain terrain, compare the next 48 hours, and see when each season usually wakes up.</p></section><SnowMap /><footer className="snow-footer"><span>Forecast: Open-Meteo · Map: MapLibre + OpenFreeMap</span><span>Opening targets are seasonal estimates—verify operations with each resort.</span></footer></main>; }

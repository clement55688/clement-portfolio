"use client";
import dynamic from "next/dynamic";
const PortfolioScene = dynamic(() => import("./portfolio-scene").then((m) => m.PortfolioScene), { ssr: false, loading: () => null });
export function SceneMount() { return <div className="canvas-wrap" aria-hidden="true"><PortfolioScene /></div>; }

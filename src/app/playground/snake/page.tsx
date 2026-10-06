import type { Metadata } from "next";
import { SnakeGame } from "@/components/snake-game";
export const metadata: Metadata = { title: "Neon Snake", description: "Play Clement's neon-on-dark Snake experiment." };
export default function SnakePage() { return <SnakeGame />; }

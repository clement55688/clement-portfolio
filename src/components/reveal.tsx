"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
export function Reveal({ children, className }: { children: ReactNode; className?: string }) { const reduced = useReducedMotion(); return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 34 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: .75, ease: [.22, 1, .36, 1] }}>{children}</motion.div>; }

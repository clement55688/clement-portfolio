import type { Metadata } from "next";
import Link from "next/link";
import { FitChecker } from "@/components/fit-checker";

export const metadata: Metadata = {
  title: "Job description fit",
  description: "Paste a job description for an honest read on how Clement Lin’s experience lines up, grounded in his resume and public projects.",
};

export default function FitPage() {
  return (
    <main className="fit-page">
      <header>
        <Link href="/">Clement / Portfolio</Link>
        <span>For recruiters · Fit check</span>
      </header>
      <section className="fit-intro">
        <p className="kicker">Job description / fit</p>
        <h1>
          How Clement
          <br />
          <em>lines up.</em>
        </h1>
        <p>
          Paste a role. This compares it with his resume and public projects, then names what matches, what is missing, and which work to open. If it is not in that record, it is a gap.
        </p>
      </section>
      <FitChecker />
    </main>
  );
}

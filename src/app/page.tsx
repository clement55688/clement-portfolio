import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SceneMount } from "@/components/scene-mount";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SideNav } from "@/components/side-nav";
import { Guestbook } from "@/components/guestbook";
import { FooterStats } from "@/components/footer-stats";
import { Reveal } from "@/components/reveal";

const projects = [
  { index: "01", title: "Snow Signal", type: "Live 3D weather", copy: "A global snowfall intelligence map for riders chasing the next storm.", href: "/snow-signal" },
  { index: "02", title: "Night Shift", type: "Product system", copy: "An operations workspace designed for the people keeping cities awake." },
  { index: "03", title: "Small Futures", type: "Creative code", copy: "Generative objects that imagine optimistic tools from possible tomorrows." },
];

export default function Home() {
  return (
    <SmoothScroll>
      <SceneMount />
      <SideNav />
      <main className="relative z-10 overflow-clip">
        <section id="home" className="section hero" aria-labelledby="hero-title">
          <div className="eyebrow"><span className="status-dot" />Available for ambitious work · 2026</div>
          <h1 id="hero-title">CLEMENT<br /><em>LIN</em></h1>
          <div className="hero-bottom"><p>Designer-minded developer building digital experiences with clarity, character, and just enough weird.</p><a href="#about" className="round-link" aria-label="Scroll to about"><ArrowDownRight /></a></div>
          <p className="scene-label" aria-label="Decorative three-dimensional kinetic sculpture">KINETIC STUDY / 001</p>
        </section>
        <section id="about" className="section split" aria-labelledby="about-title">
          <div><span className="section-number">01</span><p className="kicker">ABOUT / APPROACH</p></div>
          <Reveal className="section-copy"><h2 id="about-title">I make complex things feel <em>inevitable.</em></h2><p>I work between design and engineering—turning fuzzy ideas into expressive, resilient products. My favorite projects reward curiosity and respect attention.</p><div className="capabilities" aria-label="Capabilities"><span>Creative development</span><span>Product engineering</span><span>Interaction design</span><span>Rapid prototyping</span></div></Reveal>
        </section>
        <section id="work" className="section work" aria-labelledby="work-title">
          <div className="section-heading"><div><span className="section-number">02</span><p className="kicker">SELECTED WORK</p></div><h2 id="work-title">A few things<br />worth <em>scrolling for.</em></h2></div>
          <Reveal className="project-list">{projects.map((project) => <Link className="project" aria-label={`View ${project.title} project`} href={project.href ?? "#work"} key={project.title}><span>{project.index}</span><article><p>{project.type}</p><h3>{project.title}</h3><p>{project.copy}</p></article><ArrowUpRight aria-hidden="true" /></Link>)}</Reveal>
        </section>
        <section id="playground" className="section playground" aria-labelledby="playground-title">
          <div className="orbital-copy"><span className="section-number">03</span><p className="kicker">PLAYGROUND</p><h2 id="playground-title">Experiments<br />without a <em>brief.</em></h2><p>Shaders, generative systems, tiny games, and strange interfaces. A place to learn in public.</p><Link href="/playground/snake" className="text-link">Enter the playground <ArrowUpRight /></Link></div>
          <div className="orbit-labels" aria-label="Playground topics"><span>WEBGL</span><span>GENERATIVE</span><span>GAMES</span></div>
        </section>
        <section id="contact" className="section contact" aria-labelledby="contact-title">
          <div className="contact-intro"><p className="kicker">04 / CONTACT</p><h2 id="contact-title">Let&apos;s make<br />something <em>matter.</em></h2><a href="https://github.com/clement55688" className="contact-link">Connect on GitHub <ArrowUpRight /></a></div>
          <Guestbook />
          <footer><span>© 2026 Clement Lin</span><FooterStats /><a href="https://github.com/clement55688">GitHub</a></footer>
        </section>
      </main>
    </SmoothScroll>
  );
}

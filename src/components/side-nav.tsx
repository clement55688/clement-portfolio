"use client";
import { useEffect, useState } from "react";
const items = ["home", "about", "work", "playground", "contact"];
export function SideNav() { const [active, setActive] = useState("home"); useEffect(() => { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)), { threshold: .45 }); items.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); }); return () => observer.disconnect(); }, []); return <nav className="side-nav" aria-label="Section navigation">{items.map((id, i) => <a key={id} className={active === id ? "active" : ""} href={`#${id}`}><span>0{i + 1} {id}</span></a>)}</nav>; }

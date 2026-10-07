"use client";

import * as maplibregl from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";

maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

type PassType = "Epic" | "Ikon" | "Compare";
type StyleType = "All mountain" | "Carve" | "Powder";
type Resort = { id: string; name: string; place: string; lat: number; lng: number; opening: string; window: string; temperature: number | null; snowfallNow: number; snowfall48h: number; wind: number | null; live: boolean };
type MountainProfile = { pass: "Epic" | "Ikon"; access: string; score: number; verdict: string; terrain: string; vertical: string; classic: string; difficulty: string; pitch: string; distance: string; traverse: "LOW" | "MED" | "HIGH"; coordinates: [number, number][]; profile: number[] };

const profiles: Record<string, MountainProfile> = {
  whistler: {
    pass: "Epic", access: "Included · verify partner restrictions", score: 91, verdict: "Best for storm depth + huge terrain", terrain: "Bowls / trees / alpine", vertical: "1,609 m", classic: "Peak to Creek", difficulty: "ADVANCED", pitch: "34° max", distance: "10.7 km", traverse: "MED",
    coordinates: [[-122.9488, 50.0591], [-122.9514, 50.0662], [-122.9568, 50.075], [-122.966, 50.086], [-122.975, 50.1002], [-122.9805, 50.113]], profile: [100, 92, 76, 57, 35, 8],
  },
  mammoth: {
    pass: "Ikon", access: "Unlimited on Ikon · 5 days on Base", score: 86, verdict: "Best for wind-buff + spring laps", terrain: "Volcanic steeps / parks", vertical: "945 m", classic: "Cornice Bowl → St. Anton", difficulty: "EXPERT", pitch: "38° max", distance: "4.2 km", traverse: "LOW",
    coordinates: [[-119.0322, 37.6306], [-119.0284, 37.634], [-119.0246, 37.639], [-119.0204, 37.645], [-119.011, 37.652]], profile: [100, 84, 63, 38, 5],
  },
};

const passOptions: PassType[] = ["Compare", "Epic", "Ikon"];
const styleOptions: StyleType[] = ["All mountain", "Carve", "Powder"];
const lineFeature = (profile: MountainProfile) => ({ type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: profile.coordinates } });

export function SnowMap() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [selectedId, setSelectedId] = useState("whistler");
  const [pass, setPass] = useState<PassType>("Compare");
  const [style, setStyle] = useState<StyleType>("All mountain");
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => { fetch("/api/snow").then((response) => response.json()).then((data) => setResorts((data.resorts ?? []).filter((resort: Resort) => resort.id in profiles))); }, []);
  const visibleResorts = useMemo(() => resorts.filter((resort) => pass === "Compare" || profiles[resort.id].pass === pass), [pass, resorts]);
  const selected = resorts.find((resort) => resort.id === selectedId) ?? resorts[0];
  const selectedProfile = selected ? profiles[selected.id] : profiles.whistler;

  useEffect(() => {
    if (!container.current || !resorts.length || map.current) return;
    const instance = new maplibregl.Map({ container: container.current, style: "https://tiles.openfreemap.org/styles/liberty", center: [-121.4, 43.8], zoom: 2.7, pitch: 48, bearing: -16, maxPitch: 82 });
    map.current = instance;
    instance.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-left");
    instance.on("load", () => {
      instance.addSource("terrain", { type: "raster-dem", url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json", tileSize: 256 });
      instance.setTerrain({ source: "terrain", exaggeration: 1.55 });
      instance.addSource("classic-line", { type: "geojson", data: lineFeature(profiles.whistler) });
      instance.addLayer({ id: "classic-line-glow", type: "line", source: "classic-line", paint: { "line-color": "#ffffff", "line-width": 10, "line-opacity": 0.16, "line-blur": 4 } });
      instance.addLayer({ id: "classic-line", type: "line", source: "classic-line", paint: { "line-color": "#ffffff", "line-width": 3, "line-opacity": 0.95 } });
    });
    resorts.forEach((resort) => {
      const node = document.createElement("button");
      node.className = `snow-marker ${resort.snowfall48h > 0 ? "is-snowing" : ""}`;
      node.type = "button"; node.dataset.resort = resort.id;
      node.setAttribute("aria-label", `${resort.name}: ${resort.snowfall48h} centimeters forecast snow`);
      node.innerHTML = `<span>${profiles[resort.id].pass}</span><small>${resort.snowfall48h.toFixed(1)} CM</small>`;
      node.onclick = () => setSelectedId(resort.id);
      markers.current.push(new maplibregl.Marker({ element: node }).setLngLat([resort.lng, resort.lat]).addTo(instance));
    });
    return () => { markers.current = []; instance.remove(); map.current = null; };
  }, [resorts]);

  useEffect(() => {
    if (!map.current || !selected) return;
    document.querySelectorAll<HTMLElement>(".snow-marker").forEach((node) => node.classList.toggle("selected", node.dataset.resort === selected.id));
    const updateLine = () => (map.current?.getSource("classic-line") as maplibregl.GeoJSONSource | undefined)?.setData(lineFeature(profiles[selected.id]));
    if (map.current.isStyleLoaded()) updateLine(); else map.current.once("load", updateLine);
    map.current.flyTo({ center: [selected.lng, selected.lat], zoom: 10.8, pitch: 68, bearing: selected.id === "whistler" ? 24 : -28, duration: 1800 });
  }, [selected]);

  function previewRun() {
    if (!map.current || !selected) return;
    setPreviewing(true); const route = selectedProfile.coordinates; let index = 0;
    const fly = () => {
      if (!map.current || index >= route.length) { setPreviewing(false); return; }
      map.current.easeTo({ center: route[index], zoom: 14.4, pitch: 76, bearing: selected.id === "whistler" ? 18 : -22, duration: 900, easing: (t) => t });
      index += 1; window.setTimeout(fly, 820);
    };
    fly();
  }

  function selectPass(option: PassType) {
    setPass(option);
    if (option !== "Compare" && selected && profiles[selected.id].pass !== option) {
      const next = resorts.find((resort) => profiles[resort.id].pass === option);
      if (next) setSelectedId(next.id);
    }
  }

  return <div className="mountain-mvp">
    <section className="rider-controls" aria-label="Trip preferences">
      <div><span>01 / YOUR ACCESS</span><div className="segmented">{passOptions.map((option) => <button key={option} className={pass === option ? "active" : ""} onClick={() => selectPass(option)}>{option}</button>)}</div></div>
      <div><span>02 / RIDE STYLE</span><div className="segmented">{styleOptions.map((option) => <button key={option} className={style === option ? "active" : ""} onClick={() => setStyle(option)}>{option}</button>)}</div></div>
      <p><b>{visibleResorts.length}</b> mountains in this MVP<br /><small>{style} ranking active</small></p>
    </section>
    <section className="mvp-map-shell">
      <div className="snow-map" ref={container} aria-label="Interactive 3D comparison of Whistler Blackcomb and Mammoth Mountain" />
      <div className="map-hud"><span>3D TERRAIN</span><span>LIVE WEATHER</span><span>CLASSIC LINE</span></div>
      <aside className="mountain-card">{selected ? <>
        <div className="live-tag"><i /> LIVE MODEL / 48H</div><p className="kicker">{selectedProfile.pass} ACCESS</p><h2>{selected.name}</h2><p className="resort-place">{selected.place} · {selectedProfile.access}</p>
        <div className="ride-score"><strong>{selectedProfile.score}</strong><span>RIDE<br />SCORE</span></div><p className="verdict">{selectedProfile.verdict}</p>
        <dl><div><dt>Fresh snow</dt><dd>{selected.snowfall48h.toFixed(1)} cm / 48h</dd></div><div><dt>Wind</dt><dd>{selected.wind === null ? "—" : `${selected.wind.toFixed(0)} km/h`}</dd></div><div><dt>Terrain</dt><dd>{selectedProfile.terrain}</dd></div><div><dt>Vertical</dt><dd>{selectedProfile.vertical}</dd></div><div><dt>Snowboard flats</dt><dd className={`risk-${selectedProfile.traverse.toLowerCase()}`}>{selectedProfile.traverse}</dd></div></dl>
      </> : <p>Loading live mountain data…</p>}</aside>
    </section>
    <section className="resort-compare" aria-label="Mountain comparison">{visibleResorts.map((resort, index) => { const profile = profiles[resort.id]; return <button key={resort.id} className={selected?.id === resort.id ? "active" : ""} onClick={() => setSelectedId(resort.id)}><span>0{index + 1}</span><div><small>{profile.pass} · {resort.place}</small><h3>{resort.name}</h3><p>{profile.verdict}</p></div><b>{profile.score}</b></button>; })}</section>
    {selected && <section className="classic-line-panel">
      <div className="line-copy"><p className="kicker">CLASSIC LINE / CONCEPT PREVIEW</p><h2>{selectedProfile.classic}</h2><p>A cinematic terrain preview for trip planning—not live navigation. Run geometry and operational status should be verified against the resort before riding.</p><button onClick={previewRun} disabled={previewing}>{previewing ? "FLYING THE LINE…" : "▶ PREVIEW THE RUN"}</button></div>
      <div className="line-stats"><div><span>DIFFICULTY</span><b>{selectedProfile.difficulty}</b></div><div><span>MAX PITCH</span><b>{selectedProfile.pitch}</b></div><div><span>DISTANCE</span><b>{selectedProfile.distance}</b></div><div><span>FLAT RISK</span><b>{selectedProfile.traverse}</b></div></div>
      <div className="elevation-profile" aria-label={`Conceptual elevation profile for ${selectedProfile.classic}`}><div>{selectedProfile.profile.map((height, index) => <i key={`${selected.id}-${index}`} style={{ height: `${height}%` }} />)}</div><span>SUMMIT</span><span>BASE</span></div>
    </section>}
  </div>;
}

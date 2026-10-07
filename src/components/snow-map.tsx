"use client";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
type Resort = { id: string; name: string; place: string; lat: number; lng: number; opening: string; window: string; temperature: number | null; snowfallNow: number; snowfall48h: number; wind: number | null; live: boolean };

export function SnowMap() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [selected, setSelected] = useState<Resort | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  useEffect(() => { fetch("/api/snow").then((r) => r.json()).then((data) => { setResorts(data.resorts ?? []); setSelected(data.resorts?.[0] ?? null); }); }, []);
  useEffect(() => {
    if (!token || !container.current || !resorts.length || map.current) return;
    mapboxgl.accessToken = token;
    const instance = new mapboxgl.Map({ container: container.current, style: "mapbox://styles/mapbox/standard", center: [-122, 43], zoom: 2.2, pitch: 50, bearing: -18, antialias: true, config: { basemap: { theme: "monochrome", lightPreset: "night", showPointOfInterestLabels: false, showTransitLabels: false } } });
    map.current = instance;
    instance.on("style.load", () => { instance.addSource("terrain", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512, maxzoom: 14 }); instance.setTerrain({ source: "terrain", exaggeration: 1.45 }); });
    resorts.forEach((resort) => { const node = document.createElement("button"); node.className = `snow-marker ${resort.snowfall48h > 0 ? "is-snowing" : ""}`; node.type = "button"; node.setAttribute("aria-label", `${resort.name}: ${resort.snowfall48h} centimeters forecast snow`); node.innerHTML = `<span>${resort.snowfall48h.toFixed(1)}</span><small>CM</small>`; node.onclick = () => { setSelected(resort); instance.flyTo({ center: [resort.lng, resort.lat], zoom: 7.5, pitch: 68, bearing: 24, duration: 1800 }); }; new mapboxgl.Marker({ element: node }).setLngLat([resort.lng, resort.lat]).addTo(instance); });
    return () => { instance.remove(); map.current = null; };
  }, [resorts, token]);
  return <div className="snow-console"><div className="snow-map" ref={container}>{!token && <div className="map-fallback"><div className="contours" /><p>3D TERRAIN READY</p><span>Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to activate the live map.</span></div>}</div><aside><div className="live-tag"><i /> LIVE MODEL / 48H</div>{selected ? <><p className="kicker">SELECTED MOUNTAIN</p><h2>{selected.name}</h2><p className="resort-place">{selected.place}</p><div className="snow-metric"><strong>{selected.snowfall48h.toFixed(1)}</strong><span>cm<br />next 48h</span></div><dl><div><dt>Now</dt><dd>{selected.snowfallNow.toFixed(1)} cm/h</dd></div><div><dt>Temperature</dt><dd>{selected.temperature === null ? "—" : `${selected.temperature.toFixed(0)}°C`}</dd></div><div><dt>Opening target</dt><dd>{selected.opening}</dd></div><div><dt>Typical window</dt><dd>{selected.window}</dd></div></dl></> : <p>Loading mountain data…</p>}</aside><div className="resort-rail">{resorts.map((resort) => <button key={resort.id} className={selected?.id === resort.id ? "active" : ""} onClick={() => { setSelected(resort); map.current?.flyTo({ center: [resort.lng, resort.lat], zoom: 7.5, pitch: 68, bearing: 24, duration: 1800 }); }}><span>{resort.name}</span><b>{resort.snowfall48h.toFixed(1)} cm</b></button>)}</div></div>;
}

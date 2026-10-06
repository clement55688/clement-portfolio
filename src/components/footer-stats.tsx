"use client";
import { useEffect, useState } from "react";
type Status = { views?: number; status?: string; build?: string; region?: string };
export function FooterStats() { const [data, setData] = useState<Status>({}); useEffect(() => { const counted = sessionStorage.getItem("portfolio-view"); const viewRequest = fetch("/api/views", { method: counted ? "GET" : "POST" }).then((r) => r.json()); if (!counted) sessionStorage.setItem("portfolio-view", "1"); Promise.all([viewRequest, fetch("/api/status").then((r) => r.json())]).then(([views, status]) => setData({ ...views, ...status })).catch(() => undefined); }, []); return <span className="system-status"><i /> {data.status ?? "checking"} · {data.views ?? "—"} views · {data.region ?? "local"} / {data.build ?? "dev"}</span>; }

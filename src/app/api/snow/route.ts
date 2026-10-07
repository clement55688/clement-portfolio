const resorts = [
  { id: "whistler", name: "Whistler Blackcomb", place: "British Columbia", lat: 50.1163, lng: -122.9574, opening: "Late November", window: "Nov — May" },
  { id: "mammoth", name: "Mammoth Mountain", place: "California", lat: 37.6308, lng: -119.0326, opening: "Mid November", window: "Nov — Jun" },
  { id: "baker", name: "Mount Baker", place: "Washington", lat: 48.8619, lng: -121.6822, opening: "Late November", window: "Nov — Apr" },
  { id: "niseko", name: "Niseko United", place: "Hokkaido", lat: 42.8048, lng: 140.6874, opening: "Late November", window: "Nov — May" },
  { id: "hakuba", name: "Hakuba Valley", place: "Nagano", lat: 36.6982, lng: 137.8619, opening: "Early December", window: "Dec — May" },
  { id: "chamonix", name: "Chamonix", place: "French Alps", lat: 45.9237, lng: 6.8694, opening: "Mid December", window: "Dec — May" },
];

export async function GET() {
  const data = await Promise.all(resorts.map(async (resort) => {
    const params = new URLSearchParams({ latitude: String(resort.lat), longitude: String(resort.lng), current: "temperature_2m,snowfall,weather_code,wind_speed_10m", hourly: "snowfall", forecast_hours: "48", timezone: "auto" });
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { next: { revalidate: 900 } });
      if (!response.ok) throw new Error("Forecast unavailable");
      const weather = await response.json() as { current?: { temperature_2m?: number; snowfall?: number; wind_speed_10m?: number }; hourly?: { snowfall?: number[] } };
      const snowfall48h = (weather.hourly?.snowfall ?? []).reduce((sum, value) => sum + (value ?? 0), 0);
      return { ...resort, temperature: weather.current?.temperature_2m ?? null, snowfallNow: weather.current?.snowfall ?? 0, snowfall48h: Math.round(snowfall48h * 10) / 10, wind: weather.current?.wind_speed_10m ?? null, live: true };
    } catch { return { ...resort, temperature: null, snowfallNow: 0, snowfall48h: 0, wind: null, live: false }; }
  }));
  return Response.json({ resorts: data, updatedAt: new Date().toISOString(), source: "Open-Meteo" });
}

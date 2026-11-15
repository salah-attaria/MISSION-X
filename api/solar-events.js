
import fallbackData from "../src/data/solarEvents.json";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const endDate = new Date().toISOString().slice(0, 10);

    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 7);

    const startDate = start.toISOString().slice(0, 10);

    const params = new URLSearchParams({
      startDate,
      endDate,
      api_key: process.env.NASA_API_KEY || "DEMO_KEY"
    });

    const NASA_API =
      "https://ccmc.gsfc.nasa.gov/DONKI-API/get";

    const [cmeResponse, flareResponse, stormResponse] =
      await Promise.all([
        fetch(`${NASA_API}/CME?${params}`),
        fetch(`${NASA_API}/FLR?${params}`),
        fetch(`${NASA_API}/GST?${params}`)
      ]);

    if (
      !cmeResponse.ok ||
      !flareResponse.ok ||
      !stormResponse.ok
    ) {
      throw new Error("NASA DONKI request failed");
    }

    const [cme, flares, geomagneticStorms] =
      await Promise.all([
        cmeResponse.json(),
        flareResponse.json(),
        stormResponse.json()
      ]);

    return res.status(200).json({
      source: "NASA CCMC DONKI",
      fetchedAt: new Date().toISOString(),
      dateRange: {
        startDate,
        endDate
      },
      cme,
      flares,
      geomagneticStorms,
      offline: false
    });

  } catch (error) {
    console.error("NASA DONKI failed:", error);

    return res.status(200).json({
      ...fallbackData,
      offline: true,
      warning: "Using saved NASA observations."
    });
  }
}

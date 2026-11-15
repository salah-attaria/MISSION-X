
import fallbackData from "../src/data/planetaryData.json";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const startDate = new Date().toISOString().slice(0, 10);

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const stopDate = tomorrow.toISOString().slice(0, 10);

    const params = new URLSearchParams({
      format: "json",
      COMMAND: "'499'",
      OBJ_DATA: "'NO'",
      MAKE_EPHEM: "'YES'",
      EPHEM_TYPE: "'VECTORS'",
      CENTER: "'500@10'",
      START_TIME: `'${startDate}'`,
      STOP_TIME: `'${stopDate}'`,
      STEP_SIZE: "'1 d'",
      OUT_UNITS: "'AU-D'",
      VEC_TABLE: "'2'"
    });

    const response = await fetch(
      `https://ssd.jpl.nasa.gov/api/horizons.api?${params}`
    );

    if (!response.ok) {
      throw new Error("JPL Horizons request failed");
    }

    const jplData = await response.json();

    if (!jplData.result || jplData.error) {
      throw new Error("Invalid JPL response");
    }

    const vectorPattern =
      /(\d+\.\d+)\s*=\s*A\.D\.\s*(.*?)\s*TDB\s+X\s*=\s*([+-]?[\d.Ee+-]+)\s+Y\s*=\s*([+-]?[\d.Ee+-]+)\s+Z\s*=\s*([+-]?[\d.Ee+-]+)\s+VX\s*=\s*([+-]?[\d.Ee+-]+)\s+VY\s*=\s*([+-]?[\d.Ee+-]+)\s+VZ\s*=\s*([+-]?[\d.Ee+-]+)/g;

    const vectors = [
      ...jplData.result.matchAll(vectorPattern)
    ].map(match => ({
      julianDate: Number(match[1]),
      date: match[2].trim(),
      position: {
        x: Number(match[3]),
        y: Number(match[4]),
        z: Number(match[5])
      },
      velocity: {
        x: Number(match[6]),
        y: Number(match[7]),
        z: Number(match[8])
      }
    }));

    if (vectors.length === 0) {
      throw new Error("No Mars coordinates extracted");
    }

    return res.status(200).json({
      source: "NASA/JPL Horizons",
      target: "Mars",
      targetId: "499",
      center: "Sun",
      fetchedAt: new Date().toISOString(),
      dateRange: {
        startDate,
        stopDate
      },
      signature: jplData.signature,
      units: {
        position: "AU",
        velocity: "AU/day"
      },
      vectors,
      result: jplData.result,
      offline: false
    });

  } catch (error) {
    console.error("JPL Horizons failed:", error);

    return res.status(200).json({
      ...fallbackData,
      offline: true,
      warning: "Using saved JPL observations."
    });
  }
}

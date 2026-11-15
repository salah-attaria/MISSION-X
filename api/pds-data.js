
import fallbackData from "../src/data/pdsData.json";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const params = new URLSearchParams({
      q: '((ref_lid_target eq "urn:nasa:pds:context:target:planet.mars") and (product_class eq "Product_Observational"))',
      limit: "5"
    });

    const response = await fetch(
      `https://pds.nasa.gov/api/search/1/products?${params}`
    );

    if (!response.ok) {
      throw new Error(`NASA PDS request failed: ${response.status}`);
    }

    const pdsData = await response.json();

    const savedData = {
      source: "NASA Planetary Data System",
      target: "Mars",
      fetchedAt: new Date().toISOString(),
      products: pdsData,
      offline: false
    };

    return res.status(200).json(savedData);

  } catch (error) {
    console.error("NASA PDS failed:", error);

    return res.status(200).json({
      ...fallbackData,
      offline: true,
      warning: "Using saved NASA PDS observations."
    });
  }
}

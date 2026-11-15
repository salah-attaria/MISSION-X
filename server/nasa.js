
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 3001;
const NASA_API = 'https://ccmc.gsfc.nasa.gov/DONKI-API/get';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const cacheFile = path.resolve(
  currentDirectory,
  '../src/data/solarEvents.json'
);
const pdsCacheFile = path.resolve(
  currentDirectory,
  '../src/data/pdsData.json'
);
const horizonsCacheFile = path.resolve(
  currentDirectory,
  '../src/data/planetaryData.json'
);

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');


  // JPL HORIZONS: planetary position data
  if (req.url === '/api/planetary-data') {
    try {
      const startDate = new Date().toISOString().slice(0, 10);

      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const stopDate = tomorrow.toISOString().slice(0, 10);

      const params = new URLSearchParams({
        format: 'json',
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
        throw new Error('JPL Horizons request failed');
      }

      const jplData = await response.json();

      if (!jplData.result || jplData.error) {
        throw new Error('Invalid JPL Horizons response');
      }

const vectorPattern =
  /(\d+\.\d+)\s*=\s*A\.D\.\s*(.*?)\s*TDB\s+X\s*=\s*([+-]?[\d.Ee+-]+)\s+Y\s*=\s*([+-]?[\d.Ee+-]+)\s+Z\s*=\s*([+-]?[\d.Ee+-]+)\s+VX\s*=\s*([+-]?[\d.Ee+-]+)\s+VY\s*=\s*([+-]?[\d.Ee+-]+)\s+VZ\s*=\s*([+-]?[\d.Ee+-]+)/g;

const planetaryVectors = [
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

if (planetaryVectors.length === 0) {
  throw new Error('Could not extract Mars planetary coordinates.');
}

     
const planetaryData = {
  source: 'NASA/JPL Horizons',
  target: 'Mars',
  targetId: '499',
  center: 'Sun',
  fetchedAt: new Date().toISOString(),
  dateRange: { startDate, stopDate },
  signature: jplData.signature,
  units: {
    position: 'AU',
    velocity: 'AU/day'
  },
  vectors: planetaryVectors,
  result: jplData.result
};


      await writeFile(
        horizonsCacheFile,
        JSON.stringify(planetaryData, null, 2),
        'utf8'
      );

      res.writeHead(200);
      res.end(JSON.stringify({
        ...planetaryData,
        offline: false
      }));

    } catch (error) {
      console.error('JPL connection failed:', error.message);

      try {
        const savedRecords = await readFile(
          horizonsCacheFile,
          'utf8'
        );

        res.writeHead(200);
        res.end(JSON.stringify({
          ...JSON.parse(savedRecords),
          offline: true,
          warning: 'Using previously saved JPL observations.'
        }));

      } catch {
        res.writeHead(503);
        res.end(JSON.stringify({
          error: 'JPL unavailable and no offline planetary records exist.'
        }));
      }
    }

    return;
  }

if (req.url === '/api/pds-data') {
  try {
  
const params = new URLSearchParams({
  q: '((ref_lid_target eq "urn:nasa:pds:context:target:planet.mars") and (product_class eq "Product_Observational"))',
  limit: '5'
});


    const response = await fetch(
      `https://pds.nasa.gov/api/search/1/products?${params}`
    );

   if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`NASA PDS ${response.status}: ${errorText}`);
}
    const pdsData = await response.json();

    const savedData = {
      source: 'NASA Planetary Data System',
      target: 'Mars',
      fetchedAt: new Date().toISOString(),
      products: pdsData
    };

    await writeFile(
      pdsCacheFile,
      JSON.stringify(savedData, null, 2),
      'utf8'
    );

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
      ...savedData,
      offline: false
    }));

  } catch (error) {
    console.error('NASA PDS failed:', error.message);

    try {
      const saved = await readFile(pdsCacheFile, 'utf8');

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify({
        ...JSON.parse(saved),
        offline: true
      }));

    } catch {
      res.writeHead(503, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify({
        error: 'PDS unavailable and no saved records exist.'
      }));
    }
  }

  return;
}

  if (req.url !== '/api/solar-events') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
    return;
  }

  try {
    const endDate = new Date().toISOString().slice(0, 10);

    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 7);

    const startDate = start.toISOString().slice(0, 10);

    const dateParams = new URLSearchParams({
      startDate,
      endDate
    });

    const [cmeResponse, flareResponse, stormResponse] =
      await Promise.all([
        fetch(`${NASA_API}/CME?${dateParams}`),
        fetch(`${NASA_API}/FLR?${dateParams}`),
        fetch(`${NASA_API}/GST?${dateParams}`)
      ]);

    if (
      !cmeResponse.ok ||
      !flareResponse.ok ||
      !stormResponse.ok
    ) {
      throw new Error('NASA DONKI API request failed');
    }

    const [cme, flares, geomagneticStorms] =
      await Promise.all([
        cmeResponse.json(),
        flareResponse.json(),
        stormResponse.json()
      ]);

    const nasaData = {
      source: 'NASA CCMC DONKI',
      fetchedAt: new Date().toISOString(),
      dateRange: { startDate, endDate },
      cme,
      flares,
      geomagneticStorms
    };

    // Save the latest successful NASA observations.
    await writeFile(
      cacheFile,
      JSON.stringify(nasaData, null, 2),
      'utf8'
    );

    res.writeHead(200);
    res.end(JSON.stringify({
      ...nasaData,
      offline: false
    }));

  } catch (error) {
    console.error('NASA connection failed:', error.message);

    try {
      // Load the most recently saved NASA observations.
      const savedRecords = await readFile(cacheFile, 'utf8');
      const cachedData = JSON.parse(savedRecords);

      res.writeHead(200);
      res.end(JSON.stringify({
        ...cachedData,
        offline: true,
        warning: 'Using previously saved NASA observations.'
      }));

    } catch (cacheError) {
      res.writeHead(503);
      res.end(JSON.stringify({
        error: 'NASA is unavailable and no usable offline records exist.'
      }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`MISSION X NASA backend running on port ${PORT}`);
});

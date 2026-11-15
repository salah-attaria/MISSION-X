
import { useState, useEffect } from "react";
import { Zap, Radio, Shield, Weight, Cpu, RotateCcw, Rocket } from "lucide-react";

const systems = {
  power: {
    title: "POWER GENERATION",
    icon: Zap,
    options: [
      { name: "Compact Solar Array", mass: 80, power: 500, resilience: 1, description: "Lightweight, lower output." },
      { name: "Advanced Solar Array", mass: 130, power: 900, resilience: 2, description: "Higher output, more mass." },
      { name: "Dual Solar Array", mass: 190, power: 1200, resilience: 4, description: "Redundant power generation." }
    ]
  },
  battery: {
    title: "ENERGY STORAGE",
    icon: Shield,
    options: [
      { name: "Standard Battery", mass: 50, capacity: 300, resilience: 1, description: "Basic emergency storage." },
      { name: "High-Capacity Battery", mass: 90, capacity: 600, resilience: 3, description: "Longer emergency operation." }
    ]
  },
  antenna: {
    title: "COMMUNICATION",
    icon: Radio,
    options: [
      { name: "Compact Antenna", mass: 20, bandwidth: 2, resilience: 1, description: "Low mass, limited data flow." },
      { name: "High-Gain Antenna", mass: 55, bandwidth: 6, resilience: 2, description: "Faster scientific data transmission." },
      { name: "Dual Antenna System", mass: 85, bandwidth: 8, resilience: 4, description: "Backup communication capability." }
    ]
  }
};
const initialSelection = {
  power: 0,
  battery: 0,
  antenna: 0
};

export default function EngineeringLab({ selectedMission }) {
  const [nasaData, setNasaData] = useState(null);
const [nasaLoading, setNasaLoading] = useState(true);
const [nasaError, setNasaError] = useState("");
const [planetaryData, setPlanetaryData] = useState(null);
const [planetaryError, setPlanetaryError] = useState("");
const [pdsData, setPdsData] = useState(null);
const [pdsError, setPdsError] = useState("");
const cmePredictions = (nasaData?.cme || []).flatMap(cme =>
  (cme.cmeAnalyses || [])
    .filter(analysis => analysis.isMostAccurate)
    .flatMap(analysis => analysis.enlilList || [])
);

useEffect(() => {
  const fetchPlanetaryData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/planetary-data"
      );

      if (!response.ok) {
        throw new Error("NASA planetary data unavailable");
      }

      const data = await response.json();

      setPlanetaryData(data);
      setPlanetaryError("");
    } catch (error) {
      setPlanetaryError(error.message);
    }
  };

  fetchPlanetaryData();
}, []);

useEffect(() => {
  const fetchPDSData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/pds-data"
      );

      if (!response.ok) {
        throw new Error("NASA PDS data unavailable");
      }

      const data = await response.json();

      setPdsData(data);
      setPdsError("");
    } catch (error) {
      setPdsError(error.message);
    }
  };

  fetchPDSData();
}, []);

const earthGlancingBlowCount = cmePredictions.filter(
  prediction => prediction.isEarthGB === true
).length;

const earthMinorImpactCount = cmePredictions.filter(
  prediction => prediction.isEarthMinorImpact === true
).length;

const namedSpacecraftImpactCount = cmePredictions.reduce(
  (total, prediction) =>
    total + (prediction.impactList || []).length,
  0
);
const nasaThreatLevel = (() => {
  if (!nasaData) return "UNKNOWN";

  if (earthMinorImpactCount > 0) {
    return "HIGH";
  }

  if (earthGlancingBlowCount > 0) {
    return "MODERATE";
  }

  const hasFastCME = (nasaData.cme || []).some(cme =>
    (cme.cmeAnalyses || []).some(
      analysis =>
        analysis.isMostAccurate && analysis.speed >= 800
    )
  );

  if (hasFastCME) return "WATCH";

  return "LOW";
})();

const nasaStormSeverity = (() => {
  if (!nasaData) return "UNKNOWN";

  const kpValues = [
    ...(nasaData.geomagneticStorms ?? []).flatMap(storm =>
      (storm.allKpIndex ?? []).map(item =>
        Number(item.kpIndex)
      )
    ),

    ...(nasaData.cme ?? []).flatMap(cme =>
      (cme.cmeAnalyses ?? []).flatMap(analysis =>
        (analysis.enlilList ?? []).flatMap(model =>
          [
            model.kp_18,
            model.kp_90,
            model.kp_135,
            model.kp_180
          ]
            .filter(value => value !== null && value !== undefined)
            .map(Number)
        )
      )
    )
  ].filter(Number.isFinite);

  const predictedEarthImpact =
    (nasaData.cme ?? []).some(cme =>
      (cme.cmeAnalyses ?? []).some(analysis =>
        (analysis.enlilList ?? []).some(model =>
          model.isEarthGB === true ||
          model.isEarthMinorImpact === true
        )
      )
    );

  if (kpValues.some(kp => kp >= 7)) return "HIGH";

  if (
    kpValues.some(kp => kp >= 5) ||
    predictedEarthImpact
  ) {
    return "MODERATE";
  }

  return "LOW";
})();
useEffect(() => {
  const fetchNASAData = async () => {
    try {
      setNasaLoading(true);
      setNasaError("");

      const response = await fetch("/api/solar-events");

      if (!response.ok) {
        throw new Error("NASA data request failed");
      }

      const data = await response.json();

      setNasaData(data);
    } catch (error) {
      setNasaError(error.message);
    } finally {
      setNasaLoading(false);
    }
  };

  fetchNASAData();
}, []);
const [selection, setSelection] = useState(initialSelection);
const selectedComponents = {
  power: systems.power.options[selection.power],
  battery: systems.battery.options[selection.battery],
  antenna: systems.antenna.options[selection.antenna]
};

  const [crisisResult, setCrisisResult] = useState(null);
  const [crisisResolved, setCrisisResolved] = useState(false);

const [missionConsequences, setMissionConsequences] = useState({
  research: 0,
  damage: 0,
  data: 0,
  energyPenalty: 0
});
const [missionStage, setMissionStage] = useState(0);
const [researchCompleted, setResearchCompleted] = useState(false);
const [transmissionCompleted, setTransmissionCompleted] = useState(false);
const [repairUsed, setRepairUsed] = useState(false);
const [repairEnergySpent, setRepairEnergySpent] = useState(0);
const missionStages = [
  "LAUNCH & ORBIT",
  "SOLAR STORM",
  "SCIENCE OPERATIONS",
  "RETURN TRANSMISSION"
];
const advanceMissionStage = () => {
  if (missionStage === 0 && missionConsequences.damage < 50) {
    setMissionStage(1);
    return;
  }

  if (
    missionStage === 1 &&
    crisisResult?.status === "SUCCESS"
  ) {
    setMissionStage(2);
    return;
  }

  if (
    missionStage === 2 &&
    researchCompleted &&
    missionConsequences.research >= 10
  ) {
    setMissionStage(3);
    return;
  }

  if (
    missionStage === 3 &&
    transmissionCompleted &&
    missionConsequences.data >= 10
  ) {
    setMissionStage(4);
  }
};

const power = selectedComponents.power;
const battery = selectedComponents.battery;
const antenna = selectedComponents.antenna;
  const totalMass = power.mass + battery.mass + antenna.mass;
  const totalPower = power.power;
  const totalStorage = battery.capacity;
  const bandwidth = antenna.bandwidth;
  const resilience = power.resilience + battery.resilience + antenna.resilience;
  const dnaEffects = {
  stormResistance: power.resilience + battery.resilience,
  emergencyStorage: battery.capacity,
  communicationStrength: antenna.bandwidth + antenna.resilience
};
const missionArchetype =
  resilience >= 8 && bandwidth >= 6
    ? {
        name: "ADAPTIVE COMMANDER",
        trait: "Strong redundancy and communication."
      }
    : resilience >= 8
    ? {
        name: "SURVIVAL SPECIALIST",
        trait: "Prioritizes spacecraft survival."
      }
    : bandwidth >= 6
    ? {
        name: "DATA EXPLORER",
        trait: "Prioritizes scientific communication."
      }
    : {
        name: "LEAN EXPLORER",
        trait: "Lightweight configuration with limited emergency flexibility."
      };
      const adaptiveEnergyBoost =
  (power.resilience >= 4
    ? Math.max(
        0,
        (nasaThreatLevel === "HIGH" ? 150 :
         nasaThreatLevel === "MODERATE" ? 120 :
         nasaThreatLevel === "WATCH" ? 100 : 80)
        - missionConsequences.damage * 10
      )
    : 0)
  + (missionArchetype.name === "ADAPTIVE COMMANDER" ? 100 : 0);
  // Illustrative one-hour solar storm energy model
const availableEnergy = Math.round(
  totalPower * 0.35 + totalStorage * 0.4
);
// Adaptive spacecraft emergency power routing

const effectiveEnergy =
  availableEnergy + adaptiveEnergyBoost - repairEnergySpent;
// Adaptive battery protection

const batteryProtection =
  battery.resilience >= 3
    ? Math.max(
        0,
        (nasaThreatLevel === "HIGH" ? 40 :
         nasaThreatLevel === "MODERATE" ? 30 :
         nasaThreatLevel === "WATCH" ? 20 : 10)
        - missionConsequences.damage * 4
      )
    : 0;

const survivalBonus =
  missionArchetype.name === "SURVIVAL SPECIALIST" ? 10 : 0;

const totalBatteryProtection = Math.min(
  100,
  batteryProtection + survivalBonus
);
// Dual antenna emergency data recovery
const communicationBackup =
  antenna.resilience >= 4
    ? Math.max(
        0,
        (nasaThreatLevel === "HIGH" ? 30 :
         nasaThreatLevel === "MODERATE" ? 20 :
         nasaThreatLevel === "WATCH" ? 15 : 10)
        - missionConsequences.damage * 2
      )
    : 0;
// Mission DNA combination personality
const spacecraftPersonality = (() => {
  if (power.resilience >= 4 && battery.resilience >= 3) {
    return {
      name: "STORM GUARDIAN",
      description: "Designed to survive extreme energy and environmental stress."
    };
  }

  if (antenna.bandwidth >= 6 && power.power >= 900) {
    return {
      name: "DEEP SPACE EXPLORER",
      description: "Optimized for scientific operations and high-volume communication."
    };
  }

  if (battery.capacity >= 600 && antenna.resilience >= 4) {
    return {
      name: "AUTONOMOUS SURVIVOR",
      description: "Prioritizes emergency endurance and communication recovery."
    };
  }

  return {
    name: "MISSION GENERALIST",
    description: "A balanced spacecraft designed for multiple mission demands."
  };
})();

const spacecraftCondition =
  missionConsequences.damage >= 5
    ? {
        status: "CRITICAL",
        description: "Severe damage is disrupting spacecraft operations."
      }
    : missionConsequences.damage >= 3
    ? {
        status: "DEGRADED",
        description: "Accumulated damage is reducing adaptive system performance."
      }
    : missionConsequences.damage >= 1
    ? {
        status: "STRESSED",
        description: "Minor damage is affecting spacecraft resilience."
      }
    : {
        status: "NOMINAL",
        description: "All adaptive systems are operating normally."
      };

const missionRisk = (() => {
  if (
    spacecraftCondition.status === "CRITICAL" ||
    missionConsequences.damage >= 5
  ) {
    return {
      level: "EXTREME",
      description: "Mission survival is at serious risk."
    };
  }

  if (spacecraftCondition.status === "DEGRADED") {
    return {
      level: "HIGH",
      description: "Multiple spacecraft systems are under stress."
    };
  }

  if (spacecraftCondition.status === "STRESSED") {
    return {
      level: "MODERATE",
      description: "Early signs of spacecraft degradation detected."
    };
  }

  return {
    level: "LOW",
    description: "Spacecraft systems are operating within safe limits."
  };
})();
const missionPerformance = (() => {
  if (
    missionConsequences.damage >= 5 ||
    missionConsequences.data < 20
  ) {
    return {
      rating: "CRITICAL",
      description: "Major mission objectives were compromised."
    };
  }

  if (
    missionConsequences.research >= 70 &&
    missionConsequences.data >= 70 &&
    missionConsequences.damage <= 1
  ) {
    return {
      rating: "EXCELLENT",
      description: "The spacecraft performed exceptionally well."
    };
  }

  if (
    missionConsequences.research >= 50 &&
    missionConsequences.data >= 40
  ) {
    return {
      rating: "SUCCESSFUL",
      description: "The mission achieved its primary objectives with some limitations."
    };
  }

  return {
    rating: "PARTIAL SUCCESS",
    description: "The mission completed, but important objectives remain incomplete."
  };
})();

const energyStress = effectiveEnergy < 500 ? 10 : 0;


const conditionResearchPenalty =
  spacecraftCondition.status === "CRITICAL" ? 10 : 0;

const researchGain = Math.max(
  10,
  50
    - missionConsequences.damage * 5
    - energyStress
    - conditionResearchPenalty
);




const conditionTransmissionPenalty =
  spacecraftCondition.status === "CRITICAL" ? 10 : 0;

const transmissionGain = Math.max(
  10,
  50
    - Math.floor(missionConsequences.energyPenalty / 20) * 5
    - energyStress
    + communicationBackup
    - conditionTransmissionPenalty
);





const conditionCrisisPenalty =
  spacecraftCondition.status === "CRITICAL"
    ? 50
    : spacecraftCondition.status === "DEGRADED"
    ? 25
    : spacecraftCondition.status === "STRESSED"
    ? 10
    : 0;

const nasaBaseStormPenalty =
  nasaThreatLevel === "HIGH"
    ? 100
    : nasaThreatLevel === "MODERATE"
    ? 50
    : nasaThreatLevel === "WATCH"
    ? 25
    : 0;

const nasaStormEnergyPenalty =
  nasaThreatLevel === "HIGH"
    ? 100
    : nasaThreatLevel === "MODERATE"
    ? 50
    : nasaThreatLevel === "WATCH"
    ? 25
    : 0;
const crisisRequirements = {
  safe:
    missionArchetype.name === "SURVIVAL SPECIALIST"
      ? 200
      : 250,

  research:
    (missionArchetype.name === "ADAPTIVE COMMANDER"
      ? 550
      : 650) + conditionCrisisPenalty + nasaStormEnergyPenalty,

  transmit:
    (missionArchetype.name === "DATA EXPLORER"
      ? 350
      : 420) + conditionCrisisPenalty + nasaStormEnergyPenalty
};

const engineeringDiagnosis = (() => {

  // 1. Detect serious spacecraft damage
  if (missionConsequences.damage >= 3) {
    return {
      issue: "SPACECRAFT SYSTEM DAMAGE",
      component: selectedComponents.power.name,
      cause: `${selectedComponents.power.name} has a resilience rating of ${selectedComponents.power.resilience}. Mission damage has reached ${missionConsequences.damage}.`,
      recommendation: "Consider a redundant power-generation system to improve spacecraft survival."
    };
  }

  // Detect insufficient power generation
  if (selectedComponents.power.power < 900) {
    return {
      issue: "POWER GENERATION DEFICIT",
      component: selectedComponents.power.name,
      cause: `${selectedComponents.power.name} generates only ${selectedComponents.power.power} W, limiting available spacecraft energy.`,
      recommendation: "Upgrade to an Advanced Solar Array or Dual Solar Array to improve power generation."
    };
  }

  // Detect insufficient battery storage
  if (selectedComponents.battery.capacity < 600) {
    return {
      issue: "ENERGY STORAGE LIMITATION",
      component: selectedComponents.battery.name,
      cause: `${selectedComponents.battery.name} provides only ${selectedComponents.battery.capacity} Wh of emergency storage.`,
      recommendation: "Upgrade to a High-Capacity Battery to improve emergency energy reserves."
    };
  }

  // Detect communication bottleneck
  if (selectedComponents.antenna.bandwidth < 6) {
    return {
      issue: "COMMUNICATION BOTTLENECK",
      component: selectedComponents.antenna.name,
      cause: `${selectedComponents.antenna.name} provides only ${selectedComponents.antenna.bandwidth} MB/s bandwidth, limiting scientific data transmission.`,
      recommendation: "Upgrade to a High-Gain Antenna or Dual Antenna System to improve communication performance."
    };
  }

  // 2. Detect insufficient battery capacity
  if (selectedComponents.battery.capacity < crisisRequirements.research) {
    return {
      issue: "BATTERY CAPACITY LIMITATION",
      component: selectedComponents.battery.name,
      cause: `${selectedComponents.battery.name} provides ${selectedComponents.battery.capacity} Wh, below the ${crisisRequirements.research} Wh research requirement.`,
      recommendation: "Select a battery with greater storage capacity or reduce the energy demand of research operations."
    };
  }

  // 3. Detect communication weakness
  if (bandwidth < 6) {
    return {
      issue: "COMMUNICATION SYSTEM WEAKNESS",
      component: selectedComponents.antenna.name,
      cause: `${selectedComponents.antenna.name} provides only ${bandwidth} MB/s bandwidth.`,
      recommendation: "Upgrade to a high-bandwidth or dual antenna system."
    };
  }

  // 4. Detect incomplete scientific transmission
  if (missionConsequences.data < 50) {
    return {
      issue: "SCIENTIFIC DATA SHORTFALL",
      component: selectedComponents.antenna.name,
      cause: `Only ${missionConsequences.data}% of the target scientific data has been transmitted despite available communication bandwidth.`,
      recommendation: "RECOMMENDATION: For future missions, prioritize transmission planning and reserve sufficient energy for communication."
    };
  }

  // 5. Detect excessive energy consumption
  if (missionConsequences.energyPenalty >= 100) {
    return {
      issue: "EXCESSIVE ENERGY CONSUMPTION",
      component: selectedComponents.battery.name,
      cause: `Mission decisions have accumulated ${missionConsequences.energyPenalty} Wh in energy penalties.`,
      recommendation: "Improve energy conservation strategies and prioritize essential spacecraft systems."
    };
  }

  // 6. No major engineering weakness
  return {
    issue: "MISSION SYSTEMS STABLE",
    component: "All selected components",
    cause: "No major engineering weakness was identified by the current diagnostic rules.",
    recommendation: "Continue monitoring component trade-offs and spacecraft performance."
  };

})();

const resolveCrisis = (choice) => {
    if (crisisResolved) return;
  let result;

  if (choice === "safe") {
 result = effectiveEnergy >= crisisRequirements.safe
      ? {
          status: "SUCCESS",
          title: "SPACECRAFT PROTECTED",
          message: "Essential systems remain operational. Scientific research is paused, but the spacecraft survives the storm."
        }
      : {
          status: "FAILURE",
          title: "ENERGY CRITICAL",
          message: "Available energy is insufficient to maintain safe mode. The spacecraft risks losing essential systems."
        };
  }

  if (choice === "research") {
result =
 effectiveEnergy >= crisisRequirements.research &&
  power.resilience + battery.resilience >= 5
      ? {
          status: "SUCCESS",
          title: "RESEARCH COMPLETED",
          message: "Your spacecraft maintained its instruments throughout the storm and collected valuable scientific data."
        }
      : {
          status: "WARNING",
          title: "RESEARCH COMPROMISED",
          message: "Power reserves or system resilience were insufficient. Scientific instruments have been interrupted."
        };
  }

  if (choice === "transmit") {
   result =
effectiveEnergy >= crisisRequirements.transmit &&
  bandwidth >= 6 &&
  antenna.resilience >= 2
      ? {
          status: "SUCCESS",
          title: "DATA TRANSMISSION COMPLETE",
          message: "Your communication system successfully transmitted the emergency scientific data."
        }
      : {
          status: "WARNING",
          title: "TRANSMISSION INTERRUPTED",
          message: bandwidth < 6
            ? "Your antenna bandwidth is too limited to transmit the emergency data successfully."
            : "Your spacecraft lacks sufficient energy to complete the transmission."
        };
  }

  setCrisisResult({ choice, ...result });

  setMissionConsequences((previous) => {
 const updates = {
  safe: {
    research: -20,
    damage: result.status === "FAILURE" ? 2 : 0,
    data: 0,
  energyPenalty: Math.max(
  0,
  60 + nasaStormEnergyPenalty - totalBatteryProtection
)
  },
  research: {
    research: result.status === "SUCCESS" ? 30 : 5,
    damage: result.status === "SUCCESS" ? 1 : 2,
    data: 0,
   energyPenalty: Math.max(
  0,
  80 + nasaStormEnergyPenalty - totalBatteryProtection
)
  },
  transmit: {
    research: 0,
    damage: result.status === "SUCCESS" ? 0 : 1,
    data: result.status === "SUCCESS"
      ? 30
      : 5 + communicationBackup,
   energyPenalty: Math.max(
  0,
  100 + nasaStormEnergyPenalty - totalBatteryProtection
)
  }
};
  const change = updates[choice];

  if (!change) return previous;

  return {
    research: Math.max(0, Math.min(100, previous.research + change.research)),
    damage: Math.min(100, previous.damage + change.damage),
    data: Math.min(100, previous.data + change.data),
    energyPenalty: previous.energyPenalty + change.energyPenalty
  };
});
  
setCrisisResolved(result.status === "SUCCESS");
};
const performEmergencyRepair = () => {
  if (repairUsed || effectiveEnergy < 100) return;

  setMissionConsequences(previous => ({
    ...previous,
    damage: Math.max(0, previous.damage - 2)
  }));

  setRepairEnergySpent(previous => previous + 100);
  setRepairUsed(true);
};
 const dna = `${selection.power + 1}${selection.battery + 1}${selection.antenna + 1}`;

const changeSelection = (system, index) => {
  setSelection(previous => ({
    ...previous,
    [system]: index
  }));
};
  return (
    <section className="engineering-lab">
      <div className="eyebrow">SPACECRAFT CONFIGURATION / PROTOTYPE 01</div>
      <h1>ENGINEERING <span>LAB</span></h1>
      <p className="lab-intro">
        Every component has a cost. Every advantage creates a trade-off.
        Design a spacecraft that can survive its mission.
      </p>

{selectedMission && (
  <div className="mission-briefing-panel">
    <div className="eyebrow">ACTIVE MISSION / {selectedMission.id}</div>

    <h2>{selectedMission.name}</h2>

    <div className="mission-briefing-details">
      <div>
        <small>DESTINATION</small>
        <strong>{selectedMission.destination}</strong>
      </div>

      <div>
        <small>MISSION TYPE</small>
        <strong>{selectedMission.type}</strong>
      </div>

      <div>
        <small>DIFFICULTY</small>
        <strong>{selectedMission.difficulty}</strong>
      </div>
    </div>

    <p>{selectedMission.description}</p>
  </div>
)}

    <div className="nasa-data-panel">
  <h2>NASA LIVE SPACE WEATHER</h2>

  {nasaLoading && <p>Retrieving NASA observations...</p>}

  {nasaError && (
    <p>NASA CONNECTION ERROR: {nasaError}</p>
  )}

  {nasaData && (
    <>
      <p>
        SOURCE: {nasaData.source}
      </p>
      <p>
  DATA MODE:{" "}
  <strong>
    {nasaData.offline ? "OFFLINE CACHE" : "LIVE NASA DATA"}
  </strong>
</p>

{nasaData.warning && (
  <p>{nasaData.warning}</p>
)}
<p>
  MISSION X STORM SEVERITY:{" "}
  <strong>{nasaStormSeverity}</strong>
</p>
<p>
  NASA PREDICTION THREAT: <strong>{nasaThreatLevel}</strong>
</p>
      <div>
        <strong>Coronal Mass Ejections:</strong>{" "}
        {nasaData.cme.length}
      </div>

      <div>
        <strong>Solar Flares:</strong>{" "}
        {nasaData.flares.length}
      </div>

      <div>
        <strong>Geomagnetic Storms:</strong>{" "}
        {nasaData.geomagneticStorms.length}
      </div>

      <small>
        Retrieved: {new Date(nasaData.fetchedAt).toLocaleString()}
      </small>
    </>
  )}
</div>


<div className="planetary-data-panel">
  <h2>✦ NASA PLANETARY INTELLIGENCE</h2>

  {planetaryError ? (
    <p>DATA ERROR: {planetaryError}</p>
  ) : planetaryData?.vectors?.length > 0 ? (
    <>
      <p>SOURCE: {planetaryData.source}</p>
      <p>TARGET: {planetaryData.target}</p>
      <p>REFERENCE BODY: {planetaryData.center}</p>

      <h3>◈ POSITION VECTOR · AU</h3>
      <div className="planetary-grid">
        {["x", "y", "z"].map(axis => (
          <div className="planetary-card" key={axis}>
            <p>{axis.toUpperCase()} AXIS</p>
            <p className="planetary-value">
              {planetaryData.vectors[0].position[axis].toFixed(6)}
            </p>
          </div>
        ))}
      </div>

      <h3>◈ VELOCITY VECTOR · AU/DAY</h3>
      <div className="planetary-grid">
        {["x", "y", "z"].map(axis => (
          <div className="planetary-card" key={axis}>
            <p>V{axis.toUpperCase()} AXIS</p>
            <p className="planetary-value">
              {planetaryData.vectors[0].velocity[axis].toFixed(6)}
            </p>
          </div>
        ))}
      </div>

      <p>OBSERVATION: {planetaryData.vectors[0].date}</p>

      <span className="planetary-status">
        {planetaryData.offline
          ? "● OFFLINE NASA CACHE"
          : "● LIVE NASA DATA"}
      </span>
    </>
  ) : (
    <p>ACQUIRING PLANETARY TELEMETRY...</p>
  )}
</div>

<div className="planetary-data-panel">
  <h2>NASA SCIENTIFIC ARCHIVE</h2>

  {pdsError ? (
    <p>{pdsError}</p>
  ) : pdsData ? (
    <>
      <p>SOURCE: {pdsData.source}</p>
      <p>TARGET: {pdsData.target}</p>
      <p>
        DATA MODE: {pdsData.offline ? "OFFLINE CACHE" : "LIVE NASA DATA"}
      </p>

      <h3>ARCHIVED SCIENTIFIC PRODUCTS</h3>

      {pdsData.products?.data?.length > 0 ? (
  <div className="pds-results">
    {pdsData.products.data.map((product, index) => (
      <div className="planetary-card" key={product.id || index}>
        <p className="planetary-value">
          {product.title || "Untitled product"}
        </p>

        <p>Type: {product.type || "Not specified"}</p>

        <p>ID: {product.id}</p>

        <p>
          Targets:{" "}
          {(product.targets || [])
            .map(target => target.id.split(":").pop())
            .join(", ") || "Not listed"}
        </p>
      </div>
    ))}
  </div>
) : (
  <p>No PDS records found.</p>
)}
    </>
  ) : (
    <p>SEARCHING NASA SCIENTIFIC ARCHIVES...</p>
  )}
</div>

<div className="pds-note">
  <strong>DATA INTEGRITY NOTICE</strong>
  <p>
    Scientific archive records are retrieved from NASA PDS.
    The listed products identify Mars in their target metadata.
    MISSION X mission outcomes and engineering consequences
    are simulated, not NASA predictions.
  </p>
</div>
      <div className="lab-layout">
    
        <div className="component-panel">
          {Object.entries(systems).map(([key, system]) => {
            const Icon = system.icon;

            return (
              <div className="component-group" key={key}>
                <h3><Icon size={19} /> {system.title}</h3>

                <div className="component-options">
                  {system.options.map((option, index) => (
                    <button
                      key={option.name}
                      className={`component-option ${selection[key] === index ? "chosen" : ""}`}
                      onClick={() => changeSelection(key, index)}
                    >
                      <div className="option-heading">
                        <strong>{option.name}</strong>
                        <span>{selection[key] === index ? "SELECTED" : "SELECT"}</span>
                      </div>
                      <p>{option.description}</p>
                      <small>MASS: {option.mass} KG</small>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <button className="reset-button" onClick={() => setSelection(initialSelection)}>
            <RotateCcw size={15} /> RESET DESIGN
          </button>
        </div>

        <aside className="spacecraft-summary">
          <div className="eyebrow">LIVE ENGINEERING ANALYSIS</div>
          <div className="dna-title"><Cpu size={22} /> MISSION DNA</div>
          <div className="dna-code">{dna}</div>
          <div className="personality-panel">
  <div className="eyebrow">SPACECRAFT PERSONALITY</div>
  <h3>{spacecraftPersonality.name}</h3>
  <p>{spacecraftPersonality.description}</p>
</div>
          <p className="dna-description">
            Your spacecraft identity is generated from your component choices.
          </p>
          <div className="dna-effects">
  <h3>ACTIVE DNA EFFECTS</h3>

  <p>
    <span>STORM RESISTANCE</span>
    <strong>{dnaEffects.stormResistance} / 7</strong>
  </p>

  <p>
    <span>EMERGENCY STORAGE</span>
    <strong>{dnaEffects.emergencyStorage} Wh</strong>
  </p>

 <p>
  <span>COMMUNICATION STRENGTH</span>
  <strong>{dnaEffects.communicationStrength} / 12</strong>
</p>
</div>
<div className="archetype-card">
  <span>SPACECRAFT PERSONALITY</span>
  <strong>{missionArchetype.name}</strong>
  <p>{missionArchetype.trait}</p>
  
<div className="dna-advantage">
  <h4>MISSION DNA: GAMEPLAY ADVANTAGES</h4>

  <p>Safe Mode: {crisisRequirements.safe} Wh</p>

  <p>Research: {crisisRequirements.research} Wh</p>

  <p>Data Transmission: {crisisRequirements.transmit} Wh</p>
</div>

</div>
          <div className="metric">
            <div><span>TOTAL MASS</span><strong>{totalMass} KG</strong></div>
            <div className="metric-track"><span style={{ width: `${Math.min(totalMass / 4, 100)}%` }} /></div>
          </div>

          <div className="metric">
            <div><span>POWER OUTPUT</span><strong>{totalPower} W</strong></div>
            <div className="metric-track"><span style={{ width: `${totalPower / 15}%` }} /></div>
          </div>

          <div className="metric">
            <div><span>BATTERY CAPACITY</span><strong>{totalStorage} WH</strong></div>
            <div className="metric-track"><span style={{ width: `${totalStorage / 8}%` }} /></div>
          </div>

          <div className="metric">
            <div><span>DATA BANDWIDTH</span><strong>{bandwidth} MB/S</strong></div>
            <div className="metric-track"><span style={{ width: `${bandwidth * 10}%` }} /></div>
          </div>

          <div className="metric">
            <div><span>RESILIENCE INDEX</span><strong>{resilience}/11</strong></div>
            <div className="metric-track">
  <span style={{ width: `${(resilience / 11) * 100}%` }} />
</div>
          </div>

          <div className="engineering-warning">
            <Shield size={18} />
            <div>
              <strong>ENGINEERING TRADE-OFF</strong>
              <p>
                {bandwidth <= 2
                  ? "Limited communication may create a scientific data backlog."
                  : resilience <= 5
                  ? "Limited redundancy makes component failures more dangerous."
                  : "Your design has stronger backup capabilities, but additional mass."}
              </p>
            </div>
          </div>

          <div className="design-status">
            <span /> DESIGN CONFIGURATION SAVED LOCALLY
          </div>
        </aside>
      </div>
      
      <section className="crisis-section">
        <div className="eyebrow">UNEXPECTED EVENT / CRISIS 001</div>
{missionStage === 1 && (
        <div className="crisis-heading">
          <div>
            <h2>SOLAR STORM <span>DETECTED</span></h2>
            <p>
              A solar storm has reduced spacecraft power generation by 65%.
              You have one simulated hour to respond.
            </p>
          </div>
          <div className="danger-indicator">● CRITICAL ALERT</div>
        <div className="nasa-mission-intelligence">
  <h3>NASA MISSION INTELLIGENCE</h3>

  <p>
    NASA Threat Assessment: <strong>{nasaThreatLevel}</strong>
  </p>

  <p>
    Additional Simulated Energy Challenge:
    <strong> {nasaStormEnergyPenalty} Wh</strong>
  </p>

  <p>
    Spacecraft Battery Protection:
    <strong> {totalBatteryProtection}%</strong>
  </p>

  <small>
    NASA observations inform this scenario.
    Energy costs are simulated by MISSION X.
  </small>
</div>
        </div>
        
)}
<div className="mission-progress-panel">
  <div className="eyebrow">MISSION CONTROL / PROGRESSION</div>

  <h3>
    {missionStage === 4
      ? "MISSION COMPLETED"
      : missionStages[missionStage]}
  </h3>

  <div className="stage-track">
    {missionStages.map((stage, index) => (
      <div
        key={stage}
        className={`stage-item ${missionStage > index ? "completed" : ""} ${
          missionStage === index ? "active" : ""
        }`}
      >
        <span>{index + 1}</span>
        <small>{stage}</small>
      </div>
    ))}
  </div>

  <button
    className="advance-button"
    onClick={advanceMissionStage}
   disabled={
  missionStage === 4 ||
  (missionStage === 1 && crisisResult?.status !== "SUCCESS") ||
  (missionStage === 2 && !researchCompleted) ||
  (missionStage === 3 && !transmissionCompleted)
}
  >
    {missionStage === 4 ? "MISSION COMPLETE" : "ADVANCE MISSION"}
  </button>
</div>

{missionStage !== 1 && (
  <div className="stage-objective">
    {missionStage === 0 && (
      <>
        <h3>LAUNCH PREPARATION</h3>
        <p>Review your spacecraft design and confirm readiness for launch.</p>
        <button className="stage-action-button" onClick={advanceMissionStage}>
          <Rocket size={16} /> INITIATE LAUNCH
        </button>
      </>
    )}

    {missionStage === 2 && (
      <>
        <h3>SCIENCE OPERATIONS</h3>
        <p>Conduct scientific research to prepare the mission data.</p>
        <button
          className="stage-action-button"
          onClick={() => {
            if (researchCompleted) return;
            setMissionConsequences(previous => ({
              ...previous,
              research: Math.min(100, previous.research + researchGain)
            }));
            setResearchCompleted(true);
          }}
          disabled={researchCompleted}
        >
          <Cpu size={16} /> CONDUCT RESEARCH +{researchGain}%
        </button>
      </>
    )}

    {missionStage === 3 && (
      <>
        <h3>RETURN TRANSMISSION</h3>
        <p>Transmit the collected scientific data back to Earth.</p>
        <button
          className="stage-action-button"
          onClick={() => {
            if (transmissionCompleted) return;
            setMissionConsequences(previous => ({
              ...previous,
              data: Math.min(100, previous.data + transmissionGain)
            }));
            setTransmissionCompleted(true);
          }}
          disabled={transmissionCompleted}
        >
          <Radio size={16} /> TRANSMIT DATA +{transmissionGain}%
        </button>
      </>
    )}

    {missionStage === 4 && (
      <>
        <h3>MISSION SUCCESSFULLY COMPLETED</h3>
        <div className="diagnosis-card">
          <div className="eyebrow">POST-MISSION ENGINEERING INVESTIGATION</div>
          <h2>ENGINEERING DIAGNOSIS</h2>

          <div className="mission-risk">
            <h3>MISSION RISK: {missionRisk.level}</h3>
            <p>{missionRisk.description}</p>
          </div>

          <div className="spacecraft-condition">
            <h3>SPACECRAFT CONDITION: {spacecraftCondition.status}</h3>
            <p>{spacecraftCondition.description}</p>
          </div>

          {missionConsequences.damage >= 2 && (
            <div className="emergency-repair">
              <h3>EMERGENCY REPAIR</h3>
              <p>Restore 2 damage points at a cost of 100 Wh.</p>
              <button
                onClick={performEmergencyRepair}
                disabled={repairUsed || effectiveEnergy < 100}
              >
                {repairUsed ? "REPAIR ALREADY USED" : "REPAIR SPACECRAFT (-100 Wh)"}
              </button>
            </div>
          )}

          <div className="mission-dna-report">
            <h3>MISSION DNA IMPACT</h3>
            <p><strong>SPACECRAFT ARCHETYPE:</strong> {missionArchetype.name}</p>
            <p><strong>ENERGY CONTRIBUTION:</strong> {adaptiveEnergyBoost} Wh</p>
            <p><strong>BATTERY PROTECTION:</strong> {totalBatteryProtection}%</p>
            <p><strong>COMMUNICATION BACKUP:</strong> {communicationBackup}%</p>
          </div>

          <div className="mission-performance">
            <h3>MISSION PERFORMANCE</h3>
            <h2>{missionPerformance.rating}</h2>
            <p>{missionPerformance.description}</p>
          </div>

          <h3>{engineeringDiagnosis.issue}</h3>
          <p><strong>COMPONENT:</strong> {engineeringDiagnosis.component}</p>
          <p><strong>CAUSE:</strong> {engineeringDiagnosis.cause}</p>
          <p><strong>RECOMMENDATION:</strong> {engineeringDiagnosis.recommendation}</p>
        </div>
      </>
    )}
  </div>
)}

{missionStage === 1 && (
  <>
    <div className="crisis-stats">
      <div>
        <small>AVAILABLE ENERGY</small>
        <strong>{availableEnergy} Wh</strong>
      </div>
      <div>
        <small>COMMUNICATION</small>
        <strong>{bandwidth} MB/S</strong>
      </div>
      <div>
        <small>RESILIENCE</small>
        <strong>{resilience}/11</strong>
      </div>
      <div>
  <small>MISSION RISK</small>
  <strong>{missionRisk.level}</strong>
</div>
    </div>

    <h3 className="decision-title">
      FLIGHT DIRECTOR: SELECT YOUR RESPONSE
    </h3>

    <div className="decision-grid">
      <button
        className="decision-card"
        disabled={crisisResolved}
        onClick={() => resolveCrisis("safe")}
      >
        <Shield size={23} />
        <strong>EMERGENCY SAFE MODE</strong>
        <p>Shut down nonessential instruments and protect vital systems.</p>
    <span>ENERGY REQUIREMENT: {crisisRequirements.safe} Wh</span>
      </button>

      <button
        className="decision-card"
        disabled={crisisResolved}
        onClick={() => resolveCrisis("research")}
      >
        <Cpu size={23} />
        <strong>CONTINUE RESEARCH</strong>
        <p>Keep scientific instruments running during the solar storm.</p>
     <span>ENERGY REQUIREMENT: {crisisRequirements.research} Wh</span>
      </button>

      <button
        className="decision-card"
        disabled={crisisResolved}
        onClick={() => resolveCrisis("transmit")}
      >
        <Radio size={23} />
        <strong>EMERGENCY TRANSMISSION</strong>
        <p>Prioritize sending scientific data before communication degrades.</p>
       <span>ENERGY REQUIREMENT: {crisisRequirements.transmit} Wh</span>
      </button>
    </div>
  </>
)}

        {crisisResult && (
          <div className={`crisis-result ${crisisResult.status.toLowerCase()}`}>
            <div className="eyebrow">
              SIMULATION RESULT / {crisisResult.status}
            </div>
            <h3>{crisisResult.title}</h3>
            <p>{crisisResult.message}</p>
       {crisisResult.status !== "SUCCESS" && (
  <button
    onClick={() => {
      setCrisisResult(null);
      setCrisisResolved(false);
    }}
  >
    TRY ANOTHER RESPONSE
  </button>
)}
          </div>
        )}
<div className="consequences-panel">
  <div className="eyebrow">MISSION STATUS / LIVE CONSEQUENCES</div>
  <h2>MISSION DNA IMPACT</h2>

  <div className="consequence-grid">
    <div>
      <span>RESEARCH PROGRESS</span>
      <strong>{missionConsequences.research}%</strong>
    </div>

    <div>
      <span>SYSTEM DAMAGE</span>
      <strong>{missionConsequences.damage}</strong>
    </div>

    <div>
      <span>DATA TRANSMITTED</span>
      <strong>{missionConsequences.data}%</strong>
    </div>

    <div>
      <span>ENERGY PENALTY</span>
      <strong>{missionConsequences.energyPenalty} Wh</strong>
    </div>
  </div>
</div>
        <p className="simulation-note">
          SIMULATION MODEL: illustrative one-hour energy budget.
          Component choices influence the available resources and outcomes.
        </p>
      </section>

    </section>
  );
}

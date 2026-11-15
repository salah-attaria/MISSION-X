
import { useState, useEffect } from "react";
import EngineeringLab from "./EngineeringLab";
import {
  Rocket,
  Orbit,
  Satellite,
  Coins,
  Radio,
  Shield,
  Zap,
  Activity,
  ChevronRight,
  X,
  Telescope,
  Cpu,
  Globe,
} from "lucide-react";
import "./App.css";
const missions = [
  {
    id: "01",
    name: "LUNAR ECHO",
    destination: "MOON",
    type: "LUNAR EXPLORATION",
    difficulty: "MODERATE",
    description:
      "Establish a research mission near the lunar south pole. Manage power, communication and radiation while collecting scientific data.",

    startingCredits: 1500,
    unlockCost: 0,
    victoryReward: 1800,

    hazards: ["Lunar radiation", "Extreme temperature", "Limited sunlight"],

    objectives: [
      "Establish lunar orbit",
      "Collect ice samples",
      "Maintain power systems",
    ],

    assets: {
      power: [
        { id: "solar-compact", name: "Compact Solar Array", cost: 250, power: 500, mass: 80 },
        { id: "solar-advanced", name: "Advanced Solar Array", cost: 450, power: 900, mass: 130 },
        { id: "solar-dual", name: "Dual Solar Array", cost: 650, power: 1200, mass: 190 },
      ],
      battery: [
        { id: "battery-standard", name: "Standard Battery", cost: 150, storage: 300, mass: 50 },
        { id: "battery-high", name: "High-Capacity Battery", cost: 300, storage: 600, mass: 90 },
      ],
      antenna: [
        { id: "antenna-compact", name: "Compact Antenna", cost: 120, bandwidth: 2, mass: 20 },
        { id: "antenna-high", name: "High-Gain Antenna", cost: 280, bandwidth: 6, mass: 55 },
        { id: "antenna-dual", name: "Dual Antenna System", cost: 400, bandwidth: 8, mass: 85 },
      ],
    },
  },

  {
    id: "02",
    name: "RED FRONTIER",
    destination: "MARS",
    type: "PLANETARY EXPLORATION",
    difficulty: "ADVANCED",

    description:
      "Send an autonomous spacecraft to Mars. Prepare for communication delays, harsh radiation and unpredictable system failures.",

    unlockCost: 1200,
    victoryReward: 5200,

    hazards: [
      "Solar radiation storms",
      "Long communication delays",
      "Dust interference",
      "Extreme temperature changes",
    ],

    objectives: [
      "Reach Mars orbit",
      "Analyze the surface",
      "Protect the spacecraft",
    ],

    assets: {
      power: [
        { id: "mars-solar", name: "Radiation-Hardened Solar Array", cost: 550, power: 850, mass: 150 },
        { id: "mars-nuclear", name: "Compact Nuclear Generator", cost: 950, power: 1100, mass: 220 },
      ],
      battery: [
        { id: "mars-thermal", name: "Thermal-Protected Battery", cost: 400, storage: 650, mass: 110 },
        { id: "mars-extended", name: "Extended-Life Battery", cost: 600, storage: 900, mass: 145 },
      ],
      antenna: [
        { id: "mars-deep", name: "Deep Space Antenna", cost: 500, bandwidth: 5, mass: 75 },
        { id: "mars-array", name: "High-Gain Communication Array", cost: 750, bandwidth: 9, mass: 120 },
      ],
      instruments: [
        { id: "mars-spectrometer", name: "Mineral Spectrometer", cost: 450, science: 30, mass: 45 },
        { id: "mars-radar", name: "Ground Penetrating Radar", cost: 650, science: 45, mass: 70 },
      ],
    },
  },

  {
    id: "03",
    name: "SILENT SIGNAL",
    destination: "DEEP SPACE",
    type: "DEEP SPACE MISSION",
    difficulty: "EXPERT",

    description:
      "Explore the unknown beyond familiar planetary territory. Every engineering decision could determine whether your spacecraft survives.",

    unlockCost: 2200,
    victoryReward: 4500,

    hazards: [
      "Extremely weak solar energy",
      "Communication blackouts",
      "Long-duration system degradation",
      "Unknown radiation exposure",
    ],

    objectives: [
      "Navigate deep space",
      "Preserve communication",
      "Complete scientific survey",
    ],

    assets: {
      power: [
        { id: "deep-nuclear", name: "Long-Life Nuclear Power Core", cost: 1200, power: 1400, mass: 260 },
        { id: "deep-hybrid", name: "Hybrid Power System", cost: 900, power: 1000, mass: 190 },
      ],
      battery: [
        { id: "deep-cryo", name: "Cryogenic Energy Storage", cost: 800, storage: 1200, mass: 160 },
        { id: "deep-backup", name: "Emergency Reserve Battery", cost: 500, storage: 700, mass: 100 },
      ],
      antenna: [
        { id: "deep-relay", name: "Long-Range Relay System", cost: 1000, bandwidth: 10, mass: 130 },
        { id: "deep-laser", name: "Laser Communication System", cost: 1400, bandwidth: 15, mass: 95 },
      ],
      instruments: [
        { id: "deep-telescope", name: "Deep Space Telescope", cost: 900, science: 60, mass: 80 },
        { id: "deep-particle", name: "Particle Detection Instrument", cost: 700, science: 45, mass: 55 },
      ],
    },
  },
];
const fundingContracts = [
  {
    id: "nasa-analysis",
    title: "NASA DATA ANALYSIS",
    description: "Analyze real NASA mission observations.",
    reward: 150,
  },
  {
    id: "engineering-challenge",
    title: "ENGINEERING CHALLENGE",
    description: "Complete a spacecraft engineering diagnosis.",
    reward: 250,
  },
  {
    id: "risk-assessment",
    title: "MISSION RISK ASSESSMENT",
    description: "Identify and assess a mission hazard.",
    reward: 100,
  },
];
const crewRoles = [
  {
    id: "architect",
    name: "MISSION ARCHITECT",
    responsibility: "MISSION STRATEGY",
    description: "Plans mission objectives and evaluates engineering trade-offs.",
    ability: "Reviews spacecraft design decisions."
  },
  {
    id: "engineer",
    name: "SYSTEMS ENGINEER",
    responsibility: "SPACECRAFT SYSTEMS",
    description: "Monitors power, batteries, spacecraft damage and system resilience.",
    ability: "Diagnoses engineering weaknesses."
  },
  {
    id: "scientist",
    name: "SCIENCE OFFICER",
    responsibility: "SCIENTIFIC RESEARCH",
    description: "Manages scientific observations and research priorities.",
    ability: "Evaluates research opportunities."
  },
  {
    id: "communications",
    name: "COMMUNICATIONS OFFICER",
    responsibility: "DATA TRANSMISSION",
    description: "Manages antenna performance and communication reliability.",
    ability: "Evaluates data transmission risks."
  }
];

function App() {
  const [selectedMission, setSelectedMission] = useState(null);
  const [credits, setCredits] = useState(() => {
  const savedCredits = localStorage.getItem("missionXCredits");

  return savedCredits !== null
    ? Number(savedCredits)
    : missions[0].startingCredits;
});

useEffect(() => {
  localStorage.setItem("missionXCredits", String(credits));
}, [credits]);  
const [claimedContracts, setClaimedContracts] = useState(() => {
  return JSON.parse(
    localStorage.getItem("missionXClaimedContracts") || "[]"
  );
});

useEffect(() => {
  localStorage.setItem(
    "missionXClaimedContracts",
    JSON.stringify(claimedContracts)
  );
}, [claimedContracts]);

  const [activeMission, setActiveMission] = useState(null);
  const [activePage, setActivePage] = useState("COMMAND CENTER");
const [selectedCrewRole, setSelectedCrewRole] = useState("architect");
const [menuOpen, setMenuOpen] = useState(false);
const claimContract = (contract) => {
  const rewardKey = `missionXContract-${contract.id}`;

  if (
    claimedContracts.includes(contract.id) ||
    localStorage.getItem(rewardKey) === "claimed"
  ) {
    return;
  }

  localStorage.setItem(rewardKey, "claimed");

  setCredits(previous => previous + contract.reward);

  setClaimedContracts(previous => [
    ...previous,
    contract.id,
  ]);
};
const completeContract = (contractId) => {
  if (claimedContracts.includes(contractId)) return;

  setClaimedContracts(previous => [
    ...previous,
    contractId,
  ]);
};
  return (
    <div className="app-shell">
      <button
  className="mobile-menu-button"
  onClick={() => setMenuOpen(prev => !prev)}
  aria-label="Toggle navigation menu"
>
  {menuOpen ? "✕" : "☰"}
</button>
     <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Orbit size={27} /></div>
          <div>
            <h2>MISSION<span> X</span></h2>
            <small>SPACE SYSTEMS LAB</small>
          </div>
        </div>

        <div className="nav-label">MAIN CONTROL</div>

        {[
          { name: "COMMAND CENTER", icon: Activity },
          { name: "MISSION ARCHIVE", icon: Globe },
          { name: "ENGINEERING LAB", icon: Cpu },
          { name: "CREW & ROLES", icon: Shield },
          { name: "FUNDING CENTER", icon: Coins },
        ].map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`nav-item ${activePage === name ? "active" : ""}`}
            onClick={() => setActivePage(name)}
          >
            <Icon size={18} />
            {name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="connection"><span /> SYSTEM ONLINE</div>
          <small>MISSION X / VERSION 1.0</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">MISSION CONTROL / <span>{activePage}</span></div>
          <div className="top-status">
  <span className="live-dot" /> ALL SYSTEMS OPERATIONAL
  <span className="credit-display">
    ◈ {credits.toLocaleString()} CREDITS
  </span>
</div>
        </header>

        {activePage === "COMMAND CENTER" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <div className="eyebrow"><span /> SPACE MISSION SIMULATION PLATFORM</div>
                <h1>THE SPACECRAFT<br />MUST <span>THINK.</span></h1>
                <p>
                  Design it. Challenge it. Adapt it.
                  Every engineering decision shapes the fate of your mission.
                </p>
                <button
                  className="primary-button"
                  onClick={() => document.getElementById("missions").scrollIntoView({ behavior: "smooth" })}
                >
                  EXPLORE MISSIONS <ChevronRight size={18} />
                </button>
              </div>

              <div className="hero-visual">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="planet"><div /></div>
                <div className="satellite-icon"><Satellite size={54} /></div>
                <div className="visual-caption">ADAPTIVE SPACE SYSTEMS<br /><span>EXPLORATION PROTOCOL ACTIVE</span></div>
              </div>
            </section>

            <section className="status-grid">
              <div className="status-card">
                <Radio /><div><small>COMMUNICATION</small><strong>STABLE</strong></div>
              </div>
              <div className="status-card">
                <Zap /><div><small>POWER NETWORK</small><strong>STANDBY</strong></div>
              </div>
              <div className="status-card">
                <Shield /><div><small>SAFETY SYSTEMS</small><strong>ACTIVE</strong></div>
              </div>
              <div className="status-card">
                <Activity /><div><small>MISSION STATUS</small><strong>READY</strong></div>
              </div>
            </section>

            <section className="missions-section" id="missions">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">CHOOSE YOUR DESTINATION</div>
                  <h2>MISSION <span>SELECTOR</span></h2>
                </div>
                <span className="mission-count">03 AVAILABLE MISSIONS</span>
              </div>

              <div className="mission-grid">
                {missions.map((mission) => (
                  <article className="mission-card" key={mission.id}>
                    <div className="card-top">
                      <span>MISSION / {mission.id}</span>
                      <Orbit size={20} />
                    </div>
                    <div className="destination">{mission.destination}</div>
                    <h3>{mission.name}</h3>
                    <p>{mission.type}</p>
                    <div className="card-footer">
                      <span>{mission.difficulty}</span>
                      <button onClick={() => setSelectedMission(mission)}>
                        VIEW BRIEFING <ChevronRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {activePage === "ENGINEERING LAB" &&
  console.log("ACTIVE MISSION IN APP:", activeMission)}

  {activePage === "ENGINEERING LAB" && (
<EngineeringLab
  selectedMission={activeMission}
  credits={credits}
  setCredits={setCredits}
/>
)}


{activePage === "CREW & ROLES" && (
  <section className="placeholder-page crew-page">
    <div className="eyebrow">MISSION PERSONNEL / TEAM CONFIGURATION</div>
    <h1>CREW <span>& ROLES</span></h1>
    <p>Select your specialist. Each crew member has a different mission responsibility.</p>

    <div className="mission-grid">
      {crewRoles.map((role) => (
        <article className="mission-card" key={role.id}>
          <div className="card-top">
            <span>CREW SPECIALIST</span>
            <Shield size={20} />
          </div>

          <h3>{role.name}</h3>
          <p>{role.responsibility}</p>
          <p>{role.description}</p>

          <div className="briefing-note">
            {role.ability}
          </div>

          <div className="card-footer">
            <span>
              {selectedCrewRole === role.id ? "SELECTED" : "AVAILABLE"}
            </span>

            <button onClick={() => setSelectedCrewRole(role.id)}>
              {selectedCrewRole === role.id ? "SELECTED" : "SELECT ROLE"}
              <ChevronRight size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>

    <div className="briefing-note">
      ACTIVE CREW ROLE:{" "}
      <strong>
        {crewRoles.find(role => role.id === selectedCrewRole)?.name}
      </strong>
    </div>

    <button
      className="primary-button"
      onClick={() => setActivePage("ENGINEERING LAB")}
    >
      ENTER ENGINEERING LAB <ChevronRight size={18} />
    </button>
  </section>
)}

{activePage === "MISSION ARCHIVE" && (
  <section className="placeholder-page archive-page">
    <div className="eyebrow">MISSION DATABASE / FLIGHT RECORDS</div>
    <h1>MISSION <span>ARCHIVE</span></h1>
    <p>Explore the available mission files and their objectives.</p>

    <div className="mission-grid">
      {missions.map((mission) => (
        <article className="mission-card" key={mission.id}>
          <div className="card-top">
            <span>MISSION FILE / {mission.id}</span>
            <Globe size={20} />
          </div>

          <div className="destination">{mission.destination}</div>
          <h3>{mission.name}</h3>
          <p>{mission.type}</p>

          <div className="briefing-note">
            <strong>MISSION OBJECTIVES</strong>
            {mission.objectives.map((objective, index) => (
              <p key={objective}>0{index + 1} / {objective}</p>
            ))}
          </div>

          <div className="card-footer">
            <span>{mission.difficulty}</span>
            <button
              onClick={() => {
                setSelectedMission(mission);
                setActivePage("COMMAND CENTER");
              }}
            >
              OPEN FILE <ChevronRight size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
)}
{activePage === "FUNDING CENTER" && (
  <section className="placeholder-page">
    <div className="eyebrow">MISSION ECONOMY / RESEARCH FUNDING</div>

    <h1>FUNDING <span>CENTER</span></h1>

    <p>
      Secure additional mission funding through available research grants.
    </p>

    <div className="briefing-note">
      AVAILABLE BALANCE:
      <strong> ◈ {credits.toLocaleString()} CREDITS</strong>
    </div>

    <div className="mission-grid">
      {fundingContracts.map(contract => {
        const claimed = claimedContracts.includes(contract.id);

        return (
          <article className="mission-card" key={contract.id}>
            <div className="card-top">
              <span>FUNDING CONTRACT</span>
              <Coins size={20} />
            </div>

            <h3>{contract.title}</h3>
            <p>{contract.description}</p>

            <div className="briefing-note">
              REWARD: +{contract.reward} CREDITS
            </div>

            <div className="card-footer">
              <span>{claimed ? "CLAIMED" : "AVAILABLE"}</span>

              <button
                disabled={claimed}
                onClick={() => claimContract(contract)}
              >
                {claimed ? "REWARD CLAIMED" : "CLAIM GRANT"}
                <ChevronRight size={16} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  </section>
)}

        <footer>MISSION X © 2026 <span>BUILT FOR THE NEXT GENERATION OF SPACE ENGINEERS</span></footer>
      </main>

      {selectedMission && (
        <div className="modal-backdrop" onClick={() => setSelectedMission(null)}>
          <div className="briefing-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedMission(null)}><X /></button>
            <div className="eyebrow">MISSION BRIEFING / {selectedMission.id}</div>
          
<h2>{selectedMission.name}</h2>

<p>{selectedMission.description}</p>

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

<h3>PRIMARY OBJECTIVES</h3>

            {selectedMission.objectives.map((objective, index) => (
              <div className="objective" key={objective}>
                <span>0{index + 1}</span>{objective}
              </div>
            ))}
           
<div className="briefing-note">
  <Telescope size={19} /> MISSION BRIEFING ACKNOWLEDGED. ENGINEERING LAB READY.
</div>

<button
  className="primary-button"
 onClick={() => {
  setActiveMission(selectedMission);
  setSelectedMission(null);
  setActivePage("ENGINEERING LAB");
}}
>
  ENTER ENGINEERING LAB <ChevronRight size={18} />
</button>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;

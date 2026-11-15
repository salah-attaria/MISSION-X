
import { useState } from "react";
import EngineeringLab from "./EngineeringLab";
import {
  Rocket,
  Orbit,
  Satellite,
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
    objectives: ["Establish lunar orbit", "Collect ice samples", "Maintain power systems"],
  },
  {
    id: "02",
    name: "RED FRONTIER",
    destination: "MARS",
    type: "PLANETARY EXPLORATION",
    difficulty: "ADVANCED",
    description:
      "Send an autonomous spacecraft to Mars. Prepare for communication delays, harsh radiation and unpredictable system failures.",
    objectives: ["Reach Mars orbit", "Analyze the surface", "Protect the spacecraft"],
  },
  {
    id: "03",
    name: "SILENT SIGNAL",
    destination: "DEEP SPACE",
    type: "DEEP SPACE MISSION",
    difficulty: "EXPERT",
    description:
      "Explore the unknown beyond familiar planetary territory. Every engineering decision could determine whether your spacecraft survives.",
    objectives: ["Navigate deep space", "Preserve communication", "Complete scientific survey"],
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
  const [activeMission, setActiveMission] = useState(null);
  const [activePage, setActivePage] = useState("COMMAND CENTER");
const [selectedCrewRole, setSelectedCrewRole] = useState("architect");
  return (
    <div className="app-shell">
      <aside className="sidebar">
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

  {activePage === "ENGINEERING LAB" && (
  <EngineeringLab selectedMission={activeMission} />
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


        <footer>MISSION X © 2026 <span>BUILT FOR THE NEXT GENERATION OF SPACE ENGINEERS</span></footer>
      </main>

      {selectedMission && (
        <div className="modal-backdrop" onClick={() => setSelectedMission(null)}>
          <div className="briefing-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedMission(null)}><X /></button>
            <div className="eyebrow">MISSION BRIEFING / {selectedMission.id}</div>
            <h2>{selectedMission.name}</h2>
            <p>{selectedMission.description}</p>
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

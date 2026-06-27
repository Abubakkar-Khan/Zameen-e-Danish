import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Clock3,
  Filter,
  LocateFixed,
  MapPin,
  Pause,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  categories,
  eras,
  minimumScoreForZoom,
  personalities,
  provinces,
  tierForScore,
} from "./data.js";

const pakistanBounds = {
  minLon: 60.7,
  maxLon: 77.2,
  minLat: 23.4,
  maxLat: 37.3,
};

const pakistanOutline = [
  [61.05, 25.05],
  [61.75, 26.1],
  [62.55, 26.65],
  [63.25, 27.25],
  [63.95, 28.15],
  [64.65, 28.35],
  [65.15, 29.25],
  [66.25, 29.9],
  [66.75, 30.75],
  [67.55, 31.25],
  [68.2, 31.85],
  [68.0, 32.55],
  [69.35, 33.25],
  [70.05, 33.95],
  [70.55, 34.4],
  [71.65, 34.1],
  [72.7, 34.55],
  [73.15, 35.15],
  [74.15, 35.45],
  [74.6, 36.05],
  [75.65, 36.78],
  [76.65, 35.85],
  [75.7, 35.25],
  [74.7, 34.5],
  [74.4, 33.65],
  [73.45, 33.85],
  [72.75, 33.45],
  [72.95, 32.55],
  [72.2, 31.75],
  [71.35, 30.85],
  [70.8, 29.95],
  [70.15, 28.95],
  [69.35, 28.25],
  [69.0, 27.55],
  [68.05, 26.85],
  [67.25, 25.95],
  [66.35, 25.3],
  [65.15, 24.9],
  [64.05, 24.55],
  [62.75, 24.5],
  [61.05, 25.05],
];

const provinceGuides = [
  { label: "Punjab", path: [[68.6, 28.6], [71.3, 31.0], [73.7, 33.4]] },
  { label: "Sindh", path: [[66.0, 24.7], [67.4, 26.4], [68.6, 28.4]] },
  { label: "Balochistan", path: [[61.9, 25.7], [64.1, 28.3], [66.2, 30.1]] },
  { label: "Khyber Pakhtunkhwa", path: [[69.9, 32.6], [71.3, 34.1], [72.9, 34.6]] },
  { label: "Gilgit-Baltistan", path: [[73.5, 35.3], [75.0, 36.1], [76.0, 36.2]] },
];

function projectPoint([lat, lon]) {
  const width = 1000;
  const height = 820;
  const x = ((lon - pakistanBounds.minLon) / (pakistanBounds.maxLon - pakistanBounds.minLon)) * width;
  const y =
    height - ((lat - pakistanBounds.minLat) / (pakistanBounds.maxLat - pakistanBounds.minLat)) * height;
  return [x, y];
}

function pathFromLonLat(points) {
  return points
    .map(([lon, lat], index) => {
      const [x, y] = projectPoint([lat, lon]);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function initialsFor(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function Avatar({ person, size = "regular" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [person.id]);

  return (
    <span className={`avatar avatar--${size}`}>
      {!failed ? (
        <img src={person.portrait} alt={person.name} onError={() => setFailed(true)} />
      ) : (
        <span className="avatar__fallback">{initialsFor(person.name)}</span>
      )}
    </span>
  );
}

function SelectControl({ icon: Icon, value, onChange, label, options }) {
  return (
    <label className="control-field">
      <span>
        <Icon size={14} />
        {label}
      </span>
      <ChevronDown className="select-chevron" size={14} />
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PakistanMap({ people, selectedId, setSelectedId, zoom, setZoom }) {
  const selectedPerson = people.find((person) => person.id === selectedId) ?? people[0];
  const routePoints = people.slice(0, 7).map((person) => projectPoint(person.coordinates));
  const routePath = routePoints
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  return (
    <section className="map-stage" aria-label="Pakistan-only atlas map">
      <div className="map-grid" />
      <svg className="pakistan-svg" viewBox="0 0 1000 820" role="img" aria-label="Pakistan outline">
        <defs>
          <filter id="countryGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0.72  0 0 0 0 0.42  0 0 0 .58 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="countryFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0df28a" stopOpacity="0.34" />
            <stop offset="48%" stopColor="#01411c" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#06120d" stopOpacity="0.98" />
          </linearGradient>
        </defs>
        <path className="country-shadow" d={`${pathFromLonLat(pakistanOutline)} Z`} />
        <path className="country-fill" d={`${pathFromLonLat(pakistanOutline)} Z`} filter="url(#countryGlow)" />
        <path className="country-inner" d={`${pathFromLonLat(pakistanOutline)} Z`} />

        {provinceGuides.map((guide) => (
          <g key={guide.label}>
            <path className="province-line" d={pathFromLonLat(guide.path)} />
            <text className="province-label" x={projectPoint([guide.path[1][1], guide.path[1][0]])[0]} y={projectPoint([guide.path[1][1], guide.path[1][0]])[1]}>
              {guide.label}
            </text>
          </g>
        ))}

        {routePath && <path className="signal-route" d={routePath} />}
      </svg>

      <div className="map-markers">
        {people.map((person, index) => {
          const [x, y] = projectPoint(person.coordinates);
          const tier = tierForScore(person.impactScore);
          const selected = person.id === selectedId;
          return (
            <button
              key={person.id}
              className={`face-marker face-marker--${tier} ${selected ? "is-selected" : ""}`}
              style={{
                left: `${x / 10}%`,
                top: `${y / 8.2}%`,
                "--delay": `${index * 85}ms`,
              }}
              type="button"
              onClick={() => setSelectedId(person.id)}
              aria-label={`${person.name}, ${person.city}, impact ${person.impactScore}`}
            >
              <span className="face-marker__ring" />
              <Avatar person={person} size={tier === "legendary" ? "large" : "regular"} />
              <span className="face-marker__score">{person.impactScore}</span>
            </button>
          );
        })}
      </div>

      <div className="map-readout">
        <span>Pakistan-only mode</span>
        <strong>{people.length}</strong>
        <span>visible profiles</span>
      </div>

      <label className="zoom-surface">
        <span>Atlas depth</span>
        <input
          type="range"
          min="4"
          max="11"
          step="0.5"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
        <em>score &gt;= {minimumScoreForZoom(zoom)}</em>
      </label>

      {selectedPerson && (
        <div className="map-callout">
          <Avatar person={selectedPerson} size="regular" />
          <div>
            <span>{selectedPerson.city}</span>
            <strong>{selectedPerson.name}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

function ProfilePanel({ person, onClose }) {
  if (!person) {
    return (
      <aside className="profile profile--empty" aria-label="Profile panel">
        <Sparkles size={22} />
        <p className="eyebrow">Awaiting signal</p>
        <h2>Select a face on Pakistan</h2>
        <p>Use depth, search, and filters to move from national icons into regional knowledge.</p>
      </aside>
    );
  }

  return (
    <aside className="profile" aria-label={`${person.name} profile`}>
      <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close profile">
        <X size={18} />
      </button>
      <div className="profile-hero">
        <Avatar person={person} size="hero" />
        <div>
          <p className="eyebrow">{person.category} / {person.city}</p>
          <h2>{person.name}</h2>
          <p className="urdu-name" lang="ur" dir="rtl">{person.urduName}</p>
        </div>
        <div className={`impact-badge impact-badge--${tierForScore(person.impactScore)}`}>
          <strong>{person.impactScore}</strong>
          <span>impact</span>
        </div>
      </div>

      <div className="profile-meta">
        <span><MapPin size={14} /> {person.province}</span>
        <span><Clock3 size={14} /> {person.lifeDates}</span>
        <span><LocateFixed size={14} /> {person.era}</span>
      </div>

      <p className="bio">{person.bio}</p>

      <section>
        <h3>Verified signal</h3>
        <ul className="achievement-list">
          {person.achievements.map((achievement) => (
            <li key={achievement}>{achievement}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Sources</h3>
        <div className="source-list">
          {person.sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))}
        </div>
      </section>

      <section>
        <h3>Related minds</h3>
        <div className="related-list">
          {person.relatedPeople.map((related) => (
            <span key={related}>{related}</span>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [province, setProvince] = useState("All");
  const [era, setEra] = useState("All");
  const [zoom, setZoom] = useState(5);
  const [selectedId, setSelectedId] = useState(personalities[0].id);
  const [looping, setLooping] = useState(true);

  const activeMinimumScore = minimumScoreForZoom(zoom);

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return personalities
      .filter((person) => person.impactScore >= activeMinimumScore)
      .filter((person) => category === "All" || person.category === category)
      .filter((person) => province === "All" || person.province === province)
      .filter((person) => era === "All" || person.era === era)
      .filter((person) => {
        if (!normalizedQuery) return true;
        return [
          person.name,
          person.urduName,
          person.category,
          person.city,
          person.province,
          person.era,
          String(person.impactScore),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => b.impactScore - a.impactScore);
  }, [activeMinimumScore, category, era, province, query]);

  useEffect(() => {
    if (!looping || !filteredPeople.length) return undefined;
    const timer = window.setInterval(() => {
      setSelectedId((currentId) => {
        const index = filteredPeople.findIndex((person) => person.id === currentId);
        return filteredPeople[(index + 1 + filteredPeople.length) % filteredPeople.length].id;
      });
    }, 3600);
    return () => window.clearInterval(timer);
  }, [filteredPeople, looping]);

  useEffect(() => {
    if (!filteredPeople.length) {
      setSelectedId(null);
      return;
    }
    if (!filteredPeople.some((person) => person.id === selectedId)) {
      setSelectedId(filteredPeople[0].id);
    }
  }, [filteredPeople, selectedId]);

  const selectedPerson = filteredPeople.find((person) => person.id === selectedId) ?? filteredPeople[0] ?? null;
  const visibleLegendary = filteredPeople.filter((person) => person.impactScore >= 90).length;
  const averageScore = filteredPeople.length
    ? Math.round(filteredPeople.reduce((sum, person) => sum + person.impactScore, 0) / filteredPeople.length)
    : 0;

  return (
    <main className="atlas">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">ذ</div>
          <div>
            <p className="eyebrow">Pakistan atlas of great minds</p>
            <h1>Zameen-e-Danish</h1>
          </div>
        </div>
        <button className="loop-button" type="button" onClick={() => setLooping((value) => !value)}>
          {looping ? <Pause size={17} /> : <Play size={17} />}
          {looping ? "Looping" : "Paused"}
        </button>
      </header>

      <section className="command-panel" aria-label="Atlas controls">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people, cities, fields..."
            type="search"
          />
        </div>
        <div className="filter-grid">
          <SelectControl icon={Filter} label="Field" value={category} onChange={setCategory} options={categories} />
          <SelectControl icon={MapPin} label="Province" value={province} onChange={setProvince} options={provinces} />
          <SelectControl icon={Clock3} label="Era" value={era} onChange={setEra} options={eras} />
        </div>
        <div className="stat-strip">
          <div>
            <strong>{filteredPeople.length}</strong>
            <span>visible</span>
          </div>
          <div>
            <strong>{visibleLegendary}</strong>
            <span>legendary</span>
          </div>
          <div>
            <strong>{averageScore || "-"}</strong>
            <span>avg score</span>
          </div>
        </div>
        <div className="result-list" aria-label="Visible people">
          {filteredPeople.slice(0, 9).map((person) => (
            <button
              className={`result-row ${person.id === selectedId ? "is-active" : ""}`}
              type="button"
              key={person.id}
              onClick={() => {
                setSelectedId(person.id);
                setLooping(false);
              }}
            >
              <Avatar person={person} size="tiny" />
              <span>
                <strong>{person.name}</strong>
                <small>{person.category} / {person.city}</small>
              </span>
              <em>{person.impactScore}</em>
            </button>
          ))}
          {!filteredPeople.length && (
            <p className="empty-results">No profiles match this signal. Increase depth or loosen filters.</p>
          )}
        </div>
      </section>

      <PakistanMap
        people={filteredPeople}
        selectedId={selectedId}
        setSelectedId={(id) => {
          setSelectedId(id);
          setLooping(false);
        }}
        zoom={zoom}
        setZoom={setZoom}
      />

      <ProfilePanel person={selectedPerson} onClose={() => setSelectedId(null)} />

      <footer className="legend-bar" aria-label="Data sources">
        <span><BookOpen size={14} /> Wikipedia / Nobel / Britannica-linked data</span>
        <span><i className="mini-dot mini-dot--legendary" /> 90+ national signal</span>
        <span><i className="mini-dot mini-dot--major" /> 75+ major signal</span>
        <span><i className="mini-dot mini-dot--regional" /> deeper local signal</span>
      </footer>
    </main>
  );
}

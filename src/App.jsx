import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import {
  BookOpen,
  ChevronDown,
  Clock3,
  Filter,
  LocateFixed,
  MapPin,
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

const pakistanBounds = [
  [23.35, 60.7],
  [37.2, 77.2],
];

const zoomToDepth = (mapZoom) => {
  if (mapZoom < 6) return 4.5;
  if (mapZoom < 7) return 5.5;
  if (mapZoom < 8.5) return 7;
  if (mapZoom < 10) return 8.5;
  return 10;
};

const depthToMapZoom = (depth) => {
  if (depth < 5) return 5;
  if (depth < 6.5) return 6;
  if (depth < 8) return 7.5;
  if (depth < 9.5) return 9;
  return 10.5;
};

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [person.id]);

  return (
    <span className={`avatar avatar--${size}`}>
      <span className="avatar__fallback">{initialsFor(person.name)}</span>
      {!failed ? (
        <img
          className={loaded ? "is-loaded" : ""}
          src={person.portrait}
          alt={person.name}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
}

function markerIconFor(person, selected) {
  const tier = tierForScore(person.impactScore);
  const image = person.portrait
    ? `<img src="${person.portrait}" alt="" onerror="this.style.display='none'" />`
    : "";
  return L.divIcon({
    className: "",
    html: `
      <button class="map-person-marker map-person-marker--${tier} ${selected ? "is-selected" : ""}" aria-label="${person.name}">
        <span class="map-person-marker__halo"></span>
        <span class="map-person-marker__avatar">
          <span>${initialsFor(person.name)}</span>
          ${image}
        </span>
        <strong>${person.impactScore}</strong>
      </button>
    `,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });
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

function MapZoomSync({ zoom, setZoom }) {
  const map = useMap();

  useEffect(() => {
    const targetZoom = depthToMapZoom(zoom);
    if (Math.abs(map.getZoom() - targetZoom) > 0.35) {
      map.flyTo(map.getCenter(), targetZoom, { duration: 0.45 });
    }
  }, [map, zoom]);

  useMapEvents({
    zoomend(event) {
      setZoom(zoomToDepth(event.target.getZoom()));
    },
  });

  return null;
}

function PakistanMap({ people, selectedId, setSelectedId, zoom, setZoom }) {
  const selectedPerson = people.find((person) => person.id === selectedId) ?? people[0];

  return (
    <section className="map-stage map-stage--slippy" aria-label="Zoomable Pakistan knowledge map">
      <MapContainer
        className="slippy-map"
        center={[30.3753, 69.3451]}
        zoom={depthToMapZoom(zoom)}
        minZoom={5}
        maxZoom={12}
        maxBounds={pakistanBounds}
        maxBoundsViscosity={0.72}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapZoomSync zoom={zoom} setZoom={setZoom} />
        {people.map((person, index) => {
          const selected = person.id === selectedId;
          return (
            <Marker
              key={person.id}
              position={person.coordinates}
              icon={markerIconFor(person, selected)}
              eventHandlers={{
                click: () => setSelectedId(person.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -18]} opacity={1}>
                <strong>{person.name}</strong>
                <span>{person.city} / impact {person.impactScore}</span>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="map-readout">
        <span>Zoomable map detail</span>
        <strong>{people.length}</strong>
        <span>visible at this depth</span>
      </div>

      <label className="zoom-surface">
        <span>Zoom depth: {depthLabelForZoom(zoom)}</span>
        <input
          type="range"
          min="4"
          max="11"
          step="0.5"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
        <em>showing impact score &gt;= {minimumScoreForZoom(zoom)}</em>
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

function depthLabelForZoom(zoom) {
  if (zoom < 5) return "National";
  if (zoom < 6.5) return "Province";
  if (zoom < 8) return "City";
  if (zoom < 9.5) return "Local";
  return "Deep archive";
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
  const [zoom, setZoom] = useState(4.5);
  const [selectedId, setSelectedId] = useState(personalities[0].id);

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
            <strong>{personalities.length}</strong>
            <span>archive</span>
          </div>
          <div>
            <strong>{visibleLegendary}</strong>
            <span>legendary</span>
          </div>
        </div>
        <div className="depth-tabs" aria-label="Depth presets">
          {[
            ["National", 4.5],
            ["Province", 5.5],
            ["City", 7],
            ["Local", 8.5],
            ["Archive", 10],
          ].map(([label, value]) => (
            <button
              key={label}
              className={depthLabelForZoom(zoom) === label || (label === "Archive" && zoom >= 9.5) ? "is-active" : ""}
              type="button"
              onClick={() => setZoom(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="result-list" aria-label="Visible people">
          {filteredPeople.slice(0, 14).map((person) => (
            <button
              className={`result-row ${person.id === selectedId ? "is-active" : ""}`}
              type="button"
              key={person.id}
              onClick={() => {
                setSelectedId(person.id);
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
        }}
        zoom={zoom}
        setZoom={setZoom}
      />

      <ProfilePanel person={selectedPerson} onClose={() => setSelectedId(null)} />

      <footer className="legend-bar" aria-label="Data sources">
        <span><BookOpen size={14} /> {personalities.length} Wikipedia-linked profiles</span>
        <span><i className="mini-dot mini-dot--legendary" /> national icons</span>
        <span><i className="mini-dot mini-dot--major" /> provincial leaders</span>
        <span><i className="mini-dot mini-dot--regional" /> city/local archive</span>
      </footer>
    </main>
  );
}

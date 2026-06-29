import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, Marker, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import { ChevronDown, Clock3, Filter, LocateFixed, MapPin, Search } from "lucide-react";
import pakistanBoundary from "./pakistanBoundary.json";
import {
  categories,
  displayCoordinatesFor,
  eras,
  maxPeoplePerCityForZoom,
  minimumScoreForMapZoom,
  personalities,
  provinces,
  tierForScore,
} from "./data.js";

const pakistanBounds = [
  [23.25, 60.55],
  [37.35, 77.35],
];

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
      {!failed && person.portrait ? (
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
        <span class="map-person-marker__avatar">
          <span>${initialsFor(person.name)}</span>
          ${image}
        </span>
        ${selected ? `<strong>${person.impactScore}</strong>` : ""}
      </button>
    `,
    iconSize: selected ? [58, 58] : [44, 44],
    iconAnchor: selected ? [29, 29] : [22, 22],
  });
}

function SelectControl({ icon: Icon, value, onChange, label, options }) {
  return (
    <label className="control-field">
      <span>
        <Icon size={13} />
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

function MapZoomWatcher({ setMapZoom }) {
  useMapEvents({
    zoomend(event) {
      setMapZoom(event.target.getZoom());
    },
  });

  return null;
}

function PakistanMap({ people, selectedId, setSelectedId, setMapZoom }) {
  return (
    <section className="map-stage" aria-label="Pakistan atlas map">
      <MapContainer
        className="slippy-map"
        center={[31.15, 69.35]}
        zoom={5.55}
        minZoom={5}
        maxZoom={13}
        maxBounds={pakistanBounds}
        maxBoundsViscosity={0.82}
        attributionControl={false}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          data={pakistanBoundary}
          interactive={false}
          style={{
            color: "#01411c",
            fillColor: "#01411c",
            fillOpacity: 0,
            opacity: 1,
            weight: 3,
          }}
        />
        <MapZoomWatcher setMapZoom={setMapZoom} />
        {people.map((person, index) => {
          const selected = person.id === selectedId;
          return (
            <Marker
              key={person.id}
              position={displayCoordinatesFor(person, index, people)}
              icon={markerIconFor(person, selected)}
              zIndexOffset={selected ? 1000 : person.impactScore}
              eventHandlers={{
                click: () => setSelectedId(person.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -18]} opacity={1}>
                <strong>{person.name}</strong>
                <span>
                  {person.city} / {person.category}
                </span>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </section>
  );
}

function ProfilePanel({ person }) {
  if (!person) {
    return (
      <aside className="profile profile--empty" aria-label="Profile panel">
        <p className="eyebrow">Selection</p>
        <h2>No profile visible</h2>
        <p>Zoom in or loosen filters to reveal more source-backed personalities.</p>
      </aside>
    );
  }

  return (
    <aside className="profile" aria-label={`${person.name} profile`}>
      <div className="profile-hero">
        <Avatar person={person} size="hero" />
        <div>
          <p className="eyebrow">{person.category}</p>
          <h2>{person.name}</h2>
          <span>{person.city}</span>
        </div>
      </div>

      <div className="impact-badge">
        <strong>{person.impactScore}</strong>
        <span>relevance</span>
      </div>

      <div className="profile-meta">
        <span>
          <Filter size={14} /> {person.category}
        </span>
        <span>
          <MapPin size={14} /> {person.areaName ?? `${person.city}, ${person.province}`}
        </span>
        <span>
          <Clock3 size={14} /> {person.lifeDates}
        </span>
        <span>
          <LocateFixed size={14} /> {person.era}
        </span>
      </div>

      <section className="profile-feature">
        <h3>Top work</h3>
        <p>{person.topWork ?? person.achievements[0]}</p>
      </section>

      <p className="bio">{person.bio}</p>

      <section>
        <h3>Signal</h3>
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
        <h3>Related</h3>
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
  const [mapZoom, setMapZoom] = useState(5.4);
  const [selectedId, setSelectedId] = useState(personalities[0].id);

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return personalities
      .filter((person) => category === "All" || person.category === category)
      .filter((person) => province === "All" || person.province === province)
      .filter((person) => era === "All" || person.era === era)
      .filter((person) => {
        if (!normalizedQuery) return true;
        return [
          person.name,
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
  }, [category, era, province, query]);

  const visiblePeople = useMemo(() => {
    const minimumScore = minimumScoreForMapZoom(mapZoom);
    const zoomVisible = filteredPeople.filter((person) => person.impactScore >= minimumScore);

    const guaranteedByProvince = [];
    const provincesToGuarantee = province === "All" ? provinces : [province];
    for (const provinceName of provincesToGuarantee) {
      guaranteedByProvince.push(
        ...filteredPeople
          .filter((person) => person.province === provinceName)
          .slice(0, 5)
      );
    }

    const guaranteedIds = new Set(guaranteedByProvince.map((person) => person.id));
    const combined = [
      ...guaranteedByProvince,
      ...zoomVisible.filter((person) => !guaranteedIds.has(person.id)),
    ].sort((a, b) => b.impactScore - a.impactScore);

    const cityCounts = new Map();
    const maxPerCity = province === "All" ? maxPeoplePerCityForZoom(mapZoom) : Math.max(5, maxPeoplePerCityForZoom(mapZoom));
    return combined.filter((person) => {
      const key = `${person.province}/${person.city}`;
      const nextCount = (cityCounts.get(key) ?? 0) + 1;
      cityCounts.set(key, nextCount);
      return nextCount <= maxPerCity;
    });
  }, [filteredPeople, mapZoom, province]);


  useEffect(() => {
    if (!visiblePeople.length) {
      setSelectedId(null);
      return;
    }
    if (!visiblePeople.some((person) => person.id === selectedId)) {
      setSelectedId(visiblePeople[0].id);
    }
  }, [selectedId, visiblePeople]);

  const selectedPerson = visiblePeople.find((person) => person.id === selectedId) ?? visiblePeople[0] ?? null;

  return (
    <main className="atlas">
      <aside className="left-rail" aria-label="Atlas controls">
        <section className="command-panel">
          <header className="topbar">
            <h1>Zameen-e-Danish</h1>
          </header>

          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, city, field..."
              type="search"
            />
          </div>

          <div className="filter-grid">
            <SelectControl icon={Filter} label="Field" value={category} onChange={setCategory} options={categories} />
            <SelectControl icon={MapPin} label="Province" value={province} onChange={setProvince} options={provinces} />
            <SelectControl icon={Clock3} label="Era" value={era} onChange={setEra} options={eras} />
          </div>

          <div className="result-list" aria-label="Visible people">
            {visiblePeople.slice(0, 22).map((person) => (
              <button
                className={`result-row ${person.id === selectedId ? "is-active" : ""}`}
                type="button"
                key={person.id}
                onClick={() => setSelectedId(person.id)}
              >
                <Avatar person={person} size="tiny" />
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.category} / {person.city}</small>
                </span>
              </button>
            ))}
            {!visiblePeople.length && (
              <p className="empty-results">No visible profiles. Zoom in or loosen filters.</p>
            )}
          </div>
        </section>
      </aside>

      <PakistanMap
        people={visiblePeople}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        setMapZoom={setMapZoom}
      />

      <ProfilePanel person={selectedPerson} />
    </main>
  );
}

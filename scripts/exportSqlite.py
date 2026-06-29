import json
import re
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data_file = root / "src" / "data.js"
db_file = root / "data" / "zameen-e-danish.sqlite"
db_file.parent.mkdir(exist_ok=True)

source = data_file.read_text(encoding="utf-8")
match = re.search(r"export const personalities = (\[.*?\]);\n\nexport function", source, re.S)
if not match:
    raise SystemExit("Could not locate personalities export in src/data.js")

people = json.loads(match.group(1))

with sqlite3.connect(db_file) as conn:
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(
        """
        DROP TABLE IF EXISTS related_people;
        DROP TABLE IF EXISTS sources;
        DROP TABLE IF EXISTS achievements;
        DROP TABLE IF EXISTS personalities;

        CREATE TABLE personalities (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          urdu_name TEXT,
          category TEXT NOT NULL,
          province TEXT NOT NULL,
          city TEXT NOT NULL,
          area_name TEXT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          life_dates TEXT,
          impact_score INTEGER NOT NULL,
          era TEXT NOT NULL,
          portrait TEXT,
          top_work TEXT,
          bio TEXT
        );

        CREATE TABLE achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          personality_id TEXT NOT NULL REFERENCES personalities(id) ON DELETE CASCADE,
          sort_order INTEGER NOT NULL,
          text TEXT NOT NULL
        );

        CREATE TABLE sources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          personality_id TEXT NOT NULL REFERENCES personalities(id) ON DELETE CASCADE,
          label TEXT NOT NULL,
          url TEXT NOT NULL
        );

        CREATE TABLE related_people (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          personality_id TEXT NOT NULL REFERENCES personalities(id) ON DELETE CASCADE,
          sort_order INTEGER NOT NULL,
          name TEXT NOT NULL
        );
        """
    )

    for person in people:
        lat, lng = person["coordinates"]
        conn.execute(
            """
            INSERT INTO personalities (
              id, name, urdu_name, category, province, city, area_name,
              latitude, longitude, life_dates, impact_score, era, portrait,
              top_work, bio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                person["id"],
                person["name"],
                person.get("urduName", ""),
                person["category"],
                person["province"],
                person["city"],
                person.get("areaName", f'{person["city"]}, {person["province"]}'),
                lat,
                lng,
                person.get("lifeDates", ""),
                person["impactScore"],
                person["era"],
                person.get("portrait", ""),
                person.get("topWork", ""),
                person.get("bio", ""),
            ),
        )

        for index, achievement in enumerate(person.get("achievements", [])):
            conn.execute(
                "INSERT INTO achievements (personality_id, sort_order, text) VALUES (?, ?, ?)",
                (person["id"], index, achievement),
            )

        for source_item in person.get("sources", []):
            conn.execute(
                "INSERT INTO sources (personality_id, label, url) VALUES (?, ?, ?)",
                (person["id"], source_item["label"], source_item["url"]),
            )

        for index, related in enumerate(person.get("relatedPeople", [])):
            conn.execute(
                "INSERT INTO related_people (personality_id, sort_order, name) VALUES (?, ?, ?)",
                (person["id"], index, related),
            )

    conn.commit()

print(f"Wrote {len(people)} people to {db_file}")

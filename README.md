# Spot 🔥

A map-based temporary event app. Create a **Spot**, share the link — your people find you.

## How it works

* **Event Creators** open the app and tap **Create Spot**
* Fill in: event name, your name, location, start + end time (max 24 hrs, within 24 hrs from now)
* A shareable URL is generated — send it to anyone
* **Invited users** open the URL, see the event on the map, and get all the details

Events auto-expire and disappear from the map once they end.

## Tech stack (all free)

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Map | Leaflet.js + OpenStreetMap |
| Geocoding | Nominatim (OpenStreetMap) |
| Database | Supabase (free tier) |
| Realtime | Supabase Realtime |
| Hosting | Vercel / Netlify (free) |

## Setup

### 1. Clone & install

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. In the SQL editor, run the contents of `supabase/schema.sql`
4. Go to **Settings → API** and copy your **Project URL** and **anon/public key**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy (Vercel)

```bash
npm run build
# Push to GitHub, then import repo in vercel.com
# Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars in Vercel dashboard
```

## Project structure

```
src/
├── components/
│   ├── MapView.tsx              # Leaflet map with all spot pins
│   ├── SpotPin.tsx              # Individual map pin (color-coded by status)
│   ├── SpotSidebar.tsx          # List of active/upcoming spots
│   ├── CreateSpotModal.tsx      # Form to create a new spot
│   ├── LocationSearchInput.tsx  # Nominatim location autocomplete
│   └── Navbar.tsx
├── hooks/
│   ├── useSpots.ts              # Supabase CRUD + realtime
│   └── useLocationSearch.ts    # Nominatim geocoding
├── pages/
│   ├── HomePage.tsx             # Map + sidebar
│   └── SpotPage.tsx             # Individual spot detail + share
├── types/index.ts
├── utils/time.ts
└── lib/supabase.ts
supabase/
└── schema.sql                   # Run this in your Supabase SQL editor
```

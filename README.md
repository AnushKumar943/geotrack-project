# GeoTrack — Full-Stack Geospatial Location Portal

A runnable implementation of the supplied MCA Intern Project Specification. It uses Django REST Framework, PostgreSQL, Next.js App Router, Tailwind CSS, browser geolocation, and an interactive map. The map uses Google Maps when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is configured; otherwise it falls back to OpenStreetMap via Leaflet so the project can still be demoed without a Google key.

## Features

- Browser GPS check-in with permission/error handling.
- Store location records in PostgreSQL using a UUID primary key.
- `POST /api/v1/locations/` to record a point.
- `GET /api/v1/locations/latest/` to return the latest point for each identifier.
- `GET /api/v1/locations/history/?user_identifier=...` for chronological trail points.
- Interactive markers, marker details, and travel trail polyline.
- Optional 30-second auto-sync toggle (requires the page to remain open and GPS permission).
- Responsive Tailwind dashboard, loading and status messages.
- Environment variables for database credentials, API URL, and map key.
- OpenStreetMap fallback if no Google Maps key is configured.

## Requirements

Install these first:
- Python 3.10–3.12 recommended
- Node.js 20 LTS or newer
- PostgreSQL 14 or newer
- npm (included with Node.js)

The browser geolocation API generally requires `localhost` or HTTPS. Do not expose a development server publicly with debug mode enabled.

## 1. Create the PostgreSQL database

Open `psql` or pgAdmin and run:

```sql
CREATE DATABASE geotrack_db;
CREATE USER geotrack_user WITH PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE geotrack_db TO geotrack_user;
```

For PostgreSQL 15+, also grant schema permissions if migrations report permission errors:

```sql
\c geotrack_db
GRANT ALL ON SCHEMA public TO geotrack_user;
ALTER SCHEMA public OWNER TO geotrack_user;
```

These are local development credentials only. You may instead use your own PostgreSQL username/password; keep them in `backend/.env`, never commit that file.

## 2. Configure the Django backend

Open a terminal in the project root:

### Windows PowerShell

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set the PostgreSQL credentials to match your database. Example:

```env
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
DB_NAME=geotrack_db
DB_USER=geotrack_user
DB_PASSWORD=change_this_password
DB_HOST=127.0.0.1
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### macOS / Linux

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

Run migrations and start the API:

```bash
python manage.py makemigrations tracker
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Health check: open `http://127.0.0.1:8000/api/health/`.

Optional Django admin account:

```bash
python manage.py createsuperuser
```

Admin URL: `http://127.0.0.1:8000/admin/`.

## 3. Configure the Next.js frontend

Keep the backend terminal running. Open a second terminal:

### Windows PowerShell

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

### macOS / Linux

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend `.env.local` defaults to the local API and OpenStreetMap fallback:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_DEFAULT_USER_IDENTIFIER=intern_01
```

### Google Maps credentials (optional)

1. Open the Google Cloud Console: https://console.cloud.google.com/
2. Create/select a project and enable **Maps JavaScript API**.
3. Set up billing if Google Cloud requires it for your account.
4. Create an API key.
5. Restrict the key to **HTTP referrers** such as `http://localhost:3000/*` and restrict API access to Maps JavaScript API.
6. Put the key in `frontend/.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`.
7. Restart `npm run dev`.

A Google Maps API key is a browser-visible key, not a secret. Restrict it by referrer and API. Never put a database password or Django secret in a `NEXT_PUBLIC_` variable.

## 4. Test the API

With backend running, try these examples in PowerShell or a terminal.

Create a sample location:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/locations/ \
  -H "Content-Type: application/json" \
  -d "{\"user_identifier\":\"intern_01\",\"latitude\":12.9716,\"longitude\":77.5946,\"accuracy\":15.2}"
```

Latest point for every identifier:

```bash
curl http://127.0.0.1:8000/api/v1/locations/latest/
```

History for one identifier:

```bash
curl "http://127.0.0.1:8000/api/v1/locations/history/?user_identifier=intern_01"
```

PowerShell users can also use `Invoke-RestMethod` if `curl` behaves as a PowerShell alias.

## API contract

### `POST /api/v1/locations/`

Request JSON:

```json
{
  "user_identifier": "intern_01",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracy": 15.2
}
```

Returns `201 Created` with the saved record. Latitude must be between -90 and 90, longitude between -180 and 180. `accuracy` is optional and cannot be negative.

### `GET /api/v1/locations/latest/`

Returns the most recent record per `user_identifier`.

### `GET /api/v1/locations/history/?user_identifier=intern_01`

Returns that identifier's points oldest-to-newest. A missing identifier returns HTTP 400.

### `GET /api/health/`

Simple backend health endpoint.

## 5. How to demo

1. Start PostgreSQL.
2. Start Django at `127.0.0.1:8000`.
3. Start Next.js at `localhost:3000`.
4. Enter a user/device identifier such as `intern_01`.
5. Click **Check in / Sync location** and allow location access in the browser.
6. Confirm that the new point appears on the map and in the recent history list.
7. Click a map marker to inspect timestamp, latitude, longitude, and accuracy.
8. Turn on **Auto-sync every 30 seconds** to record a new point periodically. Turn it off when finished.
9. To test without granting GPS permission, use the API `curl` example above.

## Credential and configuration checklist

| Setting | Location | Value |
|---|---|---|
| PostgreSQL database | `backend/.env` | `geotrack_db` by default |
| PostgreSQL username | `backend/.env` | `geotrack_user` by default |
| PostgreSQL password | `backend/.env` | Set your own local password |
| Django secret key | `backend/.env` | Replace placeholder with random secret |
| Google Maps key | `frontend/.env.local` | Optional; use a restricted key |
| Backend API URL | `frontend/.env.local` | `http://127.0.0.1:8000/api/v1` |
| Frontend allowed CORS origin | `backend/.env` | `http://localhost:3000` |

**No real production credentials are included.** `.env.example` files contain placeholders. Do not commit `.env`, `.env.local`, or real keys to GitHub. The repository includes `.gitignore` rules for them.

## Troubleshooting

- **`psycopg` / PostgreSQL connection error:** check PostgreSQL service, port, database, username, and password. The default port is `5432`.
- **Permission denied for schema public:** run the schema grant commands in section 1.
- **CORS error:** ensure `CORS_ALLOWED_ORIGINS=http://localhost:3000` and restart Django.
- **Map says API key required:** either configure a restricted Google Maps key or leave it empty to use OpenStreetMap fallback.
- **Geolocation unavailable:** use `localhost`, allow location access in browser settings, and ensure device location services are enabled.
- **No history line:** the line requires at least two saved locations for the same identifier. Check in more than once or post sample points.
- **Port already in use:** use a free port and update the frontend API URL if the backend port changes.
- **PowerShell activation blocked:** run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate the virtual environment.

## Production notes

Before deployment, set `DJANGO_DEBUG=False`, configure a strong `DJANGO_SECRET_KEY`, set `DJANGO_ALLOWED_HOSTS` and CORS to the real domains, use HTTPS, and keep credentials in a secret manager. This sample does not implement user authentication; identifiers are not proof of identity. Add authentication and authorization before using it for sensitive or real-world tracking.

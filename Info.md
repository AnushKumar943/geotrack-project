# GeoTrack – Setup and Running Guide

## 1. Project Overview

GeoTrack is a geospatial location-tracking web application that allows users to:

* Record their current GPS location.
* Save latitude, longitude, and GPS accuracy.
* Store location records in PostgreSQL.
* View saved locations on an interactive map.
* View location history for individual user/device identifiers.
* Automatically record locations every 30 seconds when auto-sync is enabled.

### Technology Stack

* **Frontend:** Next.js, React, TypeScript
* **Backend:** Python, Django, Django REST Framework
* **Database:** PostgreSQL
* **Map:** Leaflet and OpenStreetMap
* **API communication:** REST API

---

## 2. Prerequisites

Install the following software before running the project:

1. Python
2. Node.js and npm
3. PostgreSQL
4. Visual Studio Code (recommended)

Verify the installations by opening Command Prompt:

```cmd
python --version
node --version
npm --version
psql --version
```

If `psql` is not recognized, use the PostgreSQL SQL Shell or pgAdmin instead.

---

## 3. Project Folder Structure

The project directory should resemble:

```text
geotrack-project/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── geotrack_core/
│   └── tracker/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── migrations/
├── frontend/
│   ├── package.json
│   ├── .env.local
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
└── README.md
```

The exact folder names may differ slightly depending on your project version.

---

## 4. Configure PostgreSQL

### Step 1: Open PostgreSQL

Open pgAdmin and connect to your PostgreSQL server.

Open the Query Tool while connected to the default `postgres` database.

### Step 2: Create the database and user

Execute these commands:

```sql
CREATE USER geotrack_user WITH PASSWORD 'YOUR_DB_PASSWORD';

CREATE DATABASE geotrack_db OWNER geotrack_user;
```

Replace `YOUR_DB_PASSWORD` with a password you choose.

If the user or database already exists, do not execute the corresponding `CREATE` command again. Instead, verify the existing database and permissions.

### Step 3: Grant schema permissions

Connect to `geotrack_db` in pgAdmin and execute:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO geotrack_user;
```

This allows Django to create its tables in the database schema.

### Step 4: Verify the database

In pgAdmin, expand:

```text
Servers
└── PostgreSQL
    └── Databases
        └── geotrack_db
```

Refresh the Databases node if the database is not visible.

---

## 5. Configure the Backend Environment

### Step 1: Open the backend directory

Open Command Prompt and run:

```cmd
cd "%USERPROFILE%\Downloads\geotrack-project\geotrack-project\backend"
```

Adjust the path if your project is stored elsewhere.

### Step 2: Create the environment file

If `.env.example` exists, copy it using Windows CMD:

```cmd
copy .env.example .env
```

If you use PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

If neither command applies because the example file is missing, create a file named `.env` in the backend directory.

### Step 3: Configure `.env`

Use the following as a local development template:

```dotenv
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=geotrack_db
DB_USER=geotrack_user
DB_PASSWORD=YOUR_DB_PASSWORD
DB_HOST=127.0.0.1
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Replace `YOUR_DB_PASSWORD` with the password configured in PostgreSQL. The variable names must match those read by your Django settings.

**Security:** Do not commit `.env` to GitHub. Use a strong, randomly generated Django secret key and disable debug mode for production.

---

## 6. Install Backend Dependencies

Make sure the terminal is inside the `backend` directory.

### Step 1: Create a virtual environment

```cmd
python -m venv venv
```

### Step 2: Activate the virtual environment

```cmd
venv\Scripts\activate
```

The terminal should show `(venv)` before the current path.

### Step 3: Upgrade pip

```cmd
python -m pip install --upgrade pip
```

### Step 4: Install dependencies

```cmd
pip install -r requirements.txt
```

Wait until the installation completes.

If your project does not contain `requirements.txt`, install the dependencies listed in your project's setup instructions instead of guessing package versions.

---

## 7. Run Backend Migrations

Keep the terminal in the `backend` directory with the virtual environment activated.

### Step 1: Check Django configuration

```cmd
python manage.py check
```

### Step 2: Create migrations if model changes need migrations

```cmd
python manage.py makemigrations
```

### Step 3: Apply migrations

```cmd
python manage.py migrate
```

A successful migration should finish without database permission errors.

If you see `permission denied for schema public`, verify that the database user has the schema permissions described in Section 4.

### Step 4: Create an admin user (optional)

```cmd
python manage.py createsuperuser
```

Follow the prompts if you want to access Django Admin.

---

## 8. Start the Django Backend

In the backend terminal, run:

```cmd
python manage.py runserver 127.0.0.1:8000
```

Expected address:

```text
http://127.0.0.1:8000/
```

Open the API health endpoint in your browser:

```text
http://127.0.0.1:8000/api/health/
```

The expected response, if implemented as in this project, is:

```json
{
  "status": "ok",
  "service": "GeoTrack API"
}
```

**Keep this terminal open** while using the application. Press `Ctrl + C` to stop the backend when you are finished.

---

## 9. Configure the Frontend

Open a second Command Prompt window.

### Step 1: Navigate to the frontend

```cmd
cd "%USERPROFILE%\Downloads\geotrack-project\geotrack-project\frontend"
```

### Step 2: Create `.env.local`

Create a file named `.env.local` inside the `frontend` directory if one does not already exist.

Add:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

This URL should match the Django API address and prefix.

Restart the frontend after changing environment variables.

### Step 3: Install npm dependencies

```cmd
npm install
```

### Step 4: Start the frontend

```cmd
npm run dev
```

Keep this terminal open.

Open the website:

```text
http://localhost:3000
```

---

## 10. How to Use GeoTrack

1. Open `http://localhost:3000`.
2. Enter a user/device identifier, such as `intern_01`.
3. Click **Check in / Sync location**.
4. Allow location access when Chrome asks for permission.
5. Wait for the success message.
6. Verify that the recorded-points count increases.
7. Check that the latitude and longitude appear.
8. Verify that the saved location appears as a marker on the map.
9. Open Location History to review the saved record.
10. Enable Auto-sync to request another location every 30 seconds, and disable it when finished.

GPS accuracy depends on the device, browser, permissions, and environment. A map showing a marker does not necessarily mean the position is perfectly accurate.

---

## 11. API Endpoints

The following endpoints are specified for this project.

### POST – Save a location

```text
POST /api/v1/locations/
```

Example JSON payload:

```json
{
  "user_identifier": "intern_01",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracy": 15.2
}
```

Expected successful response: **HTTP 201 Created**.

### GET – Latest locations

```text
GET /api/v1/locations/latest/
```

Returns the latest recorded locations according to the backend implementation.

### GET – Location history

```text
GET /api/v1/locations/history/?user_identifier=intern_01
```

Returns location history for the requested identifier.

### Health check

```text
GET /api/health/
```

Use this endpoint to verify that the backend is responding.

---

## 12. Running the Complete Project Every Time

Whenever you want to run GeoTrack again, follow these steps.

### Terminal 1 – Backend

```cmd
cd "%USERPROFILE%\Downloads\geotrack-project\geotrack-project\backend"
venv\Scripts\activate
python manage.py runserver 127.0.0.1:8000
```

### Terminal 2 – Frontend

```cmd
cd "%USERPROFILE%\Downloads\geotrack-project\geotrack-project\frontend"
npm run dev
```

Before starting, ensure PostgreSQL is running.

Then open:

```text
http://localhost:3000
```

If you close the terminal or shut down your computer, start the services again using these commands.

---

## 13. Troubleshooting

### Problem: `cp is not recognized`

Use the Windows CMD equivalent:

```cmd
copy .env.example .env
```

### Problem: Database does not exist

Create `geotrack_db` in PostgreSQL and verify the database name in `.env`.

### Problem: Permission denied for schema public

Connect to `geotrack_db` as a database administrator and grant the application user the required schema permissions.

### Problem: `400 Bad Request`

Open Chrome Developer Tools → Network → failed `POST /api/v1/locations/` → Response.

Read the JSON validation error. Check the serializer and model field constraints rather than repeatedly changing database settings.

### Problem: `createLocation is not defined`

Ensure that `createLocation` is exported from `frontend/src/lib/api.ts` and imported into `frontend/src/app/page.tsx`, or use the existing `saveLocation` function consistently.

### Problem: Cannot connect to Django

Confirm the backend is running on port `8000` and that `.env.local` contains the correct API base URL.

### Problem: Browser location permission denied

Click the site information icon beside the browser address bar, open site settings, allow location access, and refresh the page.

### Problem: Changes to `.env.local` have no effect

Stop the Next.js server with `Ctrl + C`, then restart it using:

```cmd
npm run dev
```

---

## 14. Security and Credential Management

* Keep `.env` and other private credential files out of GitHub.
* Never publish real database passwords or Django secret keys in this README.
* Use placeholders for credentials in shared documentation.
* Do not use development credentials in production.
* Location history contains sensitive location information. Restrict access to stored records and protect the API before deploying publicly.
* Use HTTPS and appropriate authentication and authorization for production deployments.

---

## 15. Final Verification Checklist

* [x] PostgreSQL is running.
* [x] The `geotrack_db` database exists.
* [x] The backend virtual environment is activated.
* [x] Backend dependencies are installed.
* [x] Django migrations have completed.
* [x] The Django backend runs on port `8000`.
* [x] The health endpoint responds successfully.
* [x] Frontend dependencies are installed.
* [x] The Next.js frontend runs on port `3000`.
* [x] Browser location permission is granted.
* [x] A check-in successfully saves a location.
* [x] Location history displays saved records.
* [x] Auto-sync works when enabled.


**GeoTrack is ready for local testing when the backend and frontend are running, the database is accessible, and a GPS check-in successfully creates a location record.**



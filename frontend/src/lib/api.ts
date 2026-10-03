
export type LocationPoint = {
  id: string;
  user_identifier: string;
  latitude: string | number;
  longitude: string | number;
  accuracy: number | null;
  timestamp: string;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      body.detail ||
      Object.values(body).flat().join(" ") ||
      `Request failed (${response.status})`;

    throw new Error(String(detail));
  }

  return body as T;
}

export async function saveLocation(payload: {
  user_identifier: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}): Promise<LocationPoint> {
  const response = await fetch(`${API_BASE}/locations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<LocationPoint>(response);
}

// Compatibility wrapper for page.tsx
export async function createLocation(payload: {
  user_identifier: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}): Promise<LocationPoint> {
  return saveLocation(payload);
}

export async function getHistory(
  userIdentifier: string
): Promise<LocationPoint[]> {
  const response = await fetch(
    `${API_BASE}/locations/history/?user_identifier=${encodeURIComponent(
      userIdentifier
    )}`,
    { cache: "no-store" }
  );

  return parseResponse<LocationPoint[]>(response);
}

export async function getLatest(): Promise<LocationPoint[]> {
  const response = await fetch(`${API_BASE}/locations/latest/`, {
    cache: "no-store",
  });

  return parseResponse<LocationPoint[]>(response);
}
export type LocationPayload = {
  lat: string;
  lon: string;
  is_available: boolean;
};

export type GeoCoords = {
  lat: number;
  lon: number;
};

export type GeoPermissionState = "unknown" | "granted" | "denied" | "unsupported";

export type ActiveOrderSnapshot = {
  id: number;
  from_address: string;
  to_address: string;
  statusLabel?: string;
};

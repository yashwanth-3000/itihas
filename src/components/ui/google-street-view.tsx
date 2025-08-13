"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import clsx from "clsx";

// Minimal global declaration so TypeScript doesn't require @types/google.maps
declare const google: any;

type TravelMode = "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";

type LatLng = {
  lat: number;
  lng: number;
};

type DistanceResult = {
  straightLineKm: number | null;
  routeDistanceText?: string;
  routeDurationText?: string;
  error?: string;
};

type GoogleStreetViewProps = {
  initialLocation?: LatLng;
  /**
   * If provided, the map/panorama will update to this location when it changes.
   */
  location?: LatLng;
  /**
   * Optional user coordinates to use as the origin for distance calculation.
   * If omitted, the component will try to use browser geolocation.
   */
  userCoords?: LatLng;
  height?: number;
  className?: string;
  /**
   * If provided, externally controls whether the right panel shows Street View or Directions.
   */
  displayMode?: "street" | "directions";
};

function toGoogleLatLng(location: LatLng) {
  return new google.maps.LatLng(location.lat, location.lng);
}

function toFixedKm(km: number | null, digits = 2): string {
  if (km == null) return "-";
  return `${km.toFixed(digits)} km`;
}

function computeHaversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const aVal =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

export function GoogleStreetView({
  initialLocation,
  location,
  userCoords,
  height = 460,
  className,
  displayMode,
}: GoogleStreetViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(
    initialLocation ?? null
  );
  const [travelMode, setTravelMode] = useState<TravelMode>("DRIVING");
  const [distance, setDistance] = useState<DistanceResult>({
    straightLineKm: null,
  });
  const [viewMode, setViewMode] = useState<"street" | "directions">("street");
  const [steps, setSteps] = useState<Array<{ instruction: string; distanceText?: string; durationText?: string }>>([]);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const panoDivRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const panoRef = useRef<any | null>(null);
  const streetViewServiceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const directionsServiceRef = useRef<any | null>(null);
  const directionsRendererRef = useRef<any | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const centerFallback = useMemo<LatLng>(
    () => initialLocation ?? { lat: 40.758, lng: -73.9855 }, // Times Square
    [initialLocation]
  );

  const handleScriptLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleScriptError = useCallback(() => {
    setScriptError("Failed to load Google Maps script.");
  }, []);

  // If Google Maps is already present (e.g., loaded earlier on the page), mark as loaded
  useEffect(() => {
    if (typeof window === "undefined") return;
    const g = (window as any).google;
    if (g && g.maps) {
      setIsLoaded(true);
    }
  }, []);

  // Initialize map and street view when script is loaded
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined" || !mapDivRef.current || !panoDivRef.current) {
      return;
    }

    const g = (window as any).google;
    if (!g || !g.maps) return;

    mapRef.current = new google.maps.Map(mapDivRef.current, {
      center: toGoogleLatLng(centerFallback),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: true,
    });

    streetViewServiceRef.current = new google.maps.StreetViewService();
    directionsServiceRef.current = new google.maps.DirectionsService();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({ suppressMarkers: false });
    directionsRendererRef.current.setMap(mapRef.current);

    panoRef.current = new google.maps.StreetViewPanorama(panoDivRef.current, {
      position: toGoogleLatLng(centerFallback),
      pov: { heading: 0, pitch: 0 },
      visible: true,
      addressControl: true,
      fullscreenControl: true,
      motionTracking: true,
    });

    mapRef.current.setStreetView(panoRef.current);

    // Marker for destination
    markerRef.current = new google.maps.Marker({
      position: toGoogleLatLng(centerFallback),
      map: mapRef.current,
    });

    // Map click selects destination and fetches nearest panorama
    mapRef.current.addListener("click", (e: any) => {
      if (!e.latLng) return;
      const nextDest = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setDestination(nextDest);
      updateMarkerAndPanorama(nextDest);
    });

    // Autocomplete setup
    if (inputRef.current) {
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.geometry || !place.geometry.location) return;
        const loc = place.geometry.location;
        const nextDest = { lat: loc.lat(), lng: loc.lng() };
        setDestination(nextDest);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(16);
        updateMarkerAndPanorama(nextDest);
      });
    }

    // Geolocation origin
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const here: LatLng = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setOrigin(here);
        },
        () => {
          // ignore errors; fallback remains
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 }
      );
    }

    // Initial panorama lookup (if provided)
    updateMarkerAndPanorama(centerFallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const updateMarkerAndPanorama = useCallback((loc: LatLng) => {
    if (!streetViewServiceRef.current || !panoRef.current || !mapRef.current) return;
    const gLoc = toGoogleLatLng(loc);
    if (markerRef.current) {
      markerRef.current.setPosition(gLoc);
    }
    // Ensure the left map reflects the new destination as well
    try {
      mapRef.current.setCenter(gLoc);
      // Bring the location into focus with a reasonable zoom level
      if (typeof mapRef.current.getZoom === "function") {
        const currentZoom = mapRef.current.getZoom();
        if (!currentZoom || currentZoom < 14) {
          mapRef.current.setZoom(15);
        }
      } else {
        mapRef.current.setZoom(15);
      }
    } catch (_) {
      // no-op: some map instances may not have getZoom in certain environments
    }

    streetViewServiceRef.current.getPanorama(
      { location: gLoc, radius: 200 },
      (data: any, status: any) => {
        if (status === google.maps.StreetViewStatus.OK && data && data.location) {
          const panoLoc = data.location.latLng;
          if (panoLoc) {
            panoRef.current!.setPosition(panoLoc);
          }
        } else {
          panoRef.current!.setPosition(gLoc);
        }
      }
    );
  }, []);

  // Sync external location changes into internal destination/map/panorama
  useEffect(() => {
    if (!location) return;
    setDestination(location);
    updateMarkerAndPanorama(location);
  }, [location, updateMarkerAndPanorama]);

  // Sync external display mode into internal view mode
  useEffect(() => {
    if (!displayMode) return;
    setViewMode(displayMode);
  }, [displayMode]);

  // Ensure that if destination was set before Google script finished loading,
  // we still update the marker/panorama once maps are ready.
  useEffect(() => {
    if (!isLoaded) return;
    if (!destination) return;
    if (!mapRef.current || !panoRef.current || !streetViewServiceRef.current) return;
    updateMarkerAndPanorama(destination);
  }, [isLoaded, destination, updateMarkerAndPanorama]);

  // If user coordinates are provided externally, use them as origin
  useEffect(() => {
    if (!userCoords) return;
    setOrigin(userCoords);
  }, [userCoords]);

  const stripHtml = (html: string): string => {
    if (typeof window === "undefined") return html;
    const el = document.createElement("div");
    el.innerHTML = html;
    return el.textContent || el.innerText || "";
  };

  const updateRoute = useCallback(() => {
    const g = (window as any).google;
    if (!g || !g.maps) return;
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;
    if (!origin || !destination) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
      setSteps([]);
      return;
    }

    directionsServiceRef.current.route(
      {
        origin: toGoogleLatLng(origin),
        destination: toGoogleLatLng(destination),
        travelMode: g.maps.TravelMode[travelMode],
        provideRouteAlternatives: false,
      },
      (result: any, status: any) => {
        if (status === g.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          if (leg?.steps) {
            setSteps(
              leg.steps.map((s: any) => ({
                instruction: stripHtml(s.instructions || s.html_instructions || ""),
                distanceText: s.distance?.text,
                durationText: s.duration?.text,
              }))
            );
          } else {
            setSteps([]);
          }
        } else {
          directionsRendererRef.current.setDirections({ routes: [] } as any);
          setSteps([]);
        }
      }
    );
  }, [origin, destination, travelMode]);

  // Compute distances when origin/destination/mode change
  useEffect(() => {
    if (!destination || !origin) {
      setDistance({ straightLineKm: null });
      return;
    }

    const straight = computeHaversineKm(origin, destination);

    const g = (window as any).google;
    if (!g || !g.maps) {
      setDistance({ straightLineKm: straight, error: "Google Maps not available" });
      return;
    }

    const svc = new google.maps.DistanceMatrixService();
    svc.getDistanceMatrix(
      {
        origins: [toGoogleLatLng(origin)],
        destinations: [toGoogleLatLng(destination)],
        travelMode: google.maps.TravelMode[travelMode],
      },
      (res: any, status: any) => {
        if (
          status === google.maps.DistanceMatrixStatus.OK &&
          res &&
          res.rows?.[0]?.elements?.[0]
        ) {
          const el = res.rows[0].elements[0];
          setDistance({
            straightLineKm: straight,
            routeDistanceText: el.distance?.text,
            routeDurationText: el.duration?.text,
          });
        } else {
          setDistance({ straightLineKm: straight, error: status });
        }
      }
    );
  }, [origin, destination, travelMode]);

  // Update route when in directions mode
  useEffect(() => {
    if (viewMode === "directions") {
      updateRoute();
    } else {
      // Clear directions overlay when switching back
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] } as any);
      }
      setSteps([]);
    }
  }, [viewMode, updateRoute]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const here: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setOrigin(here);
      mapRef.current?.panTo(toGoogleLatLng(here));
    });
  }, []);

  const apiSrc = useMemo(() => {
    if (!apiKey) return null;
    const base = "https://maps.googleapis.com/maps/api/js";
    const params = new URLSearchParams({ key: apiKey, libraries: "places" });
    return `${base}?${params.toString()}`;
  }, [apiKey]);

  return (
    <div className={clsx("w-full", className)}>
      {!apiKey && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Add it to your environment.
        </div>
      )}

      {apiSrc && (
        <Script src={apiSrc} strategy="afterInteractive" onLoad={handleScriptLoad} onError={handleScriptError} />
      )}

      {scriptError && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {scriptError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="relative">
            <div
              ref={mapDivRef}
              style={{ height: viewMode === "street" ? height : height + 136, borderRadius: 10 }}
              className="w-full overflow-hidden border border-gray-200 bg-white/90 shadow-sm"
            />
            {/* Distance badge - always visible, top-left inside map */}
            <div className="absolute left-3 top-3 z-[1]">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/70 text-white px-3 py-1 text-xs">
                <span className="opacity-80">Distance</span>
                <strong>
                  {distance.routeDistanceText ? distance.routeDistanceText : toFixedKm(distance.straightLineKm)}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-white/90 p-3 text-sm text-gray-800 shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-gray-700">View</label>
              <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("street")}
                  className={clsx("px-3 py-1 text-sm", viewMode === "street" ? "bg-gray-200" : "bg-white")}
                >
                  Street View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("directions")}
                  className={clsx("px-3 py-1 text-sm", viewMode === "directions" ? "bg-gray-200" : "bg-white")}
                >
                  Directions
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="mode" className="text-gray-700">Mode</label>
              <select
                id="mode"
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as TravelMode)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1"
              >
                <option value="DRIVING">Driving</option>
                <option value="WALKING">Walking</option>
                <option value="BICYCLING">Bicycling</option>
                <option value="TRANSIT">Transit</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-500">Straight line:</span>
              <strong>{toFixedKm(distance.straightLineKm)}</strong>
            </div>
            {distance.routeDistanceText && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Route:</span>
                <strong>{distance.routeDistanceText}</strong>
              </div>
            )}
            {distance.routeDurationText && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">ETA:</span>
                <strong>{distance.routeDurationText}</strong>
              </div>
            )}
            {distance.error && (
              <span className="text-red-700">{distance.error}</span>
            )}
          </div>
        </div>

        {viewMode === "street" ? (
          <div
            ref={panoDivRef}
            style={{ height: height + 136, borderRadius: 10 }}
            className="w-full overflow-hidden border border-gray-200 bg-white/90 shadow-sm"
          />
        ) : (
          <div
            className="w-full overflow-hidden border border-gray-200 bg-white/90 shadow-sm rounded-md p-3 text-sm text-gray-800"
            style={{ height: height + 136 }}
          >
            <div className="font-semibold mb-2">Directions</div>
            {steps.length === 0 ? (
              <div className="text-gray-500">Select a destination to see turn-by-turn directions.</div>
            ) : (
              <ol className="list-decimal pl-5 space-y-1 overflow-auto" style={{ maxHeight: height + 136 - 48 }}>
                {steps.map((s, idx) => (
                  <li key={idx} className="leading-snug">
                    <div>{s.instruction}</div>
                    <div className="text-gray-500 text-xs">
                      {s.distanceText ? s.distanceText : ""}
                      {s.distanceText && s.durationText ? " • " : ""}
                      {s.durationText ? s.durationText : ""}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleStreetView;


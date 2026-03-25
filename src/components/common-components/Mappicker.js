import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   Health Config
───────────────────────────────────────────── */
const HEALTH_CONFIG = {
  healthy: {
    color: "#1b4a2c",
    label: "Healthy",
    icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  },
  planted: {
    color: "#2563eb",
    label: "Planted",
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  },
  dead: {
    color: "#dc2626",
    label: "Dead",
    icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  },
  diseased: {
    color: "#ca8a04",
    label: "Diseased",
    icon: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  },
};

function Mappicker({ treeData = [] }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  /* ─────────────────────────────────────────────
     Initialize Map (SAFE LOAD)
  ───────────────────────────────────────────── */
  useEffect(() => {
    const initMap = () => {
      if (!window.mappls || mapRef.current) return;

      mapRef.current = new window.mappls.Map("map", {
        center: [23.0225, 72.5714],
        zoom: 10,
      });
    };

    // wait for SDK
    if (!window.mappls) {
      const interval = setInterval(() => {
        if (window.mappls) {
          clearInterval(interval);
          initMap();
        }
      }, 300);

      return () => clearInterval(interval);
    } else {
      initMap();
    }
  }, []);

  /* ─────────────────────────────────────────────
     Add Markers
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !window.mappls) return;

    // remove old markers
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch {}
    });
    markersRef.current = [];

    if (!treeData?.length) return;

    const validTrees = treeData.filter(
      (t) => t?.lat && t?.lng
    );

    validTrees.forEach((tree) => {
      const config =
        HEALTH_CONFIG[tree.healthStatus] || HEALTH_CONFIG.planted;

      const lat = Number(tree.lat);
      const lng = Number(tree.lng);

      if (isNaN(lat) || isNaN(lng)) return;

      try {
        const marker = new window.mappls.Marker({
          map: mapRef.current,
          position: { lat, lng },
          icon: config.icon,

          popupHtml: `
            <div style="padding:10px;font-family:Inter, sans-serif;">
              
              <div style="
                display:inline-block;
                background:${config.color};
                color:#fff;
                padding:4px 10px;
                border-radius:20px;
                font-size:12px;
                font-weight:600;
                margin-bottom:8px;
              ">
                ${config.label}
              </div>

              <div style="font-size:13px;color:#374151;margin-bottom:6px;">
                📍 ${tree.location || "Unknown Location"}
              </div>

              <div style="font-size:13px;color:#111827;">
                🌳 Trees: <b>${tree.count || 0}</b>
              </div>
            </div>
          `,
        });

        markersRef.current.push(marker);
      } catch (err) {
        console.error("Marker error:", err);
      }
    });

    /* ─────────────────────────────────────────────
       Fit Bounds
    ───────────────────────────────────────────── */
    if (validTrees.length) {
      const lats = validTrees.map((t) => Number(t.lat));
      const lngs = validTrees.map((t) => Number(t.lng));

      try {
        mapRef.current.fitBounds([
          [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
          [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01],
        ]);
      } catch {}
    }
  }, [treeData]);

  /* ─────────────────────────────────────────────
     UI
  ───────────────────────────────────────────── */
  return (
    <div style={{ position: "relative" }}>
      {/* Map */}
      <div
        id="map"
        style={{
          width: "100%",
          height: "500px",
          borderRadius: "12px",
        }}
      />

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          background: "#fff",
          padding: "12px 16px",
          borderRadius: "10px",
          fontSize: "13px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          🌿 Tree Health
        </div>

        {Object.entries(HEALTH_CONFIG).map(([key, val]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <img
              src={val.icon}
              alt={val.label}
              style={{ width: 16, height: 16 }}  // ✅ FIXED
            />
            <span>{val.label}</span>
          </div>
        ))}

        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid #e5e7eb",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          Total: {treeData.length} location
          {treeData.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

export default Mappicker;
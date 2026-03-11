
import React, { useEffect } from "react";
// Fix: Use correct function and treeData mapping
function Mappicker({ treeData }) {
  useEffect(() => {
    const mapInit = () => {
      try {
        const oldMap = document.getElementById("map");
        if (oldMap) {
          oldMap.innerHTML = "";
        }
        if (window.mappls) {
          const map = new window.mappls.Map("map", {
            center: [23.0225, 72.5714], // Ahmedabad
            zoom: 10,
          });
          if (Array.isArray(treeData) && treeData.length > 0) {
            treeData.forEach((tree, idx) => {
              new window.mappls.Marker({
                map: map,
                position: { lat: tree.lat, lng: tree.lng },
                popupHtml:
                  tree.popup ||
                  `<b>Tree Plantation</b><br/>${tree.location}<br/>Count: ${tree.count}`,
                icon:
                  idx === treeData.length - 1
                    ? window.mappls.Marker.Icon({ color: "red", size: "large" })
                    : undefined,
              });
            });
          } else {
            new window.mappls.Popup({
              map: map,
              position: { lat: 23.0225, lng: 72.5714 },
              html: "<b>No plantation data available</b>",
            });
          }
        } else {
          console.error("Mappls SDK not loaded yet.");
        }
      } catch (err) {
        console.error("Map initialization error:", err);
      }
    };
    if (!window.mappls) {
      const interval = setInterval(() => {
        if (window.mappls) {
          clearInterval(interval);
          mapInit();
        }
      }, 300);
      return () => clearInterval(interval);
    } else {
      mapInit();
    }
  }, [treeData]);

  return (
    <div style={{ position: "relative" }}>
      <div
        id="map"
        style={{
          width: "100%",
          height: "500px",
          borderRadius: "10px",
          minHeight: "500px",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(255,255,255,0.8)",
          padding: "8px",
          borderRadius: "6px",
          fontSize: "14px",
        }}
      >
        
      </div>
    </div>
  );
}

export default Mappicker;

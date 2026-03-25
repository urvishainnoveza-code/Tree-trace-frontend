import React, { useEffect, useState } from "react";
import Mappicker from "../../components/common-components/Mappicker";
import axiosInstance from "../../utils/axiosInstance";
import "../../components/common-components/common.css";
//import "./Dashboard.css"; // ← shared stylesheet

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTreesPlanted: 0,
    totalAssignedTrees: 0,
    healthyTrees: 0,
    deadTrees: 0,
    diseasedTrees: 0,
    recentActivities: [],
  });
  const [treeData, setTreeData] = useState([]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  /* ── Fetch dashboard stats ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/dashboard");
        setStats({
          totalUsers:          res.data.totalUsers          || 0,
          totalTreesPlanted:   res.data.totalTreesPlanted   || 0,
          totalAssignedTrees:  res.data.totalAssignedTrees  || 0,
          healthyTrees:        res.data.healthyTrees        || 0,
          deadTrees:           res.data.deadTrees           || 0,
          diseasedTrees:       res.data.diseasedTrees       || 0,
          recentActivities:    Array.isArray(res.data.recentActivities) ? res.data.recentActivities : [],
        });
      } catch { setError("Failed to fetch dashboard data"); }
      finally  { setLoading(false); }
    })();
  }, []);

  /* ── Fetch plantation map points ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/plantation");
        const plantations = res.data?.Plantation || [];
        setTreeData(
          plantations
            .filter((p) => Array.isArray(p.location?.coordinates) && p.location.coordinates.length === 2)
            .map((p) => ({
              lat: p.location.coordinates[1],
              lng: p.location.coordinates[0],
              count: p.plantedCount,
              healthStatus: p.healthStatus || "planted",
              location: p.address || p.assign?.area?.name || "Unknown",
              popup: `ID: ${p._id}<br/>Date: ${new Date(p.plantationDate).toLocaleString()}<br/>Count: ${p.plantedCount}`,
            }))
        );
      } catch { setTreeData([]); }
    })();
  }, []);

  /* ── Helpers ── */
  const activityDot = (type) =>
    ({ plant: "dad-green", assign: "dad-blue", water: "dad-gold", cancel: "dad-red" }[type] || "dad-green");

  const formatTimeAgo = (d) => {
    if (!d) return "";
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60)     return `${diff}s ago`;
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return `Yesterday, ${new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return new Date(d).toLocaleDateString();
  };

  const pct = (part, total) =>
    total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

  /* ── Data configs ── */
  const statCards = [
    { icon: "👥", badge: "dsb-green", label: "Users",   title: "Total Users",         value: stats.totalUsers,         color: "#1a5c30", barColor: "linear-gradient(90deg,#1a5c30,#4a7c59)", barPct: stats.totalUsers > 0 ? 100 : 0 },
    { icon: "🌳", badge: "dsb-blue",  label: "Planted", title: "Total Trees Planted",  value: stats.totalTreesPlanted,  color: "#1d4ed8", barColor: "linear-gradient(90deg,#1d4ed8,#3b82f6)", barPct: pct(stats.totalTreesPlanted, stats.totalAssignedTrees) },
    { icon: "📋", badge: "dsb-gold",  label: "Assigned",title: "Assigned Trees",       value: stats.totalAssignedTrees, color: "#8a5c0a", barColor: "linear-gradient(90deg,#ca8a04,#eab308)", barPct: stats.totalAssignedTrees > 0 ? 100 : 0 },
  ];

  const quickStats = [
    { icon: "❤️",  cls: "dqi-green", label: "Healthy Trees",  val: stats.healthyTrees,  color: "#1a5c30" },
    { icon: "💀",  cls: "dqi-red",   label: "Dead Trees",     val: stats.deadTrees,     color: "#b91c1c" },
    { icon: "🦠",  cls: "dqi-gold",  label: "Diseased Trees", val: stats.diseasedTrees, color: "#8a5c0a" },
  ];

  const totalHealth = stats.healthyTrees + stats.deadTrees + stats.diseasedTrees;
  const healthRows = [
    { dot: "#16a34a", label: "Healthy",  count: stats.healthyTrees,  pct: pct(stats.healthyTrees,  stats.totalTreesPlanted), bar: "linear-gradient(90deg,#16a34a,#4ade80)" },
    { dot: "#ca8a04", label: "Dead",     count: stats.deadTrees,     pct: pct(stats.deadTrees,     stats.totalTreesPlanted), bar: "linear-gradient(90deg,#ca8a04,#facc15)" },
    { dot: "#dc2626", label: "Diseased", count: stats.diseasedTrees, pct: pct(stats.diseasedTrees, stats.totalTreesPlanted), bar: "linear-gradient(90deg,#dc2626,#f87171)" },
  ];

  /* ── Render ── */
  return (
    <div className="dash-wrap">

      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h4 className="commonindex-24">Admin Dashboard</h4>
          <div className="common-index-font14">Track all tree planting activity across locations</div>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="dash-error">⚠️ &nbsp;{error}</div>}

      {/* STAT CARDS */}
      {loading ? (
        <div className="dash-loading"><div className="dash-spinner" /></div>
      ) : (
        <div className="dash-stat-grid">
          {statCards.map((s, i) => (
            <div className="dash-stat-card" key={i} data-icon={s.icon}>
              <div className={`dash-stat-badge ${s.badge}`}>{s.label}</div>
              <div className="dash-stat-num" style={{ color: s.color }}>{s.value}</div>
              <div className="dash-stat-lbl">{s.title}</div>
              <div className="dash-stat-bar">
                <div className="dash-stat-bar-fill" style={{ width: `${s.barPct}%`, background: s.barColor }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MID ROW — Map + Quick Stats */}
      <div className="dash-mid">

        {/* Map */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <div className="dct-icon">🗺️</div>
              Tree Locations Map
            </div>
          </div>
          <div className="dash-map-body">
            <Mappicker treeData={treeData} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <div className="dct-icon">📊</div>
              Quick Stats
            </div>
          </div>
          {quickStats.map((q, i) => (
            <div className="dash-q-item" key={i}>
              <div className={`dash-q-icon ${q.cls}`}>{q.icon}</div>
              <div className="flex-grow-1">
                <div className="dash-q-lbl">{q.label}</div>
                <div className="dash-q-val" style={{ color: q.color }}>{q.val}</div>
              </div>
              <div className="dash-q-arr">›</div>
            </div>
          ))}
        </div>

      </div>

      {/* BOTTOM ROW — Activity + Health */}
      <div className="dash-bot">

        {/* Recent Activity */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <div className="dct-icon">🕐</div>
              Recent Activity
            </div>
          </div>
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((a, i) => (
              <div className="dash-act-item" key={a._id || i}>
                <div className={`dash-act-dot ${activityDot(a.type)}`} />
                <div className="flex-grow-1">
                  <div className="dash-act-text">
                    {a.message}{a.group?.name && <span> ({a.group.name})</span>}
                  </div>
                  <div className="dash-act-time">{formatTimeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="dash-no-activity">No recent activity found</div>
          )}
        </div>

        {/* Health Breakdown */}
        <div className="dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">
              <div className="dct-icon">❤️</div>
              Tree Health Breakdown
            </div>
          </div>
          {totalHealth > 0 ? (
            healthRows.map((r, i) => (
              <div className="dash-hbar-row" key={i}>
                <div className="dash-hbr-top">
                  <div className="dash-hbr-lbl">
                    <div className="dash-hbr-dot" style={{ background: r.dot }} />
                    {r.label}
                  </div>
                  <div className="dash-hbr-cnt">{r.count}</div>
                </div>
                <div className="dash-hbar">
                  <div className="dash-hbar-fill" style={{ width: `${r.pct}%`, background: r.bar }} />
                </div>
              </div>
            ))
          ) : (
            <div className="dash-health-empty">No health data available</div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
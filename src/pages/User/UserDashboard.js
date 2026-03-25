import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import axiosInstance from "../../utils/axiosInstance";
import "../../components/common-components/common.css";

const PIE_COLOR_MAP = {
  Healthy: "#16a34a",
  Diseased: "#ca8a04",
  Dead: "#dc2626",
  "Not Planted": "#3b82f6",
  "No Data": "#e2ebe2",
};

/* ── Helpers ── */
const pct = (part, total) =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

const getHealthConfig = (h) => {
  const s = (h || "").toLowerCase();
  if (s === "healthy")
    return {
      cls: "ud-ht-h",
      label: "✦ Healthy",
      imgCls: "ud-ti-healthy",
      Svg: () => (
        <span role="img" aria-label="Healthy">
          🌳
        </span>
      ),
    };
  if (s === "dead")
    return {
      cls: "ud-ht-d",
      label: "✕ Dead",
      imgCls: "ud-ti-dead",
      Svg: () => (
        <span role="img" aria-label="Dead">
          🪦
        </span>
      ),
    };
  return {
    cls: "ud-ht-n",
    label: "⚠ Needs Care",
    imgCls: "ud-ti-needcare",
    Svg: () => (
      <span role="img" aria-label="Needs Care">
        🌱
      </span>
    ),
  };
};

/* ── Tooltip ── */
const PieTooltip = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="ud-tooltip">
      <strong>{payload[0].name}</strong>: {payload[0].value}
    </div>
  ) : null;

/* ══════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════ */
function UserDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/dashboard")
      .then((res) => {
        setDashboard(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="ud-loading-wrap">
        <div className="ud-spinner" />
        <span>Loading…</span>
      </div>
    );
  if (error) return <div className="ud-alert-error">⚠️ &nbsp;{error}</div>;
  if (!dashboard)
    return <div className="ud-alert-empty">No dashboard data available.</div>;

  /* ── Destructure ── */
  const {
    group,
    totalGroupMembers = 0,
    totalAssignedTrees = 0,
    totalPlantedTrees = 0,
    topTrees = [],
    healthChart = {},
    members = [],
  } = dashboard;

  const h = healthChart || {};

  /* ── Chart ── */
  const chartData = [
    { name: "Healthy", value: h.healthy || 0 },
    { name: "Diseased", value: h.diseased || 0 },
    { name: "Dead", value: h.dead || 0 },
    { name: "Not Planted", value: h.notPlanted || 0 },
  ];

  const noData = chartData.length === 0;
  const displayData = noData ? [{ name: "No Data", value: 1 }] : chartData;
  const totalTrees = displayData.reduce((s, d) => s + d.value, 0);

  /* ── Legend rows ── */
  const legendRows = [
    {
      dot: "#16a34a",
      label: "Healthy",
      val: h.healthy || 0,
      fill: "linear-gradient(90deg,#16a34a,#4ade80)",
      p: pct(h.healthy || 0, totalPlantedTrees || 1),
    },
    {
      dot: "#ca8a04",
      label: "Diseased",
      val: h.diseased || 0,
      fill: "linear-gradient(90deg,#ca8a04,#facc15)",
      p: pct(h.diseased || 0, totalPlantedTrees || 1),
    },
    {
      dot: "#dc2626",
      label: "Dead",
      val: h.dead || 0,
      fill: "linear-gradient(90deg,#dc2626,#f87171)",
      p: pct(h.dead || 0, totalPlantedTrees || 1),
    },
    {
      dot: "#3b82f6",
      label: "Not Planted",
      val: h.notPlanted || 0,
      fill: "linear-gradient(90deg,#3b82f6,#93c5fd)",
      p: pct(h.notPlanted || 0, totalAssignedTrees || 1),
    },
  ];

  /* ── Stat cards ── */
  const statCards = [
    {
      badge: "ud-scb-blue",
      icon: "👥",
      color: "#1d4ed8",
      label: "Members",
      lbl: "Group Total Users",
      num: totalGroupMembers,
      bar: `${pct(totalGroupMembers, 20)}%`,
      barBg: "linear-gradient(90deg,#1d4ed8,#3b82f6)",
      trend: "↑ Active members",
    },
    {
      badge: "ud-scb-green",
      icon: "🌳",
      color: "#1a5c30",
      label: "Assigned",
      lbl: "Group Assigned Trees",
      num: totalAssignedTrees,
      bar: `${pct(totalAssignedTrees, 100)}%`,
      barBg: "linear-gradient(90deg,#1a5c30,#4a7c59)",
      trend: "↑ Total assigned",
    },
    {
      badge: "ud-scb-gold",
      icon: "🌱",
      color: "#8a5c0a",
      label: "Planted",
      lbl: "Group Planted Trees",
      num: totalPlantedTrees,
      bar: `${pct(totalPlantedTrees, totalAssignedTrees)}%`,
      barBg: "linear-gradient(90deg,#ca8a04,#eab308)",
      trend: `↑ ${pct(totalPlantedTrees, totalAssignedTrees)}% completion`,
    },
  ];

  const areaName = group?.area
    ? typeof group.area === "object"
      ? group.area?.name
      : group.area
    : "—";

  /* ── Render ── */
  return (
    <div className="ud-wrap">
      <h4 className="commonindex-24">User Dashboard</h4>
      <div className="common-index-font14">
        Overview of your group activity and tree assignments
      </div>

      <div className="ud-group-block">
        {/* BANNER */}
        <div className="ud-banner">
          <div>
            <div className="ud-banner-name">{group?.name || "—"}</div>
            <div className="ud-banner-loc">📍&nbsp;{areaName}</div>
          </div>
          <div className="ud-banner-badge">🌿 &nbsp;Active Group</div>
        </div>

        {/* STAT CARDS */}
        <div className="row g-3 mb-2">
          {statCards.map((s, si) => (
            <div key={si} className="col-md-4 col-12">
              <div className="ud-stat-card" data-icon={s.icon}>
                <div className={`ud-sc-badge ${s.badge}`}>{s.label}</div>
                <div className="ud-sc-num" style={{ color: s.color }}>
                  {s.num}
                </div>
                <div className="ud-sc-lbl">{s.lbl}</div>
                <div className="ud-sc-bar">
                  <div
                    className="ud-sc-fill"
                    style={{ width: s.bar, background: s.barBg }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ud-divider" />

        {/* TOP 3 TREES */}
        {Array.isArray(topTrees) && topTrees.length > 0 && (
          <>
            <div className="ud-sec-header">
              <div className="ud-sec-title">
                <div className="ud-sec-icon">🌳</div>
                My Trees (Top 3)
              </div>
            </div>

            <div className="row g-3 mb-2">
              {topTrees.map((tree, ti) => {
                const { cls, label, imgCls, Svg } = getHealthConfig(
                  tree.healthStatus,
                );
                const treeName = tree.treeName
                  ? typeof tree.treeName === "object"
                    ? tree.treeName?.name
                    : tree.treeName
                  : "—";
                return (
                  <div key={ti} className="col-md-4 col-12">
                    <div className="ud-tree-card">
                      <div className={`ud-tree-img ${imgCls}`}>
                        {Array.isArray(tree.images) && tree.images[0] ? (
                          <img
                            src={tree.images[0]}
                            alt={treeName}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        ) : (
                          <Svg />
                        )}
                        <div className={`ud-htag ${cls}`}>{label}</div>
                      </div>
                      <div className="ud-tree-body">
                        <div className="ud-tree-name">{treeName}</div>
                        <div className="ud-tree-meta">
                          <div className="ud-tm-row">
                            Planted:&nbsp;
                            {tree.plantationDate
                              ? new Date(
                                  tree.plantationDate,
                                ).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                        <button
                          className="ud-btn-view"
                          onClick={() => navigate(`/tree-profile/${tree._id}`)}
                        >
                          View Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="ud-divider" />
          </>
        )}

        {/* DONUT CHART */}
        <div className="ud-sec-header">
          <div className="ud-sec-title">
            <div className="ud-sec-icon">📊</div>
            Status Distribution
          </div>
        </div>

        <div className="ud-chart-card">
          <div className="ud-chart-head">
            <div className="ud-sec-icon">🥧</div>
            <div className="ud-chart-title">
              Tree Health Status Distribution
            </div>
          </div>

          <div className="ud-chart-body">
            {/* Donut */}
            <div className="ud-pie-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={95}
                    paddingAngle={noData ? 0 : 3}
                    dataKey="value"
                    labelLine={false}
                    stroke="none"
                  >
                    {displayData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLOR_MAP[entry.name] || "#e2ebe2"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  {/* Centre text */}
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      fill: "#1a2e1e",
                      fontFamily: "Poppins,sans-serif",
                    }}
                  >
                    {noData ? "0" : totalTrees}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      fill: "#7a9a7e",
                      fontFamily: "Nunito,sans-serif",
                    }}
                  >
                    Total Trees
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="ud-legend">
              {legendRows.map((r, ri) => (
                <div key={ri} className="ud-leg-row">
                  <div className="ud-leg-top">
                    <div className="ud-leg-label">
                      <div
                        className="ud-leg-dot"
                        style={{ background: r.dot }}
                      />
                      {r.label}
                    </div>
                    <div className="ud-leg-val" style={{ color: r.dot }}>
                      {r.val}
                    </div>
                  </div>
                  <div className="ud-leg-bar">
                    <div
                      className="ud-leg-fill"
                      style={{ width: `${r.p}%`, background: r.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ud-divider" />

        {/* MEMBERS TABLE */}
        <div className="ud-sec-header">
          <div className="ud-sec-title">
            <div className="ud-sec-icon">👥</div>
            Group Members
          </div>
          <span className="ud-sec-badge">{totalGroupMembers} Members</span>
        </div>
        <table class="table table-bordered table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(members) && members.length > 0 ? (
              members.map((m, mi) => (
                <tr key={mi}>
                  <td>
                    <div className="ud-td-user">
                      <div className="ud-td-av">
                        {(m.firstName || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="ud-td-name common-index-font14">
                        {m.firstName} {m.lastName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="ud-td-email common-index-font14">
                      {m.email || "—"}
                    </span>
                  </td>
                  <td>
                    <span className="ud-td-mob common-index-font14">
                      {m.phoneNo || m.mobile || "—"}
                    </span>
                  </td>
                  <td>
                    <div className="ud-td-status">
                      <div className="ud-td-dot common-index-font14" />
                      {m.isActive !== false ? "Active" : "Inactive"}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="ud-table-empty">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserDashboard;

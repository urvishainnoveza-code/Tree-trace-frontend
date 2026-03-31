import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "../../components/common-components/common.css";
import treeDefaultImg from "../../assets/tree.jpg";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const pct = (part, total) =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

const getHealthConfig = (h) => {
  const s = (h || "").toLowerCase();
  if (s === "healthy")
    return {
      cls: "ud-ht-h",
      label: "Healthy",
      imgCls: "ud-ti-healthy",
    };
  if (s === "dead")
    return {
      cls: "ud-ht-d",
      label: "Dead",
      imgCls: "ud-ti-dead",
    };
  return {
    cls: "ud-ht-n",
    label: "Needs Care",
    imgCls: "ud-ti-needcare",
  };
};

function DonorDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAllTrees, setShowAllTrees] = useState(false);

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

  const {
    totalTrees = 0,
    totalAmount = 0,
    totalPlanted = 0,
    myTrees = [],
    donationActivity = [],
  } = dashboard;

  // Stat cards config (matching UserDashboard.js)
  const statCards = [
    {
      badge: "ud-scb-blue",
      icon: "👥",
      color: "#1d4ed8",
      label: "Total Tree",
      lbl: "Donar Donate Total Tree",
      num: totalTrees, // Replace with actual member count if available
      bar: "100%",
      barBg: "linear-gradient(90deg,#1d4ed8,#3b82f6)",
    },
    {
      badge: "ud-scb-green",
      icon: "🌳",
      color: "#1a5c30",
      label: "Total Amount",
      lbl: "Donar Donate Total Amount",
      num: totalAmount, // Replace with actual assigned trees if available
      bar: "100%",
      barBg: "linear-gradient(90deg,#1a5c30,#4a7c59)",
    },
    {
      badge: "ud-scb-gold",
      icon: "🌱",
      color: "#8a5c0a",
      label: "Planted Tree",
      lbl: "Donar Donate Planted Trees",
      num: totalPlanted,
      bar: `${pct(totalPlanted, totalTrees)}%`,
      barBg: "linear-gradient(90deg,#ca8a04,#eab308)",
    },
  ];

  // Calculate completion percentage for banner
  const completionPct = pct(totalPlanted, totalTrees);

  return (
    <div className="ud-wrap">
      <div className="ud-banner" style={{ marginBottom: 22 }}>
        <div>
          <div className="ud-banner-name">Donor Dashboard</div>
          <div className="ud-banner-loc">
            🌱 {totalTrees} trees donated &nbsp;·&nbsp; {completionPct}% planted
          </div>
        </div>
        <button
          className="ud-banner-badge"
          style={{
            cursor: "pointer",
            border: "none",
            background: "rgba(255,255,255,0.18)",
          }}
          onClick={() => navigate("/donate-tree")}
        >
          + Donate Tree
        </button>
      </div>
      <div className="ud-divider" />
      {/* Stat Cards */}
      <div className="row g-3 mb-2">
        {statCards.map((s, i) => (
          <div key={i} className="col-md-4 col-12">
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

      {/* My Trees Section */}
      {Array.isArray(myTrees) && myTrees.length > 0 && (
        <>
          <div
            className="ud-sec-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="ud-sec-title">
              <div className="ud-sec-icon">🌳</div>
              My Trees (Top 3)
            </div>
            {!showAllTrees && myTrees.length > 3 && (
              <button
                class="btn btn-primary user-filter-btn common-index-font14"
                onClick={() => setShowAllTrees(true)}
              >
                View All
              </button>
            )}
            {showAllTrees && (
              <button
                class="btn btn-primary user-filter-btn common-index-font14"
                onClick={() => setShowAllTrees(false)}
              >
                Show Top 3
              </button>
            )}
          </div>
          <div className="row g-3 mb-2">
            {(showAllTrees ? myTrees : myTrees.slice(0, 3)).map((tree, ti) => {
              const { cls, label, imgCls } = getHealthConfig(tree.healthStatus);
              const treeName =
                tree.assign?.treeName?.name || tree.treeName || "—";
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
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = treeDefaultImg;
                          }}
                        />
                      ) : (
                        <img
                          src={treeDefaultImg}
                          alt={treeName}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <div className={`ud-htag ${cls}`}>{label}</div>
                    </div>
                    <div className="ud-tree-body">
                      <div className="ud-tree-name common-index-font14">
                        {treeName}
                      </div>
                      <div className="ud-tree-meta common-index-font14">
                        <div className="ud-tm-row">
                          Planted:&nbsp;
                          {tree.plantationDate
                            ? new Date(tree.plantationDate).toLocaleDateString(
                                "en-IN",
                              )
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
        </>
      )}
      <div className="ud-divider" />

      {/* Donation Activity */}
      <div className="ud-sec-header">
        <div className="ud-sec-title">
          <div className="ud-sec-icon">📈</div>
          Donation Activity
        </div>
      </div>
      <div className="row g-3 mb-2">
        <div className="col-12">
          {Array.isArray(donationActivity) && donationActivity.length > 0 ? (
            <div className="ud-chart-card">
              <div className="ud-chart-body" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={donationActivity}
                    margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" style={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} style={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "#e2ebe2" }} />
                    <Bar dataKey="value" fill="#064f21" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="ud-alert-empty">No donation activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard;

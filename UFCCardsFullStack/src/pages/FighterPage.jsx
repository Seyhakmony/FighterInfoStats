import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowLeft, Users, Trophy, Target, Shield, Zap } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { getDetailedStats, chartColors } from "../components/FighterData";

const FighterPage = ({ allFighters }) => {
  const navigate = useNavigate();

  const findFighterBySlug = (slug) => {
    return allFighters.find((fighter) => {
      const fighterSlug = fighter.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return fighterSlug === slug;
    });
  };
  const { fighterSlug } = useParams();

  const fighter = findFighterBySlug(fighterSlug);

  const overallChartData = [
    { category: "Striking", value: fighter.striking, fullMark: 100 },
    { category: "Wrestling", value: fighter.wrestling, fullMark: 100 },
    { category: "Grappling", value: fighter.grappling, fullMark: 100 },
    { category: "Defense", value: fighter.defense, fullMark: 100 },
    { category: "Finishing", value: fighter.finishing, fullMark: 100 },
  ];

  // Get detailed stats from fighter data
  const detailedStats = getDetailedStats(fighter);

  const createDetailChart = (stats, color) => {
    return stats.map((stat) => ({
      metric: stat.metric,
      value: stat.value,
      fullMark: 100,
    }));
  };
  if (!fighter) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥊</div>
          <div className="text-xl mb-2">Fighter Not Found</div>
          <div className="text-slate-400 text-sm mb-4">
            The fighter you're looking for doesn't exist.
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            Back to Fighters
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Fighter Profile Header */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <img
              src={fighter.image}
              alt={fighter.name}
              className="w-48 h-80 sm:w-56 sm:h-96 lg:w-60 lg:h-[28rem] object-cover object-top rounded-lg mb-4 mx-auto bg-gray-600"

            />
            {/* Fighter Info */}

            <div className="flex-1">
              <div className="flex flex-col mb-4">
                <h1 className="text-4xl font-bold">{fighter.name}</h1>
                <span className="text-2xl text-slate-400">
                  {fighter.nickname}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-slate-400 text-sm">Weight Class</div>
                  <div className="text-white font-semibold">
                    {String(fighter.divisions)
                      .replace(/[\[\]'"]+/g, "")
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Stance</div>
                  <div className="text-white font-semibold">
                    {fighter.stance}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Record</div>
                  <div className="text-white font-semibold">
                    {fighter.record}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">UFC Record</div>
                  <div className="text-white font-semibold">
                    {fighter.ufcrecord}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Title Wins</div>
                  <div className="text-white font-semibold">
                    {Number(fighter.div_rank_career) === 0
                      ? fighter.titlefights_wins
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">
                    Career Pound for Pound Rank:
                  </div>
                  <div className="text-white font-semibold">
                    #{fighter.pfp_rank_career}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">
                    Career Divsion Rank:
                  </div>
                  <div className="text-white font-semibold">
                    {Number(fighter.div_rank_career) === 0
                      ? "UFC Champion"
                      : fighter.div_rank_career ?? "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">
                    All time Divsion Rank:
                  </div>
                  <div className="text-white font-semibold">
                    #{fighter.rank}
                    {/* {console.log(fighter.rank)} */}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">
                    Highest Divisional Rank
                  </div>
                  <div className="text-white font-semibold">
                    {Number(fighter.div_rank_career) === 0
                      ? "UFC Champion"
                      : fighter.div_rank ?? "Unranked"}
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm mb-2">
                  Overall Rating
                </div>
                <div className="text-4xl font-bold text-white">
                  {fighter.overall}
                </div>
              </div>
            </div>

            {/* Overall Combat Chart */}
            <div className="lg:w-96">
              <h3 className="text-xl font-bold mb-4 text-center">
                Overall Combat Profile
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={overallChartData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#6B7280" }}
                    />
                    <Radar
                      name="Stats"
                      dataKey="value"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Individual Stat Values */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {overallChartData.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400">
                      {stat.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(detailedStats).map(([category, stats]) => (
            <div key={category} className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                {category === "striking" && (
                  <Zap className="text-red-500" size={20} />
                )}
                {category === "wrestling" && (
                  <Users className="text-blue-500" size={20} />
                )}
                {category === "grappling" && (
                  <Target className="text-purple-500" size={20} />
                )}
                {category === "defense" && (
                  <Shield className="text-green-500" size={20} />
                )}
                {category === "finishing" && (
                  <Trophy className="text-yellow-500" size={20} />
                )}
                <h3 className="text-xl font-bold capitalize">
                  {category} Analysis
                </h3>
              </div>

              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={createDetailChart(stats, chartColors[category])}
                  >
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 8, fill: "#6B7280" }}
                    />
                    <Radar
                      name={category}
                      dataKey="value"
                      stroke={chartColors[category]}
                      fill={chartColors[category]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-2">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-slate-300 text-sm">
                      {stat.metric}
                    </span>
                    <span className="text-white font-semibold">
                      {stat.value}
                      {stat.metric.includes("Accuracy") ||
                      stat.metric.includes("Defense") ||
                      stat.metric.includes("Resistance")
                        ? "%"
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FighterPage;

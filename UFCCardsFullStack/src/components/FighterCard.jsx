import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const FighterCard = ({ fighter, onClick, showChart = false, selectedWeightClass }) => {
  const [isHovered, setIsHovered] = useState(false);

  const overallChartData = [
    { category: "Striking", value: fighter.striking, fullMark: 100 },
    { category: "Wrestling", value: fighter.wrestling, fullMark: 100 },
    { category: "Grappling", value: fighter.grappling, fullMark: 100 },
    { category: "Defense", value: fighter.defense, fullMark: 100 },
    { category: "Finishing", value: fighter.finishing, fullMark: 100 },
  ];

  return (
    <div
      className="relative bg-slate-800 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-700 cursor-pointer"
      onClick={() => onClick(fighter)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fighter Image */}
      <div className="relative h-48 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center overflow-hidden">
        <div className="text-white text-6xl font-bold opacity-20">UFC</div>
        <img
          src={fighter.image}
          alt={fighter.name}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Fighter Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              fighter.weight_class === "heavyweight"
                ? "bg-red-500 text-white"
                : fighter.weight_class === "light heavyweight"
                ? "bg-orange-500 text-white"
                : fighter.weight_class === "middleweight"
                ? "bg-yellow-500 text-black"
                : fighter.weight_class === "welterweight"
                ? "bg-green-500 text-white"
                : fighter.weight_class === "lightweight"
                ? "bg-blue-500 text-white"
                : fighter.weight_class === "featherweight"
                ? "bg-indigo-500 text-white"
                : fighter.weight_class === "bantamweight"
                ? "bg-purple-500 text-white"
                : fighter.weight_class === "flyweight"
                ? "bg-pink-500 text-white"
                : // womens
                fighter.weight_class === "women's featherweight"
                ? "bg-fuchsia-500 text-white"
                : fighter.weight_class === "women's bantamweight"
                ? "bg-rose-500 text-white"
                : fighter.weight_class === "women's flyweight"
                ? "bg-teal-500 text-white"
                : fighter.weight_class === "women's strawweight"
                ? "bg-cyan-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {fighter.weight_class
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>

          <span className="text-slate-400 text-sm">
            #
            {selectedWeightClass === "Pound for Pound"
              ? fighter.pfprank
              : fighter.rank}
          </span>
        </div>

        <h3 className="text-white text-xl font-bold mb-1">{fighter.name}</h3>
        <p className="text-slate-400 text-sm mb-2">"{fighter.nickname}"</p>
        <p className="text-slate-300 text-sm">{fighter.record}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-slate-400 text-xs">Overall Rating</div>
          <div className="text-2xl font-bold text-white">{fighter.overall}</div>
        </div>
      </div>

      {/* Hover Chart Overlay */}
      {isHovered && (
        <div className="absolute inset-0 w-full h-full bg-slate-900 bg-opacity-95 flex items-center justify-center transition-all duration-300 cursor-pointer">
          <div className="w-full h-full p-2">
            <h4 className="text-white text-center mb-2 font-semibold">
              {fighter.name} Stats
            </h4>
            <ResponsiveContainer width="100%" height="70%">
              <RadarChart data={overallChartData} margin={{right: 37, left: 37}}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 8, fill: "#6B7280" }}
                />
                <Radar
                  name="Stats"
                  dataKey="value"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FighterCard;

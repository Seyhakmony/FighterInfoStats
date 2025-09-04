import Papa from "papaparse";

// Weight classes remain the same
export const weightClasses = [
  "Pound for Pound",
  "heavyweight",
  "light heavyweight",
  "middleweight",
  "welterweight",
  "lightweight",
  "featherweight",
  "bantamweight",
  "flyweight",
  "women's flyweight",
  "women's bantamweight",
  "women's featherweight",
  "women's strawweight",
];

// Chart colors remain the same
export const chartColors = {
  striking: "#ef4444",
  wrestling: "#3b82f6",
  grappling: "#8b5cf6",
  defense: "#10b981",
  finishing: "#f59e0b",
};

// Function to load and parse CSV data
export const loadFighterData = async () => {
  try {
    const response = await fetch("/csv_files/fighters.csv");
    const csvData = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [",", "\t", "|", ";"],
        complete: (results) => {
          console.log(results);
          if (results.errors.length > 0) {
            console.warn("CSV parsing errors:", results.errors);
          }

          // Transform CSV data to match our fighter structure
          const transformedData = results.data.map((row, index) => {
            // Clean headers by removing whitespace
            const cleanRow = {};
            Object.keys(row).forEach((key) => {
              const cleanKey = key.trim();
              cleanRow[cleanKey] = row[key];
            });
            return {
              name: cleanRow.name || `Fighter ${index + 1}`,
              nickname: cleanRow.nickname || "",
              stance: cleanRow.stance || "Orthodox",
              overall: cleanRow.overall,
              pfprank: cleanRow.pfprank || index + 1,
              rank: cleanRow.rank || index + 1,
              
              pfp_rank_career: cleanRow.pfp_rank || null,
              div_rank_career: cleanRow.div_rank || null,
              titlefights_wins: cleanRow.Titlefighs_wins || 0,
              divisions: cleanRow.divisions || "",
              weight_class: cleanRow.maindiv || "Unknown",
              record: `${cleanRow.wins || 0}-${cleanRow.losses || 0}-${
                cleanRow.draws || 0
              }`,
              ufcrecord:
                `${parseInt(cleanRow.ufcwins) || 0}-${
                  parseInt(cleanRow.ufclosses) || 0
                }-${parseInt(cleanRow.ufcdraws) || 0}${
                  cleanRow.ufcnocon ? `-${parseInt(cleanRow.ufcnocon)} NC` : ""
                }` || 0,
              striking: Math.round(cleanRow.striking || 75),
              wrestling: Math.round(cleanRow.wrestling || 75),
              grappling: Math.round(cleanRow.grappling || 75),
              defense: Math.round(cleanRow.defense || 75),
              career_score: cleanRow.career_score || 0,
              finishing: Math.round(cleanRow.finishing || 75),
              dominance: Math.round(cleanRow.dominance || 75),
              dob: cleanRow.dob || null,
              image: cleanRow.image_url,

              // Detailed stats from CSV
              striking_details: {
                splm: cleanRow.strikes_landed_permin || 0,
                stracc: cleanRow.striking_acc || 0,
                kd: cleanRow.kd_permin || 0,
                sigatt: cleanRow.sigstrikes_attempted || 0,
              },
              wrestling_details: {
                tdl: cleanRow.takedown_landed || 0,
                tdavg: cleanRow.takedown_acc || 0,
                ctrl: cleanRow.control_time || 0,
                tatt: cleanRow.takedown_attempted || 0,
              },
              grappling_details: {
                tsub: cleanRow.total_sub || 0,
                subavg: cleanRow.sub_avg15 || 0,
                subatt: cleanRow.sub_attempted || 0,
                sublosses: cleanRow.sub_resistance || 0,
              },
              defense_details: {
                strdef: cleanRow.striking_def || 0,
                dur: cleanRow.durability || 0,
                takdef: cleanRow.takedown_def || 0,
                strabs: cleanRow.strabsorbpm || 0,
              },
            };
          });

          const validFighters = transformedData
            .filter((fighter) => fighter.name && fighter.name !== "")
            .sort((a, b) => (a.rank || 999) - (b.rank || 999));

          resolve(validFighters);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error loading CSV file:", error);
    return getFallbackData();
  }
};

export const getDetailedStats = (fighter) => {
  return {
    striking: [
      {
        metric: "Strikes/Min",
        value: fighter.striking_details?.splm || 0,
        max: 10,
      },
      {
        metric: "Accuracy",
        value: fighter.striking_details?.stracc || 0,
        max: 100,
      },
      {
        metric: "Knockdowns/Min",
        value: fighter.striking_details?.kd || 0,
        max: 25,
      },
      {
        metric: "Sig Attempts",
        value: fighter.striking_details?.sigatt || 0,
        max: 100,
      },
    ],
    wrestling: [
      {
        metric: "TD Landed",
        value: fighter.wrestling_details?.tdl || 0,
        max: 5,
      },
      {
        metric: "TD Accuracy",
        value: fighter.wrestling_details?.tdavg || 0,
        max: 100,
      },
      {
        metric: "Control Time",
        value: fighter.wrestling_details?.ctrl || 0,
        max: 10,
      },
      {
        metric: "TD Attempts",
        value: fighter.wrestling_details?.tatt || 0,
        max: 100,
      },
    ],
    grappling: [
      {
        metric: "Total Subs",
        value: fighter.grappling_details?.tsub || 0,
        max: 15,
      },
      {
        metric: "Sub Average",
        value: fighter.grappling_details?.subavg || 0,
        max: 3,
      },
      {
        metric: "Sub Attempts",
        value: fighter.grappling_details?.subatt || 0,
        max: 25,
      },
      {
        metric: "Sub Resistance",
        value: fighter.grappling_details?.sublosses || 0,
        max: 100,
      },
    ],
    defense: [
      {
        metric: "Strike Defense",
        value: fighter.defense_details?.strdef || 0,
        max: 100,
      },
      {
        metric: "Durability",
        value: fighter.defense_details?.dur || 0,
        max: 100,
      },
      {
        metric: "TD Defense",
        value: fighter.defense_details?.takdef || 0,
        max: 100,
      },
      {
        metric: "Strike Absorb",
        value: fighter.defense_details?.strabs || 0,
        max: 100,
      },
    ],
    finishing: [
      { metric: "KO Power", value: fighter.finishing || 0, max: 100 },
      {
        metric: "Sub Threat",
        value: Math.round((fighter.grappling || 0) * 0.8),
        max: 100,
      },
      { metric: "Dominance", value: fighter.dominance || 0, max: 100 },
      {
        metric: "Finish Rate",
        value: Math.round((fighter.finishing || 0) * 0.9),
        max: 100,
      },
    ],
  };
};

export default {
  loadFighterData,
  weightClasses,
  chartColors,
  getDetailedStats,
};

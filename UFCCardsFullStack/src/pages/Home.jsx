import React, { useState, useEffect } from "react";
import { Search, Filter, Loader } from "lucide-react";
import FighterCard from "../components/FighterCard";
import { weightClasses } from "../components/FighterData";
import { useNavigate } from "react-router-dom";

const Home = ({
  filteredFighters,
  searchTerm,
  setSearchTerm,
  selectedWeightClass,
  setSelectedWeightClass,
  onFighterClick,
}) => {
  const navigate = useNavigate();
  const [displayCount, setDisplayCount] = useState(25);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isSearching = searchTerm.trim() !== "";
  const displayedFighters = isSearching
    ? filteredFighters
    : filteredFighters.slice(0, displayCount);

  const hasMoreToLoad = !isSearching && filteredFighters.length > displayCount;

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      if (isSearching || isLoadingMore || !hasMoreToLoad) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when within 200px of bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        setIsLoadingMore(true);

        // Simulate brief loading delay for better UX
        setTimeout(() => {
          setDisplayCount((prev) => prev + 25);
          setIsLoadingMore(false);
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearching, isLoadingMore, hasMoreToLoad]);

  useEffect(() => {
    setDisplayCount(25);
  }, [searchTerm, selectedWeightClass]);

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleFighterClick = (fighter) => {
    const slug = createSlug(fighter.name);
    navigate(`/${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div
  className="relative bg-[url('images//ufcbackground.webp')] bg-cover bg-center bg-no-repeat overflow-hidden"
>
  {/* dark overlay to keep text readable */}
  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/70 to-slate-900/90"></div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
    <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-white">
      Welcome my analysis on UFC
      <br />
      Fighter Collection
    </h1>
    <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
      Step into the world of UFC like never before. Here, every fighter is
      represented through a detailed stat card that goes beyond wins and
      losses. Explore average performance metrics matched against their
      division rivals, uncovering how each fighter stacks up in striking,
      grappling, and endurance.
    </p>
    <p className="text-red-400 text-lg sm:text-xl font-semibold mb-8">
      Discover the data behind your favorite fighter
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-slate-300">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
        Combat Records & Statistics
      </div>
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
        Performance Analytics
      </div>
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
        Career Highlights
      </div>
    </div>
  </div>
</div>


      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">
            {isSearching ? "Search UFC Fighters" : "UFC Fighter Collection"}
          </h1>
          <p className="text-slate-400 text-center mb-6 sm:mb-8 text-sm sm:text-base">
            {isSearching
              ? "Find and explore fighter profiles and combat statistics"
              : "Browse and explore UFC's elite fighters - click any card to view detailed combat stats"}
          </p>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="relative w-full sm:flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for fighters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <select
                value={selectedWeightClass}
                onChange={(e) => setSelectedWeightClass(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-8 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {weightClasses.map((weightClass) => (
                  <option key={weightClass} value={weightClass}>
                    {weightClass
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fighters Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">
            {isSearching ? "Search Results" : "Top Fighters"}
          </h2>
          <span className="text-slate-400 text-sm sm:text-base">
            {displayedFighters.length} fighters{" "}
            {isSearching ? "found" : "shown"}
            {!isSearching &&
              filteredFighters.length > displayedFighters.length &&
              ` of ${filteredFighters.length}`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {displayedFighters.map((fighter) => (
            <FighterCard
              key={fighter.name}
              fighter={fighter}
              onClick={handleFighterClick}
              selectedWeightClass={selectedWeightClass}
            />
          ))}
        </div>

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-8 cursor-pointer">
            <Loader className="animate-spin text-red-500 mr-2" size={20} />
            <span className="text-slate-400">Loading more fighters...</span>
          </div>
        )}

        {/* No Results Message */}
        {filteredFighters.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg">
              No fighters found matching your criteria
            </div>
            <div className="text-slate-500 text-sm mt-2">
              Try adjusting your search terms or weight class filter
            </div>
          </div>
        )}

        {/* End of Results Message */}
        {!isSearching && !hasMoreToLoad && filteredFighters.length > 25 && (
          <div className="text-center mt-8">
            <p className="text-slate-400 text-sm">
              All {filteredFighters.length} fighters loaded
            </p>
          </div>
        )}

        {/* Scroll Hint */}
        {!isSearching && hasMoreToLoad && !isLoadingMore && (
          <div className="text-center mt-8">
            <p className="text-slate-400 text-sm">
              Scroll down to load more fighters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

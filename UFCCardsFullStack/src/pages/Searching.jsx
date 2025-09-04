import React from 'react';
import { Search, Filter } from 'lucide-react';
import FighterCard from '../components/FighterCard';
import { weightClasses } from '../components/FighterData';

const SearchPage = ({ 
  filteredFighters, 
  searchTerm, 
  setSearchTerm, 
  selectedWeightClass, 
  setSelectedWeightClass, 
  onFighterClick 
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-center mb-2">Search UFC Fighters</h1>
          <p className="text-slate-400 text-center mb-8">Find and explore fighter profiles and combat statistics</p>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search for fighters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <select
                value={selectedWeightClass}
                onChange={(e) => setSelectedWeightClass(e.target.value)}
                className="pl-10 pr-8 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {weightClasses.map(weightClass => (
                  <option key={weightClass} value={weightClass}>{weightClass}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Search Results</h2>
          <span className="text-slate-400">{filteredFighters.length} fighters found</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFighters.map((fighter) => (
            <FighterCard
              key={fighter.name}
              fighter={fighter}
              onClick={onFighterClick}
            />
          ))}
        </div>

        {filteredFighters.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg">No fighters found matching your criteria</div>
            <div className="text-slate-500 text-sm mt-2">Try adjusting your search terms or weight class filter</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
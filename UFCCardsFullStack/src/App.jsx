import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import FighterPage from './pages/FighterPage';
import { loadFighterData } from './components/FighterData';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedFighter, setSelectedFighter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeightClass, setSelectedWeightClass] = useState('Pound for Pound');
  const [filteredFighters, setFilteredFighters] = useState([]);
  const [allFighters, setAllFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load fighter data from CSV on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadFighterData();
        setAllFighters(data);
        setFilteredFighters(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load fighter data:', err);
        setError('Failed to load fighter data. Please make sure fighters.csv is available.');
        setAllFighters([]);
        setFilteredFighters([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  
  useEffect(() => {
    let filtered = allFighters;
    
    // console.log('Filtering fighters:', {
    //   searchTerm,
    //   selectedWeightClass,
    //   allFightersCount: allFighters.length,
    //   sampleFighter: allFighters[0]
    // });
    
    if (searchTerm) {
      filtered = filtered.filter(fighter => {
        const name = String(fighter?.name || '').toLowerCase();
        const nickname = String(fighter?.nickname || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return name.includes(searchLower) || nickname.includes(searchLower);
      });
      // console.log('After search filter:', filtered.length);
    }
    
    if (selectedWeightClass !== 'Pound for Pound') {
      filtered = filtered.filter(fighter => fighter?.weight_class === selectedWeightClass);
      // console.log('Divisions:', filtered.length);
    }
    
    // console.log('Final filtered count:', filtered.length);
    setFilteredFighters(filtered);
  }, [searchTerm, selectedWeightClass, allFighters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Fighter Data...</div>
          <div className="text-slate-400 text-sm mt-2">Reading fighters.csv</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl mb-2">Error Loading Data</div>
          <div className="text-slate-400 text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
  <Routes>
    <Route 
      path="/" 
      element={
        <Home
          filteredFighters={filteredFighters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedWeightClass={selectedWeightClass}
          setSelectedWeightClass={setSelectedWeightClass}
          allFighters={allFighters}
        />
      } 
    />
    <Route 
      path="/:fighterSlug" 
      element={<FighterPage allFighters={allFighters} />} 
    />
  </Routes>
);
};

export default App;
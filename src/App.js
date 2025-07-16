import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Sparkles } from 'lucide-react';

// Load handwritten font
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');
`;

const MashLegends = () => {
  const [gameState, setGameState] = useState('setup'); // setup, spiral, counting, results
  const [categories, setCategories] = useState({
    home: ['Mansion', 'Apartment', 'Suburbs', 'House'],
    spouse: ['', '', '', ''],
    job: ['', '', '', ''],
    kids: ['0', '1', '2', '3+']
  });
  const [spiralCount, setSpiralCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eliminationNumber, setEliminationNumber] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allItems, setAllItems] = useState([]);
  const [eliminatedItems, setEliminatedItems] = useState(new Set());
  const [results, setResults] = useState({});
  const [animationPhase, setAnimationPhase] = useState('');

  const categoryLabels = {
    home: 'WHERE YOU\'LL LIVE',
    spouse: 'WHO YOU\'LL MARRY',
    job: 'YOUR CAREER',
    kids: 'NUMBER OF KIDS'
  };

  const updateCategory = (category, index, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => i === index ? value : item)
    }));
  };

  const startSpiral = () => {
    setGameState('spiral');
    setIsDrawing(true);
    setSpiralCount(0);
    
    // Auto-increment spiral count while drawing
    const interval = setInterval(() => {
      setSpiralCount(prev => prev + 1);
    }, 150);
    
    // Store interval ID to clear it later
    window.spiralInterval = interval;
  };

  const stopSpiral = () => {
    if (window.spiralInterval) {
      clearInterval(window.spiralInterval);
    }
    setIsDrawing(false);
    
    // Calculate elimination number (3-8 range for good gameplay)
    const finalCount = Math.max(3, Math.min(8, spiralCount));
    setEliminationNumber(finalCount);
    
    // Prepare items for elimination
    const items = [];
    items.push(...'MASH'.split(''));
    Object.entries(categories).forEach(([category, values]) => {
      values.forEach((value, index) => {
        if (value.trim()) {
          items.push({ category, value, index });
        }
      });
    });
    
    setAllItems(items);
    setCurrentIndex(0);
    setEliminatedItems(new Set());
    
    setTimeout(() => {
      setGameState('counting');
      startElimination(items, finalCount);
    }, 1000);
  };

  const startElimination = (items, elimNum) => {
    let currentIdx = 0;
    let eliminated = new Set();
    let activeItems = [...items];
    
    const eliminateStep = () => {
      if (activeItems.length <= 4) {
        // Keep one from each category
        const finalResults = {};
        const mashResult = activeItems.find(item => typeof item === 'string');
        if (mashResult) finalResults.home = mashResult === 'M' ? 'Mansion' : 
                                                   mashResult === 'A' ? 'Apartment' : 
                                                   mashResult === 'S' ? 'Suburbs' : 'House';
        
        Object.entries(categories).forEach(([category, values]) => {
          const remaining = activeItems.find(item => 
            typeof item === 'object' && item.category === category
          );
          if (remaining) {
            finalResults[category] = remaining.value;
          }
        });
        
        setResults(finalResults);
        setGameState('results');
        return;
      }
      
      // Count and eliminate
      let count = 0;
      while (count < elimNum) {
        currentIdx = (currentIdx + 1) % activeItems.length;
        count++;
      }
      
      const toEliminate = activeItems[currentIdx];
      eliminated.add(toEliminate);
      activeItems.splice(currentIdx, 1);
      
      if (currentIdx >= activeItems.length) {
        currentIdx = 0;
      }
      
      setEliminatedItems(new Set(eliminated));
      setCurrentIndex(currentIdx);
      
      setTimeout(eliminateStep, 800);
    };
    
    setTimeout(eliminateStep, 1000);
  };

  const resetGame = () => {
    setGameState('setup');
    setCategories({
      home: ['Mansion', 'Apartment', 'Suburbs', 'House'],
      spouse: ['', '', '', ''],
      job: ['', '', '', ''],
      kids: ['0', '1', '2', '3+']
    });
    setSpiralCount(0);
    setIsDrawing(false);
    setEliminationNumber(0);
    setResults({});
    setEliminatedItems(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-50 p-4" style={{fontFamily: 'Kalam, cursive'}}>
      <style>{fontStyle}</style>
      {/* Retro Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 24px,
            #8b5cf6 24px,
            #8b5cf6 25px
          )`
        }} />
      </div>
      
      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 text-transparent bg-clip-text">
            <h1 className="text-6xl font-bold mb-2 tracking-wider">
              ⚡ MASH ⚡
            </h1>
            <div className="text-xl font-semibold tracking-widest">
              LEGENDS
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            ~ 1980s CLASSIC MODE ~
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-lg shadow-2xl p-8 border-4 border-purple-200 relative overflow-hidden">
          {/* Notebook Lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full" style={{
              backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 29px,
                #e5e7eb 29px,
                #e5e7eb 30px
              )`
            }} />
            <div className="absolute left-12 top-0 w-0.5 h-full bg-red-300" />
          </div>

          {gameState === 'setup' && (
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-lg">
                  <Sparkles className="w-5 h-5" />
                  SET UP YOUR FUTURE
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(categories).map(([category, values]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-bold text-purple-700 tracking-wide border-b-2 border-purple-200 pb-2">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-2">
                      {values.map((value, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateCategory(category, index, e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none"
                            placeholder={category === 'home' ? 'Already set!' : 'Type your option...'}
                            disabled={category === 'home'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={startSpiral}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg tracking-wide"
                >
                  <Play className="w-6 h-6 inline mr-2" />
                  START THE SPIRAL!
                </button>
              </div>
            </div>
          )}

          {gameState === 'spiral' && (
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-purple-700 mb-4">
                  🌀 DRAWING THE SPIRAL OF FATE 🌀
                </h2>
                <p className="text-lg text-gray-600">
                  Click STOP when you feel the moment is right...
                </p>
              </div>

              <div className="mb-8">
                <div className="inline-block bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full p-8 animate-spin">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <div className="text-4xl font-bold text-purple-600">
                      {spiralCount}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={stopSpiral}
                disabled={spiralCount < 10}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg tracking-wide disabled:opacity-50"
              >
                <Square className="w-6 h-6 inline mr-2" />
                STOP!
              </button>
            </div>
          )}

          {gameState === 'counting' && (
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-purple-700 mb-4">
                  ⚡ ELIMINATION IN PROGRESS ⚡
                </h2>
                <p className="text-lg text-gray-600">
                  Counting every {eliminationNumber} items...
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                {allItems.map((item, index) => {
                  const isEliminated = eliminatedItems.has(item);
                  const isCurrent = index === currentIndex;
                  const displayText = typeof item === 'string' ? item : item.value;
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 font-bold transition-all duration-300 ${
                        isEliminated 
                          ? 'bg-red-100 border-red-300 text-red-600 line-through opacity-50' 
                          : isCurrent
                          ? 'bg-yellow-200 border-yellow-400 text-yellow-800 animate-pulse'
                          : 'bg-purple-100 border-purple-300 text-purple-700'
                      }`}
                    >
                      {displayText}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {gameState === 'results' && (
            <div className="relative z-10 text-center">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-purple-700 mb-4">
                  🎉 YOUR DESTINY REVEALED! 🎉
                </h2>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 max-w-2xl mx-auto border-4 border-purple-300">
                <div className="space-y-6">
                  {Object.entries(results).map(([category, value]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
                      <span className="font-bold text-purple-700 uppercase tracking-wide">
                        {categoryLabels[category] || category}:
                      </span>
                      <span className="text-xl font-bold text-pink-600">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg tracking-wide"
                >
                  <RotateCcw className="w-6 h-6 inline mr-2" />
                  PLAY AGAIN!
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <span>📼</span>
            <span>Powered by 1980s nostalgia</span>
            <span>👟</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MashLegends;

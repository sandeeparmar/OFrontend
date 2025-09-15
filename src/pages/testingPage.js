import React, { useState, useEffect, useRef } from 'react';
import { Globe, Thermometer, Waves, Info, Play, Pause, Settings, Eye, Zap, Target } from 'lucide-react';

const OceanTemperatureVisualization = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [viewMode, setViewMode] = useState('temperature'); // temperature, depth, combined
  const [showControls, setShowControls] = useState(false);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [temperatureFilter, setTemperatureFilter] = useState({ min: -5, max: 35 });
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    fetchOceanData();
  }, []);

  const fetchOceanData = async () => {
    try {
      setLoading(true);
      // Simulating API call - in real scenario you'd fetch from actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
      createSampleData();
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch ocean temperature data: ${err.message}`);
      createSampleData();
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = () => {
    const sampleData = [];
    for (let lat = -60; lat <= 60; lat += 2.5) {
      for (let lon = -180; lon < 180; lon += 2.5) {
        // More realistic ocean temperature simulation
        const baseTemp = 25 - Math.abs(lat) * 0.4; // Warmer at equator
        const gulfStreamEffect = Math.exp(-Math.pow((lat - 40) / 10, 2)) * Math.exp(-Math.pow((lon + 60) / 20, 2)) * 8;
        const currentEffect = Math.sin(lon * 0.02) * Math.cos(lat * 0.02) * 4;
        const seasonalVariation = Math.sin(Date.now() * 0.001 + lon * 0.01) * 2;
        
        const temp = baseTemp + gulfStreamEffect + currentEffect + seasonalVariation + Math.random() * 3 - 1.5;
        const depth = Math.random() * 2000 + 100; // 100m to 2100m
        
        sampleData.push({
          lat,
          lon,
          temp: Math.max(-2, Math.min(35, temp)),
          depth: depth,
          salinity: 34 + Math.random() * 2, // Typical ocean salinity
          current: Math.random() * 2 // Current speed
        });
      }
    }
    setData(sampleData);
  };

  useEffect(() => {
    if (data && canvasRef.current) {
      drawVisualization();
    }
  }, [data, currentFrame, viewMode, temperatureFilter]);

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with new dark background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#2C3E50');
    gradient.addColorStop(0.5, '#536976');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Filter data based on temperature range
    const filteredData = data.filter(point => 
      point.temp >= temperatureFilter.min && point.temp <= temperatureFilter.max
    );

    filteredData.forEach((point, index) => {
      if (index % 8 !== currentFrame % 8 && isAnimating) return; // Smoother animation

      const x = ((point.lon + 180) / 360) * width;
      const y = ((90 - point.lat) / 180) * height;
      
      let color, size;
      
      switch(viewMode) {
        case 'temperature':
          color = getTemperatureColor(point.temp);
          size = Math.max(1.5, Math.abs(point.temp - 15) / 4);
          break;
        case 'depth':
          color = getDepthColor(point.depth);
          size = Math.max(1, point.depth / 400);
          break;
        case 'combined':
          color = getCombinedColor(point.temp, point.depth);
          size = Math.max(1.5, (Math.abs(point.temp - 15) + point.depth / 200) / 6);
          break;
        default:
          color = getTemperatureColor(point.temp);
          size = 2;
      }
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      
      // Draw main point
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add pulsing effect for extreme temperatures
      if (Math.abs(point.temp - 15) > 12) {
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(currentFrame * 0.3);
        ctx.beginPath();
        ctx.arc(x, y, size * 1.8, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Interactive hover effect
      if (hoverPoint && Math.abs(hoverPoint.x - x) < 20 && Math.abs(hoverPoint.y - y) < 20) {
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;
    
    // Enhanced grid with better visibility
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 0.5;
    
    // Latitude lines with labels
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Add coordinate labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '12px Arial';
      ctx.fillText(`${lat}°`, 10, y - 5);
    }
    
    // Longitude lines with labels
    for (let lon = -180; lon <= 180; lon += 60) {
      const x = ((lon + 180) / 360) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`${lon}°`, x + 5, height - 10);
    }

    // Add temperature scale legend
    drawLegend(ctx, width, height);
  };

  const drawLegend = (ctx, width, height) => {
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 20;
    const legendY = height - legendHeight - 40;

    // Legend background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(legendX - 10, legendY - 25, legendWidth + 20, legendHeight + 40);

    // Temperature gradient
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(0.25, '#50C878');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(0.75, '#FF8C00');
    gradient.addColorStop(1, '#FF4500');

    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

    // Legend labels
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Temperature Scale', legendX, legendY - 8);
    ctx.fillText('-2°C', legendX - 5, legendY + legendHeight + 15);
    ctx.fillText('35°C', legendX + legendWidth - 20, legendY + legendHeight + 15);
  };

  const getTemperatureColor = (temp) => {
    const normalized = Math.max(0, Math.min(1, (temp + 5) / 40));
    
    if (normalized < 0.2) return `hsl(210, 80%, ${40 + normalized * 40}%)`;
    if (normalized < 0.4) return `hsl(150, 70%, ${50 + normalized * 30}%)`;
    if (normalized < 0.6) return `hsl(50, 90%, ${60 + normalized * 25}%)`;
    if (normalized < 0.8) return `hsl(30, 95%, ${65 + normalized * 20}%)`;
    return `hsl(10, 100%, ${60 + normalized * 20}%)`;
  };

  const getDepthColor = (depth) => {
    const normalized = Math.max(0, Math.min(1, depth / 2000));
    return `hsl(${220 - normalized * 60}, 70%, ${30 + normalized * 50}%)`;
  };

  const getCombinedColor = (temp, depth) => {
    const tempNorm = Math.max(0, Math.min(1, (temp + 5) / 40));
    const depthNorm = Math.max(0, Math.min(1, depth / 2000));
    const hue = 220 - tempNorm * 180 + depthNorm * 30;
    const saturation = 60 + tempNorm * 40;
    const lightness = 40 + tempNorm * 30;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const handleCanvasClick = (event) => {
    if (!data) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const lon = (x / canvas.width) * 360 - 180;
    const lat = 90 - (y / canvas.height) * 180;
    
    // Find nearest data point
    let nearest = null;
    let minDistance = Infinity;
    
    data.forEach(point => {
      const px = ((point.lon + 180) / 360) * canvas.width;
      const py = ((90 - point.lat) / 180) * canvas.height;
      const distance = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });
    
    if (nearest && minDistance < 15) {
      setSelectedPoint({...nearest, clickLat: lat, clickLon: lon});
    } else {
      setSelectedPoint(null);
    }
  };

  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setHoverPoint({x, y});
  };

  const toggleAnimation = () => {
    if (isAnimating) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 100);
      }, 120 - animationSpeed);
    }
  };

  useEffect(() => {
    if (isAnimating && animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 100);
      }, 120 - animationSpeed);
    }
  }, [animationSpeed, isAnimating]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Waves className="w-16 h-16 mx-auto mb-6 animate-bounce" style={{color: '#536976'}} />
          <div className="text-2xl font-bold mb-4" style={{color: '#536976'}}>Loading Ocean Data...</div>
          <div className="text-gray-300">Preparing interactive visualization</div>
          <div className="mt-4 w-48 bg-gray-700 rounded-full h-2 mx-auto">
            <div 
              className="h-2 rounded-full animate-pulse transition-all duration-1000" 
              style={{backgroundColor: '#536976', width: '70%'}}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white overflow-hidden">
      {/* Modern Header */}
      <div className="relative z-10 p-6 bg-black bg-opacity-60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full" style={{backgroundColor: '#536976'}}>
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ocean Explorer
              </h1>
              <p className="text-gray-300 text-sm">Interactive Temperature & Depth Visualization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{backgroundColor: showControls ? '#536976' : 'rgba(83, 105, 118, 0.3)'}}
            >
              <Settings className="w-4 h-4" />
              <span>Controls</span>
            </button>
            
            <button
              onClick={toggleAnimation}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{backgroundColor: isAnimating ? '#FF6B6B' : '#536976'}}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAnimating ? 'Pause' : 'Animate'}</span>
            </button>
            
            <button
              onClick={fetchOceanData}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Controls Panel */}
        {showControls && (
          <div className="mt-6 p-4 bg-black bg-opacity-40 rounded-lg border" style={{borderColor: '#536976'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* View Mode */}
              <div>
                <label className="block text-sm font-medium mb-2">View Mode</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                >
                  <option value="temperature">Temperature</option>
                  <option value="depth">Ocean Depth</option>
                  <option value="combined">Combined View</option>
                </select>
              </div>

              {/* Animation Speed */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Animation Speed: {animationSpeed}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full"
                  style={{accentColor: '#536976'}}
                />
              </div>

              {/* Temperature Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperature Range: {temperatureFilter.min}°C - {temperatureFilter.max}°C
                </label>
                <div className="flex space-x-2">
                  <input
                    type="range"
                    min="-5"
                    max="35"
                    value={temperatureFilter.min}
                    onChange={(e) => setTemperatureFilter(prev => ({...prev, min: Number(e.target.value)}))}
                    className="flex-1"
                    style={{accentColor: '#536976'}}
                  />
                  <input
                    type="range"
                    min="-5"
                    max="35"
                    value={temperatureFilter.max}
                    onChange={(e) => setTemperatureFilter(prev => ({...prev, max: Number(e.target.value)}))}
                    className="flex-1"
                    style={{accentColor: '#536976'}}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('temperature')}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${viewMode === 'temperature' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                style={{backgroundColor: viewMode === 'temperature' ? '#536976' : 'rgba(83, 105, 118, 0.3)'}}
              >
                <Thermometer className="w-4 h-4 inline mr-1" />
                Temperature
              </button>
              <button
                onClick={() => setViewMode('depth')}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${viewMode === 'depth' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                style={{backgroundColor: viewMode === 'depth' ? '#536976' : 'rgba(83, 105, 118, 0.3)'}}
              >
                <Waves className="w-4 h-4 inline mr-1" />
                Depth
              </button>
              <button
                onClick={() => setViewMode('combined')}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${viewMode === 'combined' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                style={{backgroundColor: viewMode === 'combined' ? '#536976' : 'rgba(83, 105, 118, 0.3)'}}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Combined
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Visualization */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          width={window.innerWidth || 1200}
          height={(window.innerHeight || 800) - (showControls ? 300 : 200)}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="w-full cursor-crosshair"
          style={{ imageRendering: 'auto' }}
        />

        {/* Enhanced Info Panel */}
        {selectedPoint && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-90 backdrop-blur-md p-6 rounded-xl border-2 max-w-xs transform transition-all duration-300 scale-100 hover:scale-105" style={{borderColor: '#536976'}}>
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6" style={{color: '#536976'}} />
              <span className="font-bold text-lg">Data Point</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Location:</span>
                <span className="font-mono">{selectedPoint.lat.toFixed(2)}°, {selectedPoint.lon.toFixed(2)}°</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Temperature:</span>
                <span className="font-bold text-xl" style={{color: '#536976'}}>
                  {selectedPoint.temp.toFixed(1)}°C
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Depth:</span>
                <span className="font-semibold">{selectedPoint.depth.toFixed(0)}m</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Salinity:</span>
                <span className="font-semibold">{selectedPoint.salinity?.toFixed(1) || 'N/A'} PSU</span>
              </div>
              
              {/* Temperature category */}
              <div className="mt-4 p-3 rounded-lg" style={{backgroundColor: 'rgba(83, 105, 118, 0.2)'}}>
                <div className="text-sm text-gray-300 mb-1">Classification:</div>
                <div className="font-semibold">
                  {selectedPoint.temp < 5 ? '🧊 Cold Water' : 
                   selectedPoint.temp < 15 ? '🌊 Cool Water' :
                   selectedPoint.temp < 25 ? '🏖️ Warm Water' : '🔥 Hot Water'}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedPoint(null)}
              className="mt-4 w-full py-2 rounded-lg transition-colors duration-300 hover:opacity-80"
              style={{backgroundColor: '#536976'}}
            >
              Close
            </button>
          </div>
        )}

        {/* Interactive Tutorial */}
        {!selectedPoint && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm p-4 rounded-lg border" style={{borderColor: '#536976'}}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5" style={{color: '#536976'}} />
              <span className="font-semibold">Interactive Guide</span>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div>🖱️ Click any point to explore data</div>
              <div>🎛️ Use controls to change view modes</div>
              <div>🎬 Toggle animation for live effect</div>
              <div>🌡️ Adjust temperature filters</div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="absolute bottom-4 left-4 bg-red-900 bg-opacity-90 backdrop-blur-sm p-4 rounded-lg border border-red-500 max-w-md">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-5 h-5 text-red-400" />
              <span className="font-semibold">Demo Mode</span>
            </div>
            <div className="text-sm text-gray-300">
              Using simulated data for demonstration. The visualization shows realistic ocean temperature and depth patterns.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OceanTemperatureVisualization;
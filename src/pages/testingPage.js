import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Thermometer, Waves, Info, Play, Pause, MapPin, Calendar, Database } from 'lucide-react';

const OceanTemperatureVisualization = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [dataInfo, setDataInfo] = useState(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Memoize the fetchOceanData function with useCallback
  const fetchOceanData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://data.scripps.earth/argo/2017/argo-201702-temp-2p5-1p0.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // Check if data has the expected structure
      if (jsonData && jsonData.metadata) {
        setDataInfo(jsonData.metadata);
        setData(jsonData.data || []);
      } else {
        setData(jsonData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch ocean temperature data: ${err.message}`);
      // Create sample data for demonstration
      createSampleData();
    } finally {
      setLoading(false);
    }
  }, []);

  const createSampleData = useCallback(() => {
    // Generate sample ocean temperature data with more realistic structure
    const sampleData = [];
    for (let lat = -60; lat <= 60; lat += 2.5) {
      for (let lon = -180; lon < 180; lon += 2.5) {
        // Simulate ocean temperature based on latitude and some noise
        const baseTemp = 25 - Math.abs(lat) * 0.4; // Warmer at equator
        const noise = (Math.sin(lon * 0.1) + Math.cos(lat * 0.1)) * 3;
        const temp = baseTemp + noise + Math.random() * 2 - 1;
        
        sampleData.push({
          lat,
          lon,
          temperature: Math.max(-2, Math.min(35, temp)), // Ocean temp range
          depth: Math.random() * 1000, // Random depth
          salinity: 35 + (Math.random() * 2 - 1), // Salinity in practical salinity units
          pressure: Math.random() * 100, // Pressure in decibars
          timestamp: new Date(2017, 1, Math.floor(Math.random() * 28) + 1).toISOString(),
          platform: `Argo${Math.floor(Math.random() * 9000) + 1000}`,
          quality: Math.random() > 0.1 ? 'good' : 'questionable'
        });
      }
    }
    
    setDataInfo({
      title: "Sample Ocean Temperature Data",
      description: "Simulated data for demonstration purposes",
      dateRange: "February 2017",
      resolution: "2.5° × 2.5°",
      variables: ["temperature", "salinity", "pressure", "depth"]
    });
    
    setData(sampleData);
  }, []);

  const getTemperatureColor = useCallback((temp) => {
    // More refined color scale from cold to hot
    if (temp < 0) return 'hsl(240, 100%, 40%)'; // Very cold - deep blue
    if (temp < 10) return `hsl(210, 100%, ${50 - (temp/10)*10}%)`; // Cold - blue
    if (temp < 15) return `hsl(180, 100%, ${40 + (temp-10)*4}%)`; // Cool - cyan
    if (temp < 20) return `hsl(120, 100%, ${40 + (temp-15)*4}%)`; // Moderate - green
    if (temp < 25) return `hsl(60, 100%, ${40 + (temp-20)*4}%)`; // Warm - yellow
    if (temp < 30) return `hsl(30, 100%, ${50 + (temp-25)*2}%)`; // Hot - orange
    return 'hsl(0, 100%, 60%)'; // Very hot - red
  }, []);

  // Memoize the drawVisualization function
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with a gradient background
    const gradient = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width/2);
    gradient.addColorStop(0, '#0a1a2a');
    gradient.addColorStop(1, '#050f1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw ocean temperature data
    data.forEach((point, index) => {
      if (index % 10 !== currentFrame % 10 && isAnimating) return; // Animation effect

      const x = ((point.lon + 180) / 360) * width;
      const y = ((90 - point.lat) / 180) * height;
      
      // Color based on temperature
      const temp = point.temperature || point.temp || 15;
      const color = getTemperatureColor(temp);
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      
      // Draw point with size based on temperature intensity
      const size = Math.max(1, Math.abs(temp - 15) / 5);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add glow effect for extreme temperatures
      if (Math.abs(temp - 15) > 10) {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
    
    // Draw grid lines with better styling
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    
    // Latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`${lat}°`, 5, y - 5);
    }
    
    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 60) {
      const x = ((lon + 180) / 360) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`${lon}°`, x + 5, 15);
    }
    
    // Draw equator and prime meridian with emphasis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    
    // Equator
    const equatorY = ((90 - 0) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, equatorY);
    ctx.lineTo(width, equatorY);
    ctx.stroke();
    
    // Prime meridian
    const primeMeridianX = ((0 + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(primeMeridianX, 0);
    ctx.lineTo(primeMeridianX, height);
    ctx.stroke();
  }, [data, currentFrame, isAnimating, getTemperatureColor]);

  useEffect(() => {
    fetchOceanData();
  }, [fetchOceanData]); // Now fetchOceanData is a dependency but it's memoized

  useEffect(() => {
    if (data && canvasRef.current) {
      drawVisualization();
    }
  }, [data, currentFrame, drawVisualization]); // Now drawVisualization is a dependency but it's memoized

  const formatCoordinate = useCallback((coord, isLatitude) => {
    const absValue = Math.abs(coord);
    const direction = isLatitude 
      ? (coord >= 0 ? 'N' : 'S') 
      : (coord >= 0 ? 'E' : 'W');
    return `${absValue.toFixed(2)}° ${direction}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  const handleCanvasClick = useCallback((event) => {
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
      const distance = Math.sqrt(
        Math.pow(point.lat - lat, 2) + Math.pow(point.lon - lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });
    
    if (nearest && minDistance < 5) {
      setSelectedPoint({...nearest, clickLat: lat, clickLon: lon});
    } else {
      setSelectedPoint(null);
    }
  }, [data]);

  const toggleAnimation = useCallback(() => {
    if (isAnimating) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 100);
      }, 100 - animationSpeed);
    }
  }, [isAnimating, animationSpeed]);

  useEffect(() => {
    if (isAnimating && animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 100);
      }, 100 - animationSpeed);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Waves className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <div className="text-xl font-semibold mb-2">Loading Ocean Data...</div>
          <div className="text-blue-300">Fetching Argo temperature measurements</div>
          <div className="mt-4 w-64 h-2 bg-blue-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="relative z-10 p-6 bg-black bg-opacity-50 backdrop-blur-sm border-b border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">Ocean Temperature Visualization</h1>
              <p className="text-blue-300 text-sm">
                {dataInfo?.title || "Argo Float Data"} - {dataInfo?.dateRange || "February 2017"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAnimation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isAnimating ? 'Pause' : 'Animate'}</span>
            </button>
            
            <button
              onClick={fetchOceanData}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Controls and Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Animation Speed:</span>
              <input
                type="range"
                min="1"
                max="99"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-24"
              />
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                <span>Cold (&lt; 10°C)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                <span>Moderate (15-20°C)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                <span>Warm (&gt; 25°C)</span>
              </div>
            </div>
          </div>
          
          {dataInfo && (
            <div className="text-xs text-blue-300 flex items-center">
              <Database className="w-3 h-3 mr-1" />
              {dataInfo.resolution} resolution
            </div>
          )}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          width={window.innerWidth || 1200}
          height={(window.innerHeight || 800) - 200}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair"
        />

        {/* Info Panel */}
        {selectedPoint && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-90 backdrop-blur-sm p-4 rounded-lg border border-blue-500 max-w-xs shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Data Point Details</span>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-blue-300 hover:text-blue-200 text-sm"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-blue-300">Latitude</div>
                  <div className="font-mono">{formatCoordinate(selectedPoint.lat, true)}</div>
                </div>
                <div>
                  <div className="text-blue-300">Longitude</div>
                  <div className="font-mono">{formatCoordinate(selectedPoint.lon, false)}</div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-blue-800">
                <div className="flex items-center space-x-2 text-blue-300 mb-1">
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature</span>
                </div>
                <div className="font-mono">{(selectedPoint.temperature || selectedPoint.temp || 15).toFixed(2)}°C</div>
              </div>
              
              {selectedPoint.depth && (
                <div>
                  <div className="text-blue-300">Depth</div>
                  <div className="font-mono">{selectedPoint.depth.toFixed(0)} meters</div>
                </div>
              )}
              
              {selectedPoint.salinity && (
                <div>
                  <div className="text-blue-300">Salinity</div>
                  <div className="font-mono">{selectedPoint.salinity.toFixed(2)} PSU</div>
                </div>
              )}
              
              {selectedPoint.pressure && (
                <div>
                  <div className="text-blue-300">Pressure</div>
                  <div className="font-mono">{selectedPoint.pressure.toFixed(1)} dbar</div>
                </div>
              )}
              
              {selectedPoint.timestamp && (
                <div>
                  <div className="flex items-center space-x-2 text-blue-300 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Measurement Date</span>
                  </div>
                  <div>{formatDate(selectedPoint.timestamp)}</div>
                </div>
              )}
              
              {selectedPoint.platform && (
                <div>
                  <div className="text-blue-300">Platform</div>
                  <div>{selectedPoint.platform}</div>
                </div>
              )}
              
              {selectedPoint.quality && (
                <div>
                  <div className="text-blue-300">Data Quality</div>
                  <div className={selectedPoint.quality === 'good' ? 'text-green-400' : 'text-yellow-400'}>
                    {selectedPoint.quality.charAt(0).toUpperCase() + selectedPoint.quality.slice(1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="absolute bottom-4 left-4 bg-red-900 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg border border-red-500 max-w-md">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-5 h-5 text-red-400" />
              <span className="font-semibold">Notice</span>
            </div>
            <div className="text-sm">
              {error.includes('sample') 
                ? 'Using sample data for demonstration. The visualization shows simulated ocean temperature patterns.'
                : error
              }
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm p-4 text-center text-sm text-blue-300 border-t border-blue-800">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span>Inspired by <span className="text-blue-400">earth.nullschool.net</span></span>
          <span className="hidden sm:inline">•</span>
          <span>Data from <span className="text-blue-400">Scripps Institution of Oceanography</span></span>
          <span className="hidden sm:inline">•</span>
          <span>Click on the map to explore temperature data</span>
        </div>
      </div>
    </div>
  );
};

export default OceanTemperatureVisualization;
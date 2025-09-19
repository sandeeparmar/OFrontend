import React, { useState, useRef } from 'react';
import { Send, MapPin, Thermometer, Droplets, Gauge, Fish, Map } from 'lucide-react';

const OceanDataExplorer = () => {
  const [selectedCoords, setSelectedCoords] = useState({ lat: null, lng: null });
  const [filters, setFilters] = useState({
    depth: '',
    temperature: '',
    salinity: '',
    dataType: 'all'
  });
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', message: 'Hello! I can provide ocean data for any coordinates. Click on the map or enter coordinates to get started.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const mapRef = useRef(null);

  // Simulated ocean data generator
  const generateOceanData = (lat, lng) => {
    const depth = Math.abs(lat * lng * 0.1) + Math.random() * 1000;
    const temperature = 15 + Math.sin(lat * Math.PI / 180) * 10 + Math.random() * 5;
    const salinity = 34 + Math.random() * 3;
    const pressure = depth * 0.1 + Math.random() * 10;
    const chlorophyll = Math.random() * 5;
    const oxygen = 200 + Math.random() * 100;
    const ph = 7.8 + Math.random() * 0.4;
    
    return {
      coordinates: { latitude: lat.toFixed(4), longitude: lng.toFixed(4) },
      depth: depth.toFixed(1) + ' m',
      temperature: temperature.toFixed(1) + '°C',
      salinity: salinity.toFixed(2) + ' PSU',
      pressure: pressure.toFixed(1) + ' dbar',
      bgcParameters: {
        chlorophyll: chlorophyll.toFixed(2) + ' mg/m³',
        dissolvedOxygen: oxygen.toFixed(1) + ' μmol/kg',
        pH: ph.toFixed(2),
        nitrate: (Math.random() * 30).toFixed(1) + ' μmol/kg',
        phosphate: (Math.random() * 3).toFixed(2) + ' μmol/kg'
      }
    };
  };

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng with proper scaling
    const lng = ((x / rect.width) * 360) - 180; // -180 to 180
    const lat = 90 - ((y / rect.height) * 180);  // 90 to -90
    
    // Ensure coordinates are within valid ranges
    const clampedLat = Math.max(-90, Math.min(90, lat));
    const clampedLng = Math.max(-180, Math.min(180, lng));
    
    setSelectedCoords({ lat: clampedLat, lng: clampedLng });
    
    const data = generateOceanData(clampedLat, clampedLng);
    const botMessage = `📍 Location: ${data.coordinates.latitude}°, ${data.coordinates.longitude}°
    
🌊 Ocean Data:
• Depth: ${data.depth}
• Temperature: ${data.temperature}
• Salinity: ${data.salinity}
• Pressure: ${data.pressure}

🧪 BGC Parameters:
• Chlorophyll-a: ${data.bgcParameters.chlorophyll}
• Dissolved Oxygen: ${data.bgcParameters.dissolvedOxygen}
• pH: ${data.bgcParameters.pH}
• Nitrate: ${data.bgcParameters.nitrate}
• Phosphate: ${data.bgcParameters.phosphate}`;

    setChatMessages(prev => [...prev, { type: 'bot', message: botMessage }]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setChatMessages(prev => [...prev, { type: 'user', message: inputMessage }]);

    // Check if message contains coordinates
    const coordRegex = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/;
    const match = inputMessage.match(coordRegex);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setSelectedCoords({ lat, lng });
        const data = generateOceanData(lat, lng);
        
        const botMessage = `📍 Location: ${data.coordinates.latitude}°, ${data.coordinates.longitude}°
        
🌊 Ocean Data:
• Depth: ${data.depth}
• Temperature: ${data.temperature}
• Salinity: ${data.salinity}
• Pressure: ${data.pressure}

🧪 BGC Parameters:
• Chlorophyll-a: ${data.bgcParameters.chlorophyll}
• Dissolved Oxygen: ${data.bgcParameters.dissolvedOxygen}
• pH: ${data.bgcParameters.pH}
• Nitrate: ${data.bgcParameters.nitrate}
• Phosphate: ${data.bgcParameters.phosphate}`;

        setTimeout(() => {
          setChatMessages(prev => [...prev, { type: 'bot', message: botMessage }]);
        }, 500);
      } else {
        setTimeout(() => {
          setChatMessages(prev => [...prev, { type: 'bot', message: 'Invalid coordinates. Please enter valid latitude (-90 to 90) and longitude (-180 to 180).' }]);
        }, 500);
      }
    } else {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { type: 'bot', message: 'Please provide coordinates in the format: latitude, longitude (e.g., 40.7128, -74.0060) or click on the map.' }]);
      }, 500);
    }

    setInputMessage('');
  };

  const renderWorldMap = () => {
    const gridLines = [];
    
    // Create grid lines for latitude and longitude
    for (let i = 0; i <= 18; i++) {
      gridLines.push(
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 20}
          x2="720"
          y2={i * 20}
          stroke="#cbd5e1"
          strokeWidth="0.5"
          opacity="0.6"
        />
      );
    }
    
    for (let i = 0; i <= 36; i++) {
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={i * 20}
          y1="0"
          x2={i * 20}
          y2="360"
          stroke="#cbd5e1"
          strokeWidth="0.5"
          opacity="0.6"
        />
      );
    }

    // More detailed world continents with proper shapes
    const continents = [
      // North America
      "M120,80 Q140,75 180,85 L220,90 Q240,100 250,120 L245,140 Q240,150 230,160 L200,155 Q180,150 160,140 L140,130 Q120,120 110,100 Z",
      // Greenland
      "M200,40 Q220,35 240,50 L235,70 Q225,75 200,65 Z",
      // South America
      "M200,200 Q220,195 240,210 L250,240 Q255,270 250,300 L240,320 Q225,315 210,300 L200,280 Q195,260 200,240 Z",
      // Europe
      "M340,90 Q365,85 390,95 L385,115 Q375,120 360,115 L345,105 Z",
      // Africa
      "M350,130 Q375,125 400,140 L410,170 Q415,200 410,230 L400,250 Q385,255 370,250 L355,240 Q350,220 345,200 L350,170 Z",
      // Asia
      "M400,70 Q450,65 520,80 L580,90 Q620,100 650,120 L645,150 Q630,160 600,155 L570,150 Q540,145 510,140 L480,135 Q450,130 420,125 L400,115 Z",
      // Australia
      "M580,250 Q620,245 660,260 L655,280 Q640,285 620,280 L600,275 Q585,270 580,250 Z",
      // Antarctica
      "M0,320 L720,320 L720,360 L0,360 Z"
    ];

    // Ocean areas (for visual distinction)
    const oceans = [
      // Pacific Ocean
      "M0,100 L120,100 L120,300 L0,300 Z",
      "M500,100 L720,100 L720,300 L500,300 Z",
      // Atlantic Ocean  
      "M250,100 L350,100 L350,300 L250,300 Z",
      // Indian Ocean
      "M400,150 L580,150 L580,300 L400,300 Z"
    ];

    const currentData = selectedCoords.lat && selectedCoords.lng ? generateOceanData(selectedCoords.lat, selectedCoords.lng) : null;

    return (
      <div className="relative w-full h-full">
        <svg
          ref={mapRef}
          viewBox="0 0 720 360"
          className="w-full h-full cursor-crosshair border border-slate-300 rounded-lg bg-gradient-to-b from-sky-200 via-blue-300 to-blue-400"
          onClick={handleMapClick}
        >
          {/* Ocean background areas */}
          {oceans.map((path, index) => (
            <path
              key={`ocean-${index}`}
              d={path}
              fill="#3b82f6"
              opacity="0.3"
            />
          ))}
          
          {gridLines}
          
          {/* Continents */}
          {continents.map((path, index) => (
            <path
              key={index}
              d={path}
              fill="#22c55e"
              stroke="#16a34a"
              strokeWidth="1"
              opacity="0.9"
            />
          ))}

          {/* Equator line */}
          <line
            x1="0"
            y1="180"
            x2="720"
            y2="180"
            stroke="#dc2626"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          
          {/* Prime Meridian */}
          <line
            x1="360"
            y1="0"
            x2="360"
            y2="360"
            stroke="#dc2626"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />

          {/* Selected location marker */}
          {selectedCoords.lat && selectedCoords.lng && (
            <g>
              <circle
                cx={(selectedCoords.lng + 180) * 2}
                cy={(90 - selectedCoords.lat) * 2}
                r="6"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="3"
              />
              <circle
                cx={(selectedCoords.lng + 180) * 2}
                cy={(90 - selectedCoords.lat) * 2}
                r="12"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.6"
              >
                <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Latitude labels */}
          <text x="5" y="15" fontSize="10" fill="#64748b" fontWeight="bold">90°N</text>
          <text x="5" y="95" fontSize="10" fill="#64748b" fontWeight="bold">45°N</text>
          <text x="5" y="185" fontSize="10" fill="#64748b" fontWeight="bold">0°</text>
          <text x="5" y="275" fontSize="10" fill="#64748b" fontWeight="bold">45°S</text>
          <text x="5" y="355" fontSize="10" fill="#64748b" fontWeight="bold">90°S</text>

          {/* Longitude labels */}
          <text x="85" y="350" fontSize="10" fill="#64748b" fontWeight="bold">135°W</text>
          <text x="265" y="350" fontSize="10" fill="#64748b" fontWeight="bold">45°W</text>
          <text x="355" y="350" fontSize="10" fill="#64748b" fontWeight="bold">0°</text>
          <text x="445" y="350" fontSize="10" fill="#64748b" fontWeight="bold">45°E</text>
          <text x="625" y="350" fontSize="10" fill="#64748b" fontWeight="bold">135°E</text>
        </svg>

        {/* Data overlay when location is selected */}
        {currentData && selectedCoords.lat && selectedCoords.lng && (
          <div 
            className="absolute bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border-2 border-blue-500 max-w-xs"
            style={{
              left: `${Math.min(((selectedCoords.lng + 180) / 360) * 100 + 5, 70)}%`,
              top: `${Math.min(((90 - selectedCoords.lat) / 180) * 100 + 5, 70)}%`,
            }}
          >
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-1">
              <MapPin size={16} className="text-red-500" />
              Ocean Data
            </h3>
            <div className="text-xs space-y-1">
              <p><strong>Coordinates:</strong> {currentData.coordinates.latitude}°, {currentData.coordinates.longitude}°</p>
              <p className="flex items-center gap-1">
                <Thermometer size={12} className="text-red-500" />
                <strong>Temp:</strong> {currentData.temperature}
              </p>
              <p className="flex items-center gap-1">
                <Droplets size={12} className="text-blue-500" />
                <strong>Salinity:</strong> {currentData.salinity}
              </p>
              <p><strong>Depth:</strong> {currentData.depth}</p>
              <p><strong>Pressure:</strong> {currentData.pressure}</p>
              <hr className="my-2" />
              <p><strong>Chlorophyll:</strong> {currentData.bgcParameters.chlorophyll}</p>
              <p><strong>pH:</strong> {currentData.bgcParameters.pH}</p>
              <p><strong>O₂:</strong> {currentData.bgcParameters.dissolvedOxygen}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <Map className="text-blue-600" size={32} />
            Ocean Data Explorer
          </h1>
          <p className="text-slate-600">Explore oceanographic data by coordinates</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Gauge className="text-blue-600" size={20} />
                Filters
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Depth Range (m)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0-1000"
                    value={filters.depth}
                    onChange={(e) => setFilters({...filters, depth: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 15-25"
                    value={filters.temperature}
                    onChange={(e) => setFilters({...filters, temperature: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Salinity (PSU)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 34-36"
                    value={filters.salinity}
                    onChange={(e) => setFilters({...filters, salinity: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data Type
                  </label>
                  <select
                    value={filters.dataType}
                    onChange={(e) => setFilters({...filters, dataType: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Parameters</option>
                    <option value="physical">Physical Only</option>
                    <option value="bgc">BGC Only</option>
                    <option value="temperature">Temperature</option>
                    <option value="salinity">Salinity</option>
                  </select>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Filters
                </button>
              </div>

              {selectedCoords.lat && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={16} />
                    Selected Location
                  </h3>
                  <p className="text-sm text-slate-600">
                    Lat: {selectedCoords.lat.toFixed(4)}°<br />
                    Lng: {selectedCoords.lng.toFixed(4)}°
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center - Map */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                World Map
              </h2>
              <div className="h-96 lg:h-[500px]">
                {renderWorldMap()}
              </div>
              <p className="text-sm text-slate-600 mt-2 text-center">
                Click anywhere on the map to get ocean data for that location
              </p>
            </div>
          </div>

          {/* Right Sidebar - Chatbot */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Fish className="text-blue-600" size={20} />
                Ocean Data Assistant
              </h2>
              
              <div className="flex-1 bg-slate-50 rounded-lg p-4 mb-4 overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white ml-4'
                          : 'bg-white text-slate-800 mr-4 shadow-sm'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-line">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coordinates (lat, lng) or ask a question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                <p className="mb-1">💡 Try these examples:</p>
                <p>• "40.7128, -74.0060"</p>
                <p>• "0, 0" (Equator)</p>
                <p>• Click any point on the map</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OceanDataExplorer;
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
    
    // Convert pixel coordinates to lat/lng with proper scaling for Indian Ocean
    // Indian Ocean spans approximately from 20°E to 120°E and 30°N to 70°S
    const lng = 20 + ((x / rect.width) * 100); // 20°E to 120°E
    const lat = 30 - ((y / rect.height) * 100); // 30°N to 70°S
    
    // Ensure coordinates are within valid ranges
    const clampedLat = Math.max(-70, Math.min(30, lat));
    const clampedLng = Math.max(20, Math.min(120, lng));
    
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
      
      if (lat >= -70 && lat <= 30 && lng >= 20 && lng <= 120) {
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
          setChatMessages(prev => [...prev, { type: 'bot', message: 'Invalid coordinates. Please enter valid latitude (-70 to 30) and longitude (20 to 120) for the Indian Ocean region.' }]);
        }, 500);
      }
    } else {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { type: 'bot', message: 'Please provide coordinates in the format: latitude, longitude (e.g., -10, 70) or click on the map.' }]);
      }, 500);
    }

    setInputMessage('');
  };

  const renderIndianOceanMap = () => {
    const gridLines = [];
    
    // Create grid lines for latitude and longitude
    for (let i = 0; i <= 10; i++) {
      gridLines.push(
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 36}
          x2="720"
          y2={i * 36}
          stroke="#4b5563"
          strokeWidth="0.5"
          opacity="0.6"
        />
      );
    }
    
    for (let i = 0; i <= 10; i++) {
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={i * 72}
          y1="0"
          x2={i * 72}
          y2="360"
          stroke="#4b5563"
          strokeWidth="0.5"
          opacity="0.6"
        />
      );
    }

    // Simplified Indian Ocean region with surrounding landmasses
    const landmasses = [
      // Africa (east coast)
      "M0,100 Q50,90 70,120 L60,160 Q50,200 60,240 L70,280 Q80,300 90,320 L100,340 L0,340 Z",
      // Arabian Peninsula
      "M150,50 Q180,40 220,60 L240,80 Q250,100 240,120 L220,140 Q200,150 180,140 L160,120 Q150,100 150,80 Z",
      // Indian Subcontinent
      "M300,80 Q340,70 380,90 L400,120 Q410,150 400,180 L380,200 Q350,210 320,200 L300,180 Q290,150 300,120 Z",
      // Southeast Asia
      "M500,60 Q550,50 600,70 L620,100 Q630,130 620,160 L600,180 Q570,190 540,180 L520,160 Q510,130 520,100 Z",
      // Western Australia
      "M600,250 Q650,240 700,260 L710,300 Q700,330 670,340 L630,350 Q600,340 590,320 L580,280 Q580,260 590,240 Z",
      // Madagascar
      "M180,200 Q200,190 220,200 L230,220 Q230,240 220,260 L200,270 Q180,260 170,240 L170,220 Q170,210 180,200 Z",
      // Sri Lanka
      "M340,170 Q360,160 380,170 L385,185 Q385,200 380,215 L360,220 Q340,210 335,195 Q335,180 340,170 Z"
    ];

    // Indian Ocean area
    const oceanPath = "M0,0 L720,0 L720,360 L0,360 Z";

    const currentData = selectedCoords.lat && selectedCoords.lng ? generateOceanData(selectedCoords.lat, selectedCoords.lng) : null;

    // Convert coordinates to SVG position for Indian Ocean region
    const svgX = ((selectedCoords.lng - 20) / 100) * 720;
    const svgY = ((30 - selectedCoords.lat) / 100) * 360;

    return (
      <div className="relative w-full h-full">
        <svg
          ref={mapRef}
          viewBox="0 0 720 360"
          className="w-full h-full cursor-crosshair border border-gray-700 rounded-lg bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900"
          onClick={handleMapClick}
        >
          {/* Ocean background */}
          <path
            d={oceanPath}
            fill="#1e3a8a"
            opacity="0.7"
          />
          
          {gridLines}
          
          {/* Landmasses */}
          {landmasses.map((path, index) => (
            <path
              key={index}
              d={path}
              fill="#065f46"
              stroke="#047857"
              strokeWidth="1"
              opacity="0.9"
            />
          ))}

          {/* Selected location marker */}
          {selectedCoords.lat && selectedCoords.lng && (
            <g>
              <circle
                cx={svgX}
                cy={svgY}
                r="6"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="3"
              />
              <circle
                cx={svgX}
                cy={svgY}
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
          <text x="5" y="15" fontSize="10" fill="#d1d5db" fontWeight="bold">30°N</text>
          <text x="5" y="95" fontSize="10" fill="#d1d5db" fontWeight="bold">15°N</text>
          <text x="5" y="185" fontSize="10" fill="#d1d5db" fontWeight="bold">0°</text>
          <text x="5" y="275" fontSize="10" fill="#d1d5db" fontWeight="bold">15°S</text>
          <text x="5" y="355" fontSize="10" fill="#d1d5db" fontWeight="bold">30°S</text>

          {/* Longitude labels */}
          <text x="85" y="350" fontSize="10" fill="#d1d5db" fontWeight="bold">30°E</text>
          <text x="265" y="350" fontSize="10" fill="#d1d5db" fontWeight="bold">60°E</text>
          <text x="445" y="350" fontSize="10" fill="#d1d5db" fontWeight="bold">90°E</text>
          <text x="625" y="350" fontSize="10" fill="#d1d5db" fontWeight="bold">120°E</text>

          {/* Map title */}
          <text x="360" y="30" fontSize="14" fill="#93c5fd" fontWeight="bold" textAnchor="middle">Indian Ocean Region</text>
        </svg>

        {/* Data overlay when location is selected */}
        {currentData && selectedCoords.lat && selectedCoords.lng && (
          <div 
            className="absolute bg-gray-800 bg-opacity-95 p-4 rounded-lg shadow-lg border-2 border-blue-500 max-w-xs"
            style={{
              left: `${Math.min((svgX / 720) * 100 + 5, 70)}%`,
              top: `${Math.min((svgY / 360) * 100 + 5, 70)}%`,
            }}
          >
            <h3 className="font-bold text-white mb-2 flex items-center gap-1">
              <MapPin size={16} className="text-red-500" />
              Ocean Data
            </h3>
            <div className="text-xs space-y-1 text-gray-200">
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
              <hr className="my-2 border-gray-700" />
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
    <div className="min-h-screen mt-20 bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Map className="text-blue-400" size={32} />
            Indian Ocean Data Explorer
          </h1>
          <p className="text-gray-400">Explore oceanographic data for the Indian Ocean region</p>
        </header>

        {/* Filter Section - Full Width */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 w-full">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Gauge className="text-blue-400" size={20} />
            Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Depth Range (m)
              </label>
              <input
                type="text"
                placeholder="e.g., 0-1000"
                value={filters.depth}
                onChange={(e) => setFilters({...filters, depth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temperature (°C)
              </label>
              <input
                type="text"
                placeholder="e.g., 15-25"
                value={filters.temperature}
                onChange={(e) => setFilters({...filters, temperature: e.target.value})}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Salinity (PSU)
              </label>
              <input
                type="text"
                placeholder="e.g., 34-36"
                value={filters.salinity}
                onChange={(e) => setFilters({...filters, salinity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data Type
              </label>
              <select
                value={filters.dataType}
                onChange={(e) => setFilters({...filters, dataType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              >
                <option value="all">All Parameters</option>
                <option value="physical">Physical Only</option>
                <option value="bgc">BGC Only</option>
                <option value="temperature">Temperature</option>
                <option value="salinity">Salinity</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Apply Filters
            </button>

            {selectedCoords.lat && (
              <div className="p-4 bg-blue-900 bg-opacity-50 rounded-lg">
                <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                  <MapPin className="text-blue-400" size={16} />
                  Selected Location
                </h3>
                <p className="text-sm text-gray-300">
                  Lat: {selectedCoords.lat.toFixed(4)}°<br />
                  Lng: {selectedCoords.lng.toFixed(4)}°
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Indian Ocean Map - 75% width */}
          <div className="lg:w-3/4">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full">
              <h2 className="text-xl font-semibold text-white mb-4">
                Indian Ocean Map
              </h2>
              <div className="h-96 lg:h-[500px]">
                {renderIndianOceanMap()}
              </div>
              <p className="text-sm text-gray-400 mt-2 text-center">
                Click anywhere on the map to get ocean data for that location
              </p>
            </div>
          </div>

          {/* Ocean Data Assistant - 25% width */}
          <div className="lg:w-1/4">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Fish className="text-blue-400" size={20} />
                Ocean Data Assistant
              </h2>
              
              <div className="flex-1 bg-gray-700 rounded-lg p-4 mb-4 overflow-y-auto max-h-96">
                <div className="space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white ml-4'
                          : 'bg-gray-600 text-white mr-4 shadow-sm'
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
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                <p className="mb-1">💡 Try these examples:</p>
                <p>• "-10, 70" (Indian Ocean)</p>
                <p>• "0, 80" (Equator)</p>
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
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { oceanDataApi } from '../services/mockApi';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [oceanData, setOceanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);

  // Sample ocean data points
  const samplePoints = [
    { lat: 20, lng: -155, name: 'Hawaii Station', depth: 1000 },
    { lat: -5, lng: 90, name: 'Indian Ocean Station', depth: 500 },
    { lat: 0, lng: -150, name: 'Pacific Equator Station', depth: 2000 },
    { lat: -20, lng: 170, name: 'South Pacific Station', depth: 1500 },
  ];

  useEffect(() => {
    // Fetch initial map points
    setMapPoints(samplePoints);
  }, []);

  const fetchOceanData = async (lat, lng, depth) => {
    setLoading(true);
    try {
      const data = await oceanDataApi.getData(lat, lng, depth);
      setOceanData(data);
    } catch (error) {
      console.error('Error fetching ocean data:', error);
      // Fallback to mock data for demo
      setOceanData({
        temperature: [
          { depth: 0, temp: 25.6 },
          { depth: 100, temp: 20.1 },
          { depth: 200, temp: 15.3 },
          { depth: 300, temp: 12.4 },
          { depth: 400, temp: 10.2 },
          { depth: 500, temp: 8.7 },
        ],
        salinity: [
          { depth: 0, salinity: 35.2 },
          { depth: 100, salinity: 34.8 },
          { depth: 200, salinity: 34.9 },
          { depth: 300, salinity: 34.7 },
          { depth: 400, salinity: 34.6 },
          { depth: 500, salinity: 34.5 },
        ],
        oxygen: [
          { depth: 0, oxygen: 5.2 },
          { depth: 100, oxygen: 4.8 },
          { depth: 200, oxygen: 4.1 },
          { depth: 300, oxygen: 3.5 },
          { depth: 400, oxygen: 2.9 },
          { depth: 500, oxygen: 2.4 },
        ],
        location: { lat, lng, depth },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (point) => {
    setSelectedLocation(point);
    fetchOceanData(point.lat, point.lng, point.depth);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ocean Data Dashboard</h1>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Ocean Data Locations</h2>
          <div className="h-96">
            <MapContainer
              center={[0, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {mapPoints.map((point, index) => (
                <Marker
                  key={index}
                  position={[point.lat, point.lng]}
                  eventHandlers={{
                    click: () => handleMarkerClick(point),
                  }}
                >
                  <Popup>
                    <div>
                      <strong>{point.name}</strong>
                      <br />
                      Lat: {point.lat}, Lng: {point.lng}
                      <br />
                      Depth: {point.depth}m
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Data Visualization Section */}
        <div className="bg-white rounded-lg shadow p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">
            {selectedLocation 
              ? `Data for ${selectedLocation.name}` 
              : 'Select a location on the map to view data'}
          </h2>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ocean-medium"></div>
            </div>
          )}
          
          {!loading && oceanData && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Temperature vs Depth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={oceanData.temperature}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="depth" label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temp" stroke="#3B82F6" name="Temperature" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Salinity vs Depth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={oceanData.salinity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="depth" label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Salinity (PSU)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="salinity" stroke="#10B981" name="Salinity" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Oxygen vs Depth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={oceanData.oxygen}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="depth" label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Oxygen (ml/l)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="oxygen" stroke="#EF4444" name="Oxygen" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
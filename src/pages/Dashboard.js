import React, { useState , useEffect } from 'react';
import ArgoFloatMap from '../components/Dashboard/ArgoFloatMap';
import FloatList from '../components/Dashboard/FloatList';
import DataVisualization from '../components/Dashboard/DataVisualization';
import { argoFloats } from '../data/argoFloats';
import { handleFloatSelect } from '../components/Dashboard/ArgoFloatData';


const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [argoData, setArgoData] = useState([]);
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
    setMapPoints(samplePoints);
  }, [] );

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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ARGO Float Data Dashboard</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'map' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Float Locations
        </button>
        <button
          onClick={() => setViewMode('data')}
          className={`px-4 py-2 rounded-lg ${
            viewMode === 'data' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Data Visualization
        </button>
        {viewMode === 'data' && (
          <button
            onClick={() => setThreeDView(!threeDView)}
            className={`px-4 py-2 rounded-lg ${
              threeDView
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {threeDView ? '2D View' : '3D View'}
          </button>
        )}
      </div>

      {viewMode === 'map' && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">ARGO Float Locations</h2>
          <ArgoFloatMap 
            argoFloats={argoFloats} 
            handleFloatSelect={(float) => handleFloatSelect(
              float, 
              setSelectedLocation, 
              setArgoData, 
              setLoading
            )} 
          />
          <FloatList 
            argoFloats={argoFloats}
            selectedLocation={selectedLocation}
            handleFloatSelect={(float) => handleFloatSelect(
              float, 
              setSelectedLocation, 
              setArgoData, 
              setLoading
            )}
          />
        </div>
      )}

      {selectedLocation && viewMode === 'data' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">
              Data for Float {selectedLocation.platform_number}
            </h2>
            <p className="text-sm text-gray-600">
              Location: {selectedLocation.latitude}°N, {selectedLocation.longitude}°E | 
              Last Update: {selectedLocation.last_measurement} | 
              Mode: {selectedLocation.data_mode}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : argoData.length > 0 ? (
            <DataVisualization 
              argoData={argoData} 
              threeDView={threeDView} 
            />
          ) : (
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-gray-500">No data available for this float</p>
            </div>
          )}
        </div>
      )}

      {!selectedLocation && viewMode === 'data' && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Select an ARGO float from the map view to see its data</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
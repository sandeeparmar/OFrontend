import  {React , useState } from 'react';
import ArgoFloatMap from '../components/Dashboard/ArgoFloatMap';
import FloatList from '../components/Dashboard/FloatList';
import DataVisualization from '../components/Dashboard/DataVisualization';
import { argoFloats } from '../data/argoFloats';
import { handleFloatSelect } from '../components/Dashboard/ArgoFloatData';

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [argoData, setArgoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [threeDView, setThreeDView] = useState(false);

  return (
    <div className=" h-full flex flex-col">
      
       {/* Chat Header */}
      {/* <div className="fixed top-0 m w-full  z-50  bg-gradient-to-r from-[#3f2b96] to-[#a8c0ff] shadow-lg border-b-4 border-blue-800">
        <div className="container mx-auto  py-5">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3 mr-60" >
              
              
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer">
                <img 
                  src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg" 
                  alt="ocean_logo" 
                  className="w-full h-full object-cover"
                />
              </div>

             
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                  ARGO Float Data Dashboard
                </h1>
                <p className="text-gray-100 text-sm font-medium mt-1">
                  Explore oceanographic insights with AI
                </p>
              </div>

            </div>
          </div>
        </div>
      </div> */}


      
      <div className="flex flex-wrap gap-4 m-20">
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
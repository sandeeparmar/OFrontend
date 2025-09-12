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
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ARGO Float Data Dashboard</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setViewMode('map')}
          className={`px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-2 md:px-5 md:py-2.5 
                     text-xs xs:text-sm sm:text-base md:text-lg rounded-lg transition-all 
                     duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
            viewMode === 'map' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <span className="hidden xs:inline">Float </span>Locations
        </button>
        
        <button
          onClick={() => setViewMode('data')}
          className={`px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-2 md:px-5 md:py-2.5 
                     text-xs xs:text-sm sm:text-base md:text-lg rounded-lg transition-all 
                     duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
            viewMode === 'data' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <span className="hidden xs:inline">Data </span>Visualization
        </button>
        
        {viewMode === 'data' && (
          <button
            onClick={() => setThreeDView(!threeDView)}
            className={`px-2 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-2 md:px-5 md:py-2.5 
                       text-xs xs:text-sm sm:text-base md:text-lg rounded-lg transition-all 
                       duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
              threeDView
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {threeDView ? '2D View' : '3D View'}
          </button>
        )}
      </div>

      Map View
      {viewMode === 'map' && (
        <div className="bg-white rounded-lg shadow p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
          <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mb-2 xs:mb-3 sm:mb-4">
            ARGO Float Locations
          </h2>
          
          <div className="h-64 xs:h-72 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px] mb-3 xs:mb-4">
            <ArgoFloatMap 
              argoFloats={argoFloats} 
              handleFloatSelect={(float) => handleFloatSelect(
                float, 
                setSelectedLocation, 
                setArgoData, 
                setLoading
              )} 
            />
          </div>
          
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

      {/* Data Visualization View */}
      {selectedLocation && viewMode === 'data' && (
        <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
          <div className="bg-white p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg shadow">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mb-1 xs:mb-2">
              Float {selectedLocation.platform_number}
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-1 xs:gap-2 text-xs xs:text-sm sm:text-base text-gray-600">
              <p>📍 {selectedLocation.latitude}°N, {selectedLocation.longitude}°E</p>
              <p>📅 {selectedLocation.last_measurement}</p>
              <p>🔧 {selectedLocation.data_mode} | {selectedLocation.measurements} measurements</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40 xs:h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
              <div className="animate-spin rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm xs:text-base sm:text-lg text-gray-600">Loading data...</span>
            </div>
          ) : argoData.length > 0 ? (
            <DataVisualization 
              argoData={argoData} 
              threeDView={threeDView} 
            />
          ) : (
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-gray-500 text-sm xs:text-base">No data available for this float</p>
            </div>
          )}
        </div>
      )}

      {/* No Float Selected Message */}
      {!selectedLocation && viewMode === 'data' && (
        <div className="bg-white rounded-lg shadow p-3 xs:p-4 sm:p-5 md:p-6 text-center flex flex-col items-center justify-center min-h-[200px] xs:min-h-[250px] sm:min-h-[300px]">
          <div className="text-4xl xs:text-5xl sm:text-6xl mb-3 xs:mb-4">🌊</div>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600 mb-2 xs:mb-3">
            Select an ARGO float to view data
          </p>
          <p className="text-xs xs:text-sm text-gray-500">
            Switch to Map view and click on a float marker
          </p>
        </div>
      )}


    </div>
  );
};

export default Dashboard;
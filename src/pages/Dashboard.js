import { useState } from "react";
import ArgoFloatMap from "../components/Dashboard/ArgoFloatMap";
import FloatList from "../components/Dashboard/FloatList";
import DataVisualization from "../components/Dashboard/DataVisualization";
import { argoFloats } from "../data/argoFloats";
import { handleFloatSelect } from "../components/Dashboard/ArgoFloatData";

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [argoData, setArgoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("map");
  const [threeDView, setThreeDView] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
    
      
       {/* Chat Header */}
      <div className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#3f2b96] to-[#a8c0ff] shadow-lg border-b-4 border-blue-800">
        <div className="container mx-auto  py-5">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3 mr-60" >
              
              {/* Logo ocean */}
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer">
                <img 
                  src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg" 
                  alt="ocean_logo" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Centered content */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                  Ocean Data Assistant
                </h1>
                <p className="text-gray-100 text-sm font-medium mt-1">
                  Explore oceanographic insights with AI
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <main className="container mx-auto px-4 pt-28 pb-10 space-y-8">
       
      
        <div className="flex flex-wrap gap-3 my-3">
          <button
            onClick={() => setViewMode("map")}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              viewMode === "map"
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Float Locations
          </button>

          <button
            onClick={() => setViewMode("data")}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              viewMode === "data"
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Data Visualization
          </button>

          {viewMode === "data" && (
            <button
              onClick={() => setThreeDView(!threeDView)}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                threeDView
                  ? "bg-purple-600 text-white shadow-md hover:bg-purple-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {threeDView ? "2D View" : "3D View"}
            </button>
          )}
        </div>


        {/* Map View */}
        {viewMode === "map" && (
          <section className="bg-white border-b-4 border-gray-100 rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">ARGO Float Locations</h2>
           
            <ArgoFloatMap
              argoFloats={argoFloats}
              handleFloatSelect={(float) =>
                handleFloatSelect(float, setSelectedLocation, setArgoData, setLoading)
              }
            />

            <FloatList
              argoFloats={argoFloats}
              selectedLocation={selectedLocation}
              handleFloatSelect={(float) =>
                handleFloatSelect(float, setSelectedLocation, setArgoData, setLoading)
              }
            />
          </section>
        )}

        {/* Data View */}
        {viewMode === "data" && (
          <>
            {selectedLocation ? (
              <section className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-lg font-semibold mb-2">
                    Data for Float {selectedLocation.platform_number}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Location: {selectedLocation.latitude}°N,{" "}
                    {selectedLocation.longitude}°E | Last Update:{" "}
                    {selectedLocation.last_measurement} | Mode:{" "}
                    {selectedLocation.data_mode}
                  </p>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : argoData.length > 0 ? (
                  <DataVisualization argoData={argoData} threeDView={threeDView} />
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow text-center">
                    <p className="text-gray-500">No data available for this float</p>
                  </div>
                )}
              </section>
            ) : (
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <p className="text-gray-500">
                  Select an ARGO float from the map view to see its data
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

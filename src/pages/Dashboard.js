import React, { useState } from "react";
import { MapPin, Thermometer, Droplet, BarChart3, Globe, Waves } from 'lucide-react';
import ArgoFloatMap from "../components/Dashboard/ArgoFloatMap";
import FloatList from "../components/Dashboard/FloatList";
import DataVisualization from "../components/Dashboard/DataVisualization";
import { argoFloats } from "../data/argoFloats";
import { handleFloatSelect } from "../components/Dashboard/ArgoFloatData";

const Dashboard = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [argoData, setArgoData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('map');
    const [threeDView, setThreeDView] = useState(false);
    const [plotMode, setPlotMode] = useState(null);
    const renderDataVisualization = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-40 xs:h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
                    <div className="animate-spin rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 border-t-2 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm xs:text-base sm:text-lg text-gray-600">Loading data...</span>
                </div>
            );
        }
        if (argoData.length > 0) {
            return (
                <DataVisualization
                    argoData={argoData}
                    threeDView={threeDView}
                    plotMode={plotMode}
                />
            );
        }
        return (
            <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-gray-500 text-sm xs:text-base">No data available for this float</p>
            </div>
        );
    };
    return (
        <div className="pb-4 flex flex-col bg-gradient-to-br from-gray-600  to-cyan-500 mt-20 border-3 " >
        
            <div className="flex m-3 p-3 gap-3 justify-center px-5 bg-gray-200 border-3 rounded-xl">
                <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center space-x-2 px-5 py-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                        viewMode === 'map'
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-violet-500/40'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                >
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm xs:text-base">Float Locations</span>
                </button>
                <button
                    onClick={() => setViewMode('data')}
                    className={`flex items-center space-x-2 px-5 py-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                        viewMode === 'data'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm xs:text-base">Data Visualization</span>
                </button>
                {viewMode === 'data' && (
                    <button
                        onClick={() => setThreeDView(!threeDView)}
                        className={`flex items-center space-x-2 px-5 py-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${
                            threeDView
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                    >
                        <Globe className="w-5 h-5" />
                        <span className="text-sm xs:text-base">
                            {threeDView ? '2D View' : '3D View'}
                        </span>
                    </button>
                )}
            </div>
            {viewMode === 'map' && (
                <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                        <h2 className="text-lg font-semibold mb-3 p-4 bg-gray-50 text-blue-900 border-b">
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
                        <div className="p-4">
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
                    </div>
                </div>
            )}
            {selectedLocation && viewMode === 'data' && (
                <div className="space-y-4 p-5">
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        <h2 className="text-2xl font-bold text-blue-800 mb-1">
                            Float ID: {selectedLocation.platform_number}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> {selectedLocation.latitude}°N, {selectedLocation.longitude}°E</p>
                            <p className="flex items-center gap-2"><Waves className="w-4 h-4 text-blue-500" /> {selectedLocation.data_mode}</p>
                            <p className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" /> {selectedLocation.measurements} measurements</p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={() => setPlotMode('temperature')}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                    plotMode === 'temperature' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                                }`}
                            >
                                <Thermometer className="w-5 h-5" />
                                <span>Temperature</span>
                            </button>
                            <button
                                onClick={() => setPlotMode('salinity')}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                    plotMode === 'salinity' ? 'bg-teal-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-teal-100'
                                }`}
                            >
                                <Droplet className="w-5 h-5" />
                                <span>Salinity</span>
                            </button>
                            <button
                                onClick={() => setPlotMode('all')}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                    plotMode === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                                }`}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>All Plots</span>
                            </button>
                        </div>
                    </div>
                    {renderDataVisualization()}
                </div>
            )}
            {!selectedLocation && viewMode === 'data' && (
                <div className="bg-white rounded-lg shadow-xl p-6 text-center mx-5 my-auto flex flex-col items-center justify-center min-h-[250px]">
                    <div className="text-6xl mb-4 animate-pulse">🌊</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Select an ARGO Float to View Data
                    </h2>
                    <p className="text-sm text-gray-500">
                        Switch to Map view and click on a float marker
                    </p>
                </div>
            )}
        </div>
    );
};
export default Dashboard;

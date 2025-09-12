import React from 'react';

const FloatList = ({ argoFloats, selectedLocation, handleFloatSelect }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 
                    gap-2 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-4 mt-3 xs:mt-4">
      {argoFloats.map((float, index) => (
        <div
          key={index}
          onClick={() => handleFloatSelect(float)}
          className={`p-2 xs:p-2.5 sm:p-3 md:p-4 border rounded-lg cursor-pointer transition-all 
                     duration-200 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]
                     ${selectedLocation?.platform_number === float.platform_number
            ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-200 ring-opacity-50'
            : 'border-gray-200 hover:border-blue-300 bg-white'
          }`}
        >
          {/* Header with platform number and status indicator */}
          <div className="flex items-center justify-between mb-1 xs:mb-1.5 sm:mb-2">
            <h3 className="font-semibold text-xs xs:text-sm sm:text-sm md:text-base truncate">
              Float {float.platform_number}
            </h3>
            <span className={`inline-block w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full ${
              float.data_mode === 'R' ? 'bg-green-500' : 
              float.data_mode === 'A' ? 'bg-blue-500' : 
              'bg-yellow-500'
            }`} title={`Data Mode: ${float.data_mode}`}></span>
          </div>
          
          {/* Content */}
          <div className="space-y-0.5 xs:space-y-1 sm:space-y-1.5">
            <p className="text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-600 flex items-start">
              <span className="mr-1.5">📍</span>
              <span>{float.latitude}°N, {float.longitude}°E</span>
            </p>
            
            <p className="text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-600 flex items-center">
              <span className="mr-1.5">📅</span>
              <span>{float.last_measurement}</span>
            </p>
            
            <div className="flex items-center justify-between">
              <p className="text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-600 flex items-center">
                <span className="mr-1.5">🔧</span>
                <span className="hidden xs:inline">Mode: </span>
                {float.data_mode}
              </p>
              
              <p className="text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-600 flex items-center">
                <span className="mr-1.5">📊</span>
                {float.measurements}
              </p>
            </div>
          </div>
          
          {/* Selection indicator */}
          {selectedLocation?.platform_number === float.platform_number && (
            <div className="mt-2 xs:mt-2.5 sm:mt-3 pt-2 xs:pt-2.5 border-t border-blue-200">
              <p className="text-[10px] xs:text-xs text-blue-600 font-medium text-center">
                ✓ Currently selected
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatList;
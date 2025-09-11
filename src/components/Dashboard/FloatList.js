import React from 'react';

const FloatList = ({ argoFloats, selectedLocation, handleFloatSelect }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mt-3 xs:mt-4">
      {argoFloats.map((float, index) => (
        <div
          key={index}
          onClick={() => handleFloatSelect(float)}
          className={`p-2 xs:p-3 sm:p-4 border rounded-lg cursor-pointer transition-all 
                     duration-200 hover:shadow-md ${
            selectedLocation?.platform_number === float.platform_number
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <h3 className="font-semibold text-xs xs:text-sm sm:text-base">Float {float.platform_number}</h3>
          <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 mt-1">
            📍 {float.latitude}°N, {float.longitude}°E
          </p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
            📅 {float.last_measurement}
          </p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
            🔧 {float.data_mode} | 📊 {float.measurements}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FloatList;
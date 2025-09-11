import React from 'react';

const FloatList = ({ argoFloats, selectedLocation, handleFloatSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {argoFloats.map((float, index) => (
        <div
          key={index}
          onClick={() => handleFloatSelect(float)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedLocation?.platform_number === float.platform_number
              ? 'border-ocean-medium bg-ocean-light'
              : 'border-gray-200 hover:border-ocean-medium'
          }`}
        >
          <h3 className="font-semibold">Float {float.platform_number}</h3>
          <p className="text-sm text-gray-600">
            Position: {float.latitude}°N, {float.longitude}°E
          </p>
          <p className="text-sm text-gray-600">
            Last update: {float.last_measurement}
          </p>
          <p className="text-sm text-gray-600">
            Mode: {float.data_mode} | Measurements: {float.measurements}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FloatList;
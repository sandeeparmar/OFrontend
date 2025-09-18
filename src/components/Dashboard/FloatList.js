import React, { useState } from "react";
import { Activity } from 'lucide-react';

const FloatList = ({ argoFloats }) => {
  const [showAll, setShowAll] = useState(false);

  if (!argoFloats || argoFloats.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">
        No active floats available
      </div>
    );
  }

  // Limit rows shown
  const visibleFloats = showAll ? argoFloats : argoFloats.slice(0, 7);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <h4 className="font-semibold text-gray-700 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Active ARGO Floats
        </h4>
      </div>
      <div className="divide-y divide-gray-100">
        {visibleFloats.map((float) => (
          <div
            key={float.platform_number}
            className="px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-sm font-semibold text-blue-600">
                  #{float.platform_number}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {float.latitude.toFixed(2)}°N, {float.longitude.toFixed(2)}°E
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">{float.last_measurement}</div>
                <div className="text-xs font-medium text-green-600">
                  {float.measurements} profiles
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Button */}
      {argoFloats.length > 7 && (
        <div className="text-center p-3 border-t bg-gray-50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white text-sm rounded-md shadow hover:opacity-90 transition"
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatList;

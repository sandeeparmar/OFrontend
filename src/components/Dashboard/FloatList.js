import React from "react";
import { Activity } from 'lucide-react';
const FloatList = ({ argoFloats }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="px-4 py-3 bg-gray-50 border-b">
      <h4 className="font-semibold text-gray-700 flex items-center">
        <Activity className="w-4 h-4 mr-2" />
        Active ARGO Floats
      </h4>
    </div>
    <div className="divide-y divide-gray-100">
      {argoFloats.map((float) => (
        <div key={float.platform_number} className="px-4 py-3 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono text-sm font-semibold text-blue-600">#{float.platform_number}</div>
              <div className="text-xs text-gray-600 mt-1">
                {float.latitude.toFixed(2)}°N, {float.longitude.toFixed(2)}°E
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">{float.last_measurement}</div>
              <div className="text-xs font-medium text-green-600">{float.measurements} profiles</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FloatList ;
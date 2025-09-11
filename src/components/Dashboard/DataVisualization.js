import React from 'react';
import ThreeDVisualization from './ThreeDVisualization';
import ProfilePlots from './ProfilePlots';

const DataVisualization = ({ argoData, threeDView }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        {threeDView ? '3D Data Visualization' : '2D Data Profiles'}
      </h3>
      {threeDView ? <ThreeDVisualization argoData={argoData} /> : <ProfilePlots argoData={argoData} />}
      
      {/* Data Table */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Recent Measurements</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Depth (m)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temp (°C)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salinity (PSU)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {argoData.slice(0, 5).map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{item.PRES}</td>
                  <td className="px-4 py-2 text-sm">{item.TEMP?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm">{item.PSAL?.toFixed(2) || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm">{new Date(item.JULD).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
import React from 'react';
import ThreeDVisualization from './ThreeDVisualization';
import ProfilePlots from './ProfilePlots';

const DataVisualization = ({ argoData, threeDView }) => {
  return (
    <div className="bg-white p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg shadow">
      <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold mb-2 xs:mb-3 sm:mb-4">
        {threeDView ? '3D Data Visualization' : '2D Data Profiles'}
      </h3>
      
      <div className="h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 mb-3 xs:mb-4">
        {threeDView ? <ThreeDVisualization argoData={argoData} /> : <ProfilePlots argoData={argoData} />}
      </div>
      
      {/* Data Table */}
      <div className="mt-3 xs:mt-4 overflow-x-auto">
        <h4 className="font-medium mb-2 text-xs xs:text-sm sm:text-base">Recent Measurements</h4>
        <table className="min-w-full divide-y divide-gray-200 text-[10px] xs:text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Depth</th>
              <th className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
              <th className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Salinity</th>
              <th className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {argoData.slice(0, 5).map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2">{item.PRES}</td>
                <td className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2">{item.TEMP?.toFixed(2)}</td>
                <td className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2">{item.PSAL?.toFixed(2) || 'N/A'}</td>
                <td className="px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-3 sm:py-2">{new Date(item.JULD).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataVisualization;
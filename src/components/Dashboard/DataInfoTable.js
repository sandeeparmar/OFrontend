// components/Dashboard/DataInfoTable.js
import React from 'react';

const DataInfoTable = ({ argoData }) => {
  if (!argoData || argoData.length === 0) {
    return <div className="text-gray-500 p-4">No data available</div>;
  }

  // Extract unique information from the data
  const firstDataPoint = argoData[0];
  const lastDataPoint = argoData[argoData.length - 1];
  
  // Calculate min/max values
  const depths = argoData.map(d => d.PRES);
  const temps = argoData.map(d => d.TEMP);
  const salinities = argoData.filter(d => d.PSAL !== null).map(d => d.PSAL);

  const tableData = [
    { label: 'Data Points', value: argoData.length },
    { label: 'Depth Range', value: `${Math.min(...depths)}m - ${Math.max(...depths)}m` },
    { label: 'Temperature Range', value: `${Math.min(...temps).toFixed(2)}°C - ${Math.max(...temps).toFixed(2)}°C` },
    { label: 'Salinity Range', value: salinities.length > 0 ? 
        `${Math.min(...salinities).toFixed(2)} PSU - ${Math.max(...salinities).toFixed(2)} PSU` : 'N/A' },
    { label: 'Latitude', value: firstDataPoint.LATITUDE !== undefined ? firstDataPoint.LATITUDE.toFixed(4) : 'N/A' },
    { label: 'Longitude', value: firstDataPoint.LONGITUDE !== undefined ? firstDataPoint.LONGITUDE.toFixed(4) : 'N/A' },
    { label: 'Date Range', value: firstDataPoint.TIME && lastDataPoint.TIME ? 
        `${new Date(firstDataPoint.TIME).toLocaleDateString()} - ${new Date(lastDataPoint.TIME).toLocaleDateString()}` : 'N/A' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Data Information</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.label}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataInfoTable;
import React, { useState } from 'react';
import { adminApi } from '../services/mockApi';

const AdminPanel = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    // Check if file has .nc extension
    if (!selectedFile.name.toLowerCase().endsWith('.nc')) {
      setUploadStatus('Please select a NetCDF file (.nc extension).');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      const data = await adminApi.uploadNetcdf(selectedFile);

      if (data.success) {
        setUploadStatus('File uploaded successfully!');
        setUploadHistory(prev => [{
          filename: selectedFile.name,
          date: new Date().toLocaleString(),
          status: 'Success'
        }, ...prev]);
      } else {
        setUploadStatus(`Upload failed: ${data.message}`);
        setUploadHistory(prev => [{
          filename: selectedFile.name,
          date: new Date().toLocaleString(),
          status: 'Failed'
        }, ...prev]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Please try again.');
      setUploadHistory(prev => [{
        filename: selectedFile.name,
        date: new Date().toLocaleString(),
        status: 'Failed'
      }, ...prev]);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      // Clear file input
      document.getElementById('netcdf-file').value = '';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel - NetCDF Upload</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload NetCDF File</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select NetCDF File
            </label>
            <input
              id="netcdf-file"
              type="file"
              accept=".nc"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-ocean-light file:text-ocean-dark
                hover:file:bg-ocean-medium hover:file:text-white"
            />
          </div>
          
          {selectedFile && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Selected file: {selectedFile.name}</p>
              <p className="text-xs text-gray-500">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="w-full bg-ocean-medium text-white py-2 px-4 rounded-lg hover:bg-ocean-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
          
          {uploadStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              uploadStatus.includes('success') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload History</h2>
          
          {uploadHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No uploads yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadHistory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.filename}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{item.date}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'Success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">NetCDF File Requirements</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
          <li>Files must be in NetCDF format with .nc extension</li>
          <li>Supported variables: temperature, salinity, oxygen, depth</li>
          <li>Required dimensions: latitude, longitude, depth, time</li>
          <li>Maximum file size: 100MB</li>
          <li>Files will be processed and added to the ocean data database</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
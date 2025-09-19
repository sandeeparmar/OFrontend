import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import {  TrendingUp, TrendingDown, Activity, Thermometer, Droplets, Eye, Download, RefreshCw } from 'lucide-react';

// Generate realistic Argo data for demonstration
const generateArgoData = () => {
  const data = [];
  const baseDate = new Date('2005-01-01');
  
  for (let i = 0; i < 240; i++) { // 20 years of monthly data
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() + i);
    
    // Simulate realistic ocean patterns with trends
    const yearProgress = i / 12;
    const seasonalTemp = 2 * Math.sin((i % 12) * Math.PI / 6);
    const climateChange = 0.02 * yearProgress; // Gradual warming
    const noise = (Math.random() - 0.5) * 0.8;
    
    const temperature = 15.5 + seasonalTemp + climateChange + noise;
    const salinity = 35.0 + 0.1 * Math.sin(i * 0.1) + (Math.random() - 0.5) * 0.2;
    const depth = 1000 + 500 * Math.sin(i * 0.05) + (Math.random() - 0.5) * 100;
    const oxygenLevel = 180 - 0.5 * yearProgress + 10 * Math.sin(i * 0.2) + (Math.random() - 0.5) * 8;
    const phLevel = 8.1 - 0.001 * yearProgress + (Math.random() - 0.5) * 0.05;
    
    data.push({
      date: date.toISOString().split('T')[0],
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      temperature: parseFloat(temperature.toFixed(2)),
      salinity: parseFloat(salinity.toFixed(2)),
      depth: parseFloat(depth.toFixed(1)),
      oxygenLevel: parseFloat(oxygenLevel.toFixed(1)),
      phLevel: parseFloat(phLevel.toFixed(3)),
      floatId: `ARGO_${Math.floor(Math.random() * 1000) + 5900000}`,
      latitude: parseFloat((25 + (Math.random() - 0.5) * 10).toFixed(2)),
      longitude: parseFloat((-80 + (Math.random() - 0.5) * 20).toFixed(2))
    });
  }
  
  return data;
};

const ArgoDataAnalyzer = () => {
  const [argoData] = useState(() => generateArgoData());
  const [analysisYears, setAnalysisYears] = useState(10);
  const [viewMode, setViewMode] = useState('overview');
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - analysisYears;

  const filteredData = useMemo(() => {
    return argoData.filter(d => d.year >= startYear);
  }, [argoData, startYear]);

  const yearlyAverages = useMemo(() => {
    const yearGroups = {};
    
    filteredData.forEach(d => {
      if (!yearGroups[d.year]) {
        yearGroups[d.year] = {
          year: d.year,
          temperature: [],
          salinity: [],
          oxygenLevel: [],
          phLevel: [],
          depth: []
        };
      }
      yearGroups[d.year].temperature.push(d.temperature);
      yearGroups[d.year].salinity.push(d.salinity);
      yearGroups[d.year].oxygenLevel.push(d.oxygenLevel);
      yearGroups[d.year].phLevel.push(d.phLevel);
      yearGroups[d.year].depth.push(d.depth);
    });

    return Object.values(yearGroups).map(group => ({
      year: group.year,
      temperature: parseFloat((group.temperature.reduce((a, b) => a + b, 0) / group.temperature.length).toFixed(2)),
      salinity: parseFloat((group.salinity.reduce((a, b) => a + b, 0) / group.salinity.length).toFixed(2)),
      oxygenLevel: parseFloat((group.oxygenLevel.reduce((a, b) => a + b, 0) / group.oxygenLevel.length).toFixed(1)),
      phLevel: parseFloat((group.phLevel.reduce((a, b) => a + b, 0) / group.phLevel.length).toFixed(3)),
      depth: parseFloat((group.depth.reduce((a, b) => a + b, 0) / group.depth.length).toFixed(1))
    }));
  }, [filteredData]);

  const generateSummary = () => {
    const firstYear = yearlyAverages[0];
    const lastYear = yearlyAverages[yearlyAverages.length - 1];
    
    const tempChange = ((lastYear.temperature - firstYear.temperature) / firstYear.temperature * 100);
    const salinityChange = ((lastYear.salinity - firstYear.salinity) / firstYear.salinity * 100);
    const oxygenChange = ((lastYear.oxygenLevel - firstYear.oxygenLevel) / firstYear.oxygenLevel * 100);
    const phChange = ((lastYear.phLevel - firstYear.phLevel) / firstYear.phLevel * 100);

    return {
      temperatureTrend: tempChange > 0 ? 'increasing' : 'decreasing',
      temperatureChange: Math.abs(tempChange).toFixed(2),
      salinityTrend: salinityChange > 0 ? 'increasing' : 'decreasing',
      salinityChange: Math.abs(salinityChange).toFixed(2),
      oxygenTrend: oxygenChange > 0 ? 'increasing' : 'decreasing',
      oxygenChange: Math.abs(oxygenChange).toFixed(2),
      phTrend: phChange > 0 ? 'increasing' : 'decreasing',
      phChange: Math.abs(phChange).toFixed(3),
      totalMeasurements: filteredData.length,
      averageDepth: (filteredData.reduce((sum, d) => sum + d.depth, 0) / filteredData.length).toFixed(1)
    };
  };

  const summary = generateSummary();

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  const MetricCard = ({ title, value, change, trend, icon: Icon, unit = '' }) => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-900 rounded-lg">
            <Icon className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        </div>
        {trend === 'increasing' ? 
          <TrendingUp className="h-5 w-5 text-red-400" /> : 
          <TrendingDown className="h-5 w-5 text-green-400" />
        }
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-white">
          {value}{unit}
        </p>
        <p className="text-sm text-gray-400">
          <span className={`font-medium ${trend === 'increasing' ? 'text-red-400' : 'text-green-400'}`}>
            {trend === 'increasing' ? '↑' : '↓'} {change}%
          </span>
          {' '}over {analysisYears} years
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-blue-400 mb-2">
                Ocean Argo Data Analyzer
              </h1>
              <p className="text-xl text-gray-400">
                Advanced Ocean data analyse and transform platform
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Load</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Download </span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Analysis Period
              </label>
              <select
                value={analysisYears}
                onChange={(e) => setAnalysisYears(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>Last 5 Years</option>
                <option value={10}>Last 10 Years</option>
                <option value={15}>Last 15 Years</option>
                <option value={20}>Last 20 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overview">Overview Dashboard</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="comparative">Comparative Study</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data Points
              </label>
              <div className="text-lg font-semibold text-blue-400">
                {filteredData.length.toLocaleString()} measurements
              </div>
              <div className="text-sm text-gray-400">
                From {startYear} to {currentYear}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Temperature"
            value={yearlyAverages[yearlyAverages.length - 1]?.temperature || 0}
            change={summary.temperatureChange}
            trend={summary.temperatureTrend}
            icon={Thermometer}
            unit="°C"
          />
          <MetricCard
            title="Salinity"
            value={yearlyAverages[yearlyAverages.length - 1]?.salinity || 0}
            change={summary.salinityChange}
            trend={summary.salinityTrend}
            icon={Droplets}
            unit=" PSU"
          />
          <MetricCard
            title="Oxygen Level"
            value={yearlyAverages[yearlyAverages.length - 1]?.oxygenLevel || 0}
            change={summary.oxygenChange}
            trend={summary.oxygenTrend}
            icon={Activity}
            unit=" μmol/kg"
          />
          <MetricCard
            title="pH Level"
            value={yearlyAverages[yearlyAverages.length - 1]?.phLevel || 0}
            change={summary.phChange}
            trend={summary.phTrend}
            icon={Eye}
          />
        </div>

        {/* AI Summary */}
        <div className="bg-[#3f2b96] rounded-xl shadow-lg p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center animate-pulse">
              <Activity className="h-6 w-6 mr-2 animate-bounce" />
              AI-Generated Analysis Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-lg font-semibold mb-3 border-b border-white/30 pb-2">🔍 Key Findings</h3>
                <ul className="space-y-3 text-cyan-50">
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-yellow-300 font-bold">🌡️</span>
                    <span>Ocean temperature has been <span className={`font-bold ${summary.temperatureTrend === 'increasing' ? 'text-red-300' : 'text-blue-300'}`}>{summary.temperatureTrend}</span> by <span className="text-yellow-200 font-semibold">{summary.temperatureChange}%</span> over {analysisYears} years</span>
                  </li>
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-blue-300 font-bold">💧</span>
                    <span>Salinity levels show a <span className={`font-bold ${summary.salinityTrend === 'increasing' ? 'text-orange-300' : 'text-green-300'}`}>{summary.salinityTrend}</span> trend of <span className="text-yellow-200 font-semibold">{summary.salinityChange}%</span></span>
                  </li>
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-green-300 font-bold">💨</span>
                    <span>Oxygen concentrations are <span className={`font-bold ${summary.oxygenTrend === 'increasing' ? 'text-green-300' : 'text-red-300'}`}>{summary.oxygenTrend}</span> by <span className="text-yellow-200 font-semibold">{summary.oxygenChange}%</span></span>
                  </li>
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-purple-300 font-bold">⚗️</span>
                    <span>pH levels indicate ocean <span className={`font-bold ${summary.phTrend === 'decreasing' ? 'text-red-300' : 'text-green-300'}`}>{summary.phTrend === 'decreasing' ? 'acidification' : 'alkalization'}</span></span>
                  </li>
                </ul>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-lg font-semibold mb-3 border-b border-white/30 pb-2">🔬 Scientific Impact</h3>
                <ul className="space-y-3 text-cyan-50">
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-red-300 font-bold">⚠️</span>
                    <span><span className="font-semibold text-red-200">Climate change indicators</span> are clearly visible in the data</span>
                  </li>
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-orange-300 font-bold">🐟</span>
                    <span><span className="font-semibold text-orange-200">Marine ecosystem health</span> shows concerning trends</span>
                  </li>
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-blue-300 font-bold">🌊</span>
                    <span><span className="font-semibold text-blue-200">Deep ocean circulation patterns</span> may be shifting</span>
                  </li>
                  <li className="flex items-start space-x-2 transform transition-all duration-300 hover:translate-x-2">
                    <span className="text-yellow-300 font-bold">🚨</span>
                    <span><span className="font-semibold text-yellow-200">Immediate attention required</span> for conservation efforts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Temperature Trend */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Temperature Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                  labelFormatter={(value) => `Year: ${value}`}
                  formatter={(value, name) => [`${value}°C`, 'Temperature']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Salinity vs pH */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Salinity vs pH Correlation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={yearlyAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="salinity" name="Salinity" unit=" PSU" stroke="#9CA3AF" />
                <YAxis dataKey="phLevel" name="pH" stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [value, name === 'phLevel' ? 'pH Level' : 'Salinity']}
                />
                <Scatter 
                  dataKey="phLevel" 
                  fill="#3b82f6" 
                  r={6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-parameter Area Chart */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 lg:col-span-2 border border-gray-700">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Multi-Parameter Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={yearlyAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="#fca5a5" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="salinity" 
                  stackId="2" 
                  stroke="#3b82f6" 
                  fill="#93c5fd" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="oxygenLevel" 
                  stackId="3" 
                  stroke="#10b981" 
                  fill="#86efac" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Yearly Averages Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Temperature (°C)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Salinity (PSU)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Oxygen (μmol/kg)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">pH</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Avg Depth (m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {yearlyAverages.map((row, index) => (
                  <tr key={row.year} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{row.year}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{row.temperature}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{row.salinity}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{row.oxygenLevel}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{row.phLevel}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">{row.depth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgoDataAnalyzer;
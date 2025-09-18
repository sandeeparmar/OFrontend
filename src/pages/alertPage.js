import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Mail, MessageSquare, Activity, AlertTriangle, CheckCircle, Settings, Play, Pause } from 'lucide-react';

const ArgoMonitoringSystem = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [scientists, setScientists] = useState([
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@oceaninst.edu', phone: '+1-555-0101', active: true },
    { id: 2, name: 'Dr. Mike Chen', email: 'mike.chen@marinelab.org', phone: '+1-555-0102', active: true },
    { id: 3, name: 'Dr. Emma Rodriguez', email: 'emma.rodriguez@oceanresearch.com', phone: '+1-555-0103', active: false }
  ]);
  const [thresholds, setThresholds] = useState({
    temperature: { min: 2, max: 30, changeRate: 2.0 },
    salinity: { min: 30, max: 40, changeRate: 1.0 },
    pressure: { min: 0, max: 2000, changeRate: 50 },
    oxygen: { min: 0, max: 300, changeRate: 20 }
  });
  const [notificationMethods, setNotificationMethods] = useState({
    email: true,
    sms: true
  });
  const [lastAlertTime, setLastAlertTime] = useState({});
  const intervalRef = useRef(null);
  const dataHistoryRef = useRef([]);

  // Simulate real Argo data with realistic oceanographic values
  const generateArgoData = () => {
    const now = new Date();
    const baseTemp = 15 + Math.sin(Date.now() / 100000) * 10; // Seasonal variation
    const baseSalinity = 35 + Math.sin(Date.now() / 80000) * 2;
    const basePressure = 100 + Math.random() * 500;
    const baseOxygen = 200 + Math.sin(Date.now() / 120000) * 50;

    // Add some random spikes occasionally to trigger alerts
    const shouldSpike = Math.random() < 0.15; // 15% chance of spike
    const spikeMultiplier = shouldSpike ? (1 + (Math.random() * 0.5)) : 1;

    return {
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString(),
      temperature: parseFloat((baseTemp * spikeMultiplier + (Math.random() - 0.5) * 2).toFixed(2)),
      salinity: parseFloat((baseSalinity * spikeMultiplier + (Math.random() - 0.5) * 1).toFixed(2)),
      pressure: parseFloat((basePressure + (Math.random() - 0.5) * 100).toFixed(1)),
      oxygen: parseFloat((baseOxygen + (Math.random() - 0.5) * 40).toFixed(1)),
      depth: parseFloat((200 + Math.random() * 300).toFixed(1)),
      latitude: parseFloat((25.5 + (Math.random() - 0.5) * 0.1).toFixed(4)),
      longitude: parseFloat((-80.2 + (Math.random() - 0.5) * 0.1).toFixed(4))
    };
  };

  // Check for drastic changes in parameters
  const analyzeDataChanges = (newData, previousData) => {
    if (!previousData || previousData.length < 2) return [];

    const alerts = [];
    const latest = newData;
    const previous = previousData[previousData.length - 1];
    const beforePrevious = previousData[previousData.length - 2];

    const parameters = ['temperature', 'salinity', 'pressure', 'oxygen'];

    parameters.forEach(param => {
      const currentValue = latest[param];
      const previousValue = previous[param];
      const beforePreviousValue = beforePrevious[param];

      // Check for threshold violations
      const threshold = thresholds[param];
      if (currentValue < threshold.min || currentValue > threshold.max) {
        alerts.push({
          type: 'threshold_violation',
          parameter: param,
          value: currentValue,
          threshold: currentValue < threshold.min ? `minimum (${threshold.min})` : `maximum (${threshold.max})`,
          severity: 'high',
          message: `${param.toUpperCase()} value ${currentValue} exceeds ${currentValue < threshold.min ? 'minimum' : 'maximum'} threshold`
        });
      }

      // Check for rapid changes
      const changeRate = Math.abs(currentValue - previousValue);
      const previousChangeRate = Math.abs(previousValue - beforePreviousValue);
      
      if (changeRate > threshold.changeRate) {
        alerts.push({
          type: 'rapid_change',
          parameter: param,
          value: currentValue,
          previousValue: previousValue,
          changeRate: changeRate.toFixed(2),
          severity: changeRate > threshold.changeRate * 2 ? 'critical' : 'medium',
          message: `Rapid ${param.toUpperCase()} change detected: ${changeRate.toFixed(2)} units in 5 seconds`
        });
      }

      // Check for accelerating trends
      if (changeRate > previousChangeRate * 1.5 && changeRate > threshold.changeRate * 0.5) {
        alerts.push({
          type: 'accelerating_trend',
          parameter: param,
          value: currentValue,
          trend: currentValue > previousValue ? 'increasing' : 'decreasing',
          severity: 'medium',
          message: `Accelerating ${currentValue > previousValue ? 'increase' : 'decrease'} in ${param.toUpperCase()}`
        });
      }
    });

    return alerts;
  };

  // Simulate sending notifications
  const sendNotifications = async (alerts) => {
    const activeScientists = scientists.filter(s => s.active);
    
    for (const alert of alerts) {
      // Prevent spam - only send alerts for same parameter once every 30 seconds
      const alertKey = `${alert.parameter}_${alert.type}`;
      const now = Date.now();
      if (lastAlertTime[alertKey] && (now - lastAlertTime[alertKey] < 30000)) {
        continue;
      }

      setLastAlertTime(prev => ({ ...prev, [alertKey]: now }));

      const notificationPromises = activeScientists.map(async (scientist) => {
        const notifications = [];
        
        if (notificationMethods.email) {
          // Simulate email sending
          await new Promise(resolve => setTimeout(resolve, 100));
          notifications.push({
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            type: 'email',
            recipient: scientist.email,
            subject: `ALERT: Argo Data Anomaly - ${alert.parameter.toUpperCase()}`,
            message: `${alert.message}. Current value: ${alert.value}. Location: ${currentData[currentData.length - 1]?.latitude}, ${currentData[currentData.length - 1]?.longitude}`,
            status: 'sent',
            severity: alert.severity,
            scientist: scientist.name,
            alert: alert
          });
        }

        if (notificationMethods.sms) {
          // Simulate SMS sending
          await new Promise(resolve => setTimeout(resolve, 150));
          notifications.push({
            id: Date.now() + Math.random() + 1000,
            timestamp: new Date().toISOString(),
            type: 'sms',
            recipient: scientist.phone,
            message: `ARGO ALERT: ${alert.parameter.toUpperCase()} anomaly detected. Value: ${alert.value}. Check email for details.`,
            status: 'sent',
            severity: alert.severity,
            scientist: scientist.name,
            alert: alert
          });
        }

        return notifications;
      });

      const allNotifications = await Promise.all(notificationPromises);
      const flatNotifications = allNotifications.flat();
      
      setNotifications(prev => [
        ...flatNotifications,
        ...prev
      ].slice(0, 100)); // Keep only last 100 notifications
    }
  };

  // Main monitoring loop
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        const newDataPoint = generateArgoData();
        
        setCurrentData(prevData => {
          const updatedData = [...prevData, newDataPoint].slice(-50); // Keep last 50 points
          dataHistoryRef.current = updatedData;
          
          // Analyze for alerts
          const alerts = analyzeDataChanges(newDataPoint, prevData);
          if (alerts.length > 0) {
            sendNotifications(alerts);
          }
          
          return updatedData;
        });
      }, 5000); // Update every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, scientists, thresholds, notificationMethods]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const toggleScientist = (id) => {
    setScientists(prev => prev.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Argo Ocean Data Monitoring System</h1>
                <p className="text-gray-600">Real-time monitoring and alert system for oceanographic parameters</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
                </span>
              </div>
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMonitoring 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Data Visualization */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Values */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Measurements</h2>
              {currentData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Temperature</div>
                    <div className="text-2xl font-bold text-red-700">
                      {currentData[currentData.length - 1]?.temperature}°C
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Salinity</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {currentData[currentData.length - 1]?.salinity} PSU
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Pressure</div>
                    <div className="text-2xl font-bold text-green-700">
                      {currentData[currentData.length - 1]?.pressure} dbar
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Oxygen</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {currentData[currentData.length - 1]?.oxygen} μmol/kg
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Charts */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Parameter Trends</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature (°C)" />
                    <Line type="monotone" dataKey="salinity" stroke="#3b82f6" strokeWidth={2} name="Salinity (PSU)" />
                    <Line type="monotone" dataKey="pressure" stroke="#10b981" strokeWidth={2} name="Pressure (dbar)" />
                    <Line type="monotone" dataKey="oxygen" stroke="#8b5cf6" strokeWidth={2} name="Oxygen (μmol/kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Scientists Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Scientists</h2>
              </div>
              <div className="space-y-3">
                {scientists.map(scientist => (
                  <div key={scientist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{scientist.name}</div>
                      <div className="text-sm text-gray-600">{scientist.email}</div>
                    </div>
                    <button
                      onClick={() => toggleScientist(scientist.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                        scientist.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {scientist.active ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full bg-gray-400" />}
                      {scientist.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-900 mb-2">Notification Methods</div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={notificationMethods.email}
                      onChange={(e) => setNotificationMethods(prev => ({...prev, email: e.target.checked}))}
                      className="rounded border-gray-300"
                    />
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={notificationMethods.sms}
                      onChange={(e) => setNotificationMethods(prev => ({...prev, sms: e.target.checked}))}
                      className="rounded border-gray-300"
                    />
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">SMS Notifications</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No notifications sent yet</p>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${getSeverityColor(notification.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {notification.type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                          <div>
                            <div className="font-medium text-sm">{notification.scientist}</div>
                            <div className="text-xs opacity-80">{notification.recipient}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase">{notification.severity}</span>
                        </div>
                      </div>
                      <div className="text-sm mt-2 opacity-90">{notification.message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgoMonitoringSystem;
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Mail, MessageSquare, Activity, AlertTriangle, CheckCircle, Settings, Play, Pause, Send } from 'lucide-react';
import axios from 'axios';

const ArgoMonitoringSystem = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [emailStatus, setEmailStatus] = useState({ sending: false, lastSent: null });
  const [scientists, setScientists] = useState([
    { id: 1, name: 'Dr. Sandeep Parmar', email: '23bit062@ietdavv.edu.in', phone: '+1-555-0101', active: true },
    { id: 2, name: 'Dr. Jay Dhangi ', email: '23bit062@ietdavv.edu.in', phone: '+1-555-0102', active: true },
    { id: 3, name: 'Dr. Monu ', email: '23bit062@ietdavv.edu.in', phone: '+1-555-0103', active: false }
  ]);

  const [thresholds, setThresholds] = useState({
    temperature: { min: 2, max: 25, changeRate: 2.0 },
    salinity: { min: 32, max: 38, changeRate: 1.0 },
    pressure: { min: 0, max: 400, changeRate: 50 },
    oxygen: { min: 150, max: 280, changeRate: 20 }
  });
  
  const [notificationMethods, setNotificationMethods] = useState({
    email: true,
    sms: true
  });
  const [lastAlertTime, setLastAlertTime] = useState({});
  const intervalRef = useRef(null);
  const dataHistoryRef = useRef([]);

  // Enhanced email sending function with real-time capability
  const sendRealTimeEmail = async (alert, dataPoint, scientist) => {
    setEmailStatus(prev => ({ ...prev, sending: true }));
    
    try {
      // Simulate real email API call - replace with actual email service
      const emailData = {
        to: scientist.email,
        subject: `🚨 URGENT: Argo Data Alert - ${alert.parameter.toUpperCase()} Threshold Exceeded`,
        body: `
          ALERT DETAILS:
          ================
          Parameter: ${alert.parameter.toUpperCase()}
          Current Value: ${alert.value}
          Threshold: ${alert.threshold}
          Severity: ${alert.severity.toUpperCase()}
          
          LOCATION:
          Latitude: ${dataPoint.latitude}°
          Longitude: ${dataPoint.longitude}°
          Depth: ${dataPoint.depth}m
          
          MESSAGE: ${alert.message}
          
          Time: ${new Date().toLocaleString()}
          
          This is an automated alert from the Argo Monitoring System.
          Please check the system dashboard for real-time data.
        `,
        timestamp: new Date().toISOString()
      };

      // In a real implementation, you would call your email service here:
      const response = await axios.post( 'http://localhost:4000/sendEmail', emailData);
    console.log(response);

      setEmailStatus(prev => ({ 
        sending: false, 
        lastSent: new Date().toISOString() 
      }));

      return {
        success: true,
        emailData
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      setEmailStatus(prev => ({ ...prev, sending: false }));
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Simulate real Argo data with higher chance of threshold violations for demo
  const generateArgoData = () => {
    const now = new Date();
    const baseTemp = 15 + Math.sin(Date.now() / 100000) * 10;
    const baseSalinity = 35 + Math.sin(Date.now() / 80000) * 2;
    const basePressure = 200 + Math.random() * 300;
    const baseOxygen = 200 + Math.sin(Date.now() / 120000) * 50;

    // Higher chance of threshold violations for demonstration
    const shouldViolateThreshold = Math.random() < 0.25; // 25% chance
    let temp = baseTemp + (Math.random() - 0.5) * 4;
    let salinity = baseSalinity + (Math.random() - 0.5) * 2;
    let pressure = basePressure + (Math.random() - 0.5) * 200;
    let oxygen = baseOxygen + (Math.random() - 0.5) * 80;

    // Occasionally generate values that exceed thresholds
    if (shouldViolateThreshold) {
      const param = Math.floor(Math.random() * 4);
      switch (param) {
        case 0: // Temperature
          temp = Math.random() < 0.5 ? 1.5 : 26; // Below min or above max
          break;
        case 1: // Salinity
          salinity = Math.random() < 0.5 ? 31 : 39; // Below min or above max
          break;
        case 2: // Pressure
          pressure = Math.random() < 0.5 ? -5 : 450; // Below min or above max
          break;
        case 3: // Oxygen
          oxygen = Math.random() < 0.5 ? 140 : 290; // Below min or above max
          break;
      }
    }

    return {
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString(),
      temperature: parseFloat(temp.toFixed(2)),
      salinity: parseFloat(salinity.toFixed(2)),
      pressure: parseFloat(pressure.toFixed(1)),
      oxygen: parseFloat(oxygen.toFixed(1)),
      depth: parseFloat((200 + Math.random() * 300).toFixed(1)),
      latitude: parseFloat((25.5 + (Math.random() - 0.5) * 0.1).toFixed(4)),
      longitude: parseFloat((-80.2 + (Math.random() - 0.5) * 0.1).toFixed(4))
    
    };
  };

  // Enhanced alert detection with immediate email sending
  const analyzeDataAndSendAlerts = async (newData, previousData) => {
    if (!previousData || previousData.length < 1) return [];

    const alerts = [];
    const latest = newData;
    const previous = previousData[previousData.length - 1];

    const parameters = ['temperature', 'salinity', 'pressure', 'oxygen'];

    for (const param of parameters) {
      const currentValue = latest[param];
      const threshold = thresholds[param];

      // Check for threshold violations (HIGH PRIORITY - IMMEDIATE EMAIL)
      if (currentValue < threshold.min || currentValue > threshold.max) {
        const alertKey = `${param}_threshold_violation`;
        const now = Date.now();
        
        // Prevent spam - only send alerts for same parameter once every 60 seconds for threshold violations
        if (!lastAlertTime[alertKey] || (now - lastAlertTime[alertKey] > 60000)) {
          const alert = {
            type: 'threshold_violation',
            parameter: param,
            value: currentValue,
            threshold: currentValue < threshold.min ? `minimum (${threshold.min})` : `maximum (${threshold.max})`,
            severity: 'critical',
            message: `${param.toUpperCase()} value ${currentValue} exceeds ${currentValue < threshold.min ? 'minimum' : 'maximum'} threshold`,
            requiresImmediateEmail: true
          };

          alerts.push(alert);
          setLastAlertTime(prev => ({ ...prev, [alertKey]: now }));

          // Send immediate emails to active scientists
          const activeScientists = scientists.filter(s => s.active);
          if (notificationMethods.email && activeScientists.length > 0) {
            for (const scientist of activeScientists) {
              try {
                const emailResult = await sendRealTimeEmail(alert, latest, scientist);
                
                // Add notification to the list
                const notification = {
                  id: Date.now() + Math.random(),
                  timestamp: new Date().toISOString(),
                  type: 'email',
                  recipient: scientist.email,
                  subject: `CRITICAL ALERT: ${param.toUpperCase()} Threshold Exceeded`,
                  message: alert.message,
                  status: emailResult.success ? 'sent' : 'failed',
                  severity: alert.severity,
                  scientist: scientist.name,
                  alert: alert,
                  realTime: true
                };

                setNotifications(prev => [notification, ...prev].slice(0, 100));
              } catch (error) {
                console.error('Error sending real-time email:', error);
              }
            }
          }
        }
      }

      // Check for rapid changes (MEDIUM PRIORITY)
      if (previous) {
        const changeRate = Math.abs(currentValue - previous[param]);
        
        if (changeRate > threshold.changeRate) {
          const alertKey = `${param}_rapid_change`;
          const now = Date.now();
          
          if (!lastAlertTime[alertKey] || (now - lastAlertTime[alertKey] > 30000)) {
            alerts.push({
              type: 'rapid_change',
              parameter: param,
              value: currentValue,
              previousValue: previous[param],
              changeRate: changeRate.toFixed(2),
              severity: changeRate > threshold.changeRate * 2 ? 'high' : 'medium',
              message: `Rapid ${param.toUpperCase()} change detected: ${changeRate.toFixed(2)} units in 5 seconds`,
              requiresImmediateEmail: false
            });
            
            setLastAlertTime(prev => ({ ...prev, [alertKey]: now }));
          }
        }
      }

    }

    return alerts;
  };

  // Main monitoring loop with real-time alerts
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(async () => {
        const newDataPoint = generateArgoData();
        
        // First, analyze for alerts before updating state
        const alerts = await analyzeDataAndSendAlerts(newDataPoint, dataHistoryRef.current);
        
        setCurrentData(prevData => {
          const updatedData = [...prevData, newDataPoint].slice(-50);
          dataHistoryRef.current = updatedData;
          return updatedData;
        });

        // Handle non-critical alerts (SMS, regular notifications)
        const nonCriticalAlerts = alerts.filter(alert => !alert.requiresImmediateEmail);
        if (nonCriticalAlerts.length > 0) {
          sendRegularNotifications(nonCriticalAlerts, newDataPoint);
        }
      }, 3000); // Check every 3 seconds for more responsive monitoring
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

  // Regular notifications for non-critical alerts
  const sendRegularNotifications = async (alerts, dataPoint) => {
    const activeScientists = scientists.filter(s => s.active);
    
    for (const alert of alerts) {
      for (const scientist of activeScientists) {
        const notifications = [];
        
        if (notificationMethods.sms) {
          notifications.push({
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            type: 'sms',
            recipient: scientist.phone,
            message: `ARGO ALERT: ${alert.parameter.toUpperCase()} anomaly detected. Value: ${alert.value}`,
            status: 'sent',
            severity: alert.severity,
            scientist: scientist.name,
            alert: alert,
            realTime: false
          });
        }

        setNotifications(prev => [...notifications, ...prev].slice(0, 100));
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-300 bg-red-900/30 border-red-700';
      case 'high': return 'text-orange-300 bg-orange-900/30 border-orange-700';
      case 'medium': return 'text-yellow-300 bg-yellow-900/30 border-yellow-700';
      default: return 'text-blue-300 bg-blue-900/30 border-blue-700';
    }
  };

  const toggleScientist = (id) => {
    setScientists(prev => prev.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const updateThreshold = (param, type, value) => {
    setThresholds(prev => ({
      ...prev,
      [param]: {
        ...prev[param],
        [type]: parseFloat(value)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 pt-20 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Argo Ocean Data Monitoring System</h1>
                <p className="text-gray-400">Real-time monitoring with immediate email alerts for threshold violations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Email Status Indicator */}
              {emailStatus.sending && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-orange-900/30 text-orange-300">
                  <Send className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Sending Alert...</span>
                </div>
              )}
              
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isMonitoring ? 'bg-green-900/30 text-green-300' : 'bg-gray-700 text-gray-400'
              }`}>
                <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
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
            
            {/* Current Values with Threshold Indicators */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Current Measurements</h2>
              {currentData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['temperature', 'salinity', 'pressure', 'oxygen'].map((param, index) => {
                    const colors = ['red', 'blue', 'green', 'purple'];
                    const units = ['°C', 'PSU', 'dbar', 'μmol/kg'];
                    const currentValue = currentData[currentData.length - 1]?.[param];
                    const threshold = thresholds[param];
                    const isViolation = currentValue < threshold.min || currentValue > threshold.max;
                    
                    return (
                      <div key={param} className={`p-4 rounded-lg ${isViolation ? 'ring-2 ring-red-500 bg-red-900/20' : `bg-gradient-to-r from-${colors[index]}-900/20 to-${colors[index]}-800/30`}`}>
                        <div className={`text-sm font-medium flex items-center justify-between ${isViolation ? 'text-red-300' : `text-${colors[index]}-300`}`}>
                          <span>{param.charAt(0).toUpperCase() + param.slice(1)}</span>
                          {isViolation && <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div className={`text-2xl font-bold ${isViolation ? 'text-red-300' : `text-${colors[index]}-300`}`}>
                          {currentValue}{units[index]}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Range: {threshold.min} - {threshold.max}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Charts */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Parameter Trends</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        borderColor: '#4B5563',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                    <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} name="Temperature (°C)" />
                    <Line type="monotone" dataKey="salinity" stroke="#3B82F6" strokeWidth={2} name="Salinity (PSU)" />
                    <Line type="monotone" dataKey="pressure" stroke="#10B981" strokeWidth={2} name="Pressure (dbar)" />
                    <Line type="monotone" dataKey="oxygen" stroke="#8B5CF6" strokeWidth={2} name="Oxygen (μmol/kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Threshold Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(thresholds).map(([param, values]) => (
                  <div key={param} className="space-y-3">
                    <h3 className="font-medium text-white capitalize">{param}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400">Min</label>
                        <input
                          type="number"
                          value={values.min}
                          onChange={(e) => updateThreshold(param, 'min', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400">Max</label>
                        <input
                          type="number"
                          value={values.max}
                          onChange={(e) => updateThreshold(param, 'max', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Scientists Panel */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Scientists</h2>
              </div>
              <div className="space-y-3">
                {scientists.map(scientist => (
                  <div key={scientist.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{scientist.name}</div>
                      <div className="text-sm text-gray-400">{scientist.email}</div>
                    </div>
                    <button
                      onClick={() => toggleScientist(scientist.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                        scientist.active 
                          ? 'bg-green-900/30 text-green-300' 
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {scientist.active ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full bg-gray-500" />}
                      {scientist.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-sm font-medium text-white mb-2">Notification Methods</div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={notificationMethods.email}
                      onChange={(e) => setNotificationMethods(prev => ({...prev, email: e.target.checked}))}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500"
                    />
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Real-time Email Alerts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={notificationMethods.sms}
                      onChange={(e) => setNotificationMethods(prev => ({...prev, sms: e.target.checked}))}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500"
                    />
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">SMS Notifications</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Recent Notifications</h2>
                <span className="bg-blue-900/30 text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
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
                            <div className="font-medium text-sm flex items-center space-x-2">
                              <span className="text-white">{notification.scientist}</span>
                              {notification.realTime && (
                                <span className="text-xs bg-red-900/30 text-red-300 px-1 rounded">REAL-TIME</span>
                              )}
                            </div>
                            <div className="text-xs opacity-80 text-gray-400">{notification.recipient}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase text-white">{notification.severity}</span>
                        </div>
                      </div>
                      <div className="text-sm mt-2 opacity-90 text-gray-300">{notification.message}</div>
                      <div className="text-xs opacity-70 mt-1 flex items-center justify-between text-gray-400">
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          notification.status === 'sent' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                        }`}>
                          {notification.status}
                        </span>
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
import React, { useState, useEffect } from 'react';
import ReminderChecker from './components/ReminderChecker';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScheduleDashboard from './components/ScheduleDashboard';
import DealerColorAdmin from './components/DealerColorAdmin';
import AICharts from './pages/AICharts';
import LoadingOverlay from './components/LoadingOverlay';
import { fetchScheduleData, mockScheduleData } from './data/scheduleData';

function App() {
  const [activeView, setActiveView] = useState('schedule');
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom menu items including Schedule
  const menuItems = [
    { 
      id: 'schedule', 
      name: 'Schedule', 
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    { 
      id: 'ai-charts', 
      name: 'AI Charts', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    { 
      id: 'schedule-admin', 
      name: 'Schedule Admin', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    },
  ];

  // Set default zoom level
  useEffect(() => {
    // Set the default zoom level to 125%
    document.body.style.zoom = "125%";
    
    // Clean up function to reset zoom when component unmounts
    return () => {
      document.body.style.zoom = "100%";
    };
  }, []);

  // Fetch schedule data from Firebase
  useEffect(() => {
    const getScheduleData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch data from Firebase
        try {
          const firebaseData = await fetchScheduleData();
          setScheduleData(firebaseData);
        } catch (firebaseError) {
          console.error("Error fetching from Firebase, using mock data:", firebaseError);
          // Fall back to mock data if Firebase fetch fails
          setScheduleData(mockScheduleData);
        }
      } catch (err) {
        console.error("Fatal error fetching schedule data:", err);
        setError("Failed to load schedule data. Please try again later.");
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };

    getScheduleData();
  }, []);

  const handleMenuClick = (itemId) => {
    setActiveView(itemId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {/* Horizontal navigation bar */}
      <div className="bg-white shadow-sm p-2 flex flex-wrap justify-center">
        <nav className="flex">
          <ul className="flex space-x-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    activeView === item.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Main content area with full width */}
      <main className="flex-1 p-4 overflow-auto">
        <LoadingOverlay isLoading={loading} message="Loading dashboard data..." />
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <ReminderChecker data={scheduleData} />
            {activeView === 'schedule' && <ScheduleDashboard data={scheduleData} />}
            {activeView === 'ai-charts' && <AICharts data={scheduleData} />}
            {activeView === 'schedule-admin' && <DealerColorAdmin data={scheduleData} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
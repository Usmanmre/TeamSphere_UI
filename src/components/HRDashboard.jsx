import React from 'react';
import { FaUsers, FaRegCalendarAlt, FaClipboardList, FaPlus } from 'react-icons/fa';
import { useNavigate } from "react-router";
import { NavLink, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const HRDashboard = () => {
    let navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 shadow-lg hidden md:block">
  <div className="p-6 text-2xl font-extrabold text-blue-400 tracking-wide">
    HR Portal
  </div>
  <nav className="mt-6 space-y-3">
    <NavLink
      to="/hr/dashboard"
      className={({ isActive }) =>
        `block py-3 px-6 rounded-lg transition ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-blue-600 hover:text-white'
        }`
      }
    >
      Dashboard
    </NavLink>
    <NavLink
      to="/job-list"
      className={({ isActive }) =>
        `block py-3 px-6 rounded-lg transition ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-blue-600 hover:text-white'
        }`
      }
    >
      Jobs Listing
    </NavLink>
 
  </nav>
</aside>


      {/* Main content */}
      <main className="flex-1">
        {/* Topbar */}
        <Navbar/>
  
        {/* Stats */}
        <div className='p-8'>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-400 uppercase tracking-wide">
                  Total Employees
                </h2>
                <p className="text-4xl font-extrabold text-white">128</p>
              </div>
              <FaUsers className="text-blue-500 text-5xl" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-400 uppercase tracking-wide">
                  Upcoming Meetings
                </h2>
                <p className="text-4xl font-extrabold text-white">5</p>
              </div>
              <FaRegCalendarAlt className="text-blue-500 text-5xl" />
            </div>
          </div>

          {/* <div className="bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-400 uppercase tracking-wide">
                  Tasks Pending
                </h2>
                <p className="text-4xl font-extrabold text-white">12</p>
              </div>
              <FaClipboardList className="text-blue-500 text-5xl" />
            </div>
          </div> */}
        </section>
        </div>

      </main>
    </div>
  );
};

export default HRDashboard;

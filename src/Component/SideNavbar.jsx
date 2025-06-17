import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiHome, FiCreditCard, FiUsers, FiPackage, FiFileText, FiArchive,
  FiDollarSign, FiPieChart, FiSettings, FiUser, FiCloud,FiLogOut,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';


const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <li
    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    onClick={onClick}
  >
    <Icon className="text-lg" />
    {!label ? null : <span className="ml-3 font-medium">{label}</span>}
  </li>
);

const SideNavbar = ({ activeItem, setActivePage }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [company, setCompany] = useState({ name: 'Company Name' });
  const [admin, setAdmin] = useState({ name: 'User Name' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/companies')
      .then(res => {
        if (res.data.length > 0) {
          setCompany(res.data[0]);
          setAdmin(res.data[0]?.admin || { name: 'User Name' });
        }
      })
      .catch(err => console.error('Error fetching company data:', err));
  }, []);

  const navItems = [
    { icon: FiHome, label: 'Dashboard' },
    { icon: FiCreditCard, label: 'Billing / Invoices' },
    { icon: FiUsers, label: 'Customers' },
    { icon: FiPackage, label: 'Products' },
    { icon: FiArchive, label: 'Product Stock List' },
    { icon: FiDollarSign, label: 'Stock Summary' },
    { icon: FiPieChart, label: 'Reports' },
    { icon: FiSettings, label: 'Settings' },
    { icon: FiUser, label: 'Admin Management' },
    { icon: FiCloud, label: 'Backup / Sync' }
  ];

  return (
    <aside className={`flex flex-col h-screen bg-white border-r transition-all duration-300 ${collapsed ? 'w-24' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
  
        {!collapsed && (
          <div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800 truncate">
              {company.businessName}
            </h1>          
          </div>
        )}

      <div className="flex items-center ">

          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden">
              <img
                src={`http://localhost:5000${company.logoUrl}`}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
            {!collapsed && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold shadow-sm">
                ✓
              </div>
            )}
          </div>

          <button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className="ml-2 p-2 rounded-lg bg-white text-gray-500 shadow-sm hover:shadow-md"
          >
            {collapsed ? <FiChevronRight size={18}  /> : <FiChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {navItems.map(({ icon, label }) => (
            <NavItem
              key={label}
              icon={icon}
              label={!collapsed ? label : ''}
              active={activeItem === label}
              onClick={() => setActivePage(label)}
            />
          ))}
        </ul>
      </nav>

      {/* Profile UI – clickable to activate 'admin-profile' */}
        <div className="border-t border-gray-100 p-3 bg-gradient-to-r from-gray-50 to-blue-50">
        {!collapsed ? (
          <div 
            whileHover={{ scale: 1.01 }}
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${activeItem === 'User Management' ? 
              'bg-white shadow-md' : 'hover:bg-white hover:shadow-sm'
            }`}
            onClick={() => setActivePage('User Management')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
                {admin.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">
                <FiUser size={8} />
              </div>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
              <p className="text-xs text-gray-500 flex items-center">
                <span>Admin</span>
              
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2">
            <div 
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow cursor-pointer"
              onClick={() => setActivePage('User Management')}
            >
              {admin.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        )}       
      </div>
    </aside>
  );
};
export default SideNavbar;

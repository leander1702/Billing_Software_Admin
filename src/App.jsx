import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import LoginPage from './Component/LoginPage';
import SignupPage from './Component/Pages/SignupPage';
import SideNavbar from './Component/SideNavbar';

import Dashboard from './Component/Pages/Dashboard';
import Products from './Component/Pages/Products';
import Customers from './Component/Pages/Customers';
import ProductStockList from './Component/Pages/ProductStockList';
import StockDashboard from './Component/Pages/StockDashboard';
import AdminProfile from './Component/Pages/AdminProfile'; 
import UserManagement from './Component/Pages/UserManagement';

const MainLayout = ({ activePage, setActivePage }) => (
  <div className="flex h-screen bg-gray-50">
    <SideNavbar activeItem={activePage} setActivePage={setActivePage} />
    <main className="flex-1 overflow-auto p-3">
      {activePage === 'Dashboard' && <Dashboard />}
      {activePage === 'Products' && <Products />}
      {activePage === 'Customers' && <Customers />}
      {activePage === 'Product Stock List' && <ProductStockList />}
      {activePage === 'Stock Summary' && <StockDashboard />}
      {activePage === 'Admin Management' && <AdminProfile />}
      {activePage === 'User Management' && <UserManagement />}
    </main>
  </div>
);

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/admin"
          element={<MainLayout activePage={activePage} setActivePage={setActivePage} />}/>        
      </Routes>
    </Router>
  );
}
export default App;

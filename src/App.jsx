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
import TopNavbar from './Component/TopNavbar';
import BillingInvoices from './Component/Pages/BillingInvoices';
import { ToastContainer } from 'react-toastify';
import ProfitReport from './Component/Pages/ProfitReport';
import SellerExpenseList from './Component/Pages/SellerExpenseList';
import CreditDue from './Component/Pages/CreditDue';


const MainLayout = ({ activePage, setActivePage }) => (
  <div className="flex flex-col h-screen overflow-hidden">

    <TopNavbar setActivePage={setActivePage} />
    <div className="flex flex-1 overflow-hidden">
      <SideNavbar activeItem={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto p-4">
        {activePage === 'Dashboard' && <Dashboard />}
        {activePage === 'Products' && <Products />}
        {activePage === 'Billing / Invoices' && <BillingInvoices />}
        {activePage === 'Customers' && <Customers />}
        {activePage === 'Credit Dues' && <CreditDue />}
        {activePage === 'Product Stock List' && <ProductStockList />}
        {activePage === 'Stock Summary' && <StockDashboard />}
        {activePage === 'ProfitReport' && <ProfitReport />}
        {activePage === 'Expense Menu' && <SellerExpenseList />}
        {activePage === 'Admin Management' && <AdminProfile />}
        {activePage === 'User Management' && <UserManagement setActivePage={setActivePage} />}
      </main>
    </div>
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
          element={<>
            <MainLayout activePage={activePage} setActivePage={setActivePage} />
            {/* <ToastContainer /> */}
          </>}
        />
      </Routes>
    </Router>
  );
}
export default App;

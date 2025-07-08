import React, { useEffect, useState } from 'react';
import { FiPackage, FiTrendingUp, FiAlertTriangle, FiCalendar, FiClock, FiLoader } from 'react-icons/fi';

const StockDashboard = () => {
  const [stockSummary, setStockSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stock-summary');
        const data = await res.json();
        setStockSummary(data);
      } catch (err) {
        console.error('Failed to load stock summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStockSummary();
  }, []);

  const filteredStock = stockSummary.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTime = true;
    if (timeFilter === 'recent') {
      // Assuming each item has a lastUploaded date
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchesTime = new Date(item.lastUploaded) > oneWeekAgo;
    }
    
    return matchesSearch && matchesTime;
  });

  const criticalStock = filteredStock.filter(item => item.remaining <= 2);
  const trendingStock = filteredStock.filter(item => item.totalSold >= 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-2xl text-blue-500 mr-2" />
        <span className="text-lg">Loading stock dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FiPackage className="mr-2" /> Stock Inventory Dashboard
          </h1>
          <p className="text-gray-600">Real-time stock overview and analytics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiPackage className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="recent">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium">Total Products</p>
              <h3 className="text-3xl font-bold mt-1">{filteredStock.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiPackage className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium">Critical Stock</p>
              <h3 className="text-3xl font-bold mt-1">{criticalStock.length}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiAlertTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium">Trending Products</p>
              <h3 className="text-3xl font-bold mt-1">{trendingStock.length}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiTrendingUp className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div> */}

      {/* Stock List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Product Inventory</h3>
          <p className="text-sm text-gray-500">
            Showing {filteredStock.length} of {stockSummary.length} products
          </p>
        </div>
        
        <div className="divide-y">
          {filteredStock.length > 0 ? (
            filteredStock.map((item, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4">
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <FiCalendar className="mr-1" />
                      <span className="mr-3">Last updated: {new Date(item.lastUploaded).toLocaleDateString()}</span>
                      <FiClock className="mr-1" />
                      <span>{new Date(item.lastUploaded).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Stock Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.remaining <= 2 ? 'bg-red-100 text-red-800' : 
                        item.remaining <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.remaining <= 2 ? 'Low' : item.remaining <= 10 ? 'Low' : 'High'}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          item.remaining <= 2 ? 'bg-red-500' : 
                          item.remaining <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${Math.min(100, (item.remaining / item.totalUploaded) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Uploaded</p>
                        <p className="font-medium">{item.totalUploaded}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sold</p>
                        <p className="font-medium text-blue-600">{item.totalSold}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className={`font-medium ${
                          item.remaining <= 2 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {item.remaining}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Manage Stock
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No products found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
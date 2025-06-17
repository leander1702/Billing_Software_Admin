// src/components/Admin/StockDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const StockDashboard = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  
const fetchStock = async () => {
  try {
    const res = await axios.get('/api/stock'); // ✅ Await here
    console.log('Stock Data:', res.data);
    setStockData(res.data);
  } catch (err) {
    console.error('Failed to fetch stock data:', err.message);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">📦 Stock Overview</h2>
      {loading ? (
        <p>Loading stock data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Product Code</th>
                <th className="px-3 py-2 border">Product Name</th>
                <th className="px-3 py-2 border">Total Quantity</th>
                <th className="px-3 py-2 border text-green-600">Available</th>
                <th className="px-3 py-2 border text-blue-600">Sold</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item) => (
                <tr key={item.productCode} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border">{item.productCode}</td>
                  <td className="px-3 py-2 border">{item.productName}</td>
                  <td className="px-3 py-2 border">{item.totalQuantity}</td>
                  <td className="px-3 py-2 border text-green-600">{item.availableQuantity}</td>
                  <td className="px-3 py-2 border text-blue-600">{item.sellingQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stockData.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No stock data found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StockDashboard;

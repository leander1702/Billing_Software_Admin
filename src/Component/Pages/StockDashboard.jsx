import React, { useEffect, useState } from 'react';

const StockDashboard = () => {
  const [stockSummary, setStockSummary] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-6 text-lg">Loading stock summary...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📦 Stock Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {stockSummary.map((item, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 shadow hover:shadow-md transition duration-300
              ${item.remaining <= 2 ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}
            `}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{item.productName}</h3>
                <p className="text-sm text-gray-500">Category: {item.category}</p>
              </div>
              <div className="text-right space-y-1 text-sm">
                <p>Total Uploaded: {item.totalUploaded}</p>
                <p>Sold: {item.totalSold}</p>
                <p className={`font-bold ${item.remaining <= 2 ? 'text-red-600' : 'text-green-700'}`}>
                  Remaining: {item.remaining}
                </p>
              </div>
            </div>

            {item.remaining <= 2 && (
              <p className="text-red-600 mt-2 text-sm font-medium">⚠️ Low stock</p>
            )}
            {item.totalSold >= 5 && (
              <p className="text-blue-600 mt-1 text-sm font-medium">🔥 High sales product</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockDashboard;

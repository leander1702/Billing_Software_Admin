import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
// Importing icons from lucide-react
import { Search, Plus, Eye, Edit, Bell, DollarSign, Users, Package, ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Notification Modal Component
const NotificationModal = ({ alerts, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-1/2 lg:w-1/2 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
        {alerts.length > 0 ? (
          <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {alerts.map((alert, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <span className="text-base font-medium text-gray-800">{alert.name}</span>
                <span className="text-base text-red-600 font-semibold">{alert.quantity} left</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No low stock alerts at the moment. Good job!</p>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [lessSellingProducts, setLessSellingProducts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [showTopSellingChart, setShowTopSellingChart] = useState(true);

  useEffect(() => {
    // Fetch bills data
    const fetchBills = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/bills');
        const data = await response.json();
        setBills(data);

        // Process data for dashboard
        processDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const processDashboardData = (billsData) => {
    const allProducts = billsData.flatMap(bill => bill.products);
    const productStock = {};
    const productSales = {};

    allProducts.forEach(product => {
      // For stock calculation
      if (!productStock[product.name]) {
        productStock[product.name] = product.quantity;
      } else {
        productStock[product.name] += product.quantity;
      }

      // For sales calculation
      if (!productSales[product.name]) {
        productSales[product.name] = product.quantity;
      } else {
        productSales[product.name] += product.quantity;
      }
    });

    // Low Stock Alerts (assuming quantity < 10 is low stock)
    const alerts = Object.entries(productStock)
      .filter(([_, quantity]) => quantity < 10)
      .map(([name, quantity]) => ({ name, quantity }));
    setLowStockAlerts(alerts);

    // Top Selling Products
    const topSelling = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
    setTopSellingProducts(topSelling);

    // Less Selling Products
    const lessSelling = Object.entries(productSales)
      .sort((a, b) => a[1] - b[1]) // Sort ascending for less selling
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
    setLessSellingProducts(lessSelling);

    // Monthly Revenue
    const monthlyRev = {};
    billsData.forEach(bill => {
      const month = new Date(bill.date).getMonth();
      if (!monthlyRev[month]) {
        monthlyRev[month] = bill.total;
      } else {
        monthlyRev[month] += bill.total;
      }
    });
    setMonthlyRevenue(monthlyRev);
  };

  // Calculate summary metrics
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
  const uniqueCustomers = new Set(bills.map(bill => bill.customer.id)).size;
  const allProductsInBills = bills.flatMap(bill => bill.products);
  const totalProductsInStock = allProductsInBills.reduce((sum, product) => sum + product.quantity, 0);

  // Prepare chart data for Monthly Revenue
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenueChartData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: months.map((_, index) => monthlyRevenue[index] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // Deeper blue
        borderColor: 'rgba(29, 78, 216, 1)', // Darker blue border
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
      },
    ],
  };

  const monthlyRevenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Monthly Revenue Overview',
        font: {
          size: 18,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
        color: '#333',
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 16,
          family: 'Inter, sans-serif',
        },
        bodyFont: {
          size: 14,
          family: 'Inter, sans-serif',
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `₹${context.parsed.y.toLocaleString()}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          color: '#555',
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          color: '#555',
          callback: function (value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
    }
  };

  // Prepare chart data for Product Sales (Pie Chart)
  const getProductChartData = (products) => ({
    labels: products.map(p => p.name),
    datasets: [
      {
        data: products.map(p => p.sales),
        backgroundColor: [
          '#3B82F6', // blue-500
          '#60A5FA', // blue-400
          '#93C5FD', // blue-300
          '#BFDBFE', // blue-200
          '#DBEAFE', // blue-100
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  });

  const productChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
          color: '#333',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 16,
          family: 'Inter, sans-serif',
        },
        bodyFont: {
          size: 14,
          family: 'Inter, sans-serif',
        },
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += `${context.parsed} units`;
            }
            return label;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };


  // Filter customers for the table
  const customers = bills.reduce((acc, bill) => {
    const existingCustomer = acc.find(c => c.id === bill.customer.id);
    if (!existingCustomer) {
      acc.push({
        id: bill.customer.id,
        name: bill.customer.name,
        totalSpent: bill.total,
        lastVisit: bill.date,
      });
    } else {
      existingCustomer.totalSpent += bill.total;
      if (new Date(bill.date) > new Date(existingCustomer.lastVisit)) {
        existingCustomer.lastVisit = bill.date;
      }
    }
    return acc;
  }, []).sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit)); // Sort by last visit

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200">
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowLowStockModal(true)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 relative"
            >
              <Bell className="h-5 w-5" />
              {lowStockAlerts.length > 0 && (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold animate-bounce">
                  {lowStockAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
              <Eye className="mr-2 h-4 w-4" />
              View Stock Summary
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow-md rounded-lg transform transition duration-300 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="ml-2 w-0 flex-1">
                      <dl>
                        <dt className="text-base font-medium text-gray-500 truncate">Total Revenue</dt>
                        <p className='text-xs font-medium text-gray-500 pb-2'>Last 30 days</p>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{totalRevenue.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 shadow-lg">
                      <DollarSign className="h-7 w-7 text-blue-800" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-md rounded-lg transform transition duration-300 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="ml-2 w-0 flex-1">
                      <dl>
                        <dt className="text-base font-medium text-gray-500 truncate">Total Bill</dt>
                        <p className='text-xs font-medium text-gray-500 pb-2'>Last 30 days</p>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-bold text-gray-900">
                            {totalBills}
                          </div>
                        </dd>
                      </dl>
                    </div>
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-2 shadow-lg">
                      <ShoppingCart className="h-7 w-7 text-green-800" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-md rounded-lg transform transition duration-300 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="ml-2 w-0 flex-1">
                      <dl>
                        <dt className="text-base font-medium text-gray-500 truncate">Total Customers</dt>
                        <p className='text-xs font-medium text-gray-500 pb-2'>Last 30 days</p>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-bold text-gray-900">
                            {uniqueCustomers}
                          </div>
                        </dd>
                      </dl>
                    </div>
                    <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2 shadow-lg">
                      <Users className="h-7 w-7 text-yellow-800" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-md rounded-lg transform transition duration-300 hover:scale-105">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="ml-2 w-0 flex-1">
                      <dl>
                        <dt className="text-base font-medium text-gray-500 truncate">Products in Stock </dt>
                        <p className='text-xs font-medium text-gray-500 pb-2'>Last 30 days</p>
                        <dd className="flex items-baseline">
                          <div className="text-lg font-bold text-gray-900">
                            {totalProductsInStock}
                          </div>
                        </dd>
                      </dl>
                    </div>
                    <div className="flex-shrink-0 bg-purple-100 rounded-full p-2 shadow-lg">
                      <Package className="h-7 w-7 text-purple-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="h-80">
                  <Bar data={monthlyRevenueChartData} options={monthlyRevenueChartOptions} />
                </div>
              </div>

              {/* Product Sales Charts (Top/Less Selling) */}
              <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {showTopSellingChart ? 'Top Selling Products' : 'Less Selling Products'}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowTopSellingChart(true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${showTopSellingChart
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      Top Selling
                    </button>
                    <button
                      onClick={() => setShowTopSellingChart(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${!showTopSellingChart
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      Less Selling
                    </button>
                  </div>
                </div>
                <div className="h-80 flex justify-center items-center">
                  {showTopSellingChart ? (
                    topSellingProducts.length > 0 ? (
                      <Pie data={getProductChartData(topSellingProducts)} options={productChartOptions} />
                    ) : (
                      <p className="text-gray-600">No top selling product data available.</p>
                    )
                  ) : (
                    lessSellingProducts.length > 0 ? (
                      <Pie data={getProductChartData(lessSellingProducts)} options={productChartOptions} />
                    ) : (
                      <p className="text-gray-600">No less selling product data available.</p>
                    )
                  )}
                </div>
              </div>

            </div>
            {/* Alerts and Customer Overview */}
            <div className="mb-8 '">
              {/* Low Stock Alerts */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200 bg-red-50">
                  <h3 className="text-lg leading-6 font-semibold text-red-800 flex items-center">
                    <Bell className="mr-2 h-5 w-5" /> Low Stock Alerts
                  </h3>
                </div>
                <div className="bg-white p-6">
                  {lowStockAlerts.length > 0 ? (
                    <ul className="divide-y divide-red-100">
                      {lowStockAlerts.map((alert, index) => (
                        <li key={index} className="py-3 flex justify-between items-center">
                          <div className="text-base font-medium text-gray-900">{alert.name}</div>
                          <div className="text-base text-red-600 font-semibold">Only {alert.quantity} left</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-gray-600 text-base">
                      All good! No low stock alerts.
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Overview */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-blue-50">
                  <h3 className="text-lg leading-6 font-semibold text-blue-800 flex items-center">
                    <Users className="mr-2 h-5 w-5" /> Customer Overview
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  {filteredCustomers.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Customer Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Total Spent
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Last Visit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredCustomers.slice(0, 5).map((customer, index) => (
                          <tr key={customer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-800">₹{customer.totalSpent.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {new Date(customer.lastVisit).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-6 text-gray-600 text-base">
                      No customers found matching your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Low Stock Notification Modal */}
      {showLowStockModal && (
        <NotificationModal
          alerts={lowStockAlerts}
          onClose={() => setShowLowStockModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

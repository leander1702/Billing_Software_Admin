import React, { useEffect, useState } from 'react';
import { Search, User, Phone, Calendar, ShoppingBag, DollarSign, X } from 'lucide-react'; // Importing icons

// Product Details Modal Component (reused and slightly adapted)
const ProductDetailsModal = ({ selectedBill, onClose }) => {
  if (!selectedBill) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0 animate-scaleIn">
        <div className="p-6">
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ShoppingBag className="mr-2 h-6 w-6 text-blue-600" /> Order Details
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Bill ID: <span className="font-semibold">{selectedBill._id.substring(selectedBill._id.length - 6)}</span> (Full ID: {selectedBill._id})
              </p>
              <p className="text-sm text-gray-500">
                Date: {new Date(selectedBill.date).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <User className="mr-1 h-4 w-4" /> Customer Information
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                <p className="text-base font-semibold text-gray-900">{selectedBill.customer.name}</p>
                <p className="text-sm text-gray-700 mt-1">ID: {selectedBill.customer.id}</p>
                <p className="text-sm text-gray-700 mt-1 flex items-center">
                  <Phone className="mr-1 h-4 w-4 text-gray-600" /> {selectedBill.customer.contact}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <DollarSign className="mr-1 h-4 w-4" /> Order Summary
              </h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Total Items:</span>
                  <span className="text-base font-semibold text-gray-900">{selectedBill.products.length}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-700">Grand Total:</span>
                  <span className="text-lg font-bold text-green-700">₹ {selectedBill.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <ShoppingBag className="mr-1 h-4 w-4" /> Products Purchased
            </h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {selectedBill.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">₹ {product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹ {(product.price * product.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white text-base font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const Customers = () => {
  const [customersData, setCustomersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch bills data from the API
    fetch('http://localhost:5000/api/bills')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const groupedCustomers = {};

        data.forEach(bill => {
          const customerId = bill.customer.id;
          if (!groupedCustomers[customerId]) {
            groupedCustomers[customerId] = {
              id: customerId,
              name: bill.customer.name,
              contact: bill.customer.contact,
              firstPurchaseDate: bill.date,
              lastPurchaseDate: bill.date,
              totalSpent: 0,
              totalBills: 0,
              bills: [] // Store all bills for this customer
            };
          }

          // Update aggregated data
          groupedCustomers[customerId].totalSpent += bill.total;
          groupedCustomers[customerId].totalBills += 1;
          if (new Date(bill.date) < new Date(groupedCustomers[customerId].firstPurchaseDate)) {
            groupedCustomers[customerId].firstPurchaseDate = bill.date;
          }
          if (new Date(bill.date) > new Date(groupedCustomers[customerId].lastPurchaseDate)) {
            groupedCustomers[customerId].lastPurchaseDate = bill.date;
          }
          groupedCustomers[customerId].bills.push(bill); // Add current bill to the customer's bills array
        });

        // Convert the grouped object back to an array
        setCustomersData(Object.values(groupedCustomers));
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
        setIsLoading(false);
      });
  }, []);

  // Function to open the product details modal
  const openProductDetails = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  // Function to close the product details modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
  };

  // Filtered customers based on search term
  const filteredCustomers = customersData.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h2 className="text-3xl font-bold text-gray-800">Registered Customers</h2>
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
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-600">Loading customer data...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <User className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">No customers found</h3>
            <p className="mt-2 text-gray-500">It looks like there are no customers matching your search, or no customers have been registered yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Total Bills
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Register Date
                    </th>
                    {/* Removed Last Purchase Header */}
                    {/* Removed Actions Header */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-blue-50 transition-colors duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {customer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-base shadow-sm">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'N/A'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {customer.contact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {customer.totalBills}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                        ₹ {customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(customer.firstPurchaseDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      {/* Removed Last Purchase Data Cell */}
                      {/* Removed Actions Data Cell */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Details Modal (for a single bill's details) */}
        {isModalOpen && (
          <ProductDetailsModal
            selectedBill={selectedBill}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default Customers;

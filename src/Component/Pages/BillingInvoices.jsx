import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react'; // Import X icon for the modal close button
import api from '../../service/api';

// Product Details Modal Component (reused and slightly adapted)
const ProductDetailsModal = ({ selectedBill, onClose }) => {
  if (!selectedBill) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Order Details (Bill ID: {selectedBill._id})</h3> {/* Changed to selectedBill._id */}
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedBill.date).toLocaleString('en-IN', {
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
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" /> {/* Using Lucide React X icon */}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedBill.customer.name}</p>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedBill.customer.id}</p>
                <p className="text-sm text-gray-500 mt-1">Contact: {selectedBill.customer.contact}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Subtotal:</span>
                  <span className="text-sm font-medium">₹ {selectedBill.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">Items:</span>
                  <span className="text-sm font-medium">{selectedBill.products.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Products Purchased</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedBill.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹ {product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
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
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const BillingInvoices = () => {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term
  const [filteredBills, setFilteredBills] = useState([]); // New state for filtered bills

  useEffect(() => {
  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/bills');
      setBills(data);
      setFilteredBills(data); // Initialize filtered bills with all bills
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching bills:', 
          error.response?.data?.message || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchBills();
}, []);

  // Effect to filter bills whenever searchTerm or bills change
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const currentFilteredBills = bills.filter(bill => {
      const customerName = bill.customer.name ? bill.customer.name.toLowerCase() : '';
      const customerId = bill.customer.id ? bill.customer.id.toLowerCase() : '';
      const customerContact = bill.customer.contact ? bill.customer.contact.toLowerCase() : '';
      const billIdLastSix = bill._id ? bill._id.substring(bill._id.length - 6).toLowerCase() : '';

      return (
        customerName.includes(lowerCaseSearchTerm) ||
        customerId.includes(lowerCaseSearchTerm) ||
        customerContact.includes(lowerCaseSearchTerm) ||
        billIdLastSix.includes(lowerCaseSearchTerm)
      );
    });
    setFilteredBills(currentFilteredBills);
  }, [searchTerm, bills]);

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

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-800">Customer Bills</h2>

          {/* Search Input + Record Count */}
          <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4 w-full sm:w-auto">
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

            {/* Record Count */}
            <div className="text-sm text-gray-600 pl-1 sm:pl-0">
              {filteredBills.length} {filteredBills.length === 1 ? 'Bill' : 'Bills'} 
            </div>
          </div>
        </div>




        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-600">Loading customer bills...</p>
          </div>
        ) : filteredBills.length === 0 && !searchTerm ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No customer records found</h3>
            <p className="mt-2 text-gray-500">It looks like no customer bills have been created yet. Start by adding new sales!</p>
          </div>
        ) : filteredBills.length === 0 && searchTerm ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No matching bills found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search term.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Bill ID column header */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Bill ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50"> {/* Changed key to bill._id */}
                      {/* Bill ID data cell */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill._id.substring(bill._id.length - 6)} {/* Displaying last 6 characters of _id */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* Optional: Customer initial circle or avatar */}
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                            {bill.customer.name ? bill.customer.name.charAt(0).toUpperCase() : 'N/A'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{bill.customer.name}</div>
                            <div className="text-sm text-gray-500">ID: {bill.customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.customer.contact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.products.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(bill.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          ₹ {bill.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openProductDetails(bill)}
                          className="text-blue-600 hover:text-blue-900 font-semibold transition-colors duration-200"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
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

export default BillingInvoices;
import React, { useEffect, useState } from 'react';
import { X, Search, Printer } from 'lucide-react';
import api from '../../service/api';

const CustomerHistoryModal = ({ customer, onClose }) => {
  if (!customer) return null;

  // Calculate payment summary
  const paymentSummary = customer.bills.reduce(
    (summary, bill) => {
      const total = bill.total || 0;
      const paid = bill.paid || 0;
      const pending = total - paid;
      
      return {
        grandTotal: summary.grandTotal + total,
        totalPaid: summary.totalPaid + paid,
        totalPending: summary.totalPending + (pending > 0 ? pending : 0),
        totalBills: summary.totalBills + 1
      };
    },
    { grandTotal: 0, totalPaid: 0, totalPending: 0, totalBills: 0 }
  );

  // Function to handle printing
  const handlePrint = () => {
    const printContent = document.getElementById('printable-customer-info').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div class="print-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin-bottom: 5px;">${customer.name}'s Purchase History</h1>
          <p style="color: #6b7280; margin-top: 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${printContent}
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280;">
          Thank you for your business!
        </div>
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Customer Details: {customer.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Customer ID: {customer.id}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="text-gray-600 hover:text-blue-600 p-1 rounded-md"
                title="Print"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-1 rounded-md"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div id="printable-customer-info" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">CUSTOMER INFORMATION</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Full Name:</span>
                    <span className="text-sm font-medium text-gray-900">{customer.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Contact Number:</span>
                    <span className="text-sm font-medium text-gray-900">{customer.contact || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Aadhar ID:</span>
                    <span className="text-sm font-medium text-gray-900">{customer.aadhar || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Location:</span>
                    <span className="text-sm font-medium text-gray-900">{customer.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Customer Since:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.bills.length > 0 
                        ? new Date(customer.bills[0].date).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">PURCHASE SUMMARY</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Bills:</span>
                    <span className="text-sm font-medium text-gray-900">{paymentSummary.totalBills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Grand Total:</span>
                    <span className="text-sm font-medium text-gray-900">₹ {paymentSummary.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Paid:</span>
                    <span className="text-sm font-medium text-gray-900">₹ {paymentSummary.totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pending Amount:</span>
                    <span className={`text-sm font-medium ${
                      paymentSummary.totalPending > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹ {paymentSummary.totalPending.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Average Bill Value:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹ {paymentSummary.totalBills > 0 
                        ? (paymentSummary.grandTotal / paymentSummary.totalBills).toFixed(2) 
                        : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Purchase:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.bills.length > 0 
                        ? new Date(
                            customer.bills.reduce((latest, bill) => 
                              new Date(bill.date) > new Date(latest) ? bill.date : latest, 
                            customer.bills[0].date)
                          ).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase History */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">PURCHASE HISTORY ({customer.bills.length})</h4>
              {customer.bills.length === 0 ? (
                <p className="text-sm text-gray-500">No purchases found for this customer.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customer.bills.map((bill) => {
                        const subtotal = bill.subtotal || 
                          (bill.products?.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0) || 0);
                        const paid = bill.paid || 0;
                        const pending = (bill.total || 0) - paid;
                        
                        return (
                          <tr key={bill._id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {bill._id?.substring(bill._id.length - 6) || 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {bill.date ? new Date(bill.date).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              }) : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <ul className="list-disc list-inside">
                                {bill.products?.map((product, pIdx) => (
                                  <li key={pIdx}>
                                    {product.name || 'Unknown Product'} (x{product.quantity || 0}) 
                                    {product.price !== undefined && <span className="text-gray-400 ml-1">@ ₹{(product.price || 0).toFixed(2)}</span>}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                              ₹ {subtotal.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              ₹ {(bill.total || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-green-600">
                              ₹ {paid.toFixed(2)}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-right text-sm ${
                              pending > 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              ₹ {pending > 0 ? pending.toFixed(2) : '0.00'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                              {bill.changes || '0.00'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
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

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const customerMap = new Map();

        // Try to fetch customers first
        try {
          const customersResponse = await api.get('/customers/all');
          customersResponse.data.forEach(customer => {
            customerMap.set(customer._id, {
              id: customer._id?.toString() || 'N/A',
              name: customer.name || 'Unknown Customer',
              contact: customer.contact || 'N/A',
              aadhar: customer.aadhaar || customer.aadhar || 'N/A',
              location: customer.location || 'N/A',
              bills: []
            });
          });
        } catch (customersError) {
          console.warn('Failed to fetch customers directly:', customersError.message);
        }

        // Then fetch bills
        try {
          const billsResponse = await api.get('/bills');
          billsResponse.data.forEach(bill => {
            if (bill.customer) {
              const customerId = bill.customer._id || bill.customer.id || 'unknown';
              const customerName = bill.customer.name || 'Unknown Customer';
              const customerContact = bill.customer.contact || 'N/A';
              const customerAadhaar = bill.customer.aadhaar || bill.customer.aadhar || 'N/A';
              const customerLocation = bill.customer.location || 'N/A';

              if (!customerMap.has(customerId)) {
                customerMap.set(customerId, {
                  id: customerId.toString(),
                  name: customerName,
                  contact: customerContact,
                  aadhar: customerAadhaar,
                  location: customerLocation,
                  bills: []
                });
              }

              // Add bill to customer with proper null checks
              customerMap.get(customerId).bills.push({
                _id: bill._id || 'N/A',
                date: bill.date || new Date().toISOString(),
                products: bill.products?.map(p => ({
                  name: p.name || 'Unknown Product',
                  price: p.price || 0,
                  quantity: p.quantity || 0
                })) || [],
                subtotal: bill.subtotal || 0,
                total: bill.total || 0,
                paid: bill.paid || 0,
                changes: bill.changes || '0.00'
              });
            }
          });

          const uniqueCustomers = Array.from(customerMap.values());
          setCustomers(uniqueCustomers);
          setFilteredCustomers(uniqueCustomers);
        } catch (billsError) {
          throw new Error(`Failed to fetch bills: ${billsError.message}`);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = customers.filter(customer => {
      const nameMatch = customer.name?.toLowerCase().includes(lowerCaseSearchTerm);
      const idMatch = customer.id?.toString().toLowerCase().includes(lowerCaseSearchTerm);
      const contactMatch = customer.contact?.toLowerCase().includes(lowerCaseSearchTerm);
      const aadharMatch = customer.aadhar?.toLowerCase().includes(lowerCaseSearchTerm);
      return nameMatch || idMatch || contactMatch || aadharMatch;
    });
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const openCustomerHistory = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Error Loading Data</h3>
            <p className="mt-2 text-gray-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h2 className="text-3xl font-bold text-gray-800">Customers</h2>

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

            <div className="text-sm text-gray-600 pl-1 sm:pl-0">
              {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} 
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-600">Loading customer data...</p>
          </div>
        ) : filteredCustomers.length === 0 && !searchTerm ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No customer records found</h3>
            <p className="mt-2 text-gray-500">It looks like no customers have made purchases yet.</p>
          </div>
        ) : filteredCustomers.length === 0 && searchTerm ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No matching customers found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search term.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Total Purchases
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Pending Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => {
                    // Calculate pending amount for each customer
                    const pendingAmount = customer.bills.reduce(
                      (sum, bill) => sum + ((bill.total || 0) - (bill.paid || 0)), 
                      0
                    );
                    
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                              {customer.name ? customer.name.charAt(0).toUpperCase() : 'N/A'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-xs text-gray-500">{customer.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.bills.length} {customer.bills.length === 1 ? 'purchase' : 'purchases'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                            ₹ {pendingAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openCustomerHistory(customer)}
                            className="text-blue-600 hover:text-blue-900 font-semibold transition-colors duration-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <CustomerHistoryModal
            customer={selectedCustomer}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default Customers;
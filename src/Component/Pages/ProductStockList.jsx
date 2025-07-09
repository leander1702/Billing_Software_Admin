import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiEye } from 'react-icons/fi';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// ProductDetailsModal Component (Can be in a separate file)
const ProductDetailsModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Product Details: {product.productName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Product Code:</strong> {product.productCode}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Brand:</strong> {product.brand || '-'}</p>
          <p><strong>Base Unit:</strong> {product.baseUnit}</p>
          <p><strong>Secondary Unit:</strong> {product.secondaryUnit || '-'}</p>
          <p><strong>Conversion Rate:</strong> {product.conversionRate || '-'}</p>
          <p><strong>MRP:</strong> ₹{product.mrp?.toFixed(2)}</p>
          <p><strong>Discount:</strong> {product.discount ? `${product.discount}%` : '-'}</p>
          <p><strong>Net Price:</strong> ₹{product.netPrice?.toFixed(2)}</p>
          <p><strong>GST:</strong> {product.gst ? `${product.gst}%` : '-'}</p>
          <p><strong>SGST:</strong> {product.sgst ? `${product.sgst}%` : '-'}</p>
          <p><strong>Total Price:</strong> ₹{product.totalPrice?.toFixed(2)}</p>
          <p><strong>Stock Quantity:</strong> {product.stockQuantity} {product.baseUnit}</p>
          <p><strong>GST Category:</strong> {product.gstCategory || '-'}</p>
          <p><strong>Overall Quantity:</strong> {product.overallQuantity || '-'}</p>
          <p><strong>Quantity:</strong> {product.quantity || '-'}</p>
          <p><strong>Discount on MRP:</strong> {product.discountOnMRP ? `${product.discountOnMRP}%` : '-'}</p>
          <p><strong>Incoming Date:</strong> {product.incomingDate ? new Date(product.incomingDate).toLocaleDateString() : '-'}</p>
          <p><strong>Expiry Date:</strong> {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : '-'}</p>
          <p><strong>Supplier Name:</strong> {product.supplierName || '-'}</p>
          <p><strong>Batch Number:</strong> {product.batchNumber || '-'}</p>
          <p><strong>Manufacture Date:</strong> {product.manufactureDate ? new Date(product.manufactureDate).toLocaleDateString() : '-'}</p>
          <p><strong>Manufacture Location:</strong> {product.manufactureLocation || '-'}</p>
          <p><strong>Created At:</strong> {product.createdAt ? new Date(product.createdAt).toLocaleString() : '-'}</p>
          <p><strong>Updated At:</strong> {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductStockList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'productName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGstCategory, setSelectedGstCategory] = useState('All'); // New state for GST filter
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        console.log('Response:', response.status, response.data); 
        const productsData = Array.isArray(response.data) ? response.data : response.data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Apply GST/Non-GST filter
    if (selectedGstCategory !== 'All') {
      result = result.filter(product => {
        if (selectedGstCategory === 'GST') {
          return product.gst && product.gst > 0;
        } else if (selectedGstCategory === 'Non-GST') {
          return !product.gst || product.gst === 0;
        }
        return true; // Should not reach here if filter is applied correctly
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedGstCategory, products]); // Add selectedGstCategory to dependencies

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get current products for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get unique categories for filter dropdown with safety check
  const categories = ['All', ...new Set(Array.isArray(products) ? products.map(product => product.category) : [])];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/admin/products/${id}`);
        setProducts(products.filter(product => product._id !== id));
        // Also update filteredProducts to reflect the deletion immediately
        setFilteredProducts(prev => prev.filter(product => product._id !== id));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleEdit = (productId) => {
    console.log('Edit product with ID:', productId);
    alert(`Navigating to edit product with ID: ${productId}`);
  };

  const handleViewDetails = (product) => {
    setSelectedProductDetails(product);
    setShowDetailsModal(true);
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return 'text-red-600 bg-red-50';
    if (quantity <= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-2">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header and Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Product Stock List</h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedGstCategory}
                  onChange={(e) => setSelectedGstCategory(e.target.value)}
                >
                  <option value="All">All GST Categories</option>
                  <option value="GST">GST Products</option>
                  <option value="Non-GST">Non-GST Products</option>
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <FiPlus /> Add Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('productCode')}
                >
                  <div className="flex items-center">
                    Code
                    {sortConfig.key === 'productCode' && (
                      sortConfig.direction === 'asc' ?
                        <FaSortAmountUp className="ml-1" /> :
                        <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('productName')}
                >
                  <div className="flex items-center">
                    Product
                    {sortConfig.key === 'productName' && (
                      sortConfig.direction === 'asc' ?
                        <FaSortAmountUp className="ml-1" /> :
                        <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.key === 'category' && (
                      sortConfig.direction === 'asc' ?
                        <FaSortAmountUp className="ml-1" /> :
                        <FaSortAmountDown className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View Details</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.productCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                      <div className="text-sm text-gray-500">{product.baseUnit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="text-blue-600 hover:text-blue-900 font-semibold transition-colors duration-200"
                        title="View Details"
                      >

                        View Details
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => handleEdit(product._id)}
                        title="Edit Product"
                      >
                        <FiEdit className="inline" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(product._id)}
                        title="Delete Product"
                      >
                        <FiTrash2 className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredProducts.length)}
              </span>{' '}
              of <span className="font-medium">{filteredProducts.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && (
        <ProductDetailsModal product={selectedProductDetails} onClose={() => setShowDetailsModal(false)} />
      )}
    </div>
  );
};

export default ProductStockList;
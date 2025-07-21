import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

const SellerExpenseList = () => {
    const [sellerData, setSellerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSellers, setExpandedSellers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'supplierName', direction: 'asc' });
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [paymentStatus, setPaymentStatus] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSellerExpenses = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (dateRange.start) params.append('startDate', dateRange.start);
                if (dateRange.end) params.append('endDate', dateRange.end);

                const response = await api.get(`/products/seller-expenses?${params.toString()}`);
                setSellerData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch seller expenses');
                setLoading(false);
            }
        };

        const savedPaymentStatus = localStorage.getItem('sellerPaymentStatus');
        if (savedPaymentStatus) {
            setPaymentStatus(JSON.parse(savedPaymentStatus));
        }

        fetchSellerExpenses();
    }, [dateRange]);

    const toggleSellerDetails = (sellerKey) => {
        setExpandedSellers(prev => ({
            ...prev,
            [sellerKey]: !prev[sellerKey]
        }));
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
        let sortableData = [...sellerData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [sellerData, sortConfig]);

    const filteredSellers = sortedData.filter(seller =>
        seller.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedSellers = filteredSellers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const calculateTotalAmount = (products) => {
        return products.reduce((total, product) => {
            return total + (product.sellerPrice * product.addedStock);
        }, 0).toFixed(2);
    };

    const calculateTotalProfit = (products) => {
        return products.reduce((total, product) => {
            const profitPerUnit = (product.mrp - product.sellerPrice) || 0;
            return total + (profitPerUnit * product.addedStock);
        }, 0).toFixed(2);
    };

    const markAsPaid = (sellerKey) => {
        const newStatus = { ...paymentStatus, [sellerKey]: true };
        setPaymentStatus(newStatus);
        localStorage.setItem('sellerPaymentStatus', JSON.stringify(newStatus));
    };

    const exportToCSV = () => {
        const headers = [
            'Supplier Name', 'Batch Number', 'Product Code', 'Product Name',
            'Quantity', 'Unit', 'Cost Price', 'MRP', 'Profit', 'Added Date'
        ];

        const csvData = [
            headers.join(','),
            ...filteredSellers.flatMap(seller =>
                seller.products.map(product => [
                    `"${seller.supplierName}"`,
                    `"${seller.batchNumber}"`,
                    `"${product.productCode}"`,
                    `"${product.productName}"`,
                    product.addedStock,
                    `"${product.baseUnit}"`,
                    product.sellerPrice,
                    product.mrp,
                    (product.mrp - product.sellerPrice) * product.addedStock,
                    `"${formatDate(product.createdAt)}"`].join(',')).join('\n'))];

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `seller-expenses-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                    <div className="flex justify-between">
                        <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const EmptyState = () => (
        <div className="text-center py-12">
            <svg
                className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No seller expenses found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter to find what you're looking for.
            </p>
        </div>
    );

    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return (
            <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) return <LoadingSkeleton />;

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-100" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Seller Expense Management</h1>

                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search by seller or batch..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg
                            className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Export to CSV
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
                <div className="flex items-center">
                    <label htmlFor="startDate" className="mr-2 text-sm text-gray-600 dark:text-gray-300">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                </div>
                <div className="flex items-center">
                    <label htmlFor="endDate" className="mr-2 text-sm text-gray-600 dark:text-gray-300">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                </div>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => setCurrentPage(1)}
                >
                    Apply Filter
                </button>
            </div>

            {filteredSellers.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {paginatedSellers.map((sellerGroup) => {
                        const sellerKey = `${sellerGroup.supplierName}-${sellerGroup.batchNumber}`;
                        const isExpanded = expandedSellers[sellerKey];
                        const totalAmount = calculateTotalAmount(sellerGroup.products);
                        const totalProfit = calculateTotalProfit(sellerGroup.products);

                        return (
                            <div key={sellerKey} className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
                                <div
                                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => toggleSellerDetails(sellerKey)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${parseFloat(totalAmount) > 10000 ? 'bg-red-500' :
                                            parseFloat(totalAmount) > 5000 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}></div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{sellerGroup.supplierName}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Batch: {sellerGroup.batchNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="font-medium text-gray-800 dark:text-white">₹{totalAmount}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {sellerGroup.products.length} items | Profit: ₹{totalProfit}
                                            </p>
                                        </div>
                                        <svg
                                            className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-gray-200 dark:border-gray-700">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('productName')}
                                                        >
                                                            Product <SortIndicator columnKey="productName" />
                                                        </th>
                                                        <th
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('productCode')}
                                                        >
                                                            Code <SortIndicator columnKey="productCode" />
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Category
                                                        </th>
                                                        <th
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('addedStock')}
                                                        >
                                                            Qty <SortIndicator columnKey="addedStock" />
                                                        </th>
                                                        <th
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('sellerPrice')}
                                                        >
                                                            Cost <SortIndicator columnKey="sellerPrice" />
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Sales Price
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Profit
                                                        </th>
                                                        <th
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                                            onClick={() => requestSort('createdAt')}
                                                        >
                                                            Added <SortIndicator columnKey="createdAt" />
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Mfg
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Expiry
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                                    {sellerGroup.products.map((product) => {
                                                        const profitPerUnit = (product.mrp - product.sellerPrice) || 0;
                                                        const totalProfit = (profitPerUnit * product.addedStock).toFixed(2);

                                                        return (
                                                            <tr key={`${product._id}-${product.addedStock}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {product.productName}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">{product.productCode}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                                                        {product.category}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                                                        <span className="font-medium">{product.addedStock}</span> {product.baseUnit}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                                                        ₹{product.sellerPrice.toFixed(2)}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                                                        ₹{product.mrp?.toFixed(2) || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className={`text-sm font-medium ${profitPerUnit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                        ₹{totalProfit}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                                                        {formatDate(product.createdAt)}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                                                        {formatDate(product.manufactureDate)}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                                                        {formatDate(product.expiryDate)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-300">
                                                            Total
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-200">
                                                            {sellerGroup.products.reduce((sum, p) => sum + p.addedStock, 0)}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                                            ₹{totalAmount}
                                                        </td>
                                                        <td></td>
                                                        <td className="px-6 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                                                            ₹{totalProfit}
                                                        </td>
                                                        <td colSpan="3"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                GST: {sellerGroup.gstCategory || 'Non-GST'}
                                            </div>
                                            <button
                                                className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${paymentStatus[sellerKey]
                                                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                                    }`}
                                                onClick={() => markAsPaid(sellerKey)}
                                            >
                                                {paymentStatus[sellerKey] ? 'Paid' : 'Mark as Paid'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredSellers.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                    <nav className="inline-flex rounded-md shadow">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.ceil(filteredSellers.length / itemsPerPage) }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-2 border-t border-b border-gray-300 ${currentPage === i + 1 ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredSellers.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(filteredSellers.length / itemsPerPage)}
                            className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default SellerExpenseList;
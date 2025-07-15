import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfitReport = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalProfit, setTotalProfit] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products');
                const validProducts = res.data.filter(product => 
                    product && 
                    typeof product.profit === 'number' && 
                    typeof product.stockQuantity === 'number'
                );
                
                setProducts(validProducts);
                
                // Calculate total profit safely
                const profit = validProducts.reduce(
                    (sum, product) => sum + (product.profit || 0) * (product.stockQuantity || 0), 
                    0
                );
                setTotalProfit(profit);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Profit Report</h2>
            
            <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold">Total Profit</h3>
                <p className="text-2xl font-bold">₹{totalProfit.toFixed(2)}</p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border">Product Code</th>
                            <th className="py-2 px-4 border">Product Name</th>
                            <th className="py-2 px-4 border">Sales Price (₹)</th>
                            <th className="py-2 px-4 border">Seller Price (₹)</th>
                            <th className="py-2 px-4 border">Profit (₹)</th>
                            <th className="py-2 px-4 border">Stock Qty</th>
                            <th className="py-2 px-4 border">Total Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const mrp = product.mrp || 0;
                            const sellerPrice = product.sellerPrice || 0;
                            const profit = product.profit || 0;
                            const stockQuantity = product.stockQuantity || 0;
                            const totalProductProfit = profit * stockQuantity;

                            return (
                                <tr key={product._id} className="hover:bg-gray-50 text-center">
                                    <td className="py-2 px-4 border">{product.productCode || 'N/A'}</td>
                                    <td className="py-2 px-4 border">{product.productName || 'N/A'}</td>
                                    <td className="py-2 px-4 border">₹{mrp.toFixed(2)}</td>
                                    <td className="py-2 px-4 border">₹{sellerPrice.toFixed(2)}</td>
                                    <td className="py-2 px-4 border">₹{profit.toFixed(2)}</td>
                                    <td className="py-2 px-4 border">{stockQuantity}</td>
                                    <td className="py-2 px-4 border font-semibold">
                                        ₹{totalProductProfit.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfitReport;
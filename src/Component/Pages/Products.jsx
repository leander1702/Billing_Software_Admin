// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import ProductForm from '../ProductFom';
import ProductTable from '../ProductTable';


const Products = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // Load products from JSON file
    const loadProducts = async () => {
      try {
        const response = await fetch('/data/products.json');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  const handleAddProduct = (newProduct) => {
    const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const updatedProducts = [...products, { ...newProduct, id }];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    setEditingProduct(null);
  };

  const handleUpdateProduct = (updatedProduct) => {
    const updatedProducts = products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  const saveProducts = (productsToSave) => {
    // In a real app, you would save to a backend API
    // For this example, we'll just update the state
    console.log('Products would be saved here:', productsToSave);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <ProductForm 
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            product={editingProduct}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Product List</h2>
          <ProductTable
            products={products} 
            onEdit={setEditingProduct} 
            onDelete={handleDeleteProduct} 
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
import React, { useEffect, useState } from 'react';
import { productAPI, imageAPI } from '../lib/api';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    stock: 0,
    category: '',
    sku: '',
    image_urls: [],
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id, formData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(formData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      category: product.category,
      sku: product.sku,
      image_urls: product.image_urls || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      discount: 0,
      stock: 0,
      category: '',
      sku: '',
      image_urls: [],
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const formDataImage = new FormData();
        formDataImage.append('file', file);
        formDataImage.append('title', `${formData.name || 'Product'} Image`);
        formDataImage.append('image_type', 'program');
        formDataImage.append('description', 'Product image');

        const response = await imageAPI.upload(formDataImage);
        uploadedUrls.push(response.data.cdn_url);
      }

      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, ...uploadedUrls]
      });
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.image_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, image_urls: newImages });
  };

  const finalPrice = (price, discount) => {
    return (price - (price * discount) / 100).toFixed(2);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="products-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-600 mt-1">Manage shop inventory</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowModal(true);
            }}
            data-testid="add-product-button"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-all"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} data-testid={`product-row-${product.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_urls && product.image_urls.length > 0 ? (
                          <img 
                            src={product.image_urls[0]} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <AlertCircle size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {product.discount > 0 ? (
                          <>
                            <span className="text-sm line-through text-gray-400">
                              ₹{product.price}
                            </span>
                            <span className="text-sm font-semibold text-gray-800 ml-2">
                              ₹{finalPrice(product.price, product.discount)}
                            </span>
                            <span className="text-xs text-green-600 ml-1">
                              ({product.discount}% off)
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-gray-800">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            product.stock < 10 ? 'text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                        {product.stock < 10 && (
                          <AlertCircle size={16} className="text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(product)}
                          data-testid={`edit-product-${product.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          data-testid={`delete-product-${product.id}`}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseFloat(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center py-4"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploadingImage ? 'Uploading...' : 'Click to upload product images'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                </div>

                {/* Image Preview Grid */}
                {formData.image_urls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {formData.image_urls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="submit-product"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

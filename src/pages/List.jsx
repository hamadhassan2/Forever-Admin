import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import TextField from '@mui/material/TextField';

const AnimatedSearch = ({ searchTerm, setSearchTerm }) => (
  <div className="w-full md:w-64">
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search by product name..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'gray',
          padding: '10px'
        },
      }}
    />
  </div>
);

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ageInput, setAgeInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setAgeInput("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
    setShowEditModal(false);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const {
        _id,
        name,
        description,
        price,
        discountedPrice,
        category,
        subCategory,
        sizes,
        bestseller,
        ages,
        count,
      } = selectedProduct;
      const updatedData = {
        productId: _id,
        name,
        description,
        price,
        discountedPrice,
        category,
        subCategory,
        sizes: JSON.stringify(sizes),
        bestseller: bestseller.toString(),
        ages: JSON.stringify(ages),
        count,
      };
      const response = await axios.post(
        backendUrl + '/api/product/update',
        updatedData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        closeEditModal();
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await removeProduct(productToDelete._id);
      setProductToDelete(null);
    }
  };

  const availableList = list.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    Number(item.count) > 0
  );
  const outOfStockList = list.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    Number(item.count) === 0
  );

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <section className='p-3'>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <p className="mb-4 md:mb-0 text-3xl font-bold ">All Products List</p>
        <AnimatedSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 ">Available Products</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_1fr_1fr] items-center py-3 px-4 bg-gray-600 text-white text-sm min-w-[800px] rounded-sm">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Discounted Price</span>
            <span className="text-center">Ages</span>
            <span>Count</span>
            <span className="text-center">Action</span>
          </div>
          {availableList.length > 0 ? (
            availableList.map((item, index) => (
              <div key={item._id || index} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_1fr_1fr] items-center py-3 px-4 border-b hover:bg-gray-50 min-w-[800px]">
                <img
                  src={Array.isArray(item.image) ? item.image[0] : item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-gray-800 font-medium">{item.name}</span>
                <span className="text-gray-700">{item.category}</span>
                <span className="text-gray-800 font-semibold">{currency}{item.price}</span>
                <span className="text-gray-800 font-semibold">
                  {typeof item.discountedPrice === "number"
                    ? `${currency}${item.discountedPrice}`
                    : '-'}
                </span>
                <span className="text-center text-gray-700">
                  {item.ages && Array.isArray(item.ages) && item.ages.length > 0
                    ? item.ages.join(', ')
                    : '-'}
                </span>
                <span className="text-gray-700">{item.count}</span>
                <div className="flex justify-center items-center gap-3">
                  <div
                    onClick={() => openEditModal(item)}
                    className="cursor-pointer text-black hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                  >
                    <FaEdit size={16} />
                  </div>
                  <div
                    onClick={() => setProductToDelete(item)}
                    className="cursor-pointer text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                  >
                    <FaTrash size={16} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-gray-600">No available products found.</p>
          )}
        </div>
      </div>

      {outOfStockList.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-black mb-3">Out of Stock Products</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_1fr_1fr] items-center py-3 px-4 bg-gray-300 text-white text-sm min-w-[800px] rounded-sm">
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span>Discounted Price</span>
              <span className="text-center">Ages</span>
              <span>Count</span>
              <span className="text-center">Action</span>
            </div>
            {outOfStockList.length > 0 ? (
              outOfStockList.map((item, index) => (
                <div key={item._id || index} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2fr_1fr_1fr] items-center py-3 px-4 border-b hover:bg-gray-50 min-w-[800px]">
                  <img
                    src={Array.isArray(item.image) ? item.image[0] : item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-gray-800 font-medium">{item.name}</span>
                  <span className="text-gray-700">{item.category}</span>
                  <span className="text-gray-800 font-semibold">{currency}{item.price}</span>
                  <span className="text-gray-800 font-semibold">
                    {typeof item.discountedPrice === "number"
                      ? `${currency}${item.discountedPrice}`
                      : '-'}
                  </span>
                  <span className="text-center text-gray-700">
                    {item.ages && Array.isArray(item.ages) && item.ages.length > 0
                      ? item.ages.join(', ')
                      : '-'}
                  </span>
                  <span className="text-gray-700">{item.count}</span>
                  <div className="flex justify-center items-center gap-3">
                    <div
                      onClick={() => openEditModal(item)}
                      className="cursor-pointer text-black hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <FaEdit size={16} />
                    </div>
                    <div
                      onClick={() => setProductToDelete(item)}
                      className="cursor-pointer text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                      <FaTrash size={16} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-600">No out of stock products found.</p>
            )}
          </div>
        </div>
      )}

      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-6 ">Edit Product</h2>
            <form onSubmit={updateProduct} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={selectedProduct.description}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                  className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Discounted Price</label>
                  <input
                    type="number"
                    value={selectedProduct.discountedPrice || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, discountedPrice: e.target.value })}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Count</label>
                  <input
                    type="number"
                    value={selectedProduct.count || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, count: e.target.value })}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={selectedProduct.category}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Sub Category</label>
                  <select
                    value={selectedProduct.subCategory}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, subCategory: e.target.value })}
                    className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  >
                    <option value="Topwear">Topwear</option>
                    <option value="Bottomwear">Bottomwear</option>
                    <option value="Winterwear">Winterwear</option>
                  </select>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700">Bestseller</label>
                  <input
                    type="checkbox"
                    checked={selectedProduct.bestseller}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, bestseller: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
                <div className="flex gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((s) => (
                    <div key={s} onClick={() => {
                      const currentSizes = selectedProduct.sizes || [];
                      if (currentSizes.includes(s)) {
                        setSelectedProduct({ ...selectedProduct, sizes: currentSizes.filter(size => size !== s) });
                      } else {
                        setSelectedProduct({ ...selectedProduct, sizes: [...currentSizes, s] });
                      }
                    }} className="cursor-pointer">
                      <p className={`${(selectedProduct.sizes || []).includes(s) ? "bg-gray-600 text-white" : "bg-white border-2 border-gray-400"} px-3 py-1 rounded transition duration-300 text-sm`}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ages</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add age (e.g., 3 or 3/4)"
                    className="w-24 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const regex = /^\d+(\/\d+)?$/;
                      const trimmedInput = ageInput.trim();
                      if (regex.test(trimmedInput) && !(selectedProduct.ages || []).includes(trimmedInput)) {
                        setSelectedProduct({ 
                          ...selectedProduct, 
                          ages: [...(selectedProduct.ages || []), trimmedInput]
                        });
                        setAgeInput("");
                      } else {
                        toast.error("Enter a valid, unique age (e.g., 3 or 3/4).");
                      }
                    }} 
                    className="px-4 py-2 bg-gray-600 text-white rounded transition hover:bg-gray-800 text-sm"
                  >
                    Add Age
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {(selectedProduct.ages || []).map((age, idx) => (
                    <div key={idx} onClick={() => {
                      setSelectedProduct({ 
                        ...selectedProduct, 
                        ages: selectedProduct.ages.filter(a => a !== age)
                      });
                    }} className="cursor-pointer">
                      <p className="bg-green-200 text-green-800 px-3 py-1 rounded text-sm">{age}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {productToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Confirm Delete</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to remove this product?</p>
            <div className="flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default List;

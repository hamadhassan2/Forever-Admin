import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import TextField from '@mui/material/TextField';

const EnhancedSearch = ({ searchTerm, setSearchTerm, searchField, setSearchField }) => (
  <div className="flex flex-col sm:flex-row items-center ">
    <select
      value={searchField}
      onChange={(e) => setSearchField(e.target.value)}
      className="w-full sm:w-48 px-3 py-2 border border-gray-300  focus:outline-none focus:ring-1 focus:ring-black transition"
      style={{height:'56px'}}
    >
      <option value="name">Name</option>
      <option value="category">Category</option>
      <option value="subCategory">Sub Category</option>
      <option value="color">Color</option>
      <option value="price">Price</option>
      <option value="ages">Age</option>
      <option value="sizes">Size</option>
    </select>
    <TextField
      fullWidth
      variant="outlined"
      placeholder={`Search by ${searchField}`}
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
  const [sizeInput, setSizeInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [productToDelete, setProductToDelete] = useState(null);
  const [subCategorySuggestions, setSubCategorySuggestions] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [showSubCategorySuggestions, setShowSubCategorySuggestions] = useState(false);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
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

  // Fetch subcategories for the edit modal (similar to Add page)
  useEffect(() => {
    async function fetchSubCategories() {
      try {
        const response = await axios.get(`${backendUrl}/api/product/subcategories`);
        if (response.data.success) {
          setSubCategorySuggestions(response.data.subCategories);
        } else {
          setSubCategorySuggestions([]);
          toast.error("Failed to load subcategories");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching subcategories");
      }
    }
    fetchSubCategories();
  }, []);

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
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
    setSizeInput("");
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
        color,
      } = selectedProduct;
      const updatedData = {
        productId: _id,
        name,
        description,
        price,
        discountedPrice,
        category,
        subCategory,
        color,
        sizes: JSON.stringify(sizes),
        bestseller: bestseller.toString(),
        ages: JSON.stringify(ages),
        count,
      };
      const response = await axios.post(
        `${backendUrl}/api/product/update`,
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

  // Filtering based on searchField and searchTerm
  const filterList = (item) => {
    const term = searchTerm.toLowerCase();
    switch (searchField) {
      case "name":
        return item.name.toLowerCase().includes(term);
      case "category":
        return item.category.toLowerCase().includes(term);
      case "subCategory":
        return (item.subCategory || "").toLowerCase().includes(term);
      case "color":
        return (item.color || "").toLowerCase().includes(term);
      case "price":
        return item.price.toString().includes(term);
      case "ages":
        return item.ages && Array.isArray(item.ages)
          ? item.ages.join(" ").toLowerCase().includes(term)
          : false;
      case "sizes":
        return item.sizes && Array.isArray(item.sizes)
          ? item.sizes.join(" ").toLowerCase().includes(term)
          : false;
      default:
        return item.name.toLowerCase().includes(term);
    }
  };

  const availableList = list.filter(
    item => filterList(item) && Number(item.count) > 0
  );
  const outOfStockList = list.filter(
    item => filterList(item) && Number(item.count) === 0
  );

  // Handlers for editing subcategory field with suggestions
  const handleEditSubCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedProduct({ ...selectedProduct, subCategory: value });
    if (value) {
      const filtered = subCategorySuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(subCategorySuggestions);
    }
    setShowSubCategorySuggestions(true);
  };

  const handleEditSubCategoryClick = (suggestion) => {
    setSelectedProduct({ ...selectedProduct, subCategory: suggestion });
    setShowSubCategorySuggestions(false);
  };

  // Handlers for sizes in edit modal
  const addEditSize = () => {
    const trimmedSize = sizeInput.trim().toUpperCase();
    if (trimmedSize && !(selectedProduct.sizes || []).includes(trimmedSize)) {
      setSelectedProduct({
        ...selectedProduct,
        sizes: [...(selectedProduct.sizes || []), trimmedSize]
      });
      setSizeInput("");
    } else {
      toast.error("Please enter a valid, unique size.");
    }
  };

  const removeEditSize = (sizeToRemove) => {
    setSelectedProduct({
      ...selectedProduct,
      sizes: (selectedProduct.sizes || []).filter(s => s !== sizeToRemove)
    });
  };

  // Handlers for ages in edit modal (similar to add)
  const addEditAge = () => {
    const trimmedValue = ageInput.trim();
    if (!trimmedValue) {
      toast.error("Please enter an age value.");
      return;
    }
    let ageString = "";
    if (trimmedValue.includes("-")) {
      const parts = trimmedValue.split("-");
      if (parts.length !== 2 || isNaN(parts[0].trim()) || isNaN(parts[1].trim())) {
        toast.error("Please enter a valid age range (e.g., 3-4).");
        return;
      }
      ageString = `${trimmedValue} ${selectedProduct.ageUnit || "Years"}`;
    } else {
      if (isNaN(trimmedValue)) {
        toast.error("Please enter a valid numeric age.");
        return;
      }
      ageString = `${trimmedValue} ${selectedProduct.ageUnit || "Years"}`;
    }
    if (!(selectedProduct.ages || []).includes(ageString)) {
      setSelectedProduct({
        ...selectedProduct,
        ages: [...(selectedProduct.ages || []), ageString]
      });
      setAgeInput("");
    } else {
      toast.error("This age entry already exists.");
    }
  };

  const removeEditAge = (ageToRemove) => {
    setSelectedProduct({
      ...selectedProduct,
      ages: (selectedProduct.ages || []).filter(age => age !== ageToRemove)
    });
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <section className='p-3'>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <p className="mb-4 md:mb-0 text-3xl font-bold">All Products List</p>
        <EnhancedSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchField={searchField}
          setSearchField={setSearchField}
        />
      </div>

      {/* Available Products */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Available Products</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-600 text-white text-sm min-w-[1000px] rounded-sm">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Sub Category</span>
            <span className="text-center">Color</span>
            <span>Price</span>
            <span>Discounted Price</span>
            <span className="text-center">Ages</span>
            <span>Size</span>
            <span>Count</span>
            <span className="text-center">Action</span>
          </div>
          {availableList.length > 0 ? (
            availableList.map((item, index) => (
              <div key={item._id || index} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 border-b hover:bg-gray-50 min-w-[1000px]">
                <img
                  src={Array.isArray(item.image) ? item.image[0] : item.image}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-gray-800 font-medium">{item.name}</span>
                <span className="text-gray-700">{item.category}</span>
                <span className="text-gray-700 text-center">{item.subCategory || '-'}</span>
                <span className="text-gray-700 text-center">{item.color || '-'}</span>
                <span className="text-gray-800 font-semibold">{currency}{item.price}</span>
                <span className="text-gray-800 font-semibold">
                  {typeof item.discountedPrice === "number" ? `${currency}${item.discountedPrice}` : '-'}
                </span>
                <span className="text-center text-gray-700">
                  {item.ages && Array.isArray(item.ages) && item.ages.length > 0 ? item.ages.join(', ') : '-'}
                </span>
                <span className="text-gray-700">
                  {item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes.join(', ') : '-'}
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

      {/* Out of Stock Products */}
      {outOfStockList.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-black mb-3">Out of Stock Products</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-300 text-white text-sm min-w-[1000px] rounded-sm">
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Sub Category</span>
              <span>Color</span>
              <span>Price</span>
              <span>Discounted Price</span>
              <span className="text-center">Ages</span>
              <span>Size</span>
              <span>Count</span>
              <span className="text-center">Action</span>
            </div>
            {outOfStockList.length > 0 ? (
              outOfStockList.map((item, index) => (
                <div key={item._id || index} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr_1fr] items-center py-3 px-4 border-b hover:bg-gray-50 min-w-[1000px]">
                  <img
                    src={Array.isArray(item.image) ? item.image[0] : item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-gray-800 font-medium">{item.name}</span>
                  <span className="text-gray-700">{item.category}</span>
                  <span className="text-gray-700">{item.subCategory || '-'}</span>
                  <span className="text-gray-700">{item.color || '-'}</span>
                  <span className="text-gray-800 font-semibold">{currency}{item.price}</span>
                  <span className="text-gray-800 font-semibold">
                    {typeof item.discountedPrice === "number" ? `${currency}${item.discountedPrice}` : '-'}
                  </span>
                  <span className="text-center text-gray-700">
                    {item.ages && Array.isArray(item.ages) && item.ages.length > 0 ? item.ages.join(', ') : '-'}
                  </span>
                  <span className="text-gray-700">
                    {item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes.join(', ') : '-'}
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

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
  <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-auto pt-4 md:pt-2">
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 ">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={updateProduct} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-xl font-medium mb-2">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={selectedProduct.name}
            onChange={(e) =>
              setSelectedProduct({ ...selectedProduct, name: e.target.value })
            }
            placeholder="Enter brand name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
        {/* Product Description */}
        <div>
          <label className="block text-xl font-medium mb-2">
            Product Description
          </label>
          <textarea
            value={selectedProduct.description}
            onChange={(e) =>
              setSelectedProduct({ ...selectedProduct, description: e.target.value })
            }
            placeholder="Enter product description"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
        {/* Price, Discounted Price, Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={selectedProduct.price}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) || 0 })
              }
              placeholder="e.g., 25"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Discounted Price
            </label>
            <input
              type="number"
              value={selectedProduct.discountedPrice || ""}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, discountedPrice: Number(e.target.value) || 0 })
              }
              placeholder="Optional"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={selectedProduct.count}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, count: Number(e.target.value) || 0 })
              }
              placeholder="e.g., 10"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
        </div>
        {/* Category, Sub Category, Color */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct.category}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, category: e.target.value })
              }
              required
              className="custom-select w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Boy">Boy</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-xl font-medium mb-2">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedProduct.subCategory}
              onChange={handleEditSubCategoryChange}
              onFocus={() => {
                setShowSubCategorySuggestions(true);
                setFilteredSubCategories(subCategorySuggestions);
              }}
              onBlur={() =>
                setTimeout(() => setShowSubCategorySuggestions(false), 150)
              }
              placeholder="Enter subcategory"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            {showSubCategorySuggestions && filteredSubCategories.length > 0 && (
              <div className="absolute top-full left-0 right-0 border border-gray-300 bg-white z-10 max-h-40 overflow-auto">
                {filteredSubCategories.map((s, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => handleEditSubCategoryClick(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedProduct.color || ""}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, color: e.target.value })
              }
              placeholder="Enter product color"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
        </div>
        {/* Sizes and Ages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sizes Section */}
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Sizes
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="e.g., X, XXL, 42"
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              />
              <button
                type="button"
                onClick={addEditSize}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg transition hover:bg-gray-800"
              >
                Add Size
              </button>
            </div>
            <div className="flex flex-wrap mt-3">
              {(selectedProduct.sizes || []).map((s, index) => (
                <div
                  key={index}
                  onClick={() => removeEditSize(s)}
                  className="cursor-pointer mr-1 mb-1"
                  title="Click to remove"
                >
                  <p className="bg-gray-600 text-white px-3 py-1 rounded">{s}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Ages Section */}
          <div>
            <label className="block text-xl font-medium mb-2">
              Ages
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                placeholder="e.g., 3 or 3-4"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              />
              <select
                value={selectedProduct.ageUnit || "Years"}
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, ageUnit: e.target.value })
                }
                className="custom-select px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              >
                <option value="Years">Years</option>
                <option value="Months">Months</option>
              </select>
              <button
                type="button"
                onClick={addEditAge}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg transition hover:bg-gray-800"
              >
                Add Age
              </button>
            </div>
            <div className="flex flex-wrap mt-3">
              {(selectedProduct.ages || []).map((age, idx) => (
                <div
                  key={idx}
                  onClick={() => removeEditAge(age)}
                  className="cursor-pointer mr-1 mb-1"
                  title="Click to remove"
                >
                  <p className="bg-gray-600 text-white px-3 py-1 rounded">{age}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Bestseller */}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedProduct.bestseller}
            onChange={(e) =>
              setSelectedProduct({ ...selectedProduct, bestseller: e.target.checked })
            }
            className="w-5 h-5"
          />
          <label className="cursor-pointer text-xl">Add to Bestseller</label>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={closeEditModal}
            className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Delete Confirmation */}
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

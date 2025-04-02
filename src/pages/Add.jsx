import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  // Image states
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  // Basic product fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("");
  const [subCategorySuggestions, setSubCategorySuggestions] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [showSubCategorySuggestions, setShowSubCategorySuggestions] = useState(false);
  const [color, setColor] = useState(""); // Color field

  // Other product fields
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState(""); // Custom size input
  const [count, setCount] = useState("");

  // Age fields: admin can enter a single number or a range (e.g., "3-4")
  const [ageValue, setAgeValue] = useState("");
  const [ageUnit, setAgeUnit] = useState("Years"); // Unit selector: "Years" or "Months"
  const [ages, setAges] = useState([]);

  const [loading, setLoading] = useState(false);

  // Fetch subcategories from the backend when the component mounts.
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate required fields and ensure at least one size or age is provided.
    if (!name.trim() || !price || !count || (sizes.length === 0 && ages.length === 0)) {
      toast.error("Please fill in all required fields. At least one size or age must be provided.");
      return;
    }

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      toast.error("Discounted price must be less than the product price.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      if (discountPrice) {
        formData.append("discountedPrice", discountPrice);
      }
      formData.append("subCategory", subCategory);
      formData.append("color", color);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("count", count);

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      if (ages.length > 0) {
        formData.append("ages", JSON.stringify(ages));
      }

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        // Reset fields
        setName("");
        setDescription("");
        setColor("");
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setPrice("");
        setDiscountPrice("");
        setSizes([]);
        setSizeInput("");
        setAges([]);
        setAgeValue("");
        setAgeUnit("Years");
        setCount("");
        setSubCategory("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setLoading(false);
  };

  const addAge = () => {
    const trimmedValue = ageValue.trim();
    if (!trimmedValue) {
      toast.error("Please enter an age value.");
      return;
    }
    // Check if the input contains a hyphen (i.e., a range)
    let ageString = "";
    if (trimmedValue.includes("-")) {
      // Split and validate both parts
      const parts = trimmedValue.split("-");
      if (parts.length !== 2 || isNaN(parts[0].trim()) || isNaN(parts[1].trim())) {
        toast.error("Please enter a valid age range (e.g., 3-4).");
        return;
      }
      ageString = `${trimmedValue} ${ageUnit}`;
    } else {
      // Single numeric value validation
      if (isNaN(trimmedValue)) {
        toast.error("Please enter a valid numeric age.");
        return;
      }
      ageString = `${trimmedValue} ${ageUnit}`;
    }
    if (!ages.includes(ageString)) {
      setAges((prev) => [...prev, ageString]);
      setAgeValue("");
    } else {
      toast.error("This age entry already exists.");
    }
  };

  const removeAge = (ageToRemove) => {
    setAges((prev) => prev.filter((age) => age !== ageToRemove));
  };

  // Filter subcategories as the user types.
  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    setSubCategory(value);
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

  const handleSubCategoryClick = (suggestion) => {
    setSubCategory(suggestion);
    setShowSubCategorySuggestions(false);
  };

  // Add custom size from input, converting to uppercase.
  const addSize = () => {
    const trimmedSize = sizeInput.trim().toUpperCase();
    if (trimmedSize && !sizes.includes(trimmedSize)) {
      setSizes((prev) => [...prev, trimmedSize]);
      setSizeInput("");
    } else {
      toast.error("Please enter a valid, unique size.");
    }
  };

  const removeSize = (sizeToRemove) => {
    setSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-1xl rounded-lg p-4 md:p-8 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 inline-block border-b-2 border-gray-300 pb-4 mx-auto">
          Add New Product
        </h1>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-8">
        {/* Upload Images */}
        <div>
          <p className="text-xl font-semibold mb-3">Upload Images</p>
          <div className="flex gap-1 md:gap-6">
            {[
              { img: image1, setter: setImage1, id: "image1" },
              { img: image2, setter: setImage2, id: "image2" },
              { img: image3, setter: setImage3, id: "image3" },
              { img: image4, setter: setImage4, id: "image4" },
            ].map((item, index) => (
              <label key={index} htmlFor={item.id} className="cursor-pointer">
                <img
                  className="w-24 h-24 object-cover rounded-md shadow border border-gray-300"
                  src={
                    !item.img
                      ? assets.upload_area
                      : URL.createObjectURL(item.img)
                  }
                  alt={`Upload ${item.id}`}
                />
                <input
                  onChange={(e) => item.setter(e.target.files[0])}
                  type="file"
                  id={item.id}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xl font-medium mb-2">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            type="text"
            placeholder="Enter brand name"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-xl font-medium mb-2">
            Product Description
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Enter product description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>

        {/* Price, Discount, Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              value={price}
              required
            />
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Discounted Price
            </label>
            <input
              type="number"
              placeholder="Optional"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              onChange={(e) => setDiscountPrice(Number(e.target.value) || 0)}
              value={discountPrice}
            />
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              onChange={(e) => setCount(Number(e.target.value) || 0)}
              value={count}
              required
            />
          </div>
        </div>

        {/* Category, Subcategory & Color */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Category <span className="text-red-500">*</span>
            </label>
            <select
              onChange={(e) => setCategory(e.target.value)}
              className="custom-select w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
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
              placeholder="Enter subcategory"
              onChange={handleSubCategoryChange}
              onFocus={() => {
                setShowSubCategorySuggestions(true);
                setFilteredSubCategories(subCategorySuggestions);
              }}
              onBlur={() => {
                setTimeout(() => setShowSubCategorySuggestions(false), 150);
              }}
              value={subCategory}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            {showSubCategorySuggestions && filteredSubCategories.length > 0 && (
              <div className="absolute top-full left-0 right-0 border border-gray-300 bg-white z-10 max-h-40 overflow-auto">
                {filteredSubCategories.map((s, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSubCategoryClick(s)}
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
              placeholder="Enter product color"
              required
              onChange={(e) => setColor(e.target.value)}
              value={color}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
        </div>

        {/* Sizes, Ages & Empty Column: Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Sizes Section */}
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Sizes 
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="e.g., X, XXL, 42"
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg transition hover:bg-gray-800"
              >
                Add Size
              </button>
            </div>
            <div className="flex flex-wrap mt-3">
              {sizes.map((s, index) => (
                <div
                  key={index}
                  onClick={() => removeSize(s)}
                  className="cursor-pointer mr-1 mb-1"
                  title="Click to remove"
                >
                  <p className="bg-gray-600 text-white px-3 py-1 rounded">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ages Section with Unit Selector */}
          <div>
            <label className="block text-xl font-medium mb-2">
              Ages 
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g., 3 or 3-4"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                value={ageValue}
                onChange={(e) => setAgeValue(e.target.value)}
              />
              <select
                className="custom-select px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                value={ageUnit}
                onChange={(e) => setAgeUnit(e.target.value)}
              >
                <option value="Years">Years</option>
                <option value="Months">Months</option>
              </select>
              <button
                type="button"
                onClick={addAge}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg transition hover:bg-gray-800"
              >
                Add Age
              </button>
            </div>
            <div className="flex flex-wrap mt-3">
              {ages.map((age, index) => (
                <div
                  key={index}
                  onClick={() => removeAge(age)}
                  className="cursor-pointer mr-1 mb-1"
                  title="Click to remove"
                >
                  <p className="bg-gray-600 text-white px-3 py-1 rounded">{age}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Empty Column */}
          <div></div>
        </div>

        {/* Validation: Require at least one size or age */}
        {sizes.length === 0 && ages.length === 0 && (
          <p className="mt-2 text-sm text-red-500">
            Please add at least one size or one age.
          </p>
        )}

        {/* Bestseller */}
        <div className="flex items-center gap-4">
          <input
            onChange={() => setBestseller((prev) => !prev)}
            checked={bestseller}
            type="checkbox"
            id="bestseller"
            className="w-5 h-5"
          />
          <label className="cursor-pointer text-xl" htmlFor="bestseller">
            Add to Bestseller
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full md:w-32 flex justify-center items-center py-3 bg-green-500 text-white rounded-lg transition transform hover:scale-105 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-dashed border-white rounded-full animate-spin"></div>
          ) : (
            "ADD"
          )}
        </button>
      </form>
    </div>
  );
};

export default Add;

import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [count, setCount] = useState("");

  const [ages, setAges] = useState([]);
  const [ageInput, setAgeInput] = useState("");

  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !count ||
      sizes.length === 0
    ) {
      toast.error("Please fill in all required fields.");
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
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setPrice("");
        setDiscountPrice("");
        setSizes([]);
        setAges([]);
        setCount("");
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
    const regex = /^\d+(\/\d+)?$/;
    const trimmedInput = ageInput.trim();
    if (regex.test(trimmedInput) && !ages.includes(trimmedInput)) {
      setAges((prev) => [...prev, trimmedInput]);
      setAgeInput("");
    } else {
      toast.error("Please enter a valid, unique age (e.g., 3 or 3/4).");
    }
  };

  const removeAge = (ageToRemove) => {
    setAges((prev) => prev.filter((age) => age !== ageToRemove));
  };

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-1xl rounded-lg p-4 md:p-8 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 inline-block border-b-2 border-gray-300 pb-4 mx-auto">
          Add New Product
        </h1>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-8">
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

        <div>
          <label className="block text-xl font-medium mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            type="text"
            placeholder="Enter product name"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        <div>
          <label className="block text-xl font-medium mb-2">
            Product Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Enter product description"
            required
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xl font-medium mb-2">
              Product Category <span className="text-red-500">*</span>
            </label>
            <select
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div>
            <label className="block text-xl font-medium mb-2">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <select
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xl font-medium mb-2">
            Product Sizes <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {["S", "M", "L", "XL", "XXL"].map((s) => (
              <div
                key={s}
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes(s)
                      ? prev.filter((item) => item !== s)
                      : [...prev, s]
                  )
                }
                className="cursor-pointer"
              >
                <p
                  className={`px-4 py-2 rounded-lg transition duration-300 border-2 ${
                    sizes.includes(s)
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-800 border-gray-400"
                  }`}
                >
                  {s}
                </p>
              </div>
            ))}
          </div>
          {sizes.length === 0 && (
            <p className="mt-2 text-sm text-red-500">
              Please select at least one size.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xl font-medium mb-2">Ages</label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="e.g., 3 or 3/4"
              className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
            />
            <button
              type="button"
              onClick={addAge}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg transition hover:bg-gray-800"
            >
              Add Age
            </button>
          </div>
          <div className="flex gap-3 mt-3 flex-wrap">
            {ages.map((age, index) => (
              <div
                key={index}
                onClick={() => removeAge(age)}
                className="cursor-pointer"
                title="Click to remove"
              >
                <p className="bg-green-100 text-green-800 px-3 py-1 rounded">
                  {age}
                </p>
              </div>
            ))}
          </div>
        </div>

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

        <button
          type="submit"
          className="w-32 flex justify-center items-center py-3 bg-green-500 text-white rounded-lg transition transform hover:scale-105 disabled:opacity-50"
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


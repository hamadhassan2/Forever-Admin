import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Define status priority mapping
  const statusOrder = {
    "Order Placed": 1,
    "Packing": 2,
    "Shipped": 3,
    "Out for delivery": 4,
    "Delivered": 5,
    "Cancelled": 6,
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    fetchAllOrders();
    return () => window.removeEventListener("resize", handleResize);
  }, [token]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const sortedOrders = response.data.orders.sort((a, b) => {
          // sort by status priority first
          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }
          // if same status, sort by date (newest first)
          return new Date(b.date) - new Date(a.date);
        });
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) await fetchAllOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const paymentStatusHandler = async (event, orderId) => {
    try {
      const newPaymentStatus = event.target.value === "Done" ? true : false;
      const response = await axios.post(
        backendUrl + "/api/order/updatePaymentStatus",
        { orderId, payment: newPaymentStatus },
        { headers: { token } }
      );
      if (response.data.success) await fetchAllOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-3xl font-bold  mb-4 md:mb-0 ">
          Order Management
        </h3>
        {isMobile ? (
          <div className="flex flex-row gap-4">
            {/* Filter select on the left */}
            <div className="w-1/2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400"
              >
                <option value="All">All</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            {/* Always show search input on mobile */}
            <div className="w-1/2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:gap-4">
            {/* Filter select on the left */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400"
            >
              <option value="All">All</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {/* Search input on the right */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full mb-2 md:mb-0 p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 hover:border-gray-400"
            />
          </div>
        )}
      </div>
      <div className="space-y-6">
        {filteredOrders.map((order, index) => (
          <div
            key={order._id || index}
            className="border border-gray-200 p-6 rounded-2xl shadow-lg bg-white hover:shadow-2xl transition duration-300 cursor-pointer"
            onClick={() =>
              isMobile && setExpandedOrder(expandedOrder === index ? null : index)
            }
          >
            {isMobile ? (
              <>
                <div className="flex items-start justify-between">
                  <img
                    src={assets.parcel_icon}
                    alt="Parcel Icon"
                    className="w-14 h-14"
                  />
                  <p className="text-2xl font-bold text-gray-800">
                    {currency}
                    {order.amount}
                  </p>
                </div>
                {expandedOrder === index && (
                  <div className="mt-4 text-gray-700 space-y-3">
                    <p className="font-semibold text-lg">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <div className="text-gray-600 text-sm">
                      <p>{order.address.street},</p>
                      <p>
                        {order.address.city}, {order.address.state},{" "}
                        {order.address.country} {order.address.zipcode}
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">{order.address.phone}</p>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-2 border border-gray-300 rounded-md"
                        >
                          <p className="text-sm">
                            <span className="text-blue-600 font-bold">
                              {item.name}
                            </span>{" "}
                            x{" "}
                            <span className="text-red-600 font-semibold">
                              {item.quantity}
                            </span>{" "}
                            <span className="italic">{item.size}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <p>Items: {order.items.length}</p>
                      <p>Method: {order.paymentMethod}</p>
                      <p
                        className={`font-semibold ${
                          order.payment ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Payment: {order.payment ? "Done" : "Pending"}
                      </p>
                      <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) => statusHandler(event, order._id)}
                        value={order.status}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) =>
                          paymentStatusHandler(event, order._id)
                        }
                        value={order.payment ? "Done" : "Pending"}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6 w-2/3">
                  <img
                    src={assets.parcel_icon}
                    alt="Parcel Icon"
                    className="w-14 h-14"
                  />
                  <div className="space-y-4">
                    <p className="font-semibold text-gray-800">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <div className="text-gray-600 text-sm">
                      <p>{order.address.street},</p>
                      <p>
                        {order.address.city}, {order.address.state},{" "}
                        {order.address.country} {order.address.zipcode}
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {order.address.phone}
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="border border-gray-300 p-3 rounded-lg"
                        >
                          <p className="text-blue-600 font-bold">
                            {item.name} &nbsp;
                            <span className="text-red-600 font-semibold">
                              x {item.quantity}
                            </span> &nbsp;
                            <span className="italic text-sm">{item.size}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2 min-w-[220px]">
                  <p className="text-gray-700 text-sm">
                    Items: {order.items.length}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Method: {order.paymentMethod}
                  </p>
                  <p
                    className={`font-semibold text-sm ${
                      order.payment ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Payment: {order.payment ? "Done" : "Pending"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {currency}
                    {order.amount}
                  </p>
                  <div className="flex flex-col gap-2">
                    <select
                      onChange={(event) => statusHandler(event, order._id)}
                      value={order.status}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400 md:w-auto"
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                      onChange={(event) =>
                        paymentStatusHandler(event, order._id)
                      }
                      value={order.payment ? "Done" : "Pending"}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400 md:w-auto"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

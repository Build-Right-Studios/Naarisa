import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../utils/axiosInstance";
import { ORDER } from "../Constants/apiRoutes";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(ORDER.BY_ID(orderId));

      setOrder(res.data.data);
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order Not Found
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F9F3EB",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "#fff",
          border: "1px solid #E8DDD0",
          padding: "40px",
        }}
      >
        {/* Header */}

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "#2D6B5A",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "32px",
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            Thank You For Your Order
          </h1>

          <p
            style={{
              color: "#8C7B6B",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            Your payment has been received successfully.
          </p>
        </div>

        {/* Order Info */}

        <div
          style={{
            backgroundColor: "#FDF8F1",
            padding: "20px",
            marginBottom: "30px",
            border: "1px solid #E8DDD0",
          }}
        >
          <p>
            <strong>Order ID:</strong> {order.customOrderId}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {order.status
              ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
              : "N/A"}
          </p>

          <p>
            <strong>Paid At:</strong>{" "}
            {new Date(order.payment.paidAt).toLocaleString("en-IN")}
          </p>

          <p>
            <strong>Total:</strong> ₹
            {order.pricing.total.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Items */}

        <h2
          style={{
            fontFamily: "'EB Garamond', serif",
            marginBottom: "20px",
          }}
        >
          Ordered Items
        </h2>

        {order.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "20px",
              padding: "20px 0",
              borderBottom: "1px solid #E8DDD0",
            }}
          >
            <img
              src={item.variant?.images?.[0]?.url}
              alt={item.productName}
              style={{
                width: "100px",
                height: "130px",
                objectFit: "cover",
              }}
            />

            <div>
              <h3>{item.productName}</h3>

              <p>Color: {item.variantName}</p>

              <p>Size: {item.size}</p>

              <p>Quantity: {item.quantity}</p>

              <p>₹{item.priceAtOrder}</p>
            </div>
          </div>
        ))}

        {/* Address */}

        <div style={{ marginTop: "40px" }}>
          <h2
            style={{
              fontFamily: "'EB Garamond', serif",
              marginBottom: "10px",
            }}
          >
            Shipping Address
          </h2>

          <p>{order.address.name}</p>
          <p>{order.address.line1}</p>
          <p>
            {order.address.city}, {order.address.state}
          </p>
          <p>{order.address.pincode}</p>
          <p>{order.address.phone}</p>
        </div>

        {/* Buttons */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "40px",
          }}
        >
          <button
            onClick={() => navigate("/account")}
            style={{
              backgroundColor: "#AB721E",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            View Orders
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "#fff",
              color: "#AB721E",
              border: "1px solid #AB721E",
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
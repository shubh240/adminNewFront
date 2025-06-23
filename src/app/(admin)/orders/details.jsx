import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { API_URL_ADMIN } from '../../../context/constants';
import { useAuthContext } from '../../../context/useAuthContext';
import { formatToIST } from '../../../helpers/helper';
import { Button, Badge } from 'react-bootstrap';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL_ADMIN}order/order-details/${orderId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setOrder(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading || !order) return <Spinner size="sm" color="primary" />;

  const {
    orderNumber,
    createdAt,
    paymentStatus,
    paymentTypeId,
    isCancelled,
    isRefunded,
    subTotalAmount,
    cgst,
    sgst,
    deliveryFee,
    platformFee,
    totalAmount,
    customerId,
    customerAddressId,
    items,
    shipment,
  } = order;

  const getPaymentType = (id) => {
    if (id === 1) return 'Online';
    if (id === 2) return 'Cash on Delivery';
    return 'Unknown';
  };

  return (
    <div className="container my-4">
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/orders-list')}>
        ← Back to Orders
      </Button>

      <div className="border p-4 rounded shadow-sm bg-white">
        {/* Header */}
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h3 className="mb-1">INVOICE</h3>
            <p className="text-muted">Order #: {orderNumber}</p>
            <p className="text-muted">Date: {formatToIST(createdAt)}</p>
          </div>
          <div className="text-end">
            <h5>Status</h5>
            <Badge bg={paymentStatus === 'Paid' ? 'success' : 'warning'} className="me-1">
              {paymentStatus}
            </Badge>
            {isCancelled && <Badge bg="danger" className="me-1">Cancelled</Badge>}
            {isRefunded && <Badge bg="secondary">Refunded</Badge>}
          </div>
        </div>

        {/* Customer Info */}
        <h5 className="mb-2">Customer Details</h5>
        <table className="table table-borderless">
          <tbody>
            <tr>
              <td><strong>Name:</strong></td>
              <td>{customerId?.fullName}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>+91 {customerId?.mobileNo}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td>{customerAddressId?.addressLine1}, {customerAddressId?.city}, {customerAddressId?.state} - {customerAddressId?.pincode}</td>
            </tr>
          </tbody>
        </table>

        {/* Items List */}
        <h5 className="mt-4 mb-2">Items Ordered</h5>
        <table className="table table-striped">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={item.productImage}
                      alt={item.productId?.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      className="me-2 rounded"
                    />
                    {item.productId?.name}
                  </div>
                </td>
                <td>{item.quantity || 1}</td>
                <td>₹{item.productId?.sellingPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Price Breakdown */}
        <h5 className="mt-4 mb-2">Price Summary</h5>
        <table className="table">
          <tbody>
            <tr><td>Subtotal</td><td className="text-end">₹{subTotalAmount}</td></tr>
            <tr><td>CGST</td><td className="text-end">₹{cgst}</td></tr>
            <tr><td>SGST</td><td className="text-end">₹{sgst}</td></tr>
            <tr><td>Delivery Fee</td><td className="text-end">₹{deliveryFee}</td></tr>
            <tr><td>Platform Fee</td><td className="text-end">₹{platformFee}</td></tr>
            <tr className="table-active fw-bold fs-5">
              <td>Total</td><td className="text-end">₹{totalAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Payment & Shipment */}
        <h5 className="mt-4 mb-2">Payment & Shipping</h5>
        <p><strong>Payment Type:</strong> {getPaymentType(paymentTypeId)}</p>
        <p><strong>Tracking ID:</strong> {shipment?.trackingId || 'Not Assigned'}</p>
        <p><strong>Shipment Provider:</strong> {shipment?.shipmentProviderId?.name || 'N/A'}</p>
        {shipment?.currentStatus && (
          <p><strong>Status:</strong> <Badge bg="info">{shipment.currentStatus}</Badge></p>
        )}

        {/* Delivery Address */}
        {shipment?.dropAddressLine1 && (
          <div className="mt-3">
            <h6>Delivery Address</h6>
            <p>{shipment.dropAddressLine1}, {shipment.dropCity}, {shipment.dropState}, {shipment.dropPincode}</p>
            {shipment.dropAddressUrl && (
              <a href={shipment.dropAddressUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                View on Map
              </a>
            )}
          </div>
        )}

        {/* Pickup Address */}
        {shipment?.pickupAddress && (
          <div className="mt-3">
            <h6>Pickup Location</h6>
            <p><strong>Store:</strong> {shipment.pickupStoreName}</p>
            <p>{shipment.pickupAddress}</p>
            {shipment.pickupAddressUrl && (
              <a href={shipment.pickupAddressUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                View Pickup on Map
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState ,useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { API_URL_ADMIN } from '../../../context/constants';
import { useAuthContext } from '../../../context/useAuthContext';
import { formatToIST } from '../../../helpers/helper';
import { Button, Badge } from 'react-bootstrap';
import html2pdf from 'html2pdf.js';
import { FaDownload } from 'react-icons/fa';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const invoiceRef = useRef();

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
const handleDownloadInvoice = () => {
  const element = invoiceRef.current;
  if (!element) {
    console.error("Invoice element not found.");
    return;
  }

  const opt = {
    margin: 0.5,
    filename: `Invoice_${order?.orderNumber || orderId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  html2pdf().set(opt).from(element).save();
};


  if (loading || !order) return <Spinner size="sm" color="primary" />;

  const {
    orderNumber,
    createdAt,
    paymentStatus,
    paymentType,
    isCancelled,
    isRefunded,
    subTotalAmount,
    cgst,
    sgst,
    deliveryFee,
    platformFee,
    totalAmount,
    discountAmount,
    couponCode,
    customerId,
    customerAddressId,
    items,
    shipment,
    orderStatus,
    transactionId,
    shipmentHistory
  } = order;

  return (
    <div className="container my-4">
<div className="d-flex justify-content-end gap-2 mb-3">
  <Button variant="secondary" onClick={() => navigate('/orders-list')}>
    ← Back to Orders
  </Button>
  <Button variant="outline-primary" onClick={handleDownloadInvoice}>
    <FaDownload className="me-2" />
    Download Invoice
  </Button>
</div>


      <div className="border p-4 rounded shadow-sm bg-white" ref={invoiceRef}>
        {/* Header */}
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h3 className="mb-1">INVOICE</h3>
            <p className="text-muted">Order #: {orderNumber}</p>
            <p className="text-muted">Date: {formatToIST(createdAt)}</p>
            <p className="text-muted">Transaction ID: {transactionId || 'N/A'}</p>
          </div>
          <div className="text-end">
            <h5>Status</h5>
            <Badge bg={paymentStatus === 'Success' ? 'success' : 'warning'} className="me-1">
              {orderStatus}
            </Badge>
            {isCancelled && <Badge bg="danger" className="me-1">Cancelled</Badge>}
            {isRefunded && <Badge bg="secondary">Refunded</Badge>}
          </div>
        </div>

        {/* Customer Info */}
        <h5 className="mb-2">Customer Details</h5>
        <table className="table table-borderless">
          <tbody>
            <tr><td><strong>Name:</strong></td><td>{customerId?.fullName}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>+91 {customerId?.mobileNo}</td></tr>
            <tr><td><strong>Email:</strong></td><td>{customerId?.email}</td></tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td>
                {customerAddressId?.address_line_1}, {customerAddressId?.address_line_2 && `${customerAddressId?.address_line_2}, `}
                {customerAddressId?.city}, {customerAddressId?.state} - {customerAddressId?.pincode}
              </td>
            </tr>
            {customerAddressId?.address_url && (
              <tr>
                <td></td>
                <td>
                  <a href={customerAddressId.address_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">📍 View Map</a>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Items List */}
        <h5 className="mt-4 mb-2">Items Ordered</h5>
        <table className="table table-striped">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.productName}</td>
                <td>{item.productSize}</td>
                <td>{item.quantity}</td>
                <td>₹{item.amountPerUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Price Summary */}
        <h5 className="mt-4 mb-3 border-bottom pb-2">Price Summary</h5>
        <table className="table table-sm table-borderless">
          <tbody>
            <tr><td>Subtotal</td><td className="text-end">₹{subTotalAmount}</td></tr>
            <tr><td>CGST</td><td className="text-end">₹{cgst}</td></tr>
            <tr><td>SGST</td><td className="text-end">₹{sgst}</td></tr>
            <tr><td>Delivery Fee</td><td className="text-end">₹{deliveryFee}</td></tr>
            <tr><td>Platform Fee</td><td className="text-end">₹{platformFee}</td></tr>
            {couponCode && (
              <tr><td>Coupon ({couponCode})</td><td className="text-end">-₹{discountAmount}</td></tr>
            )}
            <tr className="border-top fw-bold fs-5">
              <td>Total</td><td className="text-end text-success">₹{totalAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* Payment & Shipment */}
        <h5 className="mt-4 mb-3 border-bottom pb-2">Payment & Delivery</h5>
        <p><strong>Payment Mode:</strong> {paymentType}</p>
        <p><strong>Shipment Provider:</strong> {shipment?.shipmentProviderId?.name || 'N/A'}</p>
        <p><strong>Tracking ID:</strong> {shipment?.trackingId || 'Not Assigned'}</p>

        {/* Delivery Address */}
        {shipment?.dropAddressLine1 && (
          <div className="mb-3">
            <h6>Delivery Address</h6>
            <p>{shipment.dropAddressLine1}{shipment.dropAddressLine2 && `, ${shipment.dropAddressLine2}`}, {shipment.dropCity}, {shipment.dropState} - {shipment.dropPincode}</p>
            {shipment.dropAddressUrl && (
              <a href={shipment.dropAddressUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                📍 View Delivery on Map
              </a>
            )}
          </div>
        )}

        {/* Pickup Address */}
        {shipment?.pickupAddress && (
          <div className="mb-3">
            <h6>Pickup Location</h6>
            <p><strong>Store:</strong> {shipment.pickupStoreName}</p>
            <p>{shipment.pickupAddress}</p>
            {shipment.pickupAddressUrl && (
              <a href={shipment.pickupAddressUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                🏪 View Pickup on Map
              </a>
            )}
          </div>
        )}

        {/* Shipment History */}
        {shipmentHistory?.length > 0 && (
          <div className="mt-4">
            <h5>Shipment Status Timeline</h5>
            <ul className="list-group">
              {shipmentHistory.map((entry, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between">
                  <span><strong>{entry.currentStatus}</strong>: {entry.description}</span>
                  <span className="text-muted">{formatToIST(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

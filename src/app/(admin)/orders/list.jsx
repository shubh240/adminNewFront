import { useNavigate, useParams,useLocation  } from 'react-router-dom'
import CommonListing from '@/components/CommonListing'
import { formatToIST, getStatusClass } from '@/helpers/helper'
import { useAuthContext } from '@/context/useAuthContext'
import axios from 'axios'
import { API_URL_ADMIN } from '@/context/constants'
import { _ } from 'gridjs-react'

export default function OrderListingPage() {
  const navigate = useNavigate()
  // const { storeId } = useParams()
  const { user } = useAuthContext()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const customerId = queryParams.get("customerId")
  const storeId = queryParams.get("storeId")

  const fetchOrders = async (filters) => {
    const body = { ...filters, storeId: storeId || undefined,customerId: customerId || undefined }
    const res = await axios.post(`${API_URL_ADMIN}order/list-order`, body, {
      headers: { Authorization: `Bearer ${user?.token}` },
    })
    return res?.data?.data?.orders?.map((item) => [
      item,
      item?.customerId?.fullName,
      item?.paymentStatus,
      item?.totalAmount,
      item?.createdAt,
    ])
  }

  const columns = [
    {
      name: 'Order No.',
      formatter: (cell, row) => row.cells[0].data?.orderNumber,
    },
    'Customer',
    {
      name: 'Payment',
      formatter: (cell, row) => {
        const item = row.cells[0].data
        return _(
          <span className={`badge ${getStatusClass(item.paymentStatus)} rounded-pill me-1`}>
            {item.paymentStatus}
          </span>
        )
      },
    },
    'Amount',
    {
      name: 'Date',
      formatter: (cell, row) => formatToIST(row.cells[0].data?.createdAt),
    },
    {
      name: 'Action',
      formatter: (cell, row) => {
        const item = row.cells[0].data
        return _(
          <>
            <button
              className="rounded-pill btn btn-sm btn-outline-info me-2"
              onClick={() => navigate(`/order-details/${item._id}`)}
            >
              Details
            </button>
            <button
              className="rounded-pill btn btn-sm btn-outline-info me-2"
              onClick={() => navigate(`/invoice/${item._id}`)}
            >
              Invoice
            </button>
          </>
        )
      },
    },
  ]

  return (
    <CommonListing
      title="Order List"
      fetchDataApi={fetchOrders}
      columns={columns}
      showStatusFilter={true}
      showDateFilter={true}
      statusOptions={[
        { label: 'All', value: '' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Accepted', value: 'Accepted' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Processing', value: 'Processing' },
        { label: 'Partner Assigned', value: 'Partner Assigned' },
        { label: 'Out For Delivery', value: 'Out For Delivery' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Shipment Cancelled', value: 'Shipment Cancelled' },
        { label: 'Return Initiated', value: 'Return Initiated' },
      ]}
    />
  )
}

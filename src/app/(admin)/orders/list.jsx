import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_SELLER } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { Grid, _ } from 'gridjs-react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from 'react-bootstrap'
import Spinner from '@/components/Spinner'
import { formatToIST, getStatusClass } from '../../../helpers/helper'

export default function Home() {
  const navigate = useNavigate()

  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const didFetch = useRef(false)

  const [data, setData] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const payload = {
        sellerId: user?._id,
      }
      const res = await axios.post(`${API_URL_SELLER}order/list-order`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
      })
      setData(res?.data?.data?.orders)
      setLoading(false)
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

const handleStatusChange = async (orderId, newStatus) => {
  try {
    const result = await Swal.fire({
      title: `Are you sure you want to mark as ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus}`,
    });

    if (!result.isConfirmed) return;

    await axios.put(
      `${API_URL_SELLER}order/update-order-status/${orderId}`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );

    showNotification({
      message: `Order status updated to ${newStatus}`,
      variant: 'success',
    });

    fetchData(); // refresh data
  } catch (err) {
    showNotification({
      message: 'Failed to update order status',
      variant: 'danger',
    });
  }
};


  useEffect(() => {
    if (didFetch.current) return
    fetchData()

    didFetch.current = true
  }, [])

  if (loading) {
    return <Spinner size="sm" color="primary" />
  }

  return (
    <>
      <PageMetaData />

      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Order List</h4>
          </div>

          {data?.length === 0 ? (
            <p className="text-muted">No orders found.</p>
          ) : (
            <Grid
              data={data?.map((item) => [item, item?.customerId?.fullName, item?.paymentStatus, item?.totalAmount, item?.createdAt])}
              columns={[
                {
                  name: 'Order No.',
                  sort: false,
                  formatter: (cell, row) => {
                    const item = row.cells[0].data
                    return item?.orderNumber
                  },
                },
                'Customer',
                {
                  name: 'Payment',
                  sort: false,
                  formatter: (cell, row) => {
                    const item = row.cells[0].data
                    const badgeClass = getStatusClass(item?.paymentStatus)
                    return _(<span className={`badge ${badgeClass} rounded-pill me-1`}>{item?.paymentStatus}</span>)
                  },
                },
                'Amount',
                {
                  name: 'Date',
                  formatter: (cell, row) => {
                    const item = row.cells[0].data
                    return formatToIST(item?.createdAt)
                  },
                },
                {
                  name: 'Order Status',
                  formatter: (cell, row) => {
                    const item = row.cells[0].data;
                    const currentStatus = item?.orderStatus || "Pending";

                    return _(
                      <select
                        className="form-select form-select-sm"
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        disabled={currentStatus !== "Pending"} // Optional: lock after decision
                        style={{ minWidth: "130px" }}
                      >
                        <option value="Pending" disabled>Pending</option>
                        <option value="Accepted">Accept</option>
                        <option value="Rejected">Reject</option>
                      </select>
                    );
                  },
                },
                {
                  name: 'Action',
                  sort: false,
                  formatter: (cell, row) => {
                    const item = row.cells[0].data
                    const id = item._id
                    return _(
                      <>
                        <button className="rounded-pill btn btn-sm btn-outline-info me-2" onClick={() => navigate(`/order-details/${id}`)}>
                          Details
                        </button>
                      </>,
                    )
                  },
                },
              ]}
              search={true}
              pagination={{
                enabled: true,
                limit: 10,
              }}
              sort={true}
            />
          )}
        </CardBody>
      </Card>
    </>
  )
}

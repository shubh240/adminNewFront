import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_ADMIN } from '../../../context/constants'
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
      
      const res = await axios.post(`${API_URL_ADMIN}order/list-order`, 
        {},
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
              data={data?.map((item) => [
                item, 
                item?.customerId?.fullName, 
                item?.paymentStatus, 
                item?.totalAmount, 
                item?.createdAt
              ])}
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
                        <button className="rounded-pill btn btn-sm btn-outline-info me-2" onClick={() => navigate(`/invoice/${id}`)}>
                          Invoice
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

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

      const res = await axios.get(`${API_URL_ADMIN}store/list-stores`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      const { stores } = res.data.data;
      setData(stores)
      setLoading(false)
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  // Fetch categories
  useEffect(() => {
    if (didFetch.current) return
    fetchData()

    didFetch.current = true
  }, [])

  const handleStatusToggle = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to toggle the store status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)

        await axios.put(
          `${API_URL_ADMIN}store/toggle-status-store/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          },
        )

        showNotification({
          message: 'Status updated successfully!',
          variant: 'success',
        })
        // Refresh the table data
        fetchData()
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)

        showNotification({
          message: 'Failed to update status',
          variant: 'danger',
        })
      }
    }
  }
  const handleActiveToggle = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to toggle the store status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)

        await axios.put(
          `${API_URL_ADMIN}store/toggle-active-store/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          },
        )

        showNotification({
          message: 'Status updated successfully!',
          variant: 'success',
        })
        // Refresh the table data
        fetchData()
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)

        showNotification({
          message: 'Failed to update status',
          variant: 'danger',
        })
      }
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This store will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)

        await axios.delete(`${API_URL_ADMIN}store/delete-store/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The store has been deleted.',
          variant: 'success',
        })
        fetchData()
        setLoading(false)
      } catch (error) {
        setLoading(false)

        showNotification({
          message: error?.response?.data?.message || 'Something went wrong.',
          variant: 'danger',
        })
      }
    }
  }

  if (loading) {
    return <Spinner size="sm" color="primary" />
  }
  
  return (
    <>
      <PageMetaData />

      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Stores List</h4>
            <Link className="btn btn-primary" to={'/stores-add'}>
              Add
            </Link>
          </div>

          {data.length === 0 ? (
            <p className="text-muted">No data found.</p>
          ) : (
            <Grid
              data={data?.map((item, index) => [
                index + 1,
                item,
                item?.storeName,
                `${item?.sellerAuthId?.userInfo?.firstName} ${item?.sellerAuthId?.userInfo?.lastName}`,
                item?.sellerAuthId?.userAuth?.email,
                item?.city,
                `${item?.limitTime?.minimum}-${item?.limitTime?.maximum}`,
                item?.city
              ])}
              columns={[
                'No',
                {
                  name: 'Logo',
                  sort: false,
                  formatter: (cell, row) => {
                    const store = row.cells[1].data

                    return _(
                        <img
                          src={store?.logoUrl}
                          alt={store?.name}
                          width="40"
                          height="40"
                          style={{ objectFit: 'cover', borderRadius: '6px' }}
                        />,
                    )
                  },
                },
                'Store Name',
                'Owner',
                'Email',
                'City',
                'Timings',
                {
                  name: 'Status',
                  sort: false,
                  formatter: (cell, row) => {
                    const store = row.cells[1].data
                    const id = store._id
                    const storeOn = store.storeOn === true

                    return _(
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" checked={storeOn} onChange={() => handleStatusToggle(id)} />
                      </div>,
                    )
                  },
                },
                {
                  name: 'Active/In-Active',
                  sort: false,
                  formatter: (cell, row) => {
                    const store = row.cells[1].data
                    const id = store._id
                    const isActive = store.isActive === true

                    return _(
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" checked={isActive} onChange={() => handleActiveToggle(id)} />
                      </div>
                    )
                  },
                },
                {
                  name: 'Action',
                  sort: false,
                  formatter: (cell, row) => {
                    const store = row.cells[1].data
                    const id = store._id
                    return _(
                      <>
                        <button className="rounded-pill btn btn-sm btn-outline-primary me-2" onClick={() => navigate(`/stores-edit/${id}`)}>
                          Edit
                        </button>
                        <button className="rounded-pill btn btn-sm btn-outline-danger" onClick={() => handleDelete(id)}>
                          Delete
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

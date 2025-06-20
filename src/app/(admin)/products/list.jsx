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

      const res = await axios.get(`${API_URL_SELLER}products/list-product`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setData(res?.data?.data?.products)
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
      text: 'Do you want to toggle the product status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)

        await axios.patch(
          `${API_URL_SELLER}products/status-product/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          },
        )

        // Swal.fire('Updated!', 'Product status has been changed.', 'success')

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
      text: 'This product will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)

        await axios.delete(`${API_URL_SELLER}products/delete-product/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The product has been deleted.',
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
            <h4 className="mb-0">Product List</h4>
            <Link className="btn btn-primary" to={'/products-add'}>
              Add
            </Link>
          </div>

          {data.length === 0 ? (
            <p className="text-muted">No data found.</p>
          ) : (
            <Grid
              data={data.map((item, index) => [
                index + 1,
                item,
                item?.name,
                // item?.sku,
                item?.brandName,
                item?.subcategory?.name + ' (' + item?.category?.name + ')' || 'N/A',
              ])}
              columns={[
                'No',
                {
                  name: 'Image',
                  sort: false,
                  formatter: (cell, row) => {
                    const product = row.cells[1].data

                    return _(
                        <img
                          src={product?.primaryImage}
                          alt={product?.name}
                          width="40"
                          height="40"
                          style={{ objectFit: 'cover', borderRadius: '6px' }}
                        />,
                    )
                  },
                },
                'Name',
                // 'SKU',
                'Brand',
                'Sub Category',
                {
                  name: 'Price',
                  sort: false,
                  formatter: (cell, row) => {
                    const product = row.cells[1].data

                    return _(
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">{product?.sellingPrice}</span>
                        {' / '}
                        <span className="text-muted text-decoration-line-through">{product?.originalPrice}</span>
                      </div>,
                    )
                  },
                },
                {
                  name: 'Status',
                  sort: false,
                  formatter: (cell, row) => {
                    const product = row.cells[1].data
                    const id = product._id
                    const isActive = product.status === true

                    return _(
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" checked={isActive} onChange={() => handleStatusToggle(id)} />
                      </div>,
                    )
                  },
                },
                {
                  name: 'Action',
                  sort: false,
                  formatter: (cell, row) => {
                    const product = row.cells[1].data
                    const id = product._id
                    return _(
                      <>
                        <button className="rounded-pill btn btn-sm btn-outline-primary me-2" onClick={() => navigate(`/products-edit/${id}`)}>
                          Edit
                        </button>
                        <button className="rounded-pill btn btn-sm btn-outline-secondary me-2" onClick={() => navigate(`/products-inventory-list/${id}`)}>
                          Inventory
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

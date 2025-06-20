import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_SELLER } from '../../../../context/constants'
import { useAuthContext } from '../../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { Grid, _ } from 'gridjs-react'
import Swal from 'sweetalert2'
import { Card, CardBody } from 'react-bootstrap'
import Spinner from '@/components/Spinner'

export default function Home() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const didFetch = useRef(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL_SELLER}productSize/list-productSize?productId=${productId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setData(res?.data?.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      showNotification({ message: 'Failed to fetch product inventory', variant: 'danger' })
    }
  }

  useEffect(() => {
    if (!didFetch.current) {
      fetchData()
      didFetch.current = true
    }
  }, [])

  const handleInlineUpdate = async (id, field, value) => {
    try {
      console.log('id, field, value',id, field, value);
      
      await axios.put(`${API_URL_SELLER}productSize/update-productSize/${id}`, {
        [field]: value,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      showNotification({ message: 'Updated successfully!', variant: 'success' })
      fetchData()
    } catch (error) {
      showNotification({
        message: error?.response?.data?.message || 'Update failed',
        variant: 'danger',
      })
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This item will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)
        await axios.delete(`${API_URL_SELLER}productSize/delete-productSize/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        })
        showNotification({ message: 'The item has been deleted.', variant: 'success' })
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

  if (loading) return <Spinner size="sm" color="primary" />

  return (
    <>
      <PageMetaData />
      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Product Inventory List</h4>
            <Link className="btn btn-primary" to={`/products-inventory-add/${productId}`}>Add Inventory</Link>
          </div>

          {data.length === 0 ? (
            <p className="text-muted">No data found.</p>
          ) : (
            <Grid
              data={data.map((item, index) => [
                index + 1,
                _(
                  <input
                    type="text"
                    defaultValue={item.size}
                    className="form-control form-control-sm"
                    onBlur={(e) => {
                      if (e.target.value !== item.size) {
                        handleInlineUpdate(item._id, 'size', e.target.value)
                      }
                    }}
                  />
                ),
                _(
                  <input
                    type="number"
                    defaultValue={item.quantity}
                    className="form-control form-control-sm"
                    onBlur={(e) => {
                      if (parseInt(e.target.value) !== item.quantity) {
                        handleInlineUpdate(item._id, 'quantity', parseInt(e.target.value))
                      }
                    }}
                  />
                ),
                _(
                  <input
                    type="text"
                    defaultValue={item.sku}
                    className="form-control form-control-sm"
                    onBlur={(e) => {
                      if (parseInt(e.target.value) !== item.sku) {
                        handleInlineUpdate(item._id, 'sku', e.target.value)
                      }
                    }}
                  />
                ),
                _(
                  <>
                   <button className="rounded-pill btn btn-sm btn-outline-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                  </>
                ),
              ])}
              columns={['No', 'Size', 'Quantity','Sku', 'Action']}
              search={true}
              pagination={{ enabled: true, limit: 10 }}
              sort={true}
            />
          )}
        </CardBody>
      </Card>
    </>
  )
}

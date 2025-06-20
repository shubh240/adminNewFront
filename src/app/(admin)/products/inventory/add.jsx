import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { Card, CardBody } from 'react-bootstrap'
import PageMetaData from '@/components/PageTitle'
import Spinner from '@/components/Spinner'
import axios from 'axios'
import { API_URL_SELLER } from '@/context/constants'

export default function Home() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()

  const [loading, setLoading] = useState(false)
  const [sizeQuantityList, setSizeQuantityList] = useState([{ size: '', quantity: '' ,sku:'' }])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!productId) {
      return showNotification({ message: 'Missing product ID.', variant: 'danger' })
    }

    if (sizeQuantityList.some(item => !item.size || !item.quantity || !item.sku)) {
      return showNotification({ message: 'Please fill all size , sku and quantity fields.', variant: 'warning' })
    }

    try {
      setLoading(true)
      for (const item of sizeQuantityList) {
        await axios.post(
          `${API_URL_SELLER}productSize/create-productSize`,
          {
            productId,
            size: item.size,
            quantity: item.quantity,
            sku: item.sku,
          },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )
      }

      showNotification({ message: 'Size & quantity added successfully.', variant: 'success' })
      navigate(`/products-inventory-list/${productId}`)
    } catch (error) {
      console.error(error)
      showNotification({
        message: error?.response?.data?.message || 'Failed to add size and quantity.',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner size="sm" color="primary" />

  return (
    <>
      <PageMetaData title="Add Sizes" />
      <Card>
        <CardBody>
          <h3 className="mb-4">Add Sizes for Product</h3>
          <form onSubmit={handleSubmit}>
            {sizeQuantityList.map((item, index) => (
              <div className="row mb-3" key={index}>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Size (e.g., S, M, L)"
                    value={item.size}
                    onChange={(e) => {
                      const updated = [...sizeQuantityList]
                      updated[index].size = e.target.value
                      setSizeQuantityList(updated)
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...sizeQuantityList]
                      updated[index].quantity = e.target.value
                      setSizeQuantityList(updated)
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="SKU"
                    value={item.sku}
                    onChange={(e) => {
                      const updated = [...sizeQuantityList]
                      updated[index].sku = e.target.value
                      setSizeQuantityList(updated)
                    }}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      const updated = sizeQuantityList.filter((_, i) => i !== index)
                      setSizeQuantityList(updated.length > 0 ? updated : [{ size: '', quantity: '' ,sku:'' }])
                    }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-primary mb-3"
              onClick={() => setSizeQuantityList([...sizeQuantityList, { size: '', quantity: '',sku:'' }])}>
              + Add Size
            </button>
            <br />
            <button type="submit" className="btn btn-success">
              Submit Sizes
            </button>
          </form>
        </CardBody>
      </Card>
    </>
  )
}

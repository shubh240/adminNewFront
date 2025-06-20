import { useCallback, useState, useEffect } from 'react'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_SELLER } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import Spinner from '@/components/Spinner'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    couponCode: '',
    discountType: '',
    maxDiscountAmount: '',
    discountValue: '',
    minOrderAmount: '',
    usageLimit: '',
    usageLimitPerUser: '',
    validFrom: '',
    validTill: '',
    images: null, // Renamed
  })

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile)
      setPreviewUrl(objectUrl)

      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [imageFile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const onDropImage = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setImageFile(file)
      setFormData((prev) => ({
        ...prev,
        images: file,
      }))
    }
  }, [])

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    onDrop: onDropImage,
    maxFiles: 1,
    accept: { 'image/*': [] },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    for (const key in formData) {
      if (!formData[key]) {
        return showNotification({
          message: `Please fill the ${key} field.`,
          variant: 'warning',
        })
      }
    }

    if (formData.validFrom && formData.validTill) {
      const fromDate = new Date(formData.validFrom)
      const tillDate = new Date(formData.validTill)

      if (tillDate <= fromDate) {
        return showNotification({
          message: 'Valid Till date must be greater than Valid From date',
          variant: 'warning',
        })
      }
    }

    try {
      setLoading(true)
      const form = new FormData()

      for (const key in formData) {
        if (formData[key]) {
          form.append(key, formData[key])
        }
      }

      await axios.post(`${API_URL_SELLER}coupon/add-coupon`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      })

      showNotification({
        message: 'Coupon added successfully!',
        variant: 'success',
      })

      navigate('/coupons-list')
    } catch (error) {
      console.error(error)
      showNotification({
        message: error?.response?.data?.message || 'Failed to add coupon',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner size="sm" color="primary" />

  return (
    <>
      <PageMetaData />
      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Add Coupon</h4>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Coupon Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Coupon Code <small className="text-muted">(Only letters, numbers, and % allowed)</small>
                </label>
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      couponCode: e.target.value.replace(/[^a-zA-Z0-9%]/g, ''),
                    }))
                  }
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Discount Type</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange} className="form-control" required>
                  <option value="">Select type</option>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Discount Value</label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className="form-control" required />
              </div>

              <div className="col-md-4">
                <label className="form-label">Max Discount Amount</label>
                <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Minimum Order Amount</label>
                <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Usage Limit</label>
                <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Usage Limit Per User</label>
                <input type="number" name="usageLimitPerUser" value={formData.usageLimitPerUser} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Valid From</label>
                <input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Valid Till</label>
                <input type="date" name="validTill" value={formData.validTill} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={3}></textarea>
              </div>

              <div className="col-md-4">
                <label className="form-label">Image</label>
                <div
                  {...getImageRootProps()}
                  className="dropzone border p-4 bg-light text-center"
                  style={{ cursor: 'pointer', borderStyle: 'dashed' }}>
                  <input {...getImageInputProps()} />
                  {imageFile ? <img src={previewUrl} alt="Preview" height={100} /> : <p>Drag 'n' drop or click to select an image</p>}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Add Coupon
            </button>
          </form>
        </CardBody>
      </Card>
    </>
  )
}

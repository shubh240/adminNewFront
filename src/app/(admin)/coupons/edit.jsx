import { useCallback, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_SELLER } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import Spinner from '@/components/Spinner'

export default function EditCoupon() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const didFetch = useRef(false)

  const [imageFile, setImageFile] = useState(null) // newly selected file
  const [previewUrl, setPreviewUrl] = useState(null) // preview of selected or existing image

  // Form data state
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
    images: null, // file object for upload
  })

  // Fetch coupon data by id
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL_SELLER}coupon/couponById/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setLoading(false)

      const coupon = res.data?.data
      if (coupon) {
        setFormData({
          name: coupon.name || '',
          description: coupon.description || '',
          couponCode: coupon.couponCode || '',
          discountType: coupon.discountType || '',
          maxDiscountAmount: coupon.maxDiscountAmount || '',
          discountValue: coupon.discountValue || '',
          minOrderAmount: coupon.minOrderAmount || '',
          usageLimit: coupon.usageLimit || '',
          usageLimitPerUser: coupon.usageLimitPerUser || '',
          validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : '',
          validTill: coupon.validTill ? coupon.validTill.slice(0, 10) : '',
          images: null, // no file yet
        })

        setPreviewUrl(coupon.imageUrl || null)
      }
    } catch (err) {
      setLoading(false)
      showNotification({ message: 'Failed to fetch coupon data', variant: 'danger' })
    }
  }

  useEffect(() => {
    if (didFetch.current) return
    fetchData()
    didFetch.current = true
  }, [])

  // Generate preview URL for newly selected image file
  useEffect(() => {
    if (!imageFile) return

    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  // Dropzone setup for image upload
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

  // Handle input changes (except couponCode handled inline)
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Submit updated coupon data
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check required fields
    for (const key of [
      'name',
      'couponCode',
      'discountType',
      'discountValue',
      'maxDiscountAmount',
      'minOrderAmount',
      'usageLimit',
      'usageLimitPerUser',
      'validFrom',
      'validTill',
    ]) {
      if (!formData[key]) {
        return showNotification({
          message: `Please fill the ${key} field.`,
          variant: 'warning',
        })
      }
    }

    // Date validation
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

      // Append all form fields except images first
      for (const key in formData) {
        if (key !== 'images') {
          form.append(key, formData[key])
        }
      }
      // Append images file if new file selected
      if (formData.images) {
        form.append('images', formData.images)
      }

      await axios.put(`${API_URL_SELLER}coupon/edit-coupon/${id}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      })

      showNotification({
        message: 'Coupon updated successfully!',
        variant: 'success',
      })

      navigate('/coupons-list')
    } catch (error) {
      console.error(error)
      showNotification({
        message: error?.response?.data?.message || 'Failed to update coupon',
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
            <h4 className="mb-0">Coupon Update</h4>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Coupon Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
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
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="form-control"
                  required>
                  <option value="">Select type</option>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Max Discount Amount</label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Minimum Order Amount</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Usage Limit Per User</label>
                <input
                  type="number"
                  name="usageLimitPerUser"
                  value={formData.usageLimitPerUser}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Valid From</label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Valid Till</label>
                <input
                  type="date"
                  name="validTill"
                  value={formData.validTill}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows={3}
                  required
                ></textarea>
              </div>

              <div className="col-md-4">
                <label className="form-label">Image</label>
                <div
                  {...getImageRootProps()}
                  className="dropzone border p-4 bg-light text-center"
                  style={{ cursor: 'pointer', borderStyle: 'dashed' }}>
                  <input {...getImageInputProps()} />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" height={100} style={{ objectFit: 'contain' }} />
                  ) : (
                    <p>Drag 'n' drop or click to select an image</p>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Update
            </button>
          </form>
        </CardBody>
      </Card>
    </>
  )
}

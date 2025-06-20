import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_ADMIN, API_URL_SELLER } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from 'react-bootstrap'
import Select from 'react-select'
import { useDropzone } from 'react-dropzone'
import Spinner from '@/components/Spinner'

export default function Home() {
  const navigate = useNavigate()

  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const didFetch = useRef(false)

  const [categoryList, setCategoryList] = useState([])
  const [subCategoryList, setSubCategoryList] = useState([])
  const [colorList, setColorList] = useState([])
  const [sizeChartList, setSizeChartList] = useState([])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      axios
        .get(`${API_URL_ADMIN}category/list-category`)
        .then((res) => {
          const options = res.data.data.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))
          setCategoryList(options)
          setFormData((prev) => ({
            ...prev,
            subcategory: null,
          }))
          setSubCategoryList([])
        })
        .catch((err) => {
          console.error('Failed to fetch categories', err)
          setLoading(false)

          showNotification({
            message: 'Failed to fetch categories',
            variant: 'danger',
          })
        })
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  const fetchSubCategory = async (category) => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_ADMIN}subCategory/list-sub-category`, {
        params: {
          category: category,
        },
      })
      setLoading(false)

      setSubCategoryList(res.data.data || [])
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  const fetchColor = async () => {
    try {
      setLoading(true)
      axios
        .get(`${API_URL_ADMIN}color/list-colors`)
        .then((res) => {
          const options = res.data.data.colors.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))
          setColorList(options)
          setFormData((prev) => ({
            ...prev,
          }))
        })
        .catch((err) => {
          console.error('Failed to fetch colors', err)
          setLoading(false)

          showNotification({
            message: 'Failed to fetch colors',
            variant: 'danger',
          })
        })
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  const fetchSizeChart = async (category) => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_SELLER}sizeChart/list-sizeChart`, {
        params: {
          category: category,
        },
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)

      setSizeChartList(res.data.data || [])
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
    setLoading(true)
    fetchCategory()
    fetchSizeChart()
    fetchColor()
    didFetch.current = true
    setLoading(false)
  }, [])

  const [primaryImage, setPrimaryImage] = useState(null)
  const [images, setImages] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    // sku: '',
    description: '',
    category: null,
    subcategory: null,
    sellingPrice: '',
    originalPrice: '',
    sizeChart: null,
    brandName: '',
    primaryImage: null,
    images: [],
    colors: null,
  })

  const [sizeQuantityList, setSizeQuantityList] = useState([{ size: '', quantity: '' ,sku:'' }])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  // Handle primary image (only 1)
  const onDropPrimary = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setPrimaryImage(file)
      setFormData((prev) => ({
        ...prev,
        primaryImage: file,
      }))
    }
  }, [])

  // Handle multiple images (up to 5)
  const onDropMultiple = useCallback(
    (acceptedFiles) => {
      if (images.length + acceptedFiles.length > 5) {
        showNotification({
          message: 'You can upload up to 5 images only.',
          variant: 'danger',
        })
        return
      }

      const newFiles = acceptedFiles.slice(0, 5 - images.length)
      const updated = [...images, ...newFiles]

      setImages(updated)
      setFormData((prev) => ({
        ...prev,
        images: updated,
      }))
    },
    [images],
  )

  const { getRootProps: getRootPropsPrimary, getInputProps: getInputPropsPrimary } = useDropzone({
    onDrop: onDropPrimary,
    maxFiles: 1,
    accept: { 'image/*': [] },
  })

  const { getRootProps: getRootPropsMultiple, getInputProps: getInputPropsMultiple } = useDropzone({
    onDrop: onDropMultiple,
    maxFiles: 5,
    accept: { 'image/*': [] },
  })

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index)
    setImages(updated)
    setFormData((prev) => ({
      ...prev,
      images: updated,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.category || !formData.subcategory || !formData.colors) {
      return showNotification({
        message: 'Please fill all required fields',
        variant: 'warning',
      })
    }
    
    if (sizeQuantityList.length === 0 || sizeQuantityList.some((item) => !item.size || !item.quantity || !item.sku)) {
      return showNotification({
        message: 'Please enter at least one valid size and quantity',
        variant: 'warning',
      })
    }

    try {
      setLoading(true)

      const form = new FormData()

      form.append('name', formData.name)
      // form.append('sku', formData.sku)
      form.append('description', formData.description)
      form.append('category', formData.category?.value)
      form.append('subcategory', formData.subcategory)
      form.append('sellingPrice', formData.sellingPrice)
      form.append('originalPrice', formData.originalPrice)
      form.append('sizeChart', formData.sizeChart)
      form.append('brandName', formData.brandName)
      form.append('colors', formData.colors.value)

      if (formData.primaryImage) {
        form.append('primaryImage', formData.primaryImage)
      }

      formData.images.forEach((image) => {
        form.append('images', image)
      })

      const res = await axios.post(`${API_URL_SELLER}products/add-product`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      })

      showNotification({
        message: 'Product added successfully!',
        variant: 'success',
      })

      if (res?.data?.success === true) {
        const productId = res?.data?.data?._id

        for (const item of sizeQuantityList) {
          if (item.size && item.quantity && item.sku) {
            
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
              },
            )
          }
        }
      }

      setLoading(false)

      navigate('/products-list')
    } catch (error) {
      setLoading(false)

      console.error(error)
      showNotification({
        message: error?.response?.data?.message || 'Failed to add product',
        variant: 'danger',
      })
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
            <h4 className="mb-0">Product Add</h4>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Product Details */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter product name"
                />
              </div>
                 <div className="col-md-6">
                <label className="form-label">Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter brand name"
                />
              </div>
              {/* <div className="col-md-6">
                <label className="form-label">SKU</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="form-control" placeholder="Enter SKU" />
              </div> */}
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter product description"></textarea>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <Select
                  id="category"
                  options={categoryList}
                  value={formData?.category}
                  placeholder="Choose a category..."
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({
                      ...prev,
                      category: selectedOption,
                    }))

                    fetchSubCategory(selectedOption?.value)
                  }}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Sub Category</label>
                <Select
                  id="Subcategory"
                  options={subCategoryList}
                  value={subCategoryList.find((opt) => opt._id === formData.subcategory) || null}
                  onChange={(selectedOption) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: selectedOption?._id || '',
                    }))
                  }
                  getOptionValue={(option) => option._id}
                  getOptionLabel={(option) => option.name}
                  placeholder="Choose a sub category..."
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Color</label>
                <Select
                  id="colors"
                  options={colorList}
                  value={formData?.colors}
                  placeholder="Choose a color..."
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({
                      ...prev,
                      colors: selectedOption,
                    }))
                  }}
                />
              </div>
            </div>

            {/* <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter brand name"
                />
              </div>
            </div> */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Selling Price</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0.00"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Original Price</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="0.00"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Size Chart</label>
                <Select
                  id="sizechart"
                  options={sizeChartList}
                  value={(sizeChartList?.length > 0 && sizeChartList.find((opt) => opt._id === formData.sizeChart)) || null}
                  onChange={(selectedOption) =>
                    setFormData((prev) => ({
                      ...prev,
                      sizeChart: selectedOption?._id || '',
                    }))
                  }
                  getOptionValue={(option) => option._id}
                  getOptionLabel={(option) => option.name}
                  placeholder="Choose a size chart..."
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Primary Image</label>
              <div
                {...getRootPropsPrimary()}
                className="dropzone border p-4 bg-light text-center"
                style={{ cursor: 'pointer', borderStyle: 'dashed' }}>
                <input {...getInputPropsPrimary()} />
                {primaryImage ? (
                  <img src={URL.createObjectURL(primaryImage)} alt="Primary" height={100} />
                ) : (
                  <p>Drag 'n' drop or click to select a primary image</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Images (Max 5)</label>
              <div
                {...getRootPropsMultiple()}
                className="dropzone border p-4 bg-light text-center"
                style={{ cursor: 'pointer', borderStyle: 'dashed' }}>
                <input {...getInputPropsMultiple()} />
                <p>Drag 'n' drop or click to select up to 5 images</p>
              </div>

              {images.length > 0 && (
                <div className="mt-3 d-flex flex-wrap gap-2">
                  {images.map((file, idx) => (
                    <div key={idx} className="position-relative">
                      <img src={URL.createObjectURL(file)} alt={`img-${idx}`} height={80} style={{ borderRadius: 8 }} />
                      <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0"
                        aria-label="Remove"
                        onClick={() => removeImage(idx)}></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label">Size & Quantity</label>
              {sizeQuantityList.map((item, index) => (
                <div className="row mb-2" key={index}>
                  <div className="col-md-3">
                    <input
                      type="text"
                      placeholder="Size (e.g., S, M, L)"
                      className="form-control"
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
                      placeholder="Quantity"
                      className="form-control"
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
                        setSizeQuantityList(updated.length > 0 ? updated : [{ size: '', quantity: '',sku:'' }])
                      }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => setSizeQuantityList([...sizeQuantityList, { size: '', quantity: '',sku:'' }])}>
                + Add Size
              </button>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary">
              Add Product
            </button>
          </form>
        </CardBody>
      </Card>
    </>
  )
}

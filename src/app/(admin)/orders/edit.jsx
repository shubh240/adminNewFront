import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_ADMIN, API_URL_SELLER } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from 'react-bootstrap'
import Select from 'react-select'
import { useDropzone } from 'react-dropzone'
import Spinner from '@/components/Spinner'

export default function Home() {
  const { id } = useParams()

  const navigate = useNavigate()

  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const didFetch = useRef(false)

  const [productData, setProductData] = useState(null)

  const [categoryList, setCategoryList] = useState([])
  const [subCategoryList, setSubCategoryList] = useState([])
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
          setLoading(false)

          console.error('Failed to fetch categories', err)
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

      setFormData((prev) => ({
        ...prev,
        subcategory: productData.subcategory?._id || '',
      }))
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

  const fetchData = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_SELLER}products/list-productById/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)

      setProductData(res.data.data || [])
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
    fetchData()
    didFetch.current = true
    setLoading(false)
  }, [])

  const [primaryImage, setPrimaryImage] = useState(null)
  const [images, setImages] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: null,
    subcategory: null,
    sellingPrice: '',
    originalPrice: '',
    sizeChart: null,
    brandName: '',
    primaryImage: null,
    images: [],
  })

  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name || '',
        sku: productData.sku || '',
        description: productData.description || '',
        category: {
          value: productData.category?._id,
          label: productData.category?.name,
        },
        subcategory: productData.subcategory?._id,
        sellingPrice: productData.sellingPrice || '',
        originalPrice: productData.originalPrice || '',
        sizeChart: productData.sizeChart?._id || null,
        brandName: productData.brandName || '',
        primaryImage: null, // Keep null unless you allow re-upload
        images: [],
      })

      fetchSubCategory(productData.category._id)
    }
  }, [productData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

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

    if (!formData.name || !formData.category || !formData.subcategory) {
      return showNotification({
        message: 'Please fill all required fields',
        variant: 'warning',
      })
    }

    // if (sizeQuantityList.length === 0 || sizeQuantityList.some((item) => !item.size || !item.quantity)) {
    //   return showNotification({
    //     message: 'Please enter at least one valid size and quantity',
    //     variant: 'warning',
    //   })
    // }

    try {
      setLoading(true)

      const form = new FormData()

      form.append('name', formData.name)
      form.append('sku', formData.sku)
      form.append('description', formData.description)
      form.append('category', formData.category?.value)
      form.append('subcategory', formData.subcategory)
      form.append('sellingPrice', formData.sellingPrice)
      form.append('originalPrice', formData.originalPrice)
      form.append('sizeChart', formData.sizeChart)
      form.append('brandName', formData.brandName)

      if (formData.primaryImage) {
        form.append('primaryImage', formData.primaryImage)
      }

      formData.images.forEach((image) => {
        form.append('images', image)
      })

      const res = await axios.put(`${API_URL_SELLER}products/update-product/${id}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      })

      showNotification({
        message: 'Product updated successfully!',
        variant: 'success',
      })

      // if (res?.data?.success === true) {
      //   const productId = res?.data?.data?._id

      //   for (const item of sizeQuantityList) {
      //     if (item.size && item.quantity) {
      //       await axios.post(
      //         `${API_URL_SELLER}productSize/create-productSize`,
      //         {
      //           productId,
      //           size: item.size,
      //           quantity: item.quantity,
      //         },
      //         {
      //           headers: {
      //             Authorization: `Bearer ${user?.token}`,
      //           },
      //         },
      //       )
      //     }
      //   }
      // }

      setLoading(false)

      navigate('/products-list')
    } catch (error) {
      setLoading(false)

      console.error(error)
      showNotification({
        message: error?.response?.data?.message || 'Failed to update product',
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
            <h4 className="mb-0">Product Edit</h4>
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
                <label className="form-label">SKU</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="form-control" placeholder="Enter SKU" />
              </div>
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
                  value={subCategoryList.find((opt) => opt._id == formData.subcategory?.toString()) || null}
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
            </div>

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
                  value={(sizeChartList?.length > 0 && sizeChartList.find((opt) => opt._id?.toString() === formData.sizeChart?.toString())) || null}
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
                  <img src={productData?.primaryImage} alt="Primary" height={100} />
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

              {images.length > 0 ? (
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
              ) : (
                <div className="mt-3 d-flex flex-wrap gap-2">
                  {productData?.images?.map((image, idx) => (
                    <div key={idx} className="position-relative">
                      <img src={image?.imageUrl} alt={`img-${idx}`} height={80} style={{ borderRadius: 8 }} />
                      {/* <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0"
                        aria-label="Remove"
                        onClick={() => removeImage(idx)}></button> */}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary">
              Update Product
            </button>
          </form>
        </CardBody>
      </Card>

    </>
  )
}

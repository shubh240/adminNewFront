import { useEffect, useRef, useState } from 'react'
import Select from 'react-select'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_ADMIN, API_URL_SELLER } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import { Grid, _ } from 'gridjs-react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/components/Spinner'

export default function Home() {
  const navigate = useNavigate()

  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const didFetch = useRef(false)

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [sellerCategories, setSellerCategories] = useState([])

  const fetchCategories = async () => {
    try {
      setLoading(true)

      axios
        .get(`${API_URL_ADMIN}category/list-category`)
        .then((res) => {
          const options = res.data.data.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))
          setCategories(options)
          setLoading(false)
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

  const fetchSellerCategories = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_SELLER}category/list-category`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)

      setSellerCategories(res.data.data)
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
    fetchCategories()
    fetchSellerCategories()

    didFetch.current = true
  }, [])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedCategory) {
      showNotification({
        // title: 'Validation',
        message: 'Please select a category',
        variant: 'warning',
      })
      return
    }

    try {
      setLoading(true)

      const payload = {
        sellerId: user?._id,
        categoryId: selectedCategory.value,
      }

      const response = await axios.post(
        `${API_URL_SELLER}category/add-category`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
      )

      setLoading(false)

      if (response.data.success) {
        showNotification({
          message: 'Category assigned successfully!',
          variant: 'success',
        })
      } else {
        showNotification({
          message: 'Failed to assign category',
          variant: 'danger',
        })
      }

      fetchSellerCategories()

      setSelectedCategory(null)
    } catch (error) {
      setLoading(false)

      console.error('Error adding category:', error?.response?.data?.message)
      showNotification({
        message: error?.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'danger',
      })
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This category will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL_SELLER}category/delete-category/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The category has been deleted.',
          variant: 'success',
        })
        fetchSellerCategories()
      } catch (error) {
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
      <PageMetaData title="Category" />
      <ComponentContainerCard id="category" title="Category List">
        <div style={{ maxWidth: '400px' }} className="mt-2">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Select Category
              </label>
              <Select id="category" options={categories} value={selectedCategory} onChange={setSelectedCategory} placeholder="Choose a category..." />
            </div>

            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
        </div>
      </ComponentContainerCard>
      <ComponentContainerCard id="category" title="Category List">
        {sellerCategories.length === 0 ? (
          <p className="text-muted">No categories assigned yet.</p>
        ) : (
          <Grid
            data={sellerCategories.map((item, index) => [index + 1, item?.category?.name || 'N/A', item._id])}
            columns={[
              'No',
              'Category',
              {
                name: 'Action',
                sort: false,
                formatter: (cell, row) => {
                  const id = row.cells[2].data
                  const category = sellerCategories.find((sc) => sc._id === id)
                  const categoryId = category?.categoryId
                  return _(
                    <>
                      {/* <button className="rounded-pill btn btn-sm btn-outline-primary me-2" onClick={() => navigate(`/categories/${id}`)}> */}
                      <button
                        className="rounded-pill btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/categories/${categoryId}/${id}`)}>
                        Sub Category
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
      </ComponentContainerCard>
    </>
  )
}

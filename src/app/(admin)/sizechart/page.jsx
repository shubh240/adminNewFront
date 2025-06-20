import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_SELLER } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import { Grid, _ } from 'gridjs-react'
import 'gridjs/dist/theme/mermaid.css'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/components/Spinner'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const didFetch = useRef(false)

  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sizeCharts, setSizeCharts] = useState([])
  const [editingId, setEditingId] = useState(null)

  const fetchSizeCharts = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_SELLER}sizeChart/list-sizeChart`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)

      setSizeCharts(res.data?.data || [])
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to fetch size charts',
        variant: 'danger',
      })
    }
  }

  useEffect(() => {
    if (didFetch.current) return
    fetchSizeCharts()
    didFetch.current = true
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || (!image && !editingId)) {
      showNotification({ message: 'Name and image are required', variant: 'warning' })
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', name)
      if (image) formData.append('image', image)

      if (editingId) {
        const response = await axios.put(
          `${API_URL_SELLER}sizeChart/update-sizeChart/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        )

      setLoading(false)

        if (response.data.success) {
          showNotification({ message: 'Size Chart updated!', variant: 'success' })
          setEditingId(null)
        } else {
          throw new Error(response.data.message)
        }
      } else {
        const response = await axios.post(`${API_URL_SELLER}sizeChart/create-sizeChart`, formData, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.success) {
          showNotification({ message: 'Size Chart created!', variant: 'success' })
        } else {
          throw new Error(response.data.message)
        }
      }

      fetchSizeCharts()
      setName('')
      setImage(null)
      setImagePreview(null)
    } catch (error) {
      setLoading(false)

      showNotification({
        message: error?.response?.data?.message || 'Error while saving size chart',
        variant: 'danger',
      })
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This size chart will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL_SELLER}sizeChart/delete-sizeChart/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The size chart has been deleted.',
          variant: 'success',
        })
        fetchSizeCharts()
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
      <PageMetaData title="Size Chart" />
      <ComponentContainerCard id="sizeChart" title={editingId ? 'Edit Size Chart' : 'Add Size Chart'}>
        <div style={{ maxWidth: '400px' }} className="mt-2">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Size Chart Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0]
                  setImage(file)
                  if (file) {
                    setImagePreview(URL.createObjectURL(file))
                  }
                }}
                className="form-control"
                accept=".jpg,.jpeg,.png,.mp4,.mov,.avi"
                required={!editingId}
              />
            </div>
            {(editingId || imagePreview) && (
              <div className="mb-3">
                <label className="form-label">
                  {imagePreview ? 'Selected Image Preview' : 'Current Image'}
                </label>
                <br />
                <img
                  src={imagePreview || sizeCharts.find((s) => s._id === editingId)?.image}
                  alt="Preview"
                  width={100}
                  style={{ borderRadius: '4px' }}
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'}
            </button>
          </form>
        </div>
      </ComponentContainerCard>

      <ComponentContainerCard id="sizeChartList" title="Size Chart List">
        {sizeCharts.length === 0 ? (
          <p className="text-muted">No size charts available.</p>
        ) : (
          <Grid
            data={(sizeCharts || []).map((item, index) => {
            const name = item?.name || ''
            const image = item?.image || ''
            const id = item?._id || ''
            return [index + 1, name, image, id]
          })}

            columns={[
              'No',
              'Name',
              {
                name: 'Image',
                sort: false,
                formatter: (cell) =>
                  _(<img src={cell} alt="size chart" width="60" style={{ borderRadius: '4px' }} />),
              },
              {
                name: 'Action',
                sort: false,
                formatter: (cell, row) => {
                  const id = row.cells[3].data
                  const name = row.cells[1].data
                  return _(
                    <>
                      <button
                        className="rounded-pill btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setEditingId(id)
                          setName(name)
                          setImage(null)
                          setImagePreview(null)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-pill btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </button>
                    </>
                  )
                },
              },
            ]}
            search={true}
            pagination={{ enabled: true, limit: 10 }}
            sort={true}
          />
        )}
      </ComponentContainerCard>
    </>
  )
}

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

  const [colors, setColors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const fetchBanners = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_ADMIN}color/list-colors`, {
        // params: search ? { name: search } : {},
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)
      setColors(res.data.data.colors || []);
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  // Fetch colors
  useEffect(() => {
    if (didFetch.current) return
    fetchBanners()
    didFetch.current = true
  }, [])

  // Handle form submit
 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      showNotification({ message: 'Please enter a Color name', variant: 'warning' })
      return;
    }

    if (!image && !isEditing) {
      showNotification({ message: 'Please select image', variant: 'warning' })
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);

    setLoading(true)
    const url = isEditing
      ? `${API_URL_ADMIN}color/edit-color/${editingId}`
      : `${API_URL_ADMIN}color/add-color`;

    try {
      const method = isEditing ? axios.put : axios.post;

      await method(url, formData, {
        "Content-Type": "multipart/form-data",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setLoading(false)
      showNotification({ message: isEditing ? "Color updated successfully!" : "Color added successfully!", variant: 'success' })
      handleCancel();
      fetchBanners();
    } catch (error) {
      setLoading(false)
      console.error("Error saving Color:", error);
      showNotification({ message: isEditing ? "Failed to update Color." : "Failed to add Color.", variant: 'warning' })
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This Color will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL_ADMIN}color/delete-color/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The Color has been deleted.',
          variant: 'success',
        })
        fetchBanners()
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

  const handleCancel = () => {
    setEditingId(null);
    setIsEditing(false);
    setName('');
    setImage(null);
    setImagePreview(null);
  };

  return (
    <>
      <PageMetaData title="Color" />
      <ComponentContainerCard id="Color" title="Color List">
        <div className="mt-3" style={{ maxWidth: '500px' }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="banner-name" className="form-label">
                Color Name
              </label>
              <input
                type="text"
                id="banner-name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="banner-image" className="form-label">
                Color Image
              </label>
              <input
                type="file"
                id="banner-image"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImage(file);
                  if (file) {
                    setImagePreview(URL.createObjectURL(file));
                  } else {
                    setImagePreview(null);
                  }
                }}
              />

              {/* Preview Image */}
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    width={100}
                    style={{ borderRadius: '4px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
            {/* Submit Button */}
            <div className="d-flex justify-content-between">
              {isEditing ? (
                <>
                  <button type="submit" className="btn btn-success w-50 me-2">
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary w-50"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button type="submit" className="btn btn-primary">
                  Add Color
                </button>
              )}
            </div>

          </form>
        </div>
      </ComponentContainerCard>

      <ComponentContainerCard id="Color" title="Color List">
        {colors.length === 0 ? (
          <p className="text-muted">No colors assigned yet.</p>
        ) : (
          <Grid
            data={colors.map((item, index) => [index + 1, item?.name || 'N/A',item?.image || "N/A", item._id])}
            columns={[
              'No',
              'Name',
              {
                name: 'Color Image',
                sort: false,
                formatter: (cell) =>
                  _(<img src={cell} alt="size chart" width="60" style={{ borderRadius: '4px' }} />),
              },
              {
                name: 'Action',
                sort: false,
                formatter: (cell, row) => {
                  const id = row.cells[3]?.data;
                  const name = row.cells[1]?.data;
                  const image = row.cells[2]?.data;
                  
                  return _(
                    <>
                      <button
                        className="rounded-pill btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingId(id)
                          setName(name)
                          setImage(null)
                          setImagePreview(image)
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
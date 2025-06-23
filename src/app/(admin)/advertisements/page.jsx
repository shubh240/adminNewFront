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
import { Value } from 'sass'

export default function Home() {
  const navigate = useNavigate()

  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const didFetch = useRef(false)

  const [Advertisements, setAdvertisements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const fetchAdvertisements = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_ADMIN}advertisement/list-advertisement`, {
        // params: search ? { name: search } : {},
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)
      setAdvertisements(res.data.data || []);
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  // Fetch Advertisements
  useEffect(() => {
    if (didFetch.current) return
    fetchAdvertisements()
    didFetch.current = true
  }, [])

  // Handle form submit
 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      showNotification({ message: 'Please enter a Advertisement name', variant: 'warning' })
      return;
    }
    if (!slug) {
      showNotification({ message: 'Please enter a Advertisement slug', variant: 'warning' })
      return;
    }

    if (!image && !isEditing) {
      showNotification({ message: 'Please select image', variant: 'warning' })
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    if (image) formData.append("image", image);

    setLoading(true)
    const url = isEditing
      ? `${API_URL_ADMIN}advertisement/edit-advertisement/${editingId}`
      : `${API_URL_ADMIN}advertisement/add-advertisement`;

    try {
      const method = isEditing ? axios.put : axios.post;

      await method(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setLoading(false)
      showNotification({ message: isEditing ? "Advertisement updated successfully!" : "Advertisement added successfully!", variant: 'success' })
      handleCancel();
      fetchAdvertisements();
    } catch (error) {
      setLoading(false)
      console.error("Error saving Advertisement:", error);
      showNotification({ message: isEditing ? "Failed to update Advertisement." : "Failed to add Advertisement.", variant: 'warning' })
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This Advertisement will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL_ADMIN}Advertisement/delete-Advertisement/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The Advertisement has been deleted.',
          variant: 'success',
        })
        fetchAdvertisements()
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
    setSlug('');
    setImage(null);
    setImagePreview(null);
  };

  return (
    <>
      <PageMetaData title="Advertisement" />
      <ComponentContainerCard id="Advertisement" title="Advertisement List">
        <div className="mt-3" style={{ maxWidth: '500px' }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="Advertisement-name" className="form-label">
                Advertisement Name
              </label>
              <input
                type="text"
                id="Advertisement-name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="Advertisement-slug" className="form-label">
                Advertisement Slug
              </label>
              <input
                type="text"
                id="Advertisement-slug"
                className="form-control"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="Advertisement-image" className="form-label">
                Advertisement Image
              </label>
              <input
                type="file"
                id="Advertisement-image"
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
                  Add Advertisement
                </button>
              )}
            </div>

          </form>
        </div>
      </ComponentContainerCard>

      <ComponentContainerCard id="Advertisement" title="Advertisement List">
        {Advertisements.length === 0 ? (
          <p className="text-muted">No Advertisements assigned yet.</p>
        ) : (
          <Grid
            data={Advertisements.map((item, index) => [index + 1, item?.name || 'N/A',item?.slug || 'N/A',item?.image || "N/A", item._id])}
            columns={[
              'No',
              'Name',
              'Slug',
              {
                name: 'Advertisement Image',
                sort: false,
                formatter: (cell) =>
                  _(<img src={cell} alt="size chart" width="60" style={{ borderRadius: '4px' }} />),
              },
              {
                name: 'Action',
                sort: false,
                formatter: (cell, row) => {
                  const id = row.cells[4]?.data;
                  const name = row.cells[1]?.data;
                  const slug = row.cells[2]?.data;
                  const image = row.cells[3]?.data;
                  
                  return _(
                    <>
                      <button
                        className="rounded-pill btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingId(id)
                          setName(name)
                          setSlug(slug)
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
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

  const [contents, setcontents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const fetchContents = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_ADMIN}content/list-content`, {
        // params: search ? { name: search } : {},
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)
      setcontents(res.data.data || []);
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  // Fetch contents
  useEffect(() => {
    if (didFetch.current) return
    fetchContents()
    didFetch.current = true
  }, [])

  // Handle form submit
 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      showNotification({ message: 'Please enter a content title', variant: 'warning' })
      return;
    }
    if (!slug) {
      showNotification({ message: 'Please enter a content slug', variant: 'warning' })
      return;
    }

    const payload = {
      title : name,
      slug,
      description
    }

    setLoading(true)
    const url = isEditing
      ? `${API_URL_ADMIN}content/edit-content/${editingId}`
      : `${API_URL_ADMIN}content/add-content`;

    try {
      const method = isEditing ? axios.put : axios.post;

      await method(url, payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setLoading(false)
      showNotification({ message: isEditing ? "content updated successfully!" : "content added successfully!", variant: 'success' })
      handleCancel();
      fetchContents();
    } catch (error) {
      setLoading(false)
      console.error("Error saving content:", error);
      showNotification({ message: isEditing ? "Failed to update content." : "Failed to add content.", variant: 'warning' })
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This content will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL_ADMIN}content/delete-content/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The content has been deleted.',
          variant: 'success',
        })
        fetchContents()
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
    setDescription('');
  };

  return (
    <>
      <PageMetaData title="content" />
      <ComponentContainerCard id="content" title="Content List">
        <div className="mt-3" style={{ maxWidth: '500px' }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="content-name" className="form-label">
                Content Title
              </label>
              <input
                type="text"
                id="content-name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content-slug" className="form-label">
                Content Slug
              </label>
              <input
                type="text"
                id="content-slug"
                className="form-control"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content-description" className="form-label">
                Content Description
              </label>
              <textarea
                id="content-description"
                className="form-control"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
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
                  Add content
                </button>
              )}
            </div>

          </form>
        </div>
      </ComponentContainerCard>

      <ComponentContainerCard id="content" title="content List">
        {contents.length === 0 ? (
          <p className="text-muted">No contents assigned yet.</p>
        ) : (
          <Grid
            data={contents.map((item, index) => [index + 1, item?.title || 'N/A',item?.slug || 'N/A',item?.description || "N/A", item._id])}
            columns={[
              'No',
              'Name',
              'Slug',
              {
                name: 'content description',
                sort: false,
                formatter: (cell) =>
                  _(<textarea value={cell} />),
              },
              {
                name: 'Action',
                sort: false,
                formatter: (cell, row) => {
                  const id = row.cells[4]?.data;
                  const name = row.cells[1]?.data;
                  const slug = row.cells[2]?.data;
                  const description = row.cells[3]?.data;
                  
                  return _(
                    <>
                      <button
                        className="rounded-pill btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingId(id)
                          setName(name)
                          setSlug(slug)
                          setDescription(description)
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
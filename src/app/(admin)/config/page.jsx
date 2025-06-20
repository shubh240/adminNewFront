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

  const [configs, setConfigs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')

  const fetchConfigs = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_ADMIN}config/list-config`, {
        // params: search ? { name: search } : {},
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)
      setConfigs(res.data.data || []);
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to data',
        variant: 'danger',
      })
    }
  }

  // Fetch configs
  useEffect(() => {
    if (didFetch.current) return
    fetchConfigs()
    didFetch.current = true
  }, [])

  // Handle form submit
 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      showNotification({ message: 'Please enter a Config name', variant: 'warning' })
      return;
    }
    if (!value) {
      showNotification({ message: 'Please enter a Config value', variant: 'warning' })
      return;
    }

    const payload = {
      name,
      value,
    };


    setLoading(true)
    const url = isEditing
      ? `${API_URL_ADMIN}config/edit-config/${editingId}`
      : `${API_URL_ADMIN}config/add-config`;

    try {
      const method = isEditing ? axios.put : axios.post;

      await method(url, payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setLoading(false)
      showNotification({ message: isEditing ? "Config updated successfully!" : "Config added successfully!", variant: 'success' })
      handleCancel();
      fetchConfigs();
    } catch (error) {
      setLoading(false)
      console.error("Error saving Config:", error);
      showNotification({ message: isEditing ? "Failed to update Config." : "Failed to add Config.", variant: 'warning' })
    }
  };

  // const handleDelete = async (id) => {
  //   const result = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'This Config will be permanently deleted.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: 'Yes, delete it!',
  //   })

  //   if (result.isConfirmed) {
  //     try {
  //       await axios.delete(`${API_URL_ADMIN}config/delete-config/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${user?.token}`,
  //         },
  //       })
  //       showNotification({
  //         message: 'The Config has been deleted.',
  //         variant: 'success',
  //       })
  //       fetchConfigs()
  //     } catch (error) {
  //       showNotification({
  //         message: error?.response?.data?.message || 'Something went wrong.',
  //         variant: 'danger',
  //       })
  //     }
  //   }
  // }

  if (loading) {
    return <Spinner size="sm" color="primary" />
  }

  const handleCancel = () => {
    setEditingId(null);
    setIsEditing(false);
    setName('');
    setValue('');
  };

  return (
    <>
      <PageMetaData title="Config" />
      <ComponentContainerCard id="Config" title="Config List">
        <div className="mt-3" style={{ maxWidth: '500px' }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="config-name" className="form-label">
                Config Name
              </label>
              <input
                type="text"
                id="config-name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="config-value" className="form-label">
                value
              </label>
              <input
                type="text"
                id="config-value"
                className="form-control"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
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
                  Add Config
                </button>
              )}
            </div>

          </form>
        </div>
      </ComponentContainerCard>

      <ComponentContainerCard id="Config" title="Config List">
        {configs.length === 0 ? (
          <p className="text-muted">No configs assigned yet.</p>
        ) : (
          <Grid
            data={configs.map((item, index) => [index + 1, item?.name || 'N/A',item?.value || 'N/A', item._id])}
            columns={[
              'No',
              'Name',
              'Value',
              {
                name: 'Action',
                sort: false,
                formatter: (cell, row) => {
                  const id = row.cells[3]?.data;
                  const name = row.cells[1]?.data;
                  const value = row.cells[2]?.data;
                  
                  return _(
                    <>
                      <button
                        className="rounded-pill btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingId(id)
                          setName(name)
                          setValue(value)
                        }}
                      >
                        Edit
                      </button>
                      {/* <button
                        className="rounded-pill btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </button> */}
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
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
import { formatToISTOnlyDate } from '../../../helpers/helper'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const didFetch = useRef(false)

  const [coupons, setCoupons] = useState([])

  const fetchCoupons = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${API_URL_SELLER}coupon/list-seller-coupon`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setLoading(false)

      setCoupons(res.data?.data || [])
    } catch (err) {
      setLoading(false)

      showNotification({
        message: 'Failed to fetch Coupons',
        variant: 'danger',
      })
    }
  }

  useEffect(() => {
    if (didFetch.current) return
    fetchCoupons()
    didFetch.current = true
  }, [])

  const handleStatusToggle = async (id, isActive) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to toggle the coupon status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)

        await axios.put(
          `${API_URL_SELLER}coupon/edit-coupon/${id}`,
          {
            isActive: !isActive,
          },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          },
        )

        showNotification({
          message: 'Status updated successfully!',
          variant: 'success',
        })
        fetchCoupons()
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)

        showNotification({
          message: 'Failed to update status',
          variant: 'danger',
        })
      }
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This Coupon will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL_SELLER}coupon/delete-coupon/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        showNotification({
          message: 'The Coupon has been deleted.',
          variant: 'success',
        })
        fetchCoupons()
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
      <PageMetaData title="Coupon" />

      <ComponentContainerCard id="couponList" title="Coupon List" addButtonLink="/coupons-add">
        {coupons.length === 0 ? (
          <p className="text-muted">No Coupons available.</p>
        ) : (
          <Grid
            data={(coupons || []).map((item, index) => {
              return [
                index + 1,
                item,
                item?.name,
                item?.couponCode,
                item?.discountType.charAt(0).toUpperCase() + item?.discountType.slice(1),
                item?.discountValue,
                item?.currentUsagesCount + '/' + item?.usageLimit,
                formatToISTOnlyDate(item?.validFrom) + ' TO ' + formatToISTOnlyDate(item?.validTill),
              ]
            })}
            columns={[
              'No',
              {
                name: 'Image',
                sort: false,
                formatter: (cell, row) => {
                  const item = row.cells[1].data

                  return _(<img src={item?.imageUrl} alt={item?.name} width="40" height="40" style={{ objectFit: 'cover', borderRadius: '6px' }} />)
                },
              },
              'Name',
              'Code',
              'Type',
              'Discount Value',
              'Usage',
              'Timeline',
              {
                name: 'Status',
                sort: false,
                formatter: (cell, row) => {
                  const data = row.cells[1].data
                  console.log(data)
                  const id = data._id
                  const isActive = data.isActive === true

                  return _(
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked={isActive} onChange={() => handleStatusToggle(id, isActive)} />
                    </div>,
                  )
                },
              },
              {
                name: 'Action',
                sort: false,
                formatter: (cell, row) => {
                  const data = row.cells[1].data
                  const id = data._id

                  return _(
                    <>
                      <button
                        className="rounded-pill btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          navigate(`/coupons-edit/${id}`)
                        }}>
                        Edit
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
            pagination={{ enabled: true, limit: 10 }}
            sort={true}
          />
        )}
      </ComponentContainerCard>
    </>
  )
}

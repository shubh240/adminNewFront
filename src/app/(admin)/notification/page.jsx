import { useState } from 'react'
import axios from 'axios'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import PageMetaData from '@/components/PageTitle'
import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { API_URL_ADMIN } from '@/context/constants'
import Spinner from '@/components/Spinner'

export default function SendNotificationPage() {
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const [notifType, setNotifType] = useState("customer")
  const [notifTitle, setNotifTitle] = useState("")
  const [notifBody, setNotifBody] = useState("")
  const [notifImage, setNotifImage] = useState(null)
  const [notifImagePreview, setNotifImagePreview] = useState(null)

  const handleSendNotification = async (e) => {
    e.preventDefault()

    if (!notifTitle || !notifBody) {
      return showNotification({ message: 'Title & Body required', variant: 'warning' })
    }

    const formData = new FormData()
    formData.append("type", notifType)
    formData.append("title", notifTitle)
    formData.append("body", notifBody)
    if (notifImage) formData.append("image", notifImage)

    try {
      setLoading(true)
      await axios.post(`${API_URL_ADMIN}notification`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      showNotification({ message: "Notification sent!", variant: "success" })
      setNotifTitle("")
      setNotifBody("")
      setNotifImage(null)
      setNotifImagePreview(null)
    } catch (err) {
      showNotification({ message: err?.response?.data?.message || "Send failed", variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner size="sm" color="primary" />

  return (
    <>
      <PageMetaData title="Send Notification" />
      <ComponentContainerCard id="Notification" title="Send Notification">
        <form onSubmit={handleSendNotification} style={{ maxWidth: "500px" }}>
          <div className="mb-3">
            <label className="form-label">Send To</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input type="radio" id="notifCustomer" name="notifType" className="form-check-input"
                  checked={notifType === "customer"} onChange={() => setNotifType("customer")} />
                <label className="form-check-label" htmlFor="notifCustomer">Customer</label>
              </div>
              <div className="form-check">
                <input type="radio" id="notifSeller" name="notifType" className="form-check-input"
                  checked={notifType === "seller"} onChange={() => setNotifType("seller")} />
                <label className="form-check-label" htmlFor="notifSeller">Seller</label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Title</label>
            <input type="text" className="form-control" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Body</label>
            <textarea className="form-control" rows="3" value={notifBody} onChange={(e) => setNotifBody(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Image (optional)</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setNotifImage(file)
                setNotifImagePreview(file ? URL.createObjectURL(file) : null)
              }}
            />
            {notifImagePreview && <img src={notifImagePreview} width={100} className="mt-2" alt="Preview" />}
          </div>

          <button type="submit" className="btn btn-success">Send Notification</button>
        </form>
      </ComponentContainerCard>
    </>
  )
}

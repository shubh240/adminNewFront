import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_ADMIN } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from 'react-bootstrap'
import Spinner from '@/components/Spinner'
import { Autocomplete } from '@react-google-maps/api'

export default function EditStore() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const autocompleteRef = useRef(null)

  const [formData, setFormData] = useState({
    sellerAuthId: '', // <-- Add this line
    firstName: '',
    lastName: '',
    storeName: '',
    zone: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    searchLocation: '',
    storeAddress: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    mapUrl: '',
    startTime: '',
    closeTime: '',
    newPassword: '',
  })

  const [logo, setLogo] = useState(null)
  const [coverPhoto, setCoverPhoto] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [coverPhotoPreview, setCoverPhotoPreview] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    setLogo(file)
    if (file) setLogoPreview(URL.createObjectURL(file))
  }

  const handleCoverPhotoUpload = (e) => {
    const file = e.target.files[0]
    setCoverPhoto(file)
    if (file) setCoverPhotoPreview(URL.createObjectURL(file))
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    if (!place || !place.address_components) return

    const components = place.address_components
    const getComponent = (type) =>
      components.find((comp) => comp.types.includes(type))?.long_name || ''

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()

    setFormData((prev) => ({
      ...prev,
      searchLocation: place.formatted_address,
      storeAddress: place.formatted_address,
      city: getComponent('locality'),
      state: getComponent('administrative_area_level_1'),
      pincode: getComponent('postal_code'),
      latitude: lat,
      longitude: lng,
    }))
  }

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL_ADMIN}store/details-store/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      const store = res?.data?.data?.store

      setFormData({
        sellerAuthId: store?.sellerAuthId?._id || '', // <-- Add this
        firstName: store?.sellerAuthId?.userInfo?.firstName || '',
        lastName: store?.sellerAuthId?.userInfo?.lastName || '',
        storeName: store.storeName || '',
        zone: store.zone || '',
        bankName: store.bankName || '',
        accountHolderName: store.accountHolderName || '',
        accountNumber: store.accountNumber || '',
        ifscCode: store.ifscCode || '',
        searchLocation: store.storeAddress || '',
        storeAddress: store.storeAddress || '',
        city: store.city || '',
        state: store.state || '',
        pincode: store.pincode || '',
        latitude: store.position?.lat || '',
        longitude: store.position?.lng || '',
        mapUrl: store.address_url || '',
        startTime: store.limitTime?.minimum || '',
        closeTime: store.limitTime?.maximum || '',
        newPassword: '',
      })
      setLogoPreview(store.logoUrl || '')
      setCoverPhotoPreview(store.coverPhotoUrl || '')
    } catch (err) {
      showNotification({ message: 'Failed to fetch store data', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchStoreData()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => form.append(key, value))
      form.append(
        'position',
        JSON.stringify({ lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) })
      )
      form.append(
        'limitTime',
        JSON.stringify({ minimum: formData.startTime, maximum: formData.closeTime })
      )
      if (logo) form.append('logo', logo)
      if (coverPhoto) form.append('coverPhoto', coverPhoto)

      await axios.put(`${API_URL_ADMIN}store/edit-store/${id}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      })
      showNotification({ message: 'Store updated successfully!', variant: 'success' })
      navigate('/stores-list')
    } catch (err) {
      showNotification({
        message: err?.response?.data?.message || 'Failed to update store',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!formData.newPassword) {
      return showNotification({ message: 'Please enter a new password', variant: 'warning' })
    }
    try {
      setLoading(true)
      await axios.put(
        `${API_URL_ADMIN}store/edit-password/${formData?.sellerAuthId}`,
        { userId: id, password: formData.newPassword },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      showNotification({ message: 'Password updated successfully', variant: 'success' })
      setFormData((prev) => ({ ...prev, newPassword: '' }))
      navigate('/stores-list')
    } catch (err) {
      showNotification({ message: 'Failed to update password', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner size="sm" color="primary" />

  return (
    <>
      <PageMetaData />
      <Card>
        <CardBody>
          <h4 className="mb-3">Edit Store</h4>
          <form onSubmit={handleSubmit}>
            {/* Owner Info */}
            <div className="mb-4 border p-3 rounded">
              <h5>Owner Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <label>First Name</label>
                  <input name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label>Last Name</label>
                  <input name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div className="mb-4 border p-3 rounded">
              <h5>Store Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <label>Store Name</label>
                  <input name="storeName" className="form-control" value={formData.storeName} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label>Zone</label>
                  <input name="zone" className="form-control" value={formData.zone} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label>Logo</label>
                  <input type="file" className="form-control" onChange={handleLogoUpload} />
                  {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: '100px', marginTop: '10px' }} />}
                </div>
                <div className="col-md-6">
                  <label>Cover Photo</label>
                  <input type="file" className="form-control" onChange={handleCoverPhotoUpload} />
                  {coverPhotoPreview && <img src={coverPhotoPreview} alt="Cover Preview" style={{ maxHeight: '100px', marginTop: '10px' }} />}
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="mb-4 border p-3 rounded">
              <h5>Bank Information</h5>
              <div className="row">
                <div className="col-md-6"><label>Bank Name</label><input name="bankName" value={formData.bankName} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Account Holder Name</label><input name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Account Number</label><input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>IFSC Code</label><input name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="form-control" /></div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-4 border p-3 rounded">
              <h5>Address & Location</h5>
              <div className="row">
                <div className="col-md-6">
                  <label>Search Shop</label>
                  <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
                    <input name="searchLocation" value={formData.searchLocation} onChange={handleChange} className="form-control" placeholder="Search store location" />
                  </Autocomplete>
                </div>
                <div className="col-md-6"><label>Store Address</label><textarea name="storeAddress" value={formData.storeAddress} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>City</label><input name="city" value={formData.city} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>State</label><input name="state" value={formData.state} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>Pincode</label><input name="pincode" value={formData.pincode} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>Latitude</label><input name="latitude" value={formData.latitude} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>Longitude</label><input name="longitude" value={formData.longitude} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-12"><label>Google Maps URL</label><input name="mapUrl" value={formData.mapUrl} onChange={handleChange} className="form-control" /></div>
              </div>
            </div>

            {/* Time */}
            <div className="mb-4 border p-3 rounded">
              <h5>Operating Hours</h5>
              <div className="row">
                <div className="col-md-6"><label>Start Time</label><input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Close Time</label><input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} className="form-control" /></div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mb-3">Update Store</button>

            {/* Change Password */}
            <div className="mb-4 border p-3 rounded">
              <h5>Change Password</h5>
              <div className="row">
                <div className="col-md-6">
                  <label>New Password</label>
                  <input type="password" name="newPassword" className="form-control" value={formData.newPassword} onChange={handleChange} />
                </div>
              </div>
            </div>
            <button type="button" onClick={handleChangePassword} className="btn btn-secondary">Update Password</button>
          </form>
        </CardBody>
      </Card>
    </>
  )
}
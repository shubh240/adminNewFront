import { useRef, useState } from 'react'
import axios from 'axios'
import PageMetaData from '@/components/PageTitle'
import { API_URL_ADMIN } from '../../../context/constants'
import { useAuthContext } from '../../../context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from 'react-bootstrap'
import { Autocomplete } from "@react-google-maps/api";

export default function AddStore() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const autocompleteRef = useRef(null);
  const accountNumberRegex = /^\d{9,18}$/;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.address_components) return;

    const components = place.address_components;

    const getComponent = (type) =>
      components.find((comp) => comp.types.includes(type))?.long_name || '';

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData((prev) => ({
      ...prev,
      searchLocation: place.formatted_address,
      storeAddress: place.formatted_address,
      city: getComponent('locality'),
      state: getComponent('administrative_area_level_1'),
      pincode: getComponent('postal_code'),
      latitude: lat,
      longitude: lng,
    }));
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNo: '',
    email: '',
    password: '',
    confirmPassword: '',

    storeName: '',
    zone: '',
    logo: null,
    coverPhoto: null,

    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',

    searchLocation: '',
    storeAddress: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',

    startTime: '',
    closeTime: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData((prev) => ({ ...prev, [name]: files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password || formData.password !== formData.confirmPassword) {
      showNotification({
        message: 'Please fill all required fields and make sure passwords match',
        variant: 'warning',
      })
      return
    }

    if (formData.accountNumber && !accountNumberRegex.test(formData.accountNumber)) {
      showNotification({
        message: 'Please enter a valid account number (9-18 digits)',
        variant: 'warning',
      })
      return;
    }

    if (formData.ifsc && !ifscRegex.test(formData.ifsc.toUpperCase())) {
      showNotification({
        message: 'Please enter a valid IFSC code (e.g., SBIN0001234)',
        variant: 'warning',
      })
      return;
    }
    
    try {
      const form = new FormData()
      for (let key in formData) {
        if (['latitude', 'longitude', 'startTime', 'closeTime'].includes(key)) continue;
        form.append(key, formData[key])
      }

    form.append(
      'position',
      JSON.stringify({
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      })
    );

    form.append(
      'limitTime',
      JSON.stringify({
        minimum: formData.startTime,
        maximum: formData.closeTime,
      })
    );
      const response = await axios.post(`${API_URL_ADMIN}store/add-store`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response?.data?.success) {
        showNotification({
          message: 'Store created successfully!',
          variant: 'success',
        })
        navigate('/stores-list')
      } else {
        showNotification({
          message: response?.data?.message || 'Something went wrong',
          variant: 'danger',
        })
      }
    } catch (error) {
      console.error(error)
      showNotification({
        message: error?.response?.data?.message || 'Error adding store',
        variant: 'danger',
      })
    }
  }

  return (
    <>
      <PageMetaData />
      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Store Add</h4>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Owner Info */}
            <div className="mb-4 border p-3 rounded">
              <h5>Owner Information</h5>
              <div className="row">
                <div className="col-md-6"><label>First Name</label><input name="firstName" value={formData.firstName} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Last Name</label><input name="lastName" value={formData.lastName} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>mobileNo No</label><input name="mobileNo" value={formData.mobileNo} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Email</label><input name="email" value={formData.email} onChange={handleChange} type="email" className="form-control" /></div>
                <div className="col-md-6"><label>Password</label><input name="password" value={formData.password} onChange={handleChange} type="password" className="form-control" /></div>
                <div className="col-md-6"><label>Confirm Password</label><input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" className="form-control" /></div>
              </div>
            </div>

            {/* Store Info */}
            <div className="mb-4 border p-3 rounded">
              <h5>Store Information</h5>
              <div className="row">
                <div className="col-md-6"><label>Store Name</label><input name="storeName" value={formData.storeName} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Zone</label><input name="zone" value={formData.zone} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Logo</label><input name="logo" onChange={handleFileChange} type="file" className="form-control" /></div>
                <div className="col-md-6"><label>Cover Photo</label><input name="coverPhoto" onChange={handleFileChange} type="file" className="form-control" /></div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="mb-4 border p-3 rounded">
              <h5>Bank Information</h5>
              <div className="row">
                <div className="col-md-6"><label>Bank Name</label><input name="bankName" value={formData.bankName} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Account Holder Name</label><input name="accountHolder" value={formData.accountHolder} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Account Number</label><input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>IFSC Code</label><input name="ifsc" value={formData.ifsc} onChange={handleChange} className="form-control" /></div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-4 border p-3 rounded">
              <h5>Address & Location</h5>
              <div className="row">
                <div className="col-md-6"><label>Search Shop</label>
                  <Autocomplete
                    onLoad={(ref) => (autocompleteRef.current = ref)}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      componentRestrictions: { country: 'in' },
                      types: ['establishment'], // or ['geocode'] for general
                    }}
                  >
                    <input
                      name="searchLocation"
                      value={formData.searchLocation}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Search store location"
                    />
                  </Autocomplete>
                </div>
                <div className="col-md-6"><label>Store Address</label><textarea name="storeAddress" value={formData.storeAddress} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>City</label><input name="city" value={formData.city} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>State</label><input name="state" value={formData.state} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-4"><label>Pincode</label><input name="pincode" value={formData.pincode} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Latitude</label><input name="latitude" value={formData.latitude} onChange={handleChange} className="form-control" /></div>
                <div className="col-md-6"><label>Longitude</label><input name="longitude" value={formData.longitude} onChange={handleChange} className="form-control" /></div>
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

            <button type="submit" className="btn btn-primary">Add Store</button>
          </form>
        </CardBody>
      </Card>
    </>
  )
}

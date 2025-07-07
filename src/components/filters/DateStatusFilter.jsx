import { useState, useEffect } from 'react'
import { useNotificationContext } from '@/context/useNotificationContext'

export default function DateStatusFilter({ onFilterChange, showStatus = false, value = {},statusOptions = [] }) {
  const { showNotification } = useNotificationContext()
  const [localFilters, setLocalFilters] = useState(value)

  useEffect(() => {
    setLocalFilters(value)
  }, [value])

  const handleApplyFilter = () => {
    const { startDate, endDate } = localFilters
    if (startDate && !endDate) {
      showNotification({
        message: "Please select end date as well.",
        variant: "danger",
      })
      return
    }
    if (!startDate && endDate) {
      showNotification({
        message: "Please select start date as well.",
        variant: "danger",
      })
      return
    }
    onFilterChange({ ...localFilters }) // trigger actual filter update
  }

  const handleClear = () => {
    const cleared = { startDate: "", endDate: "", status: "" }
    setLocalFilters(cleared)
    onFilterChange(cleared)
  }

  return (
    <div className="d-flex gap-3 flex-wrap mb-3 align-items-end">
      <div>
        <label className="form-label">Start Date</label>
        <input
          type="date"
          className="form-control"
          value={localFilters.startDate}
          onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
        />
      </div>

      <div>
        <label className="form-label">End Date</label>
        <input
          type="date"
          className="form-control"
          value={localFilters.endDate}
          onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
        />
      </div>

      {showStatus && (
        <div>
          <label className="form-label">Status</label>
            <select
            className="form-select"
            value={localFilters.status}
            onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, status: e.target.value }))
            }            >
            {(statusOptions || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                {opt.label}
                </option>
            ))}
            </select>
        </div>
      )}

      <div>
        <button className="btn btn-primary" onClick={handleApplyFilter}>
          Apply
        </button>
        <button className="btn btn-secondary ms-2" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  )
}

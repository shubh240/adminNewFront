import { useEffect, useState } from 'react'
import { Card, CardBody } from 'react-bootstrap'
import Spinner from '@/components/Spinner'
import { Grid, _ } from 'gridjs-react'
import PageMetaData from '@/components/PageTitle'
import DateStatusFilter from '@/components/filters/DateStatusFilter'

export default function CommonListing({
  title = 'List',
  fetchDataApi,
  exportApi,
  columns,
  statusOptions = [],
  showStatusFilter = false,
  showDateFilter = false,
  customFilters = {},
  customGridProps = {},
}) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    ...customFilters,
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await fetchDataApi(filters)
      setData(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  if (loading) return <Spinner size="sm" color="primary" />

  const handleExport = async () => {
    try {
      const res = await exportApi();

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_export.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <>
      <PageMetaData />

      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">{title}</h4>
              {exportApi && (
              <button className="btn btn-success" onClick={() => handleExport()}>
                Export
              </button>
            )}
          </div>

          {(showStatusFilter || showDateFilter) && (
            <DateStatusFilter
              value={filters}
              onFilterChange={setFilters}
              showStatus={showStatusFilter}
              showDate={showDateFilter}
              statusOptions={statusOptions}
            />
          )}

          {data?.length === 0 ? (
            <p className="text-muted">No data found.</p>
          ) : (
            <Grid
              data={data}
              columns={columns}
              search={true}
              pagination={{ enabled: true, limit: 10 }}
              sort={true}
              {...customGridProps}
            />
          )}
        </CardBody>
      </Card>
    </>
  )
}

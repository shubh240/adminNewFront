import CommonListing from '@/components/CommonListing'
import { useAuthContext } from '@/context/useAuthContext'
import axios from 'axios'
import { API_URL_ADMIN } from '@/context/constants'
import { formatToIST } from '@/helpers/helper'
import { _ } from 'gridjs-react'
import { useNavigate } from 'react-router-dom'

export default function CustomerListPage() {
    const { user } = useAuthContext()
    const navigate = useNavigate()

    const fetchCustomers = async (filters) => {
        const res = await axios.post(`${API_URL_ADMIN}customer/list`, filters, {
            headers: { Authorization: `Bearer ${user?.token}` },
        })
        return res?.data?.data?.customers?.map((item, index) => [
            index + 1,
            item, // full object for row[0]
            item?.email,
            item?.mobileNo,
        ])
    }

    const columns = [
        {
            name: 'No',
            formatter: (cell, row) => row.cells[0].data,
        },
        {
            name: 'Name',
            formatter: (cell, row) => row.cells[1].data?.fullName,
        },
        {
            name: 'Email',
            formatter: (cell, row) => row.cells[2].data,
        },
        {
            name: 'Mobile',
            formatter: (cell, row) => row.cells[3].data,
        },
        {
            name: 'Registered On',
            formatter: (cell, row) => formatToIST(row.cells[1].data?.createdAt),
        },
        {
            name: 'Action',
            sort: false,
            formatter: (cell, row) => {
                const customer = row.cells[1].data
                const id = customer._id
                return _(
                    <>
                        <button
                            className="rounded-pill btn btn-sm btn-outline-info me-2"
                            onClick={() => navigate(`/orders-list?customerId=${id}`)}
                        >
                            Orders
                        </button>
                    </>,
                )
            },
        },
    ]


    return (
        <CommonListing
            title="Customer List"
            fetchDataApi={fetchCustomers}
            columns={columns}
        //   showDateFilter={true}
        />
    )
}

import React, { useEffect } from 'react'
import CouponTable from './CouponTable'
import { useAppDispatch } from '../../../redux/Store'
import { fetchAllCoupons } from '../../../redux/Admin/AdminCouponSlice'

const Coupon = () => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchAllCoupons(localStorage.getItem("jwt") || ""))
    }, [])
    return (
        <div>
            <CouponTable />
        </div>
    )
}

export default Coupon
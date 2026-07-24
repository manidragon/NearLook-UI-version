import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch } from '../../redux/Store';
import { verifySellerEmail } from '../../redux/Seller/sellerSlice';

const SellerAccountVerification = () => {
  const{ otp}=useParams();
  const navigate=useNavigate()
  const dispatch=useAppDispatch();

  useEffect(()=>{
    dispatch(verifySellerEmail({otp:Number(otp),navigate}))
  },[otp])


  return (
    <div>SellerAccountVerification</div>
  )
}

export default SellerAccountVerification
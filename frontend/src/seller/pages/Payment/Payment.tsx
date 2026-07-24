// D:\Mani\Code with Zosh\Backup\source code\frontend\src\seller\pages\Payment\Payment.tsx
import Button from "../../../components/NeonButton";
import { Card, Divider, Tabs, Tab, Box } from "@mui/material"
import  { useState, useEffect, useMemo } from 'react'
import TransactionTable from './TransactionTable';
import { useAppSelector, useAppDispatch } from '../../../redux/Store';
import { fetchTransactionsBySeller } from '../../../redux/Seller/transactionSlice';

const tab = [
    { name: "Online Transaction" },
    { name: "Offline Transaction" }
]
const Payment = () => {
    const [activeTab, setActiveTab] = useState(tab[0].name);
    const transaction = useAppSelector(state => state.transaction);
    const dispatch = useAppDispatch();

    useEffect(() => {
      dispatch(fetchTransactionsBySeller(localStorage.getItem("jwt") || ""));
    }, [dispatch]);

    // const { onlineEarnings, offlineEarnings } = useMemo(() => {
    //     let online = 0;
    //     let offline = 0;
    //     transaction.transactions.forEach(t => {
    //         // Check if transaction is completed and not cancelled
    //         if (t.paymentStatus === 'COMPLETED' && t.order?.orderStatus !== 'CANCELLED') {
    //             if (t.isOffline) {
    //                 offline += t.netAmount || 0;
    //             } else {
    //                 online += t.netAmount || 0;
    //             }
    //         }
    //     });
    //     return { onlineEarnings: online, offlineEarnings: offline };
    // }, [transaction.transactions]);

    const handleActiveTab = (item:any) => {
        setActiveTab(item.name);
    }
    return (
        <div>
            <TransactionTable />
        </div>
    )
}

export default Payment
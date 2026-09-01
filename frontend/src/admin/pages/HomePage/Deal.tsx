import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DealsTable from './DealsTable'
import { useAppSelector, useAppDispatch } from '../../../redux/Store'
import { fetchHomeCategories } from '../../../redux/Admin/AdminSlice'
import DealsCategoryTable from './DealsCategoryTable'
import CreateDealForm from './CreateDealForm'
import { Box, Typography } from '@mui/material'

const tabs = [
    { name: "Deals", id: "Deals" },
    { name: "Categories", id: "Categories" },
    { name: "Create Deal", id: "Create Deal" }
]

const Deal = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].id);
    const dispatch = useAppDispatch();
    const adminState = useAppSelector((state) => state.admin);

    useEffect(() => {
        if (adminState.categories.length === 0) {
            dispatch(fetchHomeCategories());
        }
    }, [dispatch, adminState.categories.length]);

    return (
        <Box className="p-4 sm:p-8 min-h-screen bg-gray-50/50">
            <Box className="mb-8">
                <Typography variant="h3" className="font-bold text-gray-900 mb-2 tracking-tight">
                    Deal Management
                </Typography>
                <Typography variant="subtitle1" component="p" className="text-gray-500">
                    Manage your promotional deals and categories with ease.
                </Typography>
            </Box>

            {/* Custom Modern Tabs */}
            <Box className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 inline-flex w-full sm:w-auto mb-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-6 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50
                            ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeDealTab"
                                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl shadow-md"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{tab.name}</span>
                    </button>
                ))}
            </Box>

            {/* Tab Content with Animations */}
            <Box className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "Deals" && <DealsTable />}
                        {activeTab === "Categories" && <DealsCategoryTable />}
                        {activeTab === "Create Deal" && (
                            <Box className="flex justify-center items-start pt-8 pb-16">
                                <CreateDealForm />
                            </Box>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    )
}

export default Deal
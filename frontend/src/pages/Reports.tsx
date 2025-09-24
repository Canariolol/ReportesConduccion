import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store/store.ts'
import { getReports } from '../store/slices/excelSlice.ts'
import ReportsManagement from '../components/Dashboard/ReportsManagement.tsx'

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(getReports('demo_user'))
  }, [dispatch])

  return (
    <ReportsManagement />
  )
}

export default Reports

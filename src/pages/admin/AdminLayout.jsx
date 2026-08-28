import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/layout/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-bg text-ink font-pjs">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

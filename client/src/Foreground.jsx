import React, { useContext } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Logout from "./pages/Logout"
import { AuthContext } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import ManageStudents from './pages/admin/ManageStudents'
import ManageProfessors from './pages/admin/ManageProfessors'
import ManageProgramIncharges from './pages/admin/ManageProgramIncharges'
import ManageAdmins from './pages/admin/ManageAdmins'
import "./pages/admin/ManageUsers.scss"
function Foreground() {
  const {currentUser} = useContext(AuthContext);
  
  return (
    <>
      {/* <div className=' h-full w-full'> */}
      <Navbar />
      <main className='flex flex-column justify-center items-center gap-4 w-full m-auto absolute z-10'>
        <Routes>
          <Route path='*'>
            <Route index element={<Home />} />
            <Route path='dashboard/*' element={<Dashboard />} />
            <Route path='manageStudents/*' element={<ManageStudents />} />
            <Route path='manageProfessors/*' element={<ManageProfessors />} />
            <Route path='manageProgramIncharges/*' element={<ManageProgramIncharges />} />
            <Route path='manageAdmins/*' element={<ManageAdmins />} />
            <Route path='dashboard/*' element={<Dashboard />} />
            <Route path='dashboard/*' element={<Dashboard />} />
            <Route path='dashboard/*' element={<Dashboard />} />
            <Route path='logout' element={<Logout />}></Route>
          </Route>
        </Routes>
      </main>
    </>
  )
}

export default Foreground
import React from 'react'
import BackToDashboard from '../../components/BackToDashboard'

function ManageStudents() {
  
  const ManageAddStudent = () => {
    console.log('Add Student')
  }
  
  return (
    <div className='manage-users-container'>
      <BackToDashboard />
      <div className='users-info-and-options'>
        <p className='title'>Manage Students</p>
        <button onClick={ManageAddStudent}>Add Student</button>
      </div>
    </div>
  )
}

export default ManageStudents
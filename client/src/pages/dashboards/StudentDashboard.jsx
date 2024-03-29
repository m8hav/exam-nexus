import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext';
import Calendar from '../../components/Calendar';

function StudentDashboard() {
  const { currentUser } = useContext(AuthContext);

  const handleViewCourses = () => {
    console.log('View Courses')
  }

  const handleViewUpcomingExams = () => {
    console.log('View Upcoming Exams')
  }

  const handleViewPastExamsResults = () => {
    console.log('View Past Exams Results')
  }

  return (
    <div className='dashboard'>
      <div className="user-info">
        <p className='title'>Student Info</p>
        <table>
          <tbody>
            <tr>
              <td>Name:</td>
              <td>{currentUser.name}</td>
            </tr>
            <tr>
              <td>Username:</td>
              <td>{currentUser.username}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>{currentUser.email}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="quick-actions">
        <p className='title'>Quick Actions</p>
        <div className="buttons">
          <button className='quick-action-btn' onClick={handleViewCourses}>View Courses</button>
          <button className='quick-action-btn' onClick={handleViewUpcomingExams}>View Upcoming Exams</button>
          <button className='quick-action-btn' onClick={handleViewPastExamsResults}>View Past Exams Results</button>
        </div>
      </div>
      <Calendar type="student" user={currentUser} />
    </div>
  )
}

export default StudentDashboard
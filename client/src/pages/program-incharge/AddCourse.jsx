import React, { useState } from 'react'
import BackToDashboard from '../../components/BackToDashboard'
import { getUserDetails } from '../../utils/auth';

function AddCourse() {

  const { token } = getUserDetails();

  const [studentIds, setStudentIds] = useState([]);
  const [professorId, setProfessorId] = useState({});

  const getProfessor = async (username) => {
    if (!token) return;
    let url = `http://localhost:8080/api/professor/${username}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    setProfessorId(data.data);
  }

  const appendStudentId = async (username) => {
    if (!token) return;
    let url = `http://localhost:8080/api/student/${username}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    setStudentIds([...studentIds, data.data._id]);
  }

  const handleAddCourse = async (e) => {
    e.preventDefault();
    console.log("Add Course")

    const studentIds = e.target[4].value.split(",").map((student) => student.trim());

    for (let i = 0; i < studentIds.length; i++) {
      appendStudentId(studentIds[i]);
    }

    getProfessor(e.target[2].value);

    let course = {
      code: e.target[0].value,
      name: e.target[1].value,
      professor: professorId._id,
      syllabus: e.target[3].value.split(",").map((syllabus) => syllabus.trim()),
      studentIds: studentIds
    }
    console.log(course)
    return;

    let url = "http://localhost:8080/api/course"
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(course)
    });
    const data = await response.json();

  }

  return (
    <div className='add-course-container'>
      <BackToDashboard />
      <div className='course-info'>
        <p className='title'>Add Course</p>
        <form className='add-course-form' onSubmit={handleAddCourse}>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Professor Username</th>
                <th>Syllabus</th>
                <th>Student Username</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="text" placeholder="Code" /></td>
                <td><input type="text" placeholder="Name" /></td>
                <td><input type="text" placeholder="Professor Username" /></td>
                <td><input type="text" placeholder="Syllabus" /></td>
                <td><input type="text" placeholder="Student Usernames" /></td>
              </tr>
            </tbody>
          </table>
          <button type='submit'>Add Course</button>
        </form  >
      </div>
    </div>
  )
}

export default AddCourse
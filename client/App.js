// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import LoginBox from './components/LoginBox';
import StudentDash from './components/StudentDash';
import UpcomingExams from './components/UpcomingExams';
import AttendExam from './components/AttendExam';
import PastExams from './components/PastExams';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginBox />} />
        <Route path="/student-dashboard" element={<StudentDash />} />
        <Route path="/upcoming-exams" element={<UpcomingExams />} />
        <Route path="/attend-exam" element={<AttendExam />} />
        <Route path="/past-exams" element={<PastExams />} />
      </Routes>
    </Router>
  );
};

export default App;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  createStudent,
  createProfessor,
  createProgramIncharge,
  createAdmin,
  createCourse,
  createMCQQuestion,
  createCodeQuestion,
  createExam,
  createResult,
  createAppeal,

  getStudent,
  getProfessor,
  getProgramIncharge,
  getAdmin,
  getCourse,
  getMCQQuestion,
  getCodeQuestion,
  getExam,
  getResult,
  getAppeal,

  updateStudent,
  updateProfessor,
  updateProgramIncharge,
  updateAdmin,
  updateCourse,
  updateMCQQuestion,
  updateCodeQuestion,
  updateExam,
  updateResult,
  updateAppeal,

  deleteStudent,
  deleteProfessor,
  deleteProgramIncharge,
  deleteAdmin,
  deleteCourse,
  deleteMCQQuestion,
  deleteCodeQuestion,
  deleteExam,
  deleteResult,
  deleteAppeal,
} from './database.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
app.use(cors());
app.use(express.json());




// Protected route that requires JWT authentication
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully.', user: req.user });
});
app.get('/api/protected/:id', authenticateToken, (req, res) => {
  if (req.user.type !== "admin" && req.user.username != req.params.username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json({ message: 'Protected route accessed successfully.', user: req.user });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}



// Login student and get JWT
app.post('/api/students/login', async (req, res) => {
  const result = await getStudent({ username: req.body.username });
  if (result.success) {
    const hashed_password = result.student.password;
    const passwordMatch = await bcrypt.compare(req.body.password, hashed_password);
    if (passwordMatch) {
      // Generate a JWT
      const token = jwt.sign({
        username: req.body.username,
        _id: result.student._id,
        type: "student"
      }, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({ token });
    } else {
      res.status(400).send({ message: "Incorrect password" });
    }
  } else {
    res.status(400).send(result);
  }
});

// Login professor and get JWT
app.post('/api/professors/login', async (req, res) => {
  const result = await getProfessor({ username: req.body.username });
  if (result.success) {
    const hashed_password = result.professor.password;
    const passwordMatch = await bcrypt.compare(req.body.password, hashed_password);
    if (passwordMatch) {
      // Generate a JWT
      const token = jwt.sign({
        username: req.body.username,
        _id: result.professor._id,
        type: "professor"
      }, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({ token });
    } else {
      res.status(400).send({ message: "Incorrect password" });
    }
  } else {
    res.status(400).send(result);
  }
});

// Login program incharge and get JWT
app.post('/api/program-incharges/login', async (req, res) => {
  const result = await getProgramIncharge({ username: req.body.username });
  if (result.success) {
    const hashed_password = result.programIncharge.password;
    const passwordMatch = await bcrypt.compare(req.body.password, hashed_password);
    if (passwordMatch) {
      // Generate a JWT
      const token = jwt.sign({
        username: req.body.username,
        _id: result.programIncharge._id,
        type: "program-incharge"
      }, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({ token });
    } else {
      res.status(400).send({ message: "Incorrect password" });
    }
  } else {
    res.status(400).send(result);
  }
});

// Login admin and get JWT
app.post('/api/admins/login', async (req, res) => {
  const result = await getAdmin({ username: req.body.username });
  if (result.success) {
    const hashed_password = result.admin.password;
    const passwordMatch = await bcrypt.compare(req.body.password, hashed_password);
    if (passwordMatch) {
      // Generate a JWT
      const token = jwt.sign({
        username: req.body.username,
        _id: result.admin._id,
        type: "admin"
      }, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({ token });
    } else {
      res.status(400).send({ message: "Incorrect password" });
    }
  } else {
    res.status(400).send(result);
  }
});



// create student
app.post('/api/student', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const studentInfo = {
      enrolledCourseIds: [],
      pastEnrolledCourses: [],
      performance: {
        semesterPerformance: [],
        overallPerformance: {
          totalExamsAttended: 0,
          totalMaxMarks: 0,
          totalMarksScored: 0
        }
      },
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10)
    }
    const result = await createStudent(studentInfo);
    if (result.success) {
      res.status(201).json(result.student);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get student by username
app.get('/api/student/:username', authenticateToken, async (req, res) => {
  if (!(req.user.type in ["admin", "program-incharge"]) && req.user.username != req.params.username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const student = await getStudent({ username: req.params.username });
    if (student.success) {
      res.status(200).json(student.student);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update student by username
app.put('/api/student/:username', authenticateToken, async (req, res) => {
  if (!(req.user.type in ["admin", "program-incharge", "professor"]) && req.user.username != req.params.username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const studentInfo = {
      ...req.body,
      // update password if provided
      ...(req.body.password && { password: await bcrypt.hash(req.body.password, 10) })
    }
    const result = await updateStudent({ username: req.params.username }, studentInfo);
    if (result.success) {
      res.status(200).json(result.student);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete student by username
app.delete('/api/student/:username', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteStudent({ username: req.params.username });
    if (result.success) {
      res.status(200).json(result.student);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// create professor
app.post('/api/professor', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const professorInfo = {
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10)
    }
    const result = await createProfessor(professorInfo);
    if (result.success) {
      res.status(201).json(result.professor);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get professor by username
app.get('/api/professor/:username', authenticateToken, async (req, res) => {
  if (!(req.user.type in ["admin", "program-incharge", "professor"])) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const professor = await getProfessor({ username: req.params.username });
    if (professor.success) {
      res.status(200).json(professor.professor);
    } else {
      res.status(404).json({ message: "Professor not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update professor by username
app.put('/api/professor/:username', authenticateToken, async (req, res) => {
  if (!(req.user.type in ["admin", "program-incharge"]) && req.user.username != req.params.username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const professorInfo = {
      ...req.body,
      // update password if provided
      ...(req.body.password && { password: await bcrypt.hash(req.body.password, 10) })
    }
    const result = await updateProfessor({ username: req.params.username }, professorInfo);
    if (result.success) {
      res.status(200).json(result.professor);
    } else {
      res.status(404).json({ message: "Professor not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete professor by username
app.delete('/api/professor/:username', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteProfessor({ username: req.params.username });
    if (result.success) {
      res.status(200).json(result.professor);
    } else {
      res.status(404).json({ message: "Professor not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// create program incharge
app.post('/api/program-incharge', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const programInchargeInfo = {
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10)
    }
    const result = await createProgramIncharge(programInchargeInfo);
    if (result.success) {
      res.status(201).json(result.programIncharge);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get program incharge by username
app.get('/api/program-incharge/:username', authenticateToken, async (req, res) => {
  if (!(req.user.type in ["admin", "program-incharge"])) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const programIncharge = await getProgramIncharge({ username: req.params.username });
    if (programIncharge.success) {
      res.status(200).json(programIncharge.programIncharge);
    } else {
      res.status(404).json({ message: "Program Incharge not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update program incharge by username
app.put('/api/program-incharge/:username', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin" && req.user.username != req.params.username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const programInchargeInfo = {
      ...req.body,
      // update password if provided
      ...(req.body.password && { password: await bcrypt.hash(req.body.password, 10) })
    }
    const result = await updateProgramIncharge({ username: req.params.username }, programInchargeInfo);
    if (result.success) {
      res.status(200).json(result.programIncharge);
    } else {
      res.status(404).json({ message: "Program Incharge not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete program incharge by username
app.delete('/api/program-incharge/:username', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteProgramIncharge({ username: req.params.username });
    if (result.success) {
      res.status(200).json(result.programIncharge);
    } else {
      res.status(404).json({ message: "Program Incharge not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// create admin
app.post('/api/admin', async (req, res) => {
  try {
    const adminInfo = {
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10)
    }
    const result = await createAdmin(adminInfo);
    if (result.success) {
      res.status(201).json(result.admin);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get admin by username
app.get('/api/admin/:username', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const admin = await getAdmin({ username: req.params.username });
    if (admin.success) {
      res.status(200).json(admin.admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update admin by username
app.put('/api/admin/:username', authenticateToken, async (req, res) => {
  if (req.user.username != req.params.username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const adminInfo = {
      ...req.body,
      // update password if provided
      ...(req.body.password && { password: await bcrypt.hash(req.body.password, 10) })
    }
    const result = await updateAdmin({ username: req.params.username }, adminInfo);
    if (result.success) {
      res.status(200).json(result.admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete admin by username
app.delete('/api/admin/:username', authenticateToken, async (req, res) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteAdmin({ username: req.params.username });
    if (result.success) {
      res.status(200).json(result.admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});




// create course
app.post('/api/course', authenticateToken, async (req, res) => {
  if (req.user.type !== "program-incharge") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await createCourse(req.body);
    if (result.success) {
      res.status(201).json(result.course);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get course by course code
app.get('/api/course/:courseCode', authenticateToken, async (req, res) => {
  try {
    const course = await getCourse({ courseCode: req.params.courseCode });
    if (course.success) {
      res.status(200).json(course.course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update course by course code
app.put('/api/course/:courseCode', authenticateToken, async (req, res) => {
  if (req.user.type !== "program-incharge") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await updateCourse({ courseCode: req.params.courseCode }, req.body);
    if (result.success) {
      res.status(200).json(result.course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete course by course code
app.delete('/api/course/:courseCode', authenticateToken, async (req, res) => {
  if (req.user.type !== "program-incharge") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteCourse({ courseCode: req.params.courseCode });
    if (result.success) {
      res.status(200).json(result.course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// create mcq question
app.post('/api/mcq-question', authenticateToken, async (req, res) => {
  if (req.user.type !== "program-incharge") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await createMCQQuestion(req.body);
    if (result.success) {
      res.status(201).json(result.mcqQuestion);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get mcq question by object id
app.get('/api/mcq-question/:oid', authenticateToken, async (req, res) => {
  try {
    const mcqQuestion = await getMCQQuestion({ _id: req.params.oid });
    if (mcqQuestion.success) {
      res.status(200).json(mcqQuestion.mcqQuestion);
    } else {
      res.status(404).json({ message: "MCQ Question not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update mcq question by object id
app.put('/api/mcq-question/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "program-incharge") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await updateMCQQuestion({ _id: req.params.oid }, req.body);
    if (result.success) {
      res.status(200).json(result.mcqQuestion);
    } else {
      res.status(404).json({ message: "MCQ Question not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete mcq question by object id
app.delete('/api/mcq-question/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "program-incharge") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteMCQQuestion({ _id: req.params.oid });
    if (result.success) {
      res.status(200).json(result.mcqQuestion);
    } else {
      res.status(404).json({ message: "MCQ Question not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// create code question
app.post('/api/code-question', authenticateToken, async (req, res) => {
  if (req.user.type !== "professor") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await createCodeQuestion(req.body);
    if (result.success) {
      res.status(201).json(result.codeQuestion);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get code question by object id
app.get('/api/code-question/:oid', authenticateToken, async (req, res) => {
  try {
    const codeQuestion = await getCodeQuestion({ _id: req.params.oid });
    if (codeQuestion.success) {
      res.status(200).json(codeQuestion.codeQuestion);
    } else {
      res.status(404).json({ message: "Code Question not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update code question by object id
app.put('/api/code-question/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "professor") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await updateCodeQuestion({ _id: req.params.oid }, req.body);
    if (result.success) {
      res.status(200).json(result.codeQuestion);
    } else {
      res.status(404).json({ message: "Code Question not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete code question by object id
app.delete('/api/code-question/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "professor") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteCodeQuestion({ _id: req.params.oid });
    if (result.success) {
      res.status(200).json(result.codeQuestion);
    } else {
      res.status(404).json({ message: "Code Question not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// create exam
app.post('/api/exam', authenticateToken, async (req, res) => {
  if (req.user.type !== "professor") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await createExam(req.body);
    if (result.success) {
      res.status(201).json(result.exam);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get exam by object id
app.get('/api/exam/:oid', authenticateToken, async (req, res) => {
  try {
    const exam = await getExam({ _id: req.params.oid });
    if (exam.success) {
      res.status(200).json(exam.exam);
    } else {
      res.status(404).json({ message: "Exam not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all exams of a course
app.get('/api/exams/:courseCode', authenticateToken, async (req, res) => {
  try {
    const course = await getCourse({ courseCode: req.params.courseCode });
    if (!course.success) {
      return res.status(404).json({ message: "Course not found" });
    }
    course.course.examIds = await Promise.all(course.course.examIds.map(async (examId) => {
      const exam = await getExam({ _id: examId });
      return exam.success ? exam.exam : null;
    }));
    const exams = course.course.examIds;
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all exams of a student by student id / username
app.get('/api/exams/', authenticateToken, async (req, res) => {
  let { username, studentId } = req.query;
  try {
    const student = await getStudent(studentId ? { _id: studentId } : { username: username });
    if (!student.success) {
      return res.status(404).json({ message: "Student not found" });
    }
    student.student.enrolledCourseIds = await Promise.all(student.student.enrolledCourseIds.map(async (courseId) => {
      const course = await getCourse({ _id: courseId });
      return course.success ? course.course : null;
    }));
    const examsIds = student.student.enrolledCourseIds.map((course) => course.examIds).flat();
    const exams = await Promise.all(examsIds.map(async (examId) => {
      const exam = await getExam({ _id: examId });
      return exam.success ? exam.exam : null;
    }));
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update exam by object id
app.put('/api/exam/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "professor") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await updateExam({ _id: req.params.oid }, req.body);
    if (result.success) {
      res.status(200).json(result.exam);
    } else {
      res.status(404).json({ message: "Exam not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete exam by object id
app.delete('/api/exam/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "professor") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteExam({ _id: req.params.oid });
    if (result.success) {
      res.status(200).json(result.exam);
    } else {
      res.status(404).json({ message: "Exam not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// create result
app.post('/api/result', authenticateToken, async (req, res) => {
  if (req.user.type !== "student") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await createResult(req.body);
    if (result.success) {
      res.status(201).json(result.result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get result by object id
app.get('/api/result/:oid', authenticateToken, async (req, res) => {
  try {
    const result = await getResult({ _id: req.params.oid });
    if (result.success) {
      res.status(200).json(result.result);
    } else {
      res.status(404).json({ message: "Result not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all results of an exam by exam id
app.get('/api/results/:examId', authenticateToken, async (req, res) => {
  try {
    const exam = await getExam({ _id: req.params.examId });
    if (!exam.success) {
      return res.status(404).json({ message: "Exam not found" });
    }
    exam.exam.resultIds = await Promise.all(exam.exam.resultIds.map(async (resultId) => {
      const result = await getResult({ _id: resultId });
      return result.success ? result.result : null;
    }));
    const results = exam.exam.resultIds;
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get result by exam id and student id / username
app.get('/api/result/', authenticateToken, async (req, res) => {
  let { examId, username, studentId } = req.query;
  try {
    if (!studentId) {
      const student = await getStudent({ username: username });
      if (!student.success) {
        return res.status(404).json({ message: "Student not found" });
      }
      studentId = student.student._id;
    }
    const result = await getResult({ examId, studentId });
    if (result.success) {
      res.status(200).json(result.result);
    } else {
      res.status(404).json({ message: "Result not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update result by object id
app.put('/api/result/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "student") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await updateResult({ _id: req.params.oid }, req.body);
    if (result.success) {
      res.status(200).json(result.result);
    } else {
      res.status(404).json({ message: "Result not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete result by object id
app.delete('/api/result/:oid', authenticateToken, async (req, res) => {
  if (req.user.type !== "student") {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await deleteResult({ _id: req.params.oid });
    if (result.success) {
      res.status(200).json(result.result);
    } else {
      res.status(404).json({ message: "Result not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});




// create appeal
app.post('/api/appeal', authenticateToken, async (req, res) => {
  try {
    const result = await createAppeal(req.body);
    if (result.success) {
      res.status(201).json(result.appeal);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get appeal by object id
app.get('/api/appeal/:oid', authenticateToken, async (req, res) => {
  try {
    const appeal = await getAppeal({ _id: req.params.oid });
    if (appeal.success) {
      res.status(200).json(appeal.appeal);
    } else {
      res.status(404).json({ message: "Appeal not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get appeal of a result by exam id and student id / username
app.get('/api/appeal/', authenticateToken, async (req, res) => {
  let { examId, username, studentId } = req.query;
  try {
    if (!studentId) {
      const student = await getStudent({ username });
      if (!student.success) {
        return res.status(404).json({ message: "Student not found" });
      }
      studentId = student.student._id;
    }
    const result = await getResult({ examId, studentId });
    if (!result.success) {
      return res.status(404).json({ message: "Result not found" });
    }
    const appeal = await getAppeal({ resultId: result.result._id });
    if (appeal.success) {
      res.status(200).json(appeal.appeal);
    } else {
      res.status(404).json({ message: "Appeal not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all appeals of an exam by exam id
app.get('/api/appeals/:examId', authenticateToken, async (req, res) => {
  try {
    const exam = await getExam({ _id: req.params.examId });
    if (!exam.success) {
      return res.status(404).json({ message: "Exam not found" });
    }
    exam.exam.appealIds = await Promise.all(exam.exam.appealIds.map(async (appealId) => {
      const appeal = await getAppeal({ _id: appealId });
      return appeal.success ? appeal.appeal : null;
    }));
    const appeals = exam.exam.appealIds;
    res.status(200).json(appeals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update appeal by object id
app.put('/api/appeal/:oid', authenticateToken, async (req, res) => {
  try {
    const result = await updateAppeal({ _id: req.params.oid }, req.body);
    if (result.success) {
      res.status(200).json(result.appeal);
    } else {
      res.status(404).json({ message: "Appeal not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete appeal by object id
app.delete('/api/appeal/:oid', authenticateToken, async (req, res) => {
  try {
    const result = await deleteAppeal({ _id: req.params.oid });
    if (result.success) {
      res.status(200).json(result.appeal);
    } else {
      res.status(404).json({ message: "Appeal not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});







// Default route
app.get('/', (req, res) => {
  res.send('Welcome to Exam Nexus!')
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send({ message: "Something broke!" })
})

app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT)
})

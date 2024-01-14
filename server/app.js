import {
  createStudent,
  createProfessor,
  createProgramIncharge,
  createAdmin,
  createMCQQuestion,
  createCodeQuestion,
  createExam,
  createResult,
  createAppeal,
  createCourse,

  getStudent,
  getProfessor,
  getProgramIncharge,
  getAdmin,
  getMCQQuestion,
  getCodeQuestion,
  getExam,
  getResult,
  getAppeal,
  getCourse,

  updateStudent,
  updateProfessor,
  updateProgramIncharge,
  updateAdmin,
  updateMCQQuestion,
  updateCodeQuestion,
  updateExam,
  updateResult,
  updateAppeal,
  updateCourse,

  deleteStudent,
  deleteProfessor,
  deleteProgramIncharge,
  deleteAdmin,
  deleteMCQQuestion,
  deleteCodeQuestion,
  deleteExam,
  deleteResult,
  deleteAppeal,
  deleteCourse
} from './database.js';

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ObjectId } from 'mongodb';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});


// updateStudent("2011981262", {
//   "personalDetails.name": "Pranav",
//   "personalDetails.email": "pranav@gmail.com"
// })
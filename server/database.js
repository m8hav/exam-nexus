// Desc: Database connection and CRUD operations

// IMPORTS

import mongoose from 'mongoose';

// importing models
import Student from './models/Student.js';
import Professor from './models/Professor.js';
import ProgramIncharge from './models/ProgramIncharge.js';
import Admin from './models/Admin.js';
import Exam from './models/Exam.js';
import Result from './models/Result.js';
import Appeal from './models/Appeal.js';
import Course from './models/Course.js';
import MCQQuestion from './models/MCQQuestion.js';
import CodeQuestion from './models/CodeQuestion.js';


// CONNECTING TO DATABASE
mongoose.connect('mongodb://0.0.0.0:27017/exam_nexus_db');
const connection = mongoose.connection;
connection.once('open', function () {
  console.log("database connected");
});
connection.on('error', () => console.log("Couldn't connect to MongoDB"));




// CREATE FUNCTIONS

// create student
export const createStudent = async (student) => {
  try {
    const newStudent = await Student.create(student);
    return {
      success: true,
      student: newStudent
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// create professor
export const createProfessor = async (professor) => {
  try {
    const newProfessor = await Professor.create(professor);
    return {
      success: true,
      professor: newProfessor
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// create program incharge
export const createProgramIncharge = async (programIncharge) => {
  try {
    const newProgramIncharge = await ProgramIncharge.create(programIncharge);
    return {
      success: true,
      programIncharge: newProgramIncharge
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// create admin
export const createAdmin = async (admin) => {
  try {
    const newAdmin = await Admin.create(admin);
    return {
      success: true,
      admin: newAdmin
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// create course
export const createCourse = async (course) => {
  try {
    const professor = await Professor.findById(course.professorId);
    if (!professor) {
      return {
        success: false,
        message: "Professor not found"
      };
    }
    const students = await Student.find({ _id: { $in: course.studentIds } });
    if (students.length !== course.studentIds.length) {
      return {
        success: false,
        message: "One or more students not found"
      };
    }
    const newCourse = await Course.create(course);
    professor.courseIds.push(newCourse._id);
    await professor.save();
    for (const student of students) {
      student.enrolledCourseIds.push(newCourse._id);
      await student.save();
    };
    return {
      success: true,
      course: newCourse
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// create mcq question
export const createMCQQuestion = async (mcqQuestion) => {
  try {
    const newMCQQuestion = await MCQQuestion.create(mcqQuestion);
    return {
      success: true,
      mcqQuestion: newMCQQuestion
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// create code question
export const createCodeQuestion = async (codeQuestion) => {
  try {
    const newCodeQuestion = await CodeQuestion.create(codeQuestion);
    return {
      success: true,
      codeQuestion: newCodeQuestion
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// create exam
export const createExam = async (exam) => {
  try {
    const course = await Course.findById(exam.courseId);
    if (!course) {
      return {
        success: false,
        message: "Course not found"
      };
    }
    const newExam = await Exam.create(exam);
    course.examIds.push(newExam._id);
    await course.save();
    return {
      success: true,
      exam: newExam
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// calculate all ranks of an exam's results
const calculateRanks = async (exam) => {
  await exam.populate('resultIds');
  const results = exam.resultIds;
  results.sort((result1, result2) => result2.marks - result1.marks);
  for (const [index, result] of results.entries()) {
    result.rank = index + 1;
    await result.save();
  };
}

// calculate result marks
const calculateResultMarks = async (exam, result) => {
  await exam.populate('mcqQuestionIds')
  let marks = 0;
  for (let index = 0; index < result.mcqResults.length; index++) {
    const mcqResult = result.mcqResults[index];
    const mcqQuestion = exam.mcqQuestionIds[index];
    if (!isNaN(mcqResult.selectedOption) && mcqQuestion.options[mcqResult.selectedOption].isCorrect)
      marks += mcqQuestion.marks;
  }
  return marks;
}

// create result
export const createResult = async (result) => {
  try {
    const exam = await Exam.findById(result.examId);
    if (!exam) {
      return {
        success: false,
        message: "Exam not found"
      };
    }
    const student = await Student.findById(result.studentId);
    if (!student) {
      return {
        success: false,
        message: "Student not found"
      };
    }
    let marks = 0;
    marks += await calculateResultMarks(exam, result);
    result.marks = marks;
    result.updatedAt = new Date();
    result.rank = 0;
    const newResult = await Result.findOneAndUpdate({ examId: result.examId, studentId: result.studentId }, result, { upsert: true, new: true });
    if (!exam.resultIds.includes(newResult._id))
      exam.resultIds.push(newResult._id);
    exam.resultAnalytics.totalAttendees += 1;
    exam.resultAnalytics.totalMarksScored += newResult.marks;
    if (newResult.marks > exam.resultAnalytics.highestMarksInfo.marks) {
      exam.resultAnalytics.highestMarksInfo.marks = newResult.marks;
      exam.resultAnalytics.highestMarksInfo.studentId = newResult.studentId;
    }
    await exam.save();
    await calculateRanks(exam);
    return {
      success: true,
      result: await Result.findById(newResult._id)
    };
  } catch (error) {
    await Result.deleteOne({ examId: result.examId, studentId: result.studentId });
    return {
      success: false,
      message: error.message
    };
  }
}

// create appeal
export const createAppeal = async (appeal) => {
  try {
    const newAppeal = await Appeal.create(appeal);
    return {
      success: true,
      appeal: newAppeal
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}



// READ FUNCTIONS / GET FUNCTIONS

// get student / read student
export const getStudent = async (studentInfo) => {
  const student = await Student.findOne(studentInfo);
  if (student) {
    return {
      success: true,
      student: student
    };
  } else {
    return {
      success: false,
      message: "Student not found"
    };
  }
}

// get multiple students / read multiple students
export const getStudents = async (studentsInfo) => {
  const students = await Student.find(studentsInfo);
  if (students && students.length > 0) {
    return {
      success: true,
      students: students
    };
  } else {
    return {
      success: false,
      message: "Students not found"
    };
  }
}

// get professor / read professor
export const getProfessor = async (professorInfo) => {
  const professor = await Professor.findOne(professorInfo);
  if (professor) {
    return {
      success: true,
      professor: professor
    };
  } else {
    return {
      success: false,
      message: "Professor not found"
    };
  }
}

// get program incharge / read program incharge
export const getProgramIncharge = async (programInchargeInfo) => {
  const programIncharge = await ProgramIncharge.findOne(programInchargeInfo);
  if (programIncharge) {
    return {
      success: true,
      programIncharge: programIncharge
    };
  } else {
    return {
      success: false,
      message: "Program Incharge not found"
    };
  }
}

// get admin / read admin
export const getAdmin = async (adminInfo) => {
  const admin = await Admin.findOne(adminInfo);
  if (admin) {
    return {
      success: true,
      admin: admin
    };
  } else {
    return {
      success: false,
      message: "Admin not found"
    };
  }
}

// get course / read course
export const getCourse = async (courseInfo) => {
  const course = await Course.findOne(courseInfo);
  if (course) {
    return {
      success: true,
      course: course
    };
  } else {
    return {
      success: false,
      message: "Course not found"
    };
  }
}

// get mcq question / read mcq question
export const getMCQQuestion = async (mcqQuestionInfo) => {
  const mcqQuestion = await MCQQuestion.findOne(mcqQuestionInfo);
  if (mcqQuestion) {
    return {
      success: true,
      mcqQuestion: mcqQuestion
    };
  } else {
    return {
      success: false,
      message: "MCQ Question not found"
    };
  }
}

// get code question / read code question
export const getCodeQuestion = async (codeQuestionInfo) => {
  const codeQuestion = await CodeQuestion.findOne(codeQuestionInfo);
  if (codeQuestion) {
    return {
      success: true,
      codeQuestion: codeQuestion
    };
  } else {
    return {
      success: false,
      message: "Code Question not found"
    };
  }
}

// get exam / read exam
export const getExam = async (examInfo) => {
  const exam = await Exam.findOne(examInfo);
  if (exam) {
    return {
      success: true,
      exam: exam
    };
  } else {
    return {
      success: false,
      message: "Exam not found"
    };
  }
}

// get result / read result
export const getResult = async (resultInfo) => {
  const result = await Result.findOne(resultInfo);
  if (result) {
    return {
      success: true,
      result: result
    };
  } else {
    return {
      success: false,
      message: "Result not found"
    };
  }
}

// get appeal / read appeal
export const getAppeal = async (appealInfo) => {
  const appeal = await Appeal.findOne(appealInfo);
  if (appeal) {
    return {
      success: true,
      appeal: appeal
    };
  } else {
    return {
      success: false,
      message: "Appeal not found"
    };
  }
}



// UPDATE FUNCTIONS

// update student
export const updateStudent = async (studentInfo, update) => {
  const student = await Student.findOne(studentInfo);
  if (student) {
    try {
      const updateResult = await student.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          student: await Student.findById(student._id)
        };
      }
      throw new Error("Couldn't update student for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "Student not found"
    };
  }
}

// update professor
export const updateProfessor = async (professorInfo, update) => {
  const professor = await Professor.findOne(professorInfo);
  if (professor) {
    try {
      const updateResult = await professor.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          professor: await Professor.findById(professor._id)
        };
      }
      throw new Error("Couldn't update professor for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "Professor not found"
    };
  }
}

// update program incharge
export const updateProgramIncharge = async (programInchargeInfo, update) => {
  const programIncharge = await ProgramIncharge.findOne(programInchargeInfo);
  if (programIncharge) {
    try {
      const updateResult = await programIncharge.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          programIncharge: await ProgramIncharge.findById(programIncharge._id)
        };
      }
      throw new Error("Couldn't update program incharge for unknown reason");
    } catch (error) {
    }
  } else {
  }
}

// update admin
export const updateAdmin = async (adminInfo, update) => {
  const admin = await Admin.findOne(adminInfo);
  if (admin) {
    try {
      const updateResult = await admin.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          admin: await Admin.findById(admin._id)
        };
      }
      throw new Error("Couldn't update admin for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "Admin not found"
    };
  }
}

// update course
export const updateCourse = async (courseInfo, update) => {
  const course = await Course.findOne(courseInfo);
  if (course) {
    try {
      const updateResult = await course.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          course: await Course.findById(course._id)
        };
      }
      throw new Error("Couldn't update course for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "Course not found"
    };
  }
}

// update mcq question
export const updateMCQQuestion = async (mcqQuestionInfo, update) => {
  const mcqQuestion = await MCQQuestion.findOne(mcqQuestionInfo);
  if (mcqQuestion) {
    try {
      const updateResult = await mcqQuestion.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          mcqQuestion: await MCQQuestion.findById(mcqQuestion._id)
        };
      }
      throw new Error("Couldn't update MCQ question for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "MCQ Question not found"
    };
  }
}

// update code question
export const updateCodeQuestion = async (codeQuestionInfo, update) => {
  const codeQuestion = await CodeQuestion.findOne(codeQuestionInfo);
  if (codeQuestion) {
    try {
      const updateResult = await codeQuestion.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          codeQuestion: await CodeQuestion.findById(codeQuestion._id)
        };
      }
      throw new Error("Couldn't update code question for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
  return {
    success: false,
    message: "Code Question not found"
  };
}

// update exam
export const updateExam = async (examInfo, update) => {
  const exam = await Exam.findOne(examInfo);
  if (exam) {
    try {
      const updateResult = await exam.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          exam: await Exam.findById(exam._id)
        };
      }
      throw new Error("Couldn't update exam for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "Exam not found"
    };
  }
}

// update exam's result
export const updateExamResults = async (examInfo, update) => {
  const exam = await Exam.findOne(examInfo);
  if (exam) {
    try {
      const updateResult = await exam.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          exam: await Exam.findById(exam._id)
        };
      }
      throw new Error("Couldn't update exam for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "Exam not found"
    };
  }
}

// update result
export const updateResult = async (resultInfo, update) => {
  const result = await Result.findOne(resultInfo);
  if (result) {
    try {
      const updateResult = await result.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          result: await Result.findById(result._id)
        };
      }
      throw new Error("Couldn't update result for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  } else {
    return {
      success: false,
      message: "Result not found"
    };
  }
}

// update appeal
export const updateAppeal = async (appealInfo, update) => {
  const appeal = await Appeal.findOne(appealInfo);
  if (appeal) {
    try {
      const updateResult = await appeal.updateOne(update);
      if (updateResult.acknowledged) {
        return {
          success: true,
          appeal: await Appeal.findById(appeal._id)
        };
      }
      throw new Error("Couldn't update appeal for unknown reason");
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
  return {
    success: false,
    message: "Appeal not found"
  };
}






// TESTING RESULT ADDITION

// // creating 4 students
// const student1 = await createStudent({
//   name: "Pranav",
//   email: "pranav@gmail.com",
//   username: "2111981140",
//   password: "123456",
//   batch: 2021,
//   semester: 1,
//   enrolledCourseIds: [],
//   pastEnrolledCourses: [],
//   performance: {
//     semesterPerformance: [],
//     overallPerformance: {
//       totalExamsAttended: 0,
//       totalMaxMarks: 0,
//       totalMarksScored: 0,
//     }
//   }
// })
// console.log(student1);
// const student2 = await createStudent({
//   name: "Madhav",
//   email: "madhav@gmail.com",
//   username: "2011981262",
//   password: "123456",
//   batch: 2021,
//   semester: 1,
//   enrolledCourseIds: [],
//   pastEnrolledCourses: [],
//   performance: {
//     semesterPerformance: [],
//     overallPerformance: {
//       totalExamsAttended: 0,
//       totalMaxMarks: 0,
//       totalMarksScored: 0,
//     }
//   }
// })
// console.log(student2);
// const student3 = await createStudent({
//   name: "Aayush",
//   email: "aayush@gmail.com",
//   username: "2111981048",
//   password: "123456",
//   batch: 2021,
//   semester: 1,
//   enrolledCourseIds: [],
//   pastEnrolledCourses: [],
//   performance: {
//     semesterPerformance: [],
//     overallPerformance: {
//       totalExamsAttended: 0,
//       totalMaxMarks: 0,
//       totalMarksScored: 0,
//     }
//   }
// })
// console.log(student3);
// const student4 = await createStudent({
//   name: "Jasmine",
//   email: "jasmine@gmail.com",
//   username: "2111981160",
//   password: "123456",
//   batch: 2021,
//   semester: 1,
//   enrolledCourseIds: [],
//   pastEnrolledCourses: [],
//   performance: {
//     semesterPerformance: [],
//     overallPerformance: {
//       totalExamsAttended: 0,
//       totalMaxMarks: 0,
//       totalMarksScored: 0,
//     }
//   }
// })
// console.log(student4);

// // creating a professor
// const professor1 = await createProfessor({
//   username: "1",
//   password: "123456",
//   name: "Manan",
//   email: "manan@gmail.com",
//   courseIds: []
// })
// console.log(professor1);

// // creating a course
// const course1 = await createCourse({
//   name: "DSA",
//   courseCode: "DSA265",
//   syllabus: ["DSA"],
//   professorId: (await Professor.findOne({}).select('_id'))._id,
//   studentIds: (await Student.find({}).select('_id')).map(studentObj => studentObj._id),
//   examIds: [],
//   startDate: new Date(),
// })
// console.log(course1);

// // creating 4 mcq questions
// const mcqQuestion1 = await createMCQQuestion({
//   questionText: "What is the time complexity of bubble sort?",
//   options: [{
//     text: "O(n)",
//     isCorrect: false
//   }, {
//     text: "O(nlogn)",
//     isCorrect: false
//   }, {
//     text: "O(n^2)",
//     isCorrect: true
//   }, {
//     text: "O(n^3)",
//     isCorrect: false
//   }],
//   marks: 1
// })
// console.log(mcqQuestion1);
// const mcqQuestion2 = await createMCQQuestion({
//   questionText: "What is the time complexity of merge sort?",
//   options: [{
//     text: "O(n)",
//     isCorrect: false
//   }, {
//     text: "O(nlogn)",
//     isCorrect: true
//   }, {
//     text: "O(n^2)",
//     isCorrect: false
//   }, {
//     text: "O(n^3)",
//     isCorrect: false
//   }],
//   marks: 1
// })
// console.log(mcqQuestion2);
// const mcqQuestion3 = await createMCQQuestion({
//   questionText: "What form of polymorphism is method overloading?",
//   options: [{
//     text: "Compile time polymorphism",
//     isCorrect: true
//   }, {
//     text: "Run time polymorphism",
//     isCorrect: false
//   }, {
//     text: "Both",
//     isCorrect: false
//   }, {
//     text: "None",
//     isCorrect: false
//   }],
//   marks: 1
// })
// console.log(mcqQuestion3);
// const mcqQuestion4 = await createMCQQuestion({
//   questionText: "What form of polymorphism is method overriding?",
//   options: [{
//     text: "Compile time polymorphism",
//     isCorrect: false
//   }, {
//     text: "Run time polymorphism",
//     isCorrect: true
//   }, {
//     text: "Both",
//     isCorrect: false
//   }, {
//     text: "None",
//     isCorrect: false
//   }],
//   marks: 1
// })
// console.log(mcqQuestion4);

// creating an exam
// const exam1 = await createExam({
//   name: "DSA Midsem",
//   courseId: (await Course.findOne({}).select('_id'))._id,
//   syllabus: ["DSA"],
//   dateTime: new Date(2024, 1, 25, 13, 30),
//   loginWindowCloseTime: new Date(2024, 1, 25, 13, 30) + (30 * 60 * 1000),
//   duration: 60,
//   maxMarks: 10,
//   mcqQuestionIds: (await MCQQuestion.find({}).select('_id')).map(mcqQuestionObj => mcqQuestionObj._id),
//   codeQuestionIds: [],
//   resultIds: [],
//   resultAnalytics: {
//     totalAttendees: 0,
//     totalMarksScored: 0,
//     highestMarksInfo: {
//       marks: 0,
//       studentId: null
//     }
//   }
// })
// console.log(exam1);

// creating 4 results
// const result1 = await createResult({
//   examId: (await Exam.findOne({}).select('_id'))._id,
//   studentId: (await Student.find({}).select('_id').skip(0).limit(1))[0]._id,
//   mcqResults: [{
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(0).limit(1))[0]._id,
//     selectedOption: 1
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(1).limit(1))[0]._id,
//     selectedOption: 2
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(2).limit(1))[0]._id,
//     selectedOption: 3
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(3).limit(1))[0]._id,
//     selectedOption: 1
//   }],
// })
// console.log(result1);
// const result2 = await createResult({
//   examId: (await Exam.findOne({}).select('_id'))._id,
//   studentId: (await Student.find({}).select('_id').skip(1).limit(1))[0]._id,
//   mcqResults: [{
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(0).limit(1))[0]._id,
//     selectedOption: 2
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(1).limit(1))[0]._id,
//     selectedOption: 1
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(2).limit(1))[0]._id,
//     selectedOption: 3
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(3).limit(1))[0]._id,
//     selectedOption: 1
//   }],
// })
// console.log(result2);
// const result3 = await createResult({
//   examId: (await Exam.findOne({}).select('_id'))._id,
//   studentId: (await Student.find({}).select('_id').skip(2).limit(1))[0]._id,
//   mcqResults: [{
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(0).limit(1))[0]._id,
//     selectedOption: 2
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(1).limit(1))[0]._id,
//     selectedOption: 1
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(2).limit(1))[0]._id,
//     selectedOption: 0
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(3).limit(1))[0]._id,
//     selectedOption: 1
//   }],
// })
// console.log(result3);
// const result4 = await createResult({
//   examId: (await Exam.findOne({}).select('_id'))._id,
//   studentId: (await Student.find({}).select('_id').skip(3).limit(1))[0]._id,
//   mcqResults: [{
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(0).limit(1))[0]._id,
//     selectedOption: 2
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(1).limit(1))[0]._id,
//     selectedOption: 1
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(2).limit(1))[0]._id,
//     selectedOption: 1
//   }, {
//     mcqQuestionId: (await MCQQuestion.find({}).select('_id').skip(3).limit(1))[0]._id,
//     selectedOption: 2
//   }],
// })
// console.log(result4);

// print all results with ranks and student details
// console.log("RANKS");
// const results = await Exam.findOne().populate('resultIds').select('resultIds');
// results.resultIds.forEach(result => {
//   console.log(result.rank, result.studentId);
// })
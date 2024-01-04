import { Schema, model } from 'mongoose';

// Student Schema
const StudentSchema = new Schema({
  _id: ObjectId,
  username: String,
  password: String,
  personalDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  batch: String,
  enrolledCourse: { type: Schema.Types.ObjectId, ref: 'Course' },
  enrolledSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  enrollmentHistory: [{
    semester: String,
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  }],
  analytics: {
    totalExamsAttended: Number,
    averageMarksPercentage: Number,
    courseRank: Number,
    semesterRanks: [
      {
        semester: String,
        rank: Number,
      },
    ],
    subjectRanks: [
      {
        subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
        rank: Number,
      },
    ],
  },
});

// Professor Schema
const ProfessorSchema = new Schema({
  _id: ObjectId,
  username: String,
  password: String,
  personalDetails: {
    name: String,
    email: String,
    phone: String
  },
});

// ProgramIncharge Schema
const ProgramInchargeSchema = new Schema({
  _id: ObjectId,
  username: String,
  password: String,
  personalDetails: {
    name: String,
    email: String,
    phone: String
  },
});

// Admin Schema
const AdminSchema = new Schema({
  _id: ObjectId,
  username: String,
  password: String,
  personalDetails: {
    name: String,
    email: String,
    phone: String
  },
});

// Course Schema
const CourseSchema = new Schema({
  _id: ObjectId,
  name: String,
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  programIncharge: { type: Schema.Types.ObjectId, ref: 'ProgramIncharge' },
  analytics: {
    totalStudents: Number,
    totalExams: Number,
    averageMarksPercentage: Number,
  },
});

// Subject Schema
const SubjectSchema = new Schema({
  _id: ObjectId,
  name: String,
  syllabus: [String],
  professor: { type: Schema.Types.ObjectId, ref: 'Professor' },
  analytics: {
    totalStudents: Number,
    totalExams: Number,
    averageMarksPercentage: Number,
  },
});

// MCQ Question schema
const MCQQuestionSchema = new Schema({
  _id: ObjectId,
  text: String,
  options: [{ text: String, isCorrect: Boolean }],
  marks: Number,
});

// Code-Based Question schema
const CodeQuestionSchema = new Schema({
  _id: ObjectId,
  text: String,
  code: {
    hiddenHeader: String,
    headerFixed: String,
    editableStub: String,
    footerFixed: String,
    hiddenFooter: String,
    driver: String,
  },
  testCases: [{ input: String, expectedOutput: String }],
  programmingLanguages: [String],
  marks: Number,
});

// Question schema
const QuestionSchema = new Schema({
  _id: ObjectId,
  type: { type: String, enum: ['MCQ', 'Code'] },
  mcqQuestion: { type: Schema.Types.ObjectId, ref: 'MCQQuestion', required: function () { return this.type === 'MCQ'; } },
  codeQuestion: { type: Schema.Types.ObjectId, ref: 'CodeQuestion', required: function () { return this.type === 'Code'; } },
});

// Exam Schema
const ExamSchema = new Schema({
  _id: ObjectId,
  name: String,
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  syllabus: [String],
  dateTime: Date,
  loginWindowCloseTime: Date,
  duration: Number,
  maxMarks: Number,
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  resultAnalytics: {
    totalAttendees: Number,
    averageMarks: Number,
    highestMarks: Number,
  },
});

// Result Schema
const ResultSchema = new Schema({
  _id: ObjectId,
  exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  mcqResults: [{ question: { type: Schema.Types.ObjectId, ref: 'MCQQuestion' }, selectedOption: Number }],
  codeResults: [{ question: { type: Schema.Types.ObjectId, ref: 'CodeQuestion' }, code: String }],
  lastModified: Date,
  marks: Number,
  rank: Number,
});

// Export models
export const Student = model('Student', StudentSchema);
export const Professor = model('Professor', ProfessorSchema);
export const ProgramIncharge = model('ProgramIncharge', ProgramInchargeSchema);
export const Admin = model('Admin', AdminSchema);
export const Course = model('Course', CourseSchema);
export const Subject = model('Subject', SubjectSchema);
export const MCQQuestion = model('MCQQuestion', MCQQuestionSchema);
export const CodeQuestion = model('CodeQuestion', CodeQuestionSchema);
export const Question = model('Question', QuestionSchema);
export const Exam = model('Exam', ExamSchema);
export const Result = model('Result', ResultSchema);
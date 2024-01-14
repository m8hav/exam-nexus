import { Schema, model } from 'mongoose';

// Appeal Schema
const AppealSchema = new Schema({
  resultId: {
    type: Schema.Types.ObjectId,
    ref: 'Result'
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student'
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam'
  },
  appealText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now()
  },
});

export default model('Appeal', AppealSchema, 'appeals');
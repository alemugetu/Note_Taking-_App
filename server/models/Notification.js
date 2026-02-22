import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    noteTitle: { type: String, default: '' },
    type: { type: String, enum: ['reminder', 'system'], default: 'reminder' },
    message: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

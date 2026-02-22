import mongoose from 'mongoose';

const { Schema } = mongoose;

const pushSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subscription: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PushSubscription = mongoose.model('PushSubscription', pushSchema);

export default PushSubscription;

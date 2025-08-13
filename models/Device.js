import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  field: { type: String, required: true },
  widgetId: { type: String, required: true },
  currentWidgetId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Device || mongoose.model('Device', deviceSchema);
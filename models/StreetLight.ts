import mongoose from 'mongoose';

const StreetLightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ledNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['on', 'off'],
    default: 'off',
  },
  thingSpeakField: {
    type: String,
    required: true,
  },
  inputStatusUrl: String,
  currentStatusUrl: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.StreetLight || mongoose.model('StreetLight', StreetLightSchema);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function(this: any) {
      return !this.image; // Password required only if no OAuth image
    },
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'operator'],
    default: 'user',
  },
  image: {
    type: String, // For OAuth profile pictures
  },
  thingspeakApiKey: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(password: string) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  city: string;
  profilePicture: string;
  registerType: 'email' | 'google' | 'github';
  role: 'admin' | 'user';
  state: string;
  phoneNumber: string;
  accVerified: boolean;
  activeSessions: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'] 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} is not a valid email address!`
      }
    },
    password: { 
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't return password by default
    },
    city: { 
      type: String, 
      default: '' 
    },
    profilePicture: { 
      type: String, 
      default: '' 
    },
    registerType: { 
      type: String,
      enum: ['email', 'google', 'github'],
      default: 'email'
    },
    role: { 
      type: String, 
      enum: ['admin', 'user'],
      default: 'user'
    },
    state: { 
      type: String, 
      default: '' 
    },
    phoneNumber: { 
      type: String, 
      default: '' 
    },
    accVerified: { 
      type: Boolean, 
      default: false 
    },
    activeSessions: { 
      type: [String],
      default: [],
      validate: [
        {
          validator: function(v: string[]) {
            return v.length <= 10;
          },
          message: 'Cannot have more than 10 active sessions'
        }
      ]
    }
  },
  { 
    timestamps: true 
  }
);

// Hash password before saving
UserSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Create model only if it doesn't exist already
// Wrap in try-catch to avoid errors in Edge runtime
let User: mongoose.Model<IUser>;

try {
  // Check if the mongoose models object exists
  User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
} catch (error) {
  // This will run in Edge runtime where mongoose.models may not exist
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User; 
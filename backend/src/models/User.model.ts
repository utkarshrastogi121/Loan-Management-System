import { Schema, model, Document } from 'mongoose';
import { ROLES, UserRole } from '../constants/roles.constants.js';

export interface IUserPersonalDetails {
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: 'Salaried' | 'Self-Employed' | 'Unemployed';
  isEligible: boolean;
  rejectionReason?: string;
  salarySlipUrl?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  personalDetails?: IUserPersonalDetails;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.BORROWER,
      required: true,
      index: true,
    },
    personalDetails: {
      fullName: { type: String },
      pan: { type: String, uppercase: true, trim: true },
      dateOfBirth: { type: Date },
      monthlySalary: { type: Number },
      employmentMode: {
        type: String,
        enum: ['Salaried', 'Self-Employed', 'Unemployed'],
      },
      isEligible: { type: Boolean, default: false },
      rejectionReason: { type: String },
      salarySlipUrl: { type: String },
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model.js';
import { ENV } from '../config/env.js';
import { ROLES, UserRole } from '../constants/roles.constants.js';

export class AuthService {
  public static async registerBorrower(name: string, email: string, password: string): Promise<IUser> {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: ROLES.BORROWER,
    });

    return newUser;
  }

  public static async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user, token };
  }
}
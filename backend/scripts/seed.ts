import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../src/models/User.model.js';
import { Loan } from '../src/models/Loan.model.js';
import { Payment } from '../src/models/Payment.model.js';
import { AuditLog } from '../src/models/AuditLog.model.js';
import { ENV } from '../src/config/env.js';
import { ROLES } from '../src/constants/roles.constants.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('Cleaning up existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Loan.deleteMany({}),
      Payment.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    const defaultPassword = 'Password@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const testUsers = [
      {
        name: 'System Admin',
        email: 'admin@lms.com',
        role: ROLES.ADMIN,
        passwordHash,
      },
      {
        name: 'Sales Executive',
        email: 'sales@lms.com',
        role: ROLES.SALES,
        passwordHash,
      },
      {
        name: 'Sanction Officer',
        email: 'sanction@lms.com',
        role: ROLES.SANCTION,
        passwordHash,
      },
      {
        name: 'Disbursement Manager',
        email: 'disbursement@lms.com',
        role: ROLES.DISBURSEMENT,
        passwordHash,
      },
      {
        name: 'Collection Agent',
        email: 'collection@lms.com',
        role: ROLES.COLLECTION,
        passwordHash,
      },
      {
        name: 'Rohan Sharma',
        email: 'borrower@lms.com',
        role: ROLES.BORROWER,
        passwordHash,
        personalDetails: {
          fullName: 'Rohan Sharma',
          pan: 'ABCDE1234F',
          dateOfBirth: new Date('1995-04-12'),
          monthlySalary: 45000,
          employmentMode: 'Salaried',
          isEligible: true,
          salarySlipUrl: '/uploads/salary-slips/sample.pdf',
        },
      },
    ];

    await User.insertMany(testUsers);

    console.log('\n Seeding completed successfully!');
    console.log('====================================================');
    console.log('CREDENTIALS FOR TESTING (Password for all: Password@123):');
    console.log('====================================================');
    console.log('1. Admin:        admin@lms.com');
    console.log('2. Sales:        sales@lms.com');
    console.log('3. Sanction:     sanction@lms.com');
    console.log('4. Disbursement: disbursement@lms.com');
    console.log('5. Collection:   collection@lms.com');
    console.log('6. Borrower:     borrower@lms.com');
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
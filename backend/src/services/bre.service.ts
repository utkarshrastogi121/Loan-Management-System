import { BRE_RULES } from '../constants/bre.constants.js';

export interface BRERequest {
  fullName: string;
  pan: string;
  dateOfBirth: Date | string;
  monthlySalary: number;
  employmentMode: string;
}

export interface BREResult {
  isEligible: boolean;
  reasons: string[];
}

export class BREService {
  public static evaluate(details: BRERequest): BREResult {
    const reasons: string[] = [];

    // 1. Age Rule: Not between 23 and 50
    const dob = new Date(details.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (isNaN(age) || age < BRE_RULES.MIN_AGE || age > BRE_RULES.MAX_AGE) {
      reasons.push(
        `Age must be between ${BRE_RULES.MIN_AGE} and ${BRE_RULES.MAX_AGE}. Provided age is ${isNaN(age) ? 'invalid' : age}.`
      );
    }

    // 2. Salary Rule: Below 25,000/month
    if (details.monthlySalary < BRE_RULES.MIN_SALARY) {
      reasons.push(
        `Monthly salary must be at least ₹${BRE_RULES.MIN_SALARY.toLocaleString()}. Provided salary: ₹${details.monthlySalary.toLocaleString()}.`
      );
    }

    // 3. PAN Rule: Valid PAN Format
    const cleanPan = details.pan ? details.pan.trim().toUpperCase() : '';
    if (!BRE_RULES.PAN_REGEX.test(cleanPan)) {
      reasons.push('Invalid PAN format. Must match 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).');
    }

    // 4. Employment Mode Rule: Unemployed is rejected
    if (details.employmentMode === 'Unemployed') {
      reasons.push('Applicant cannot be Unemployed. Must be Salaried or Self-Employed.');
    } else if (!BRE_RULES.ALLOWED_EMPLOYMENT.includes(details.employmentMode as any)) {
      reasons.push(`Employment mode '${details.employmentMode}' is invalid.`);
    }

    return {
      isEligible: reasons.length === 0,
      reasons,
    };
  }
}
'use client';

import React, { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleGuard } from '@/components/role-guard';
import { Step1Auth } from '@/components/apply/step-1-auth';
import { Step2Details } from '@/components/apply/step-2-details';
import { Step3Upload } from '@/components/apply/step-3-upload';
import { Step4Loan } from '@/components/apply/step-4-loan';

const STEPS = [
  { id: 1, name: 'Account' },
  { id: 2, name: 'Eligibility' },
  { id: 3, name: 'Documentation' },
  { id: 4, name: 'Loan Calculator' },
];

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [salarySlipUrl, setSalarySlipUrl] = useState('');

  const goToNextStep = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleDocumentUpload = (url: string) => {
    setSalarySlipUrl(url);
    goToNextStep();
  };

  return (
    <RoleGuard allowedRoles={['BORROWER']}>
      <div className="min-h-screen bg-[#F8FAFC]">

        <main className="max-w-3xl mx-auto py-10 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Loan Application Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete your verification in 4 quick steps for same-day credit approval
            </p>
          </div>

          {/* Shopeers Clean Stepper Indicator */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between relative px-2">
              {STEPS.map((step, idx) => {
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex-1 flex flex-col items-center relative">
                    {/* Connecting Bar */}
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          'absolute top-4 left-[50%] right-[-50%] h-[2px] -z-0 transition-all',
                          completedSteps.has(step.id) ? 'bg-blue-600' : 'bg-slate-200'
                        )}
                      />
                    )}

                    {/* Step Circle */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative z-10',
                        isCompleted
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : isCurrent
                          ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-600 font-extrabold'
                          : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        'text-[11px] font-semibold mt-2 text-center transition-colors',
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            {currentStep === 1 && <Step1Auth onNext={goToNextStep} />}
            {currentStep === 2 && <Step2Details onNext={goToNextStep} />}
            {currentStep === 3 && <Step3Upload onNext={handleDocumentUpload} />}
            {currentStep === 4 && <Step4Loan salarySlipUrl={salarySlipUrl} />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

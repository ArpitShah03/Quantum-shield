import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
}

export interface StepperProps {
  steps: Step[];
}

export function Stepper({ steps }: StepperProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {index !== steps.length - 1 && (
            <div className="absolute left-[15px] top-[30px] bottom-[-24px] w-[2px] bg-border" />
          )}
          <div className="flex items-start">
            <div className="flex-shrink-0 relative z-10">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2',
                  step.status === 'pending' && 'border-border bg-surface text-text-muted',
                  step.status === 'processing' && 'border-primary bg-primary text-white',
                  step.status === 'success' && 'border-green-500 bg-green-500 text-white',
                  step.status === 'error' && 'border-red-500 bg-red-500 text-white'
                )}
              >
                {step.status === 'success' && <Check className="w-4 h-4" />}
                {step.status === 'error' && <X className="w-4 h-4" />}
                {step.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                )}
                {step.status === 'pending' && <span className="text-xs font-medium">{index + 1}</span>}
              </div>
            </div>
            <div className="ml-4 mt-1">
              <h4
                className={cn(
                  'text-sm font-semibold',
                  step.status === 'pending' ? 'text-text-muted' : 'text-text-main'
                )}
              >
                {step.title}
              </h4>
              {step.description && (
                <p className="text-sm text-text-muted mt-1">{step.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

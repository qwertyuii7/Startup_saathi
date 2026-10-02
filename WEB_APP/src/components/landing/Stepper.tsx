"use client";

import React, { useState, Children, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StepperProps {
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  children: ReactNode;
}

export function Step({ children }: { children: ReactNode }) {
  return <div className="w-full h-full flex flex-col">{children}</div>;
}

export default function Stepper({
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = "Back",
  nextButtonText = "Next",
  disableStepIndicators = false,
  children,
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
      onStepChange?.(currentStep + 1);
    } else {
      onFinalStepCompleted?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-[2rem] border border-neutral-200 shadow-xl overflow-hidden relative z-20">
      {!disableStepIndicators && (
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-neutral-100">
          {stepsArray.map((_, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isPast = stepNum < currentStep;

            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-500 ${
                      isActive
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                        : isPast
                        ? "bg-violet-100 text-violet-600"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {isPast ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                </div>
                {idx < totalSteps - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-neutral-100 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-violet-600 transition-all duration-700 ease-out" 
                        style={{ width: isPast ? '100%' : '0%' }}
                     />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden min-h-[220px] p-8 lg:p-12 flex items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex flex-col"
          >
            {stepsArray[currentStep - 1]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center p-6 lg:px-8 border-t border-neutral-100 bg-neutral-50/50">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-2.5 rounded-full font-medium transition-all ${
            currentStep === 1 
              ? "opacity-0 cursor-default" 
              : "opacity-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200"
          }`}
        >
          {backButtonText}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-full font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-md active:scale-95"
        >
          {currentStep === totalSteps ? "Finish" : nextButtonText}
        </button>
      </div>
    </div>
  );
}

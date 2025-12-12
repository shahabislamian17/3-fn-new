
"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StepperContextValue extends Omit<StepperProps, 'children'> {
  clickable?: boolean
  className?: string
  currentStep: number
  isError?: boolean
  isLoading?: boolean
  isVertical: boolean
  setStep: (step: number) => void
  nextStep: () => void;
  prevStep: () => void;
  steps: React.ReactElement<StepProps>[]
}

const StepperContext = React.createContext<StepperContextValue | null>(null)

function useStepper() {
  const context = React.useContext(StepperContext)

  if (context === null) {
    throw new Error("useStepper must be used within a <Stepper />")
  }

  return context
}

const Stepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StepperProps
>(
  (
    {
      className,
      children,
      orientation = "horizontal",
      initialStep = 0,
      clickable = false,
      ...props
    },
    ref
  ) => {
    const isVertical = orientation === "vertical"

    const Children = React.Children.toArray(children) as React.ReactElement[]

    const steps = Children.filter(
      (child) => child.type === StepperItem
    ) as React.ReactElement<StepProps>[]

    const [currentStep, setCurrentStep] = React.useState(initialStep)

    const setStep = (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step)
      }
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    }
    
    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }

    return (
      <StepperContext.Provider
        value={{
          ...props,
          currentStep,
          isVertical,
          setStep,
          steps,
          clickable,
          nextStep,
          prevStep
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex w-full flex-col gap-4",
            isVertical ? "flex-col" : "flex-row",
            className
          )}
        >
            <div className={cn(
                "flex items-center justify-between",
                isVertical ? "flex-col items-start" : "flex-row"
            )}>
                 {steps.map((step, index) => (
                    <div key={index} className={cn("flex items-center gap-2", isVertical ? "w-full" : "flex-1")}>
                        <div className="flex items-center gap-2">
                            <StepButton index={index} />
                            <StepLabel label={step.props.label} index={index} />
                        </div>
                        {index < steps.length - 1 && <StepConnector isVertical={isVertical} />}
                    </div>
                 ))}
            </div>
            <StepperContent />
        </div>
      </StepperContext.Provider>
    )
  }
)
Stepper.displayName = "Stepper"

const stepButtonVariants = cva(
  "rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium transition-colors",
  {
    variants: {
      status: {
        active: "border-2 border-primary bg-transparent text-primary",
        inactive: "border-2 border-border bg-transparent text-muted-foreground",
        completed: "bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      status: "inactive",
    },
  }
)

const StepButton = ({ index }: { index: number }) => {
  const { currentStep, setStep, clickable } = useStepper()
  const isActive = currentStep === index
  const isCompleted = currentStep > index

  const status = isCompleted ? "completed" : isActive ? "active" : "inactive"

  return (
    <button
      onClick={() => clickable && setStep(index)}
      className={cn(
        stepButtonVariants({ status }),
        clickable && "cursor-pointer"
      )}
      aria-current={isActive ? "step" : undefined}
    >
      {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
    </button>
  )
}

const stepLabelVariants = cva("text-sm font-medium", {
  variants: {
    status: {
      active: "text-primary",
      inactive: "text-muted-foreground",
      completed: "text-foreground",
    },
  },
  defaultVariants: {
    status: "inactive",
  },
});


const StepLabel = ({ label, index }: { label: string, index: number }) => {
    const { currentStep } = useStepper();
    const isActive = currentStep === index;
    const isCompleted = currentStep > index;
    const status = isCompleted ? "completed" : isActive ? "active" : "inactive";
  
    return (
      <div className={cn(stepLabelVariants({ status }))}>
        {label}
      </div>
    );
  };

const StepConnector = ({ isVertical }: { isVertical: boolean }) => {
    return <div className={cn("bg-border flex-1", isVertical ? 'min-h-8 w-px' : 'h-px w-full')} />
}

const StepperContent = () => {
    const { currentStep, steps } = useStepper()
    const activeStepContent = steps[currentStep]
    return <div className="w-full">{activeStepContent}</div>
}

const StepperItem = React.forwardRef<HTMLDivElement, StepProps>(
  ({ children, className, ...props }, ref) => {
    return <div ref={ref} className={className} {...props}>{children}</div>
  }
)
StepperItem.displayName = "StepperItem"

const StepperNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  const { nextStep, currentStep, steps } = useStepper()
  const isLastStep = currentStep === steps.length - 1

  return (
    <Button
      ref={ref}
      {...props}
      disabled={isLastStep || props.disabled}
      onClick={(e) => {
        props.onClick?.(e)
        if (!e.isDefaultPrevented()) {
          nextStep()
        }
      }}
    />
  )
})
StepperNext.displayName = "StepperNext"

const StepperPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  const { prevStep, currentStep } = useStepper()
  const isFirstStep = currentStep === 0

  return (
    <Button
      ref={ref}
      variant="ghost"
      {...props}
      disabled={isFirstStep || props.disabled}
      onClick={(e) => {
        props.onClick?.(e)
        if (!e.isDefaultPrevented()) {
          prevStep()
        }
      }}
    />
  )
})
StepperPrevious.displayName = "StepperPrevious"

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
}

interface StepperProps {
  initialStep?: number
  orientation?: "horizontal" | "vertical"
  children: React.ReactNode
  clickable?: boolean;
}

export {
  Stepper,
  StepperItem,
  StepperContent,
  StepperNext,
  StepperPrevious,
  useStepper,
}

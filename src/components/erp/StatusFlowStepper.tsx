import { CheckCircle2 } from "lucide-react";

interface StatusStep {
  code: string;
  label: string;
}

interface StatusFlowStepperProps {
  steps: StatusStep[];
  currentStatus: string;
  extraStep?: StatusStep;
}

const StatusFlowStepper = ({ steps, currentStatus, extraStep }: StatusFlowStepperProps) => {
  const currentIdx = steps.findIndex((s) => s.code === currentStatus);

  return (
    <div className="mt-4">
      <div className="flex items-center overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const isCurrent = step.code === currentStatus;
          const isPast = currentIdx >= 0 && i < currentIdx;
          const isFuture = !isCurrent && !isPast;

          return (
            <div key={step.code} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                {/* Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-card"
                      : isPast
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[9px]">{step.code}</span>
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-[9px] whitespace-nowrap ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isPast
                        ? "text-success"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`w-6 h-0.5 mx-0.5 mt-[-14px] ${
                    isPast ? "bg-success/40" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
        {/* Extra step (e.g. T04 for shipment) */}
        {extraStep && (
          <>
            <div className="mx-2 mt-[-14px] text-muted-foreground/30 text-xs">|</div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  currentStatus === extraStep.code
                    ? "bg-warning/20 text-warning ring-2 ring-warning/30 ring-offset-1 ring-offset-card"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="text-[9px]">{extraStep.code}</span>
              </div>
              <span
                className={`text-[9px] whitespace-nowrap ${
                  currentStatus === extraStep.code ? "text-warning font-bold" : "text-muted-foreground"
                }`}
              >
                {extraStep.label}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusFlowStepper;
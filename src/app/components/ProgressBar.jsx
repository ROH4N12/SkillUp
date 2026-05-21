interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  variant = "default",
  size = "md"
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variantColors = {
    default: "bg-purple-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    danger: "bg-red-600",
  };

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${variantColors[variant]} ${sizeClasses[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

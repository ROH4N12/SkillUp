interface SkillBadgeProps {
  skill: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  variant?: "default" | "outlined" | "success" | "warning" | "danger";
}

export function SkillBadge({ skill, level, variant = "default" }: SkillBadgeProps) {
  const variantStyles = {
    default: "bg-indigo-100 text-indigo-700 dark:text-indigo-300 border-indigo-200",
    outlined: "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600",
    success: "bg-green-100 text-green-700 dark:text-green-300 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 dark:text-yellow-300 border-yellow-200",
    danger: "bg-red-100 text-red-700 dark:text-red-300 border-red-200",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]}`}>
      {skill}
      {level && (
        <span className="opacity-75">• {level}</span>
      )}
    </span>
  );
}

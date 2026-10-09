import React from "react";
import { GraduationCap } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
      <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-gray-100">
        SkillUp
      </span>
    </div>
  );
};

export default Logo;

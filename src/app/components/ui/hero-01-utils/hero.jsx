import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

function HeroSection({ onGetStarted }) {
  return (
    <section>
      <div className="w-full h-full relative">
        <div className="relative w-full pt-4 md:pt-14 pb-8 md:pb-12">
          <div className="container mx-auto relative z-10 px-4">
            <div className="flex flex-col max-w-5xl mx-auto gap-8">
              <div className="relative flex flex-col text-center items-center sm:gap-6 gap-4">
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="font-display lg:text-8xl md:text-7xl text-5xl font-medium tracking-tight leading-[1.12]"
                >
                  AI-powered learning roadmaps for{" "}
                  <span className="font-instrument-serif tracking-tight font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300">
                    modern engineers
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
                  className="text-base sm:text-lg font-normal max-w-2xl text-muted-foreground leading-relaxed"
                >
                  Generate targeted curricula from your goals, curate structured video modules, and track competencies with real-time analytics.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                className="flex items-center justify-center pt-2"
              >
                <Button 
                  onClick={onGetStarted}
                  className="relative text-sm font-semibold rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer shadow-xl shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white border border-white/20"
                >
                  <span className="relative z-10 transition-all duration-500">
                    Start Learning Free
                  </span>
                  <span className="absolute right-1 w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45 shadow-sm">
                    <ArrowUpRight size={16} />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

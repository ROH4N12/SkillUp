import React from "react";
import HeroSection from "@/components/ui/hero-01-utils/hero";
import Header from "@/components/ui/hero-01-utils/header";

export default function AgencyHeroSection() {
  const navigationData = [
    {
      title: "Home",
      href: "#",
      isActive: true,
    },
    {
      title: "Features",
      href: "#features",
    },
    {
      title: "How It Works",
      href: "#how-it-works",
    },
    {
      title: "Platform",
      href: "/dashboard",
    },
  ];

  return (
    <div className="relative">
      <Header navigationData={navigationData} />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}

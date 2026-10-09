import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "@/assets/logo/logo";
import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const CollaborateButton = ({ className, onClick }) => (
  <Button 
    onClick={onClick}
    className={cn("relative text-sm font-medium rounded-full h-10 p-1 ps-4 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-4 w-fit overflow-hidden cursor-pointer", className)}
  >
    <span className="relative z-10 transition-all duration-500">
      Get Started
    </span>
    <span className="absolute right-1 w-8 h-8 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45">
      <ArrowUpRight size={16} />
    </span>
  </Button>
);

const Header = ({ navigationData = [], className, onGetStarted }) => {
  const [sticky, setSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 50);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setIsOpen(false);
  }, []);

  const handleNavClick = useCallback((e, href) => {
    if (href?.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleScroll, handleResize]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className={cn(
        "inset-x-0 z-50 px-4 flex items-center justify-center sticky top-0 h-20",
        className,
      )}
    >
      <div
        className={cn(
          "w-full max-w-6xl flex items-center h-fit justify-between gap-3.5 lg:gap-6 transition-all duration-500",
          sticky
            ? "p-2.5 glass-subtle backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl shadow-indigo-500/5 rounded-full"
            : "bg-transparent border-transparent",
        )}
      >
        {/* Logo */}
        <div>
          <a href="#">
            <Logo />
          </a>
        </div>

        {/* Desktop Navigation */}
        <div>
          <NavigationMenu className="max-lg:hidden glass-pill p-1 rounded-full border border-white/40 dark:border-white/10">
            <NavigationMenuList className="flex gap-1">
              {navigationData.map((navItem) => (
                <NavigationMenuItem key={navItem.title}>
                  <NavigationMenuLink
                    href={navItem.href}
                    onClick={(e) => handleNavClick(e, navItem.href)}
                    className={cn(
                      "px-3 lg:px-4 py-1.5 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all tracking-normal cursor-pointer",
                      navItem.isActive ? "bg-background text-foreground shadow-xs" : ""
                    )}
                  >
                    {navItem.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA & Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle variant="switch" />
          <CollaborateButton className="hidden lg:flex" onClick={onGetStarted} />

          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  id="mobile-menu-trigger"
                  className="rounded-full border border-border p-2 block glass-pill cursor-pointer"
                  aria-label="Toggle Menu"
                >
                  <Menu width={20} height={20} />
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full sm:w-96 p-0 glass-elevated backdrop-blur-2xl border-l border-white/40 dark:border-white/10"
              >
                <div className="flex items-center justify-between p-6 border-b border-border/40">
                  <a href="#">
                    <Logo />
                  </a>
                  <SheetClose asChild>
                    <button
                      id="mobile-menu-close"
                      className="rounded-full border border-border p-2 block glass-pill cursor-pointer"
                      aria-label="Close Menu"
                    >
                      <X width={16} height={16} />
                    </button>
                  </SheetClose>
                </div>

                <div className="flex flex-col gap-8 px-6 py-6 overflow-y-auto">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <NavigationMenu
                    orientation="vertical"
                    className="items-start flex-none w-full"
                  >
                    <NavigationMenuList className="flex flex-col items-start gap-3 w-full">
                      {navigationData.map((item) => (
                        <NavigationMenuItem key={item.title} className="w-full">
                          <NavigationMenuLink
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className={cn(
                              "flex items-center text-xl font-semibold tracking-tight transition-all p-2 rounded-lg hover:bg-accent/40 w-full cursor-pointer",
                              item.isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                            )}
                          >
                            {item.title}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>

                  <div className="w-full">
                    <CollaborateButton className="w-full justify-center" onClick={onGetStarted} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

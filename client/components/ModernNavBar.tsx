import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ModernButton } from "./ui/modern-button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { trapFocus } from "@/lib/accessibility";
import { QuoteRequestModal } from "./QuoteRequestModal";
import { api } from "../lib/api";

const ModernNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use global state for mobile menu
  const { isMobileMenuOpen, setMobileMenuOpen } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        if (isMobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen, setMobileMenuOpen]);

  // Trap focus in mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const cleanup = trapFocus(mobileMenuRef.current);
      return cleanup;
    }
  }, [isMobileMenuOpen]);

  const [serviceDropdown, setServiceDropdown] = useState<
    { label: string; href: string }[]
  >([]);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Only fetch active services for the dropdown
        const response = await import("../lib/api").then((m) =>
          m.api.services.getAll({ active: true }),
        );
        if (response.success && response.data) {
          setServiceDropdown(
            response.data.map((service: any) => ({
              label: service.name,
              href: `/services/${service.id}`,
            })),
          );
        } else {
          setServiceDropdown([]);
        }
      } catch {
        setServiceDropdown([]);
      }
    };
    fetchServices();
  }, []);

  const navItems = [
    {
      label: "Services",
      href: "/services",
      dropdown: serviceDropdown,
    },
    {
      label: "Products",
      href: "/products",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About Us",
      href: "/about",
    },
    {
      label: "Contact Us",
      href: "/contact",
    },
  ];

  const isActiveLink = (href: string) => {
    if (href.startsWith("#")) {
      return false; // Handle hash links differently
    }
    return location.pathname === href;
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 animate-slide-in-down",
        isScrolled
          ? "bg-blue-900/95 backdrop-blur-md shadow-xl border-b border-yellow-400/50 hover:shadow-2xl"
          : "bg-blue-900/80 backdrop-blur-sm",
      )}
    >
      <div className="container mb-2.5">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 hover:opacity-90 transition-all duration-300 animate-fade-in-left"
          >
            <div className="w-40 h-14 rounded-lg flex items-center justify-center shadow-sm overflow-hidden group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 relative">
              {/* Logo glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <img
                src="/logo/logo1.png"
                alt="Nolads Engineering Logo"
                title="Nolads Engineering"
                className="w-full h-full object-contain mr-auto relative z-10 group-hover:brightness-110 transition-all duration-300"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = '1';
                    target.src = '/logo/logo1.2.png';
                  }
                }}
              />
            </div>
            <div className="font-semibold text-xl text-white group-hover:text-yellow-300 transition-colors duration-300" />
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={activeDropdown === item.label}
                    className={cn(
                      "group flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      activeDropdown === item.label
                        ? "text-yellow-400 bg-blue-800/80 shadow-lg shadow-yellow-400/20"
                        : "text-blue-100 hover:text-yellow-400 hover:bg-blue-800/60 hover:shadow-lg",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === item.label ? null : item.label);
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 relative z-10",
                        activeDropdown === item.label ? "rotate-180" : "",
                      )}
                    />
                  </button>
                ) : item.href.startsWith("#") ? (
                  <a
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      isActiveLink(item.href)
                        ? "text-yellow-400 bg-blue-800/80 shadow-lg shadow-yellow-400/20"
                        : "text-blue-100 hover:text-yellow-400 hover:bg-blue-800/60 hover:shadow-lg",
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      "group flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden",
                      isActiveLink(item.href)
                        ? "text-yellow-400 bg-blue-800/80 shadow-lg shadow-yellow-400/20"
                        : "text-blue-100 hover:text-yellow-400 hover:bg-blue-800/60 hover:shadow-lg",
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                )}

                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-blue-900/95 backdrop-blur-lg rounded-xl shadow-xl border border-yellow-400/30 py-2 transition-opacity duration-200 overflow-hidden">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.label}
                        to={dropdownItem.href}
                        className="block px-4 py-2 text-sm text-blue-100 hover:text-yellow-400 hover:bg-blue-800/60 transition-colors duration-150 rounded-lg mx-2"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-3 animate-fade-in-right">
            <Link to="/admin">
              <ModernButton
                variant="ghost"
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/30"
              >
                Admin Page
              </ModernButton>
            </Link>
            <ModernButton
              variant="primary"
              size="sm"
              type="button"
              className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 border-2 border-blue-500 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/30"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Opening quote modal...");
                setIsQuoteModalOpen(true);
              }}
            >
              Request Quote
            </ModernButton>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <button
            className="lg:hidden p-2.5 rounded-lg hover:bg-blue-800/60 transition-all duration-300 animate-fade-in group"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
            ) : (
              <Menu className="w-6 h-6 text-white transition-all duration-300 group-hover:scale-110" />
            )}

            {/* Button glow effect */}
            <div className="absolute inset-0 bg-yellow-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-yellow-400/50 bg-blue-900/95 backdrop-blur-lg animate-slide-in-down relative overflow-hidden">
          {/* Mobile menu background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5" />

          <div className="container py-6 relative z-10" ref={mobileMenuRef}>
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <div key={item.label}>
                  {item.dropdown ? (
                    <div
                      className={cn(
                        "group relative block px-5 py-4 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden text-blue-100",
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center justify-between">
                        {item.label}
                        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
                      </span>
                    </div>
                  ) : item.href.startsWith("#") ? (
                    <a
                      href={item.href}
                      className={cn(
                        "group relative block px-5 py-4 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
                        isActiveLink(item.href)
                          ? "text-yellow-400 bg-blue-800/80 shadow-lg"
                          : "text-blue-100 hover:text-yellow-400 hover:bg-blue-800/60 hover:shadow-md",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center justify-between">
                        {item.label}
                        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
                      </span>
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "group relative block px-5 py-4 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
                        isActiveLink(item.href)
                          ? "text-yellow-400 bg-blue-800/80 shadow-lg"
                          : "text-blue-100 hover:text-yellow-400 hover:bg-blue-800/60 hover:shadow-md",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center justify-between">
                        {item.label}
                        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
                      </span>
                    </Link>
                  )}

                  {item.dropdown && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.dropdown.map((dropdownItem, dropdownIndex) => (
                        <Link
                          key={dropdownItem.label}
                          to={dropdownItem.href}
                          className="group relative block px-4 py-3 text-sm text-blue-200 hover:text-yellow-400 hover:bg-blue-800/60 rounded-lg transition-all duration-300 hover:translate-x-1 animate-fade-in-right"
                          style={{
                            animationDelay: `${(index + 1) * 100 + dropdownIndex * 50}ms`,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-400/50 rounded-full group-hover:bg-yellow-400 transition-colors duration-300" />
                            <span className="group-hover:font-medium transition-all duration-300">
                              {dropdownItem.label}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced Mobile CTAs */}
            <div className="pt-6 mt-6 border-t border-yellow-400/50 space-y-3">
              <div className="animate-fade-in-up delay-500">
                <Link to="/admin">
                  <ModernButton
                    variant="ghost"
                    className="w-full justify-center bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Page
                  </ModernButton>
                </Link>
              </div>
              <div className="animate-fade-in-up delay-600">
                <ModernButton
                  variant="primary"
                  type="button"
                  className="w-full justify-center bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 border-2 border-blue-500 hover:border-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    console.log("Opening quote modal from mobile menu...");
                    setIsQuoteModalOpen(true);
                  }}
                >
                  Request Quote
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          console.log("Closing quote modal...");
          setIsQuoteModalOpen(false);
        }}
        items={[]}
        type="service"
        onSubmit={async (data) => {
          try {
            await api.quotes.create(data);
            setIsQuoteModalOpen(false);
          } catch (error) {
            console.error("Error submitting quote:", error);
          }
        }}
      />
    </nav>
  );
};

export default ModernNavBar;

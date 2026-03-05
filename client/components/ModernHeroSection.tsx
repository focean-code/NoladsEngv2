import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  Gauge,
  Check,
  Star,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { ModernButton } from "./ui/modern-button";
import { ModernCard, CardContent } from "./ui/modern-card";
import { QuoteRequestModal } from "./QuoteRequestModal";
import { api } from "../lib/api";

const ModernHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const images = [
    {
      title: "Innovative Solutions",
      description: "Empowering your business with modern engineering.",
      placeholder: "/slider/slide1.jpg",
    },
    {
      title: "Advanced Technology",
      description: "State-of-the-art systems for every industry.",
      placeholder: "/slider/slide2.jpg",
    },
    {
      title: "Quality & Reliability",
      description: "Delivering excellence in every project.",
      placeholder: "/slider/slide3.jpg",
    },
    {
      title: "Smart Performance",
      description: "Real-time analytics and monitoring.",
      placeholder: "/slider/slide4.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevSlide(currentSlide);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 1000); // blur duration
    }, 8000);
    return () => clearInterval(interval);
  }, [currentSlide, images.length]);

  const stats = [
    { icon: Users, value: "1000+", label: "Projects Completed" },
    { icon: Award, value: "25+", label: "Years Experience" },
    { icon: TrendingUp, value: "500+", label: "Workforce" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Power Systems",
      description: "Advanced electrical distribution and management systems",
    },
    {
      icon: Shield,
      title: "Safety Solutions",
      description: "Comprehensive protection with industry-leading standards",
    },
    {
      icon: Gauge,
      title: "Performance Monitoring",
      description: "Real-time analytics and optimization for peak efficiency",
    },
  ];

  const testimonials = [
    {
      name: "University of Nairobi",
      role: "",
      company: "Educational Institution",
      content:
        "Our experience with Nolads Engineering is amazing. Their work dedication is unmatched.",
      rating: 5,
    },
    {
      name: "Kenya Railways",
      role: "",
      company: "Transportation Authority",
      content:
        "Your Services are excellent. Your turnaround response to emergency call-outs is very good.",
      rating: 5,
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Blurred background transition */}
      <div className="absolute inset-0 w-full h-full">
        {/* Previous image (blurred during transition) */}
        <div
          className={`absolute inset-0 w-full h-full bg-center bg-cover transition-all duration-400 ${isTransitioning ? 'blur-sm opacity-0' : 'opacity-0'}`}
          style={{
            backgroundImage: `url(${images[prevSlide].placeholder})`,
            opacity: isTransitioning ? 0.35 : 0,
            zIndex: 1,
          }}
          aria-hidden="true"
        />
        {/* Current image (sharp after transition) */}
        <div
          className={`absolute inset-0 w-full h-full bg-center bg-cover transition-all duration-400 ${isTransitioning ? 'blur-sm opacity-100' : 'opacity-100'}`}
          style={{
            backgroundImage: `url(${images[currentSlide].placeholder})`,
            opacity: 0.35,
            zIndex: 2,
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-20 container mx-auto px-7 py-9 pt-20 h-full flex items-center">
        <div className="grid lg:grid-cols-12 gap-7 items-center w-full">
          {/* Hero Content - Left Side */}
          <div className="lg:col-span-7 max-w-4xl">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400 text-yellow-400 px-3.5 py-1.5 rounded-full text-sm font-medium mb-5 backdrop-blur-sm animate-scale-in-bounce hover:scale-110 transition-all duration-300 cursor-default">
              <Zap className="w-3.5 h-3.5 animate-pulse-glow" />
              <span className="animate-fade-in-right delay-200">Premium Engineering Solutions</span>
            </div>

            {/* Enhanced Hero Title with Staggered Animation */}
            <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-5 leading-tight">
              <span className="block text-4xl lg:text-6xl xl:text-7xl animate-fade-in-up">
                Nolads Engineering
              </span>
              <span className="block text-2xl lg:text-4xl xl:text-5xl mt-1.5 text-blue-100 animate-fade-in-left delay-300">
                A Pinnacle Of
              </span>
              <span className="text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text block text-3xl lg:text-5xl xl:text-6xl mt-1.5 animate-slide-in-right delay-500 animate-gradient-shift hover:scale-105 transition-transform duration-300 cursor-default">
                Engineering Excellence.
              </span>
            </h1>

            {/* Enhanced Hero Description */}
            <div className="animate-fade-in-up delay-700">
              <p className="text-base lg:text-lg text-blue-100 mb-7 leading-relaxed max-w-2xl">
                Nestled in the heart of innovation, Nolads Engineering offers
                transformative industrial solutions where cutting-edge technology
                meets uncompromising precision.
              </p>
            </div>

            {/* Enhanced Feature List with Staggered Animation */}
            <div className="space-y-2 mb-6">
              {[
                  "Over 1000 successful projects delivered",
                  "25+ years of engineering excellence",
                  "Certified by NCA & EPRA",
                  "Trusted by 100+ leading clients",
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 group animate-slide-in-left hover:translate-x-2 transition-all duration-300"
                  style={{ animationDelay: `${800 + (index * 150)}ms` }}
                >
                  <div className="w-6 h-6 bg-yellow-400/20 border border-yellow-400 rounded-full flex items-center justify-center group-hover:bg-yellow-400 group-hover:scale-110 transition-all duration-300">
                    <Check className="w-3.5 h-3.5 text-yellow-400 group-hover:text-blue-900 flex-shrink-0" />
                  </div>
                  <span className="text-sm text-blue-100 group-hover:text-white transition-colors duration-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <ModernButton
                variant="primary"
                size="sm"
                className="bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Request Quote
              </ModernButton>
              <ModernButton
                variant="secondary"
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                View Our Work
              </ModernButton>
            </div>

            {/* Enhanced Stats with Animation */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group text-center animate-bounce-in-up hover-lift cursor-default"
                  style={{ animationDelay: `${1200 + (index * 200)}ms` }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl group-hover:shadow-yellow-400/50 group-hover:scale-110 transition-all duration-500 animate-float-slow">
                    <stat.icon className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-lg font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-xs text-blue-200 group-hover:text-blue-100 transition-colors duration-300">{stat.label}</div>
                  
                  {/* Decorative glow */}
                  <div className="absolute inset-0 bg-yellow-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </div>
              ))}
            </div>
          </div>

          {/* Simple Service Card - Right Side */}
          <div className="lg:col-span-5 flex justify-end">
            <div className="max-w-sm w-full">
              <ModernCard className="bg-blue-900/50 backdrop-blur-sm border border-white/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-white font-bold text-xl mb-2">
                      Transform your operations with
                    </h3>
                    <p className="text-blue-100 text-sm mb-4">
                      world-class engineering solutions
                    </p>                    
                    <div className="flex flex-col gap-3">
                      <ModernButton
                        variant="primary"
                        className="w-full bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                        onClick={() => setIsQuoteModalOpen(true)}
                      >
                        Get Custom Quote
                      </ModernButton>
                    </div>
                  </div>
                </CardContent>
              </ModernCard>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        items={[]}
        type="service"
        onSubmit={async (data) => {
          try {
            await api.quotes.create(data);
            setIsQuoteModalOpen(false);
          } catch (error) {
            console.error('Error submitting quote:', error);
          }
        }}
      />
    </section>
  );
};

export default ModernHeroSection;

import React, { useState, useEffect } from "react";
import { useSEO } from "../hooks/useSEO";
import { api } from "../lib/api";
import { Service } from "@shared/api";
import eventBus, { CONTENT_UPDATED } from "../lib/eventBus";
import {
  Zap,
  Shield,
  Settings,
  Gauge,
  Wrench,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import {
  ModernCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardGrid,
  ServiceCard,
} from "../components/ui/modern-card";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // SEO optimization for services page
  useSEO({
    title: 'Electrical Engineering Services - Nolads Engineering',
    description: 'Comprehensive electrical engineering services including power systems design, safety solutions, industrial automation, and performance monitoring for industrial applications.',
    keywords: 'electrical engineering services, power systems design, electrical safety solutions, industrial automation, PLC programming, SCADA systems, electrical consulting, power distribution design',
    ogTitle: 'Professional Electrical Engineering Services',
    ogDescription: 'Expert electrical engineering services for industrial applications. Power systems, automation, safety, and monitoring solutions.',
    canonical: typeof window !== 'undefined' ? `${window.location.origin}/services` : undefined,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Electrical Engineering Services",
      "provider": {
        "@type": "Organization",
        "name": "Nolads Engineering",
        "url": typeof window !== 'undefined' ? window.location.origin : undefined
      },
      "areaServed": "Kenya",
      "description": 'Comprehensive electrical engineering services including power systems design, safety solutions, industrial automation, and performance monitoring for industrial applications.'
    }
  });

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.services.getAll({ active: true });
        if (response.success && response.data) {
          setServices(response.data);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();

    // Subscribe to service updates
    const unsubscribe = eventBus.subscribe(CONTENT_UPDATED.SERVICES, () => {
      console.log('Services updated, fetching new data...');
      fetchServices();
    });

    return () => {
      unsubscribe(); // Cleanup subscription when component unmounts
    };
  }, []);

  // Map API services to display format
  const mapApiServicesToDisplay = (apiServices: Service[]) => {
    const iconMap: { [key: string]: any } = {
      'power': Zap,
      'safety': Shield,
      'automation': Settings,
      'monitoring': Gauge,
      'maintenance': Wrench,
      'consulting': Award,
    };

    const parseFeatures = (raw: unknown): string[] => {
      if (Array.isArray(raw)) return raw.map((v) => String(v));
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map((v) => String(v));
        } catch {
          // Fallback: handle comma/newline/semicolon separated values or bracketed lists without quotes
          const cleaned = trimmed.replace(/^\[|\]$/g, '');
          const items = cleaned
            .split(/[,;|\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          if (items.length) return items;
        }
      }
      return [];
    };

    return apiServices.map(service => {
      // Generate link based on name (fallback) or id (API)
      let link = service.id ? `/services/${service.id}` : `/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`;
      return {
        icon: iconMap[service.category?.toLowerCase() || 'consulting'] || Award,
        title: service.name,
        description: service.short_description || service.description || '',
        features: parseFeatures(service.features as unknown),
        link,
        price_range: service.price_range,
      };
    });
  };

  // Convert API services to display format if we have them
  const displayServices = services.length > 0 && services[0].id 
    ? mapApiServicesToDisplay(services)
    : services;

  const processSteps = [
    {
      step: "01",
      title: "Assessment & Planning",
      description:
        "Comprehensive evaluation of your current systems and requirements to develop the optimal solution strategy.",
    },
    {
      step: "02",
      title: "Design & Engineering",
      description:
        "Detailed engineering design using industry-leading software and best practices for maximum efficiency.",
    },
    {
      step: "03",
      title: "Implementation",
      description:
        "Professional installation and integration with minimal disruption to your operations.",
    },
    {
      step: "04",
      title: "Testing & Commissioning",
      description:
        "Rigorous testing protocols ensure all systems meet specifications and safety standards.",
    },
    {
      step: "05",
      title: "Training & Support",
      description:
        "Comprehensive training for your team and ongoing support to maximize system performance.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <ModernNavBar />

      {/* Hero Section */}
      <section className="section bg-slate-50 pt-24 pb-0">
        <div className="container">
          <div className="text-center mb-5 pb-5 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Settings className="w-4 h-4" />
              Engineering Services
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Engineering Services That
              <span className="text-blue-600"> Power Innovation</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              From initial concept to ongoing maintenance, our comprehensive
              engineering services ensure your electrical systems operate at
              peak performance with maximum safety and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ModernButton 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/contact'}
              >
                Request Consultation
                <ArrowRight className="w-5 h-5" />
              </ModernButton>
              <ModernButton variant="outline" size="lg">
                View Case Studies
              </ModernButton>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section py-5">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Wrench className="w-4 h-4" />
              Our Core Services
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              Comprehensive Engineering
              <span className="text-blue-600"> Solutions</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive electrical engineering solutions tailored to meet
              your specific requirements and industry standards.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayServices.map((service, index) => (
                <div
                  key={index}
                  className="animate-slide-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ModernCard className="h-full card-md hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-2 border-blue-700/50 text-center hover:scale-105 hover:rotate-1 transition-all duration-500 shadow-2xl hover:shadow-blue-500/30 hover:border-yellow-400/50 relative overflow-hidden">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardContent className="p-6 h-full flex flex-col relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:shadow-yellow-400/50 animate-float-medium group-hover:animate-pulse-glow transition-all duration-500">
                          <service.icon className="w-8 h-8 text-blue-900 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-500">
                          {service.title}
                        </h3>
                        
                        {service.price_range && (
                          <p className="text-xs text-yellow-300 font-semibold mb-3">
                            {service.price_range}
                          </p>
                        )}
                        
                        <p className="text-blue-100 mb-4 leading-relaxed flex-grow text-sm">
                          {service.description}
                        </p>

                        {service.features && service.features.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-yellow-300 mb-2">Key Features:</h4>
                            <ul className="space-y-1">
                              {service.features.slice(0, 2).map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center gap-2 text-xs text-blue-100">
                                  <CheckCircle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                              {service.features.length > 2 && (
                                <li className="text-xs text-blue-200 italic">
                                  +{service.features.length - 2} more features
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <div className="mt-auto">
                          <ModernButton
                            variant="outline"
                            size="sm"
                            className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400 transition-all duration-300 hover:scale-110 hover:shadow-lg group-hover:animate-pulse-glow font-semibold"
                            onClick={() => window.location.href = service.link}
                          >
                            Learn More
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </ModernButton>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-50" />
                        <div
                          className="absolute bottom-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse opacity-30"
                          style={{ animationDelay: "1s" }}
                        />
                      </CardContent>
                    </ModernCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="section bg-blue-900 py-5">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-6 h-6" />
              Our Process
            </div>
            <h2 className="type-h2 font-bold text-yellow-400 mb-6">
              Our Proven
              <span className="text-blue-600"> Process</span>
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto">
              A systematic approach that ensures successful project delivery
              from concept to completion.
            </p>
          </div>

          <div className="space-y-6">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ModernCard className="overflow-hidden card-md">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {step.step}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                  </CardContent>
                </ModernCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section pt-5 pb-24">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Quote className="w-4 h-4" />
              Client Stories
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              What Our Clients
              <span className="text-blue-600"> Are Saying</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Don't just take our word for it. Hear from industry leaders who
              have transformed their operations with our engineering solutions.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ModernCard variant="elevated" className="overflow-hidden card-md">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <blockquote className="text-2xl text-slate-900 mb-8 leading-relaxed">
                    "Nolads Engineering transformed our power distribution
                    system with exceptional precision. Their safety-first
                    approach and cutting-edge automation solutions increased our
                    operational efficiency by 40%."
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src="/placeholder.svg"
                      alt="Michael Rodriguez"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 text-lg">
                        Michael Rodriguez
                      </div>
                      <div className="text-slate-600">Chief Engineer</div>
                      <div className="text-blue-600 font-medium">
                        Steelworks Manufacturing
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-blue-600 pt-5 pb-24">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="type-h2 font-bold text-white mb-6">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get started with a consultation or get a quotation and discover how our
              engineering expertise can optimize your electrical systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ModernButton
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule Consultation
              </ModernButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container py-16">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo/logo1.png"
                    alt="Nolads Engineering Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-semibold text-2xl">
                  Nolads<span className="text-blue-400">Engineering</span>
                </div>
              </div>
              <p className="text-slate-300 mb-8 leading-relaxed max-w-md">
                Leading the future of electrical engineering with innovative
                solutions, exceptional service, and unwavering commitment to
                safety and reliability.
              </p>
              <ModernButton variant="primary">
                Get Started Today
                <ArrowRight className="w-4 h-4" />
              </ModernButton>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Services</h4>
              <ul className="space-y-3">
                {[
                  "Power Systems Design",
                  "Safety Solutions",
                  "Industrial Automation",
                  "Performance Monitoring",
                  "Maintenance Services",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Company</h4>
              <ul className="space-y-3">
                {[
                  "About Us",
                  "Our Team",
                  "Careers",
                  "Case Studies",
                  "Contact",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Nolads Engineering. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;

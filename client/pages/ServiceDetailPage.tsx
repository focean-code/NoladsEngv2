import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Zap,
  Shield,
  Settings,
  Gauge,
  Wrench,
  Award,
} from "lucide-react";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import {
  ModernCard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardGrid,
} from "../components/ui/modern-card";
import { api } from "../lib/api";
import { Service as OriginalService } from "@shared/api";
import { companyInfo } from "../data/company-info";

// Extend Service type to include 'benefits' and 'process' properties
type Service = OriginalService & {
  benefits?: string;
  process?: string;
};


const iconMap: { [key: string]: any } = {
  power: Zap,
  safety: Shield,
  automation: Settings,
  monitoring: Gauge,
  maintenance: Wrench,
  consulting: Award,
};

const parseList = (raw: unknown): string[] => {
  // Accept arrays directly
  if (Array.isArray(raw)) return raw.map((v) => String(v).trim()).filter(Boolean);

  // Handle strings like: JSON arrays, comma/semicolon/newline separated,
  // or strings wrapped with curly braces: {"item";"item2"} or {item, item2}
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    // Try JSON.parse first (handles '[]' and '"..."' formats)
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      // fallthrough to fallback parsing
    }

    // Remove surrounding brackets or braces if present
    const noOuter = trimmed.replace(/^\s*[\[\{]\s*/, '').replace(/\s*[\]\}]\s*$/, '');

    // Split on common separators
    const parts = noOuter.split(/[,;|\n]+/);

    // Clean each part: remove surrounding single/double quotes and trim
    return parts
      .map((s) => s.trim().replace(/^['"]+|['"]+$/g, ''))
      .filter(Boolean);
  }

  return [];
};

const ServiceDetailPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        if (!serviceId) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const response = await api.services.getById(Number(serviceId));
        if (response.success && response.data) {
          setService(response.data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="text-xl text-slate-600">Loading service details...</span>
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="min-h-screen bg-white">
        <ModernNavBar />
        <section className="section flex items-center justify-center min-h-[80vh]">
          <div className="container text-center">
            <h1 className="type-h2 font-bold text-slate-900 mb-4">
              Service Not Found
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              The service you're looking for doesn't exist.
            </p>
            <Link to="/services">
              <ModernButton variant="primary">
                <ArrowLeft className="w-4 h-4" />
                Back to Services
              </ModernButton>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Map category to icon
  const IconComponent = iconMap[service.category?.toLowerCase() || "consulting"] || Award;

  // Primary contact details from company profile
  const primaryOffice = companyInfo.offices?.[0];
  const primaryPhone = primaryOffice?.phone?.[0] || "";
  const primaryEmail = primaryOffice?.email || "info@noladseng.com";
  const telHref = `tel:${(primaryPhone || "").replace(/\s+/g, "")}`;
  const mailHref = `mailto:${primaryEmail}`;

  return (
    <div className="min-h-screen bg-white">
      <ModernNavBar />

      {/* Breadcrumb */}
      <section className="pt-24 pb-8 bg-slate-50">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/services"
              className="hover:text-blue-600 transition-colors"
            >
              Services
            </Link>
            <span>/</span>
            <span className="text-slate-900">{service.name}</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div>
            <div className="animate-slide-in-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  {service.category ? `${service.category} Service` : "Expert Service"}
                </div>
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-4">
                {service.name}
              </h1>
              {/* <p className="text-2xl text-blue-600 font-semibold mb-6">
                {service.subtitle}
              </p> */}
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {service.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <ModernButton 
                  variant="primary" 
                  size="lg"
                  onClick={() => window.location.href = '/contact'}
                >
                  Request a Consultation
                  <ArrowRight className="w-5 h-5" />
                </ModernButton>
                <ModernButton variant="outline" size="lg">
                  Download Brochure
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              Service
              <span className="text-blue-600"> Features</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive solutions designed to meet your specific
              requirements and exceed industry standards.
            </p>
          </div>

          <div className="mb-16">
            {parseList(service.features).length > 0 ? (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parseList(service.features).map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="group flex items-start gap-4 p-6 bg-white shadow-lg rounded-xl border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 font-semibold leading-relaxed group-hover:text-blue-700 transition-colors duration-300">
                          {feature}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">Features Coming Soon</h3>
                <p className="text-slate-500">
                  Detailed features for this service will be available soon. 
                  Contact us for more information about what this service includes.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-blue-600">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Speak with our team about your {service.name?.toLowerCase() || "service"} requirements for a tailored solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={telHref}>
                <ModernButton
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Phone className="w-5 h-5" />
                  Call: {primaryPhone}
                </ModernButton>
              </a>
              <a href={mailHref}>
                <ModernButton
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Mail className="w-5 h-5" />
                  Email: {primaryEmail}
                </ModernButton>
              </a>
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
              <Link to="/contact">
                <ModernButton variant="primary">
                  Get Started Today
                  <ArrowRight className="w-4 h-4" />
                </ModernButton>
              </Link>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Services</h4>
              <ul className="space-y-3">
                {[
                  {
                    name: "Power Systems Design",
                    href: "/services/power-systems",
                  },
                  { name: "Safety Solutions", href: "/services/safety" },
                  {
                    name: "Industrial Automation",
                    href: "/services/automation",
                  },
                  {
                    name: "Performance Monitoring",
                    href: "/services/monitoring",
                  },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Company</h4>
              <ul className="space-y-3">
                {[
                  { name: "About Us", href: "/#about" },
                  { name: "Our Team", href: "/#about" },
                  { name: "Careers", href: "/#contact" },
                  { name: "Case Studies", href: "/services" },
                  { name: "Contact", href: "/#contact" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {item.name}
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

export default ServiceDetailPage;

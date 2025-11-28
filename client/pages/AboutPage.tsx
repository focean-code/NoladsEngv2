import React from "react";
import { useSEO } from "../hooks/useSEO";
import {
  Users,
  Award,
  Target,
  Heart,
  Shield,
  Building,
  Calendar,
  Mail,
  Linkedin,
  ArrowRight,
  CheckCircle,
  Globe,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import {
  ModernCard,
  CardContent,
  CardGrid,
} from "../components/ui/modern-card";
import { companyInfo } from "../src/companyData";

const AboutPage = () => {
  // SEO optimization for about page
  useSEO({
    title: `About ${companyInfo.name} - Leading Electrical Engineering Company`,
    description: `Learn about ${companyInfo.name}, established in ${companyInfo.established} and incorporated in ${companyInfo.incorporated}. Leading provider of electrical engineering, power generation, and building construction services in Kenya.`,
    keywords: `about ${companyInfo.name}, electrical engineering company, power systems experts, industrial automation specialists, electrical safety professionals`,
    ogTitle: `About ${companyInfo.name} - Electrical Engineering Experts`,
    ogDescription: `Established in ${companyInfo.established}, ${companyInfo.name} specializes in electrical engineering, power generation, civil engineering, and building construction services across Kenya.`,
    canonical: typeof window !== 'undefined' ? `${window.location.origin}/about` : undefined,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": companyInfo.name,
      "url": typeof window !== 'undefined' ? window.location.origin : undefined,
      "logo": "logo/logo1.png",
      "description": `Leading provider of electrical engineering, power generation, and building construction services in Kenya since ${companyInfo.established}.`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": companyInfo.offices[0]?.address,
        "addressLocality": "Mombasa",
        "addressCountry": "KE"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": companyInfo.offices[0]?.phone[0],
          "contactType": "customer service",
          "email": companyInfo.offices[0]?.email
        }
      ]
    }
  });

  const stats = [
    { icon: Users, value: companyInfo.stats.completedProjects, label: "Completed Projects" },
    { icon: Award, value: `${new Date().getFullYear() - companyInfo.established}+`, label: "Years Experience" },
    { icon: TrendingUp, value: companyInfo.stats.workforce, label: "Our Work Force" },
    { icon: Globe, value: companyInfo.stats.citiesCovered, label: "Cities Covered" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Safety is our top priority in every project we undertake. We ensure all our solutions meet the highest safety standards and regulations.",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "We continuously push the boundaries of electrical engineering, embracing new technologies and methodologies to deliver cutting-edge solutions.",
    },
    {
      icon: Heart,
      title: "Quality Excellence",
      description:
        "Our commitment to quality is unwavering. We deliver solutions that exceed expectations and stand the test of time.",
    },
    {
      icon: Users,
      title: "Customer Success",
      description:
        "Our clients' success is our success. We build long-lasting partnerships based on trust, reliability, and exceptional service.",
    },
  ];

  const timeline = [
    {
      year: String(companyInfo.established),
      title: "Company Established",
      description:
        `${companyInfo.name} was established as a Sole Proprietor Business, initially focusing on Power Generation Sector services.`,
    },
    {
      year: String(companyInfo.incorporated),
      title: "Company Incorporation",
      description:
        "Incorporated as a Limited Liability Company, expanding our capabilities and establishing ourselves as specialized service providers.",
    },
    {
      year: "2010s",
      title: "Service Expansion",
      description:
        "Broadened expertise and established Building Construction and Civil Engineering Works division, undertaking several GOK and NGO projects.",
    },
    {
      year: "Present",
      title: "Leading Provider",
      description:
        "Registered with EPRA as specialized Electrical Contractors Class A-2, serving major institutions including government agencies, universities, and corporations across Kenya.",
    },
  ];

  const team = companyInfo.directors.map(d => ({
    name: d.name,
    role: "Director",
    bio: `${d.shares} shareholder, ${d.nationality}.`,
    linkedin: "#",
    email: `info@noladseng.com`,
    specialties: ["Leadership", "Strategy"]
  }));

  const certifications = companyInfo.ncaRegistrations;

  return (
    <div className="min-h-screen bg-white">
      <ModernNavBar />

      {/* Hero Section */}
      <section className="section bg-slate-50 pt-24 pb-5">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building className="w-4 h-4" />
              About Nolads Engineering
            </div>
            <h1 className="type-h2 font-bold text-slate-900 mb-6">
              Engineering Excellence
              <span className="text-blue-600"> Since 2008</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              We are a leading electrical engineering company dedicated to
              delivering innovative, safe, and reliable solutions that power the
              future of industry. Our team of expert engineers combines decades
              of experience with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services">
                <ModernButton variant="primary" size="lg">
                  Explore Our Services
                  <ArrowRight className="w-5 h-5" />
                </ModernButton>
              </Link>
              <Link to="/contact">
                <ModernButton variant="outline" size="lg">
                  Get In Touch
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section pt-5 pb-24">
        <div className="container">
          <CardGrid cols={4} gap="lg">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ModernCard variant="gradient" className="text-center">
                  <CardContent className="py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <stat.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-slate-600 font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </ModernCard>
              </div>
            ))}
          </CardGrid>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-slate-50 pt-5 pb-24">
        <div className="container flex flex-col items-center justify-center">
          <div className="w-full animate-fade-in flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6 justify-center">
              <Target className="w-4 h-4" />
              Our Mission
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6 text-center">
              Our Mission
              <span className="text-blue-600"> & Vision</span>
            </h2>
            <div className="mb-8 w-full flex flex-col items-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Vision</h3>
              <p className="text-xl text-slate-600 mb-6 leading-relaxed text-center">
                To be among the leading service providers of choice in the power generation <br />
                and building construction sectors in Kenya.
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Mission</h3>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed text-center">
                To achieve long term relationships with our clients and provide exceptional <br />
                services and products by pursuing business innovations and technology.
              </p>
            </div>
            <div className="space-y-4 max-w-xl mx-auto w-full flex flex-col items-center">
              {[
                "Supply, installation and maintenance of generator sets",
                "Electrical installation and power distribution works",
                "Building construction and civil engineering works",
                "Genuine spare parts for power generator sets",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 justify-center w-full">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 text-center">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section pt-5 pb-24">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              The Principles That
              <span className="text-blue-600"> Guide Us</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our core values shape every decision we make and every solution we
              deliver. They are the foundation of our company culture and our
              commitment to excellence.
            </p>
          </div>

          <CardGrid cols={2} gap="lg">
            {values.map((value, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ModernCard className="h-full card-md">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                      <value.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </ModernCard>
              </div>
            ))}
          </CardGrid>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section bg-slate-50 pt-5 pb-24">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Our Journey
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              Milestones in
              <span className="text-blue-600"> Engineering Excellence</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From our founding to today, we've consistently pushed the
              boundaries of what's possible in electrical engineering.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-0.5 top-0 bottom-0 w-0.5 bg-slate-300"></div>

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    } animate-slide-up`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div
                      className={`w-full md:w-1/2 ${
                        index % 2 === 0
                          ? "md:pr-12 pl-16 md:pl-0"
                          : "md:pl-12 pl-16 md:pr-0"
                      }`}
                    >
                      <ModernCard className="card-md">
                        <CardContent className="p-6">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {item.year}
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-3">
                            {item.title}
                          </h3>
                          <p className="text-slate-600">{item.description}</p>
                        </CardContent>
                      </ModernCard>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section pt-5 pb-24">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Our Team
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              Meet the Experts Behind
              <span className="text-blue-600"> Our Success</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our team combines decades of experience with fresh perspectives,
              ensuring we deliver innovative solutions that meet today's
              challenges and tomorrow's opportunities.
            </p>
          </div>

          <CardGrid cols={3} gap="lg">
            {team.map((member, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ModernCard className="h-full group card-md">
                  <CardContent className="p-0">
                    {/* Removed image placeholder for team members */}

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                        {member.bio}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {member.specialties.map((specialty, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </ModernCard>
              </div>
            ))}
          </CardGrid>
        </div>
      </section>

      {/* Certifications */}
      <section className="section bg-slate-50 pt-5 pb-24">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Certifications & Memberships
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              Recognized for
              <span className="text-blue-600"> Quality & Excellence</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our commitment to quality is recognized by leading industry
              organizations and certification bodies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <ModernCard
                key={index}
                className="text-center animate-slide-up card-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-medium text-slate-900">{cert}</p>
                </CardContent>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-blue-600 pt-5 pb-24">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 font-bold text-white mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of satisfied clients who trust Nolads Engineering
              for their most critical electrical projects. Let's discuss how we
              can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <ModernButton
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Start a Conversation
                  <ArrowRight className="w-5 h-5" />
                </ModernButton>
              </Link>
              <Link to="/services">
                <ModernButton
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Explore Our Services
                </ModernButton>
              </Link>
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
              <h4 className="font-semibold text-lg mb-6">Company</h4>
              <ul className="space-y-3">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Our Team", href: "/about#team" },
                  { name: "Careers", href: "/contact" },
                  { name: "Case Studies", href: "/services" },
                  { name: "Contact", href: "/contact" },
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
              <h4 className="font-semibold text-lg mb-6">Services</h4>
              <ul className="space-y-3">
                {[
                  { name: "Power Systems", href: "/services/power-systems" },
                  { name: "Safety Solutions", href: "/services/safety" },
                  { name: "Automation", href: "/services/automation" },
                  { name: "Monitoring", href: "/services/monitoring" },
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

export default AboutPage;

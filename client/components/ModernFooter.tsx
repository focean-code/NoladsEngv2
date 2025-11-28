import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ModernButton } from './ui/modern-button';

export const ModernFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots opacity-5" />
      
      <div className="container py-16 relative z-10">
        <div className="grid lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="/logo/logo1.png"
                  alt="Nolads Engineering Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-bold text-2xl">
                Nolads<span className="text-yellow-400">Engineering</span>
              </div>
            </div>
            <p className="text-slate-300 mb-8 leading-relaxed max-w-lg text-base">
              Leading the future of electrical engineering with innovative
              solutions, exceptional service, and unwavering commitment to
              safety and reliability.
            </p>
            <Link to="/contact">
              <ModernButton variant="primary" size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-900 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                Get Started Today
                <ArrowRight className="w-4 h-4" />
              </ModernButton>
            </Link>
          </div>

          <div>
            <h4 className="text-slate-100 font-semibold text-base mb-5">Services</h4>
            <ul className="space-y-2.5">
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
            <h4 className="text-slate-100 font-semibold text-base mb-5">Company</h4>
            <ul className="space-y-2.5">
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

        <div className="border-t border-slate-500 mt-10 pt-7 flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-300 text-sm">
            <p className="mb-2">© {new Date().getFullYear()} Nolads Engineering. All rights reserved.</p>
            <p>
              Designed and developed by{" "}
              <a 
                href="https://www.mobiwave.co.ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-300 hover:text-yellow-300 transition-colors"
              >
                Mobiwave Innovations Ltd
              </a>
            </p>
          </div>
          <div className="flex items-center gap-5 mt-3.5 md:mt-0">
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
  );
};

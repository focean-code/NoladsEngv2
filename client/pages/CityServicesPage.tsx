import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import { api } from "../lib/api";
import { Service } from "@shared/api";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import { ModernCard, CardContent, CardGrid } from "../components/ui/modern-card";
import { CheckCircle, ArrowRight } from "lucide-react";

const normalizeCity = (city: string) => city.toLowerCase();

const CityServicesPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const rawCity = params.city || "";
  const city = useMemo(() => normalizeCity(rawCity), [rawCity]);
  const isSupportedCity = city === "nairobi" || city === "mombasa";

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useSEO({
    title: `Generator & Electrical Services in ${isSupportedCity ? capitalize(city) : "Kenya"} | Nolads Engineering`,
    description: `Generator installation and maintenance, industrial electrical works, and construction services in ${isSupportedCity ? capitalize(city) : "Kenya"}.`,
    canonical: typeof window !== "undefined" ? `${window.location.origin}/services/city/${city}` : undefined,
    keywords: `${isSupportedCity ? `generator installation ${city}, generator maintenance ${city}, electrical contractor ${city}, building construction ${city}` : "generator installation kenya, generator maintenance kenya, electrical contractor kenya"}`,
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: `Nolads Engineering - ${isSupportedCity ? capitalize(city) : "Kenya"}`,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        areaServed: [isSupportedCity ? capitalize(city) : "Kenya", "Kenya"],
        address: {
          "@type": "PostalAddress",
          addressCountry: "KE",
          addressLocality: isSupportedCity ? capitalize(city) : "Kenya",
        },
        makesOffer: services.slice(0, 8).map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.name, description: s.short_description || s.description },
          areaServed: isSupportedCity ? capitalize(city) : "Kenya",
        })),
      },
    ],
  });

  useEffect(() => {
    if (!rawCity) return;
    if (!isSupportedCity) {
      navigate("/services", { replace: true });
      return;
    }
  }, [rawCity, isSupportedCity, navigate]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await api.services.getFeatured(12);
        if (res.success && res.data) setServices(res.data);
        else setServices([]);
      } catch {
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const cityTitle = isSupportedCity ? capitalize(city) : "Kenya";

  return (
    <div className="min-h-screen bg-white">
      <ModernNavBar />

      <section className="section bg-slate-50 pt-24 pb-0">
        <div className="container">
          <div className="text-center mb-10">
            <h1 className="type-h2 font-bold text-slate-900">
              Services in <span className="text-blue-600">{cityTitle}</span>
            </h1>
            <p className="text-lg text-slate-600 mt-4">
              Generator installations & maintenance, industrial electrical works, and construction services.
            </p>
          </div>
        </div>
      </section>

      <section className="section py-10">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CardGrid cols={4} gap="lg">
              {services.map((service, idx) => (
                <ModernCard key={service.id || idx} className="h-full card-md">
                  <CardContent className="p-6 h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-slate-600 mb-4 flex-grow">
                      {service.short_description || service.description}
                    </p>
                    <ModernButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => (window.location.href = `/services/${service.id || ""}`)}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </ModernButton>
                  </CardContent>
                </ModernCard>
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <section className="section pb-20 pt-0">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <ModernButton asChild variant="primary">
              <Link to="/contact">
                Request a Quote in {cityTitle}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Link>
            </ModernButton>
          </div>
        </div>
      </section>
    </div>
  );
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default CityServicesPage;



import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Zap } from "lucide-react";
import ModernNavBar from "../components/ModernNavBar";
import { ModernButton } from "../components/ui/modern-button";
import { ModernCard, CardContent } from "../components/ui/modern-card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <ModernNavBar />

      <section className="section flex items-center justify-center min-h-[80vh]">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <ModernCard variant="elevated">
              <CardContent className="py-16 px-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Zap className="w-12 h-12 text-blue-600" />
                </div>

                <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-slate-700 mb-4">
                  Page Not Found
                </h2>
                <p className="text-xl text-slate-600 mb-8 max-w-md mx-auto">
                  The page you're looking for doesn't exist or has been moved.
                  Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/">
                    <ModernButton variant="primary" size="lg">
                      <Home className="w-5 h-5" />
                      Back to Home
                    </ModernButton>
                  </Link>
                  <ModernButton
                    variant="outline"
                    size="lg"
                    onClick={() => window.history.back()}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Go Back
                  </ModernButton>
                </div>
              </CardContent>
            </ModernCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;

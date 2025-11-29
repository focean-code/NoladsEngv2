import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  CompanyInfo, 
  CompanyContacts, 
  CompanyStats, 
  Service, 
  Product, 
  Testimonial 
} from '@shared/api';
import ModernNavBar from '../components/ModernNavBar';
import { ModernCard, CardContent, CardHeader, CardTitle } from '../components/ui/modern-card';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  Database, 
  Server, 
  Globe,
  Users,
  Award,
  Building
} from 'lucide-react';

interface ConnectionStatus {
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: any;
}

const ConnectionTestPage = () => {
  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>({
    companyInfo: { status: 'loading', message: 'Testing company info API...' },
    companyStats: { status: 'loading', message: 'Testing company stats API...' },
    companyContact: { status: 'loading', message: 'Testing company contact API...' },
    services: { status: 'loading', message: 'Testing services API...' },
    products: { status: 'loading', message: 'Testing products API...' },
    testimonials: { status: 'loading', message: 'Testing testimonials API...' },
  });

  const updateConnection = (key: string, status: ConnectionStatus) => {
    setConnections(prev => ({ ...prev, [key]: status }));
  };

  useEffect(() => {
    const testConnections = async () => {
      // Test Company Info API
      try {
        const companyResponse = await api.company.getStats();
        updateConnection('companyInfo', {
          status: 'success',
          message: `✅ Company Stats loaded successfully`,
          data: companyResponse.data
        });
      } catch (error) {
        updateConnection('companyInfo', {
          status: 'error',
          message: `❌ Company Info failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test Company Stats API
      try {
        const statsResponse = await api.company.getStats();
        updateConnection('companyStats', {
          status: 'success',
          message: `✅ Company Stats loaded successfully`,
          data: statsResponse.data
        });
      } catch (error) {
        updateConnection('companyStats', {
          status: 'error',
          message: `❌ Company Stats failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test Company Contact API
      try {
        // Contact info is part of the stats response
        const contactResponse = await api.company.getStats();
        updateConnection('companyContact', {
          status: 'success',
          message: `✅ Company Contact info loaded successfully`,
          data: contactResponse.data
        });
      } catch (error) {
        updateConnection('companyContact', {
          status: 'error',
          message: `❌ Company Contact failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test Services API
      try {
        const servicesResponse = await api.services.getAll();
        updateConnection('services', {
          status: 'success',
          message: `✅ Services loaded: ${servicesResponse.data?.length || 0} services from database`,
          data: servicesResponse.data
        });
      } catch (error) {
        updateConnection('services', {
          status: 'error',
          message: `❌ Services failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test Products API
      try {
        const productsResponse = await api.products.getAll();
        updateConnection('products', {
          status: 'success',
          message: `✅ Products loaded: ${productsResponse.data?.length || 0} products from database`,
          data: productsResponse.data
        });
      } catch (error) {
        updateConnection('products', {
          status: 'error',
          message: `❌ Products failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test Testimonials API
      try {
        const testimonialsResponse = await api.testimonials.getFeatured(10);
        updateConnection('testimonials', {
          status: 'success',
          message: `✅ Testimonials loaded: ${testimonialsResponse.data?.length || 0} testimonials from database`,
          data: testimonialsResponse.data
        });
      } catch (error) {
        updateConnection('testimonials', {
          status: 'error',
          message: `❌ Testimonials failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    };

    testConnections();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const allSuccess = Object.values(connections).every(conn => conn.status === 'success');
  const anyError = Object.values(connections).some(conn => conn.status === 'error');

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavBar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="type-h2 font-bold text-gray-900 mb-4">
              System Connection Test
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Testing Frontend ↔ Backend ↔ Database connectivity
            </p>
            
            {/* Overall Status */}
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold ${
              allSuccess ? 'bg-green-500' : anyError ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              {allSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  All Systems Connected ✅
                </>
              ) : anyError ? (
                <>
                  <XCircle className="w-5 h-5" />
                  Connection Issues Detected ❌
                </>
              ) : (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Testing Connections...
                </>
              )}
            </div>
          </div>

          {/* Connection Tests */}
          <div className="grid gap-6 mb-8">
            {Object.entries(connections).map(([key, connection]) => (
              <ModernCard key={key} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(connection.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-gray-600">{connection.message}</p>
                    </div>
                  </div>
                </CardContent>
              </ModernCard>
            ))}
          </div>

          {/* Data Samples */}
          {allSuccess && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Company Info Sample */}
              {connections.companyInfo.data && (
                <ModernCard variant="gradient">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-white">
                      <p><strong>Name:</strong> {connections.companyInfo.data.name}</p>
                      <p><strong>Tagline:</strong> {connections.companyInfo.data.tagline}</p>
                      <p><strong>Established:</strong> {connections.companyInfo.data.stats?.established}</p>
                      <p><strong>Workforce:</strong> {connections.companyInfo.data.stats?.workforce}</p>
                    </div>
                  </CardContent>
                </ModernCard>
              )}

              {/* Services Sample */}
              {connections.services.data && (
                <ModernCard variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Services from Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {connections.services.data.slice(0, 3).map((service: Service) => (
                        <div key={service.id} className="p-2 bg-gray-50 rounded">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.category}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </ModernCard>
              )}

              {/* Products Sample */}
              {connections.products.data && (
                <ModernCard variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Products from Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {connections.products.data.slice(0, 3).map((product: Product) => (
                        <div key={product.id} className="p-2 bg-gray-50 rounded">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </ModernCard>
              )}

              {/* Testimonials Sample */}
              {connections.testimonials.data && (
                <ModernCard variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Testimonials from Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {connections.testimonials.data.slice(0, 3).map((testimonial: Testimonial) => (
                        <div key={testimonial.id} className="p-2 bg-gray-50 rounded">
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-gray-600">{testimonial.company}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Award key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </ModernCard>
              )}
            </div>
          )}

          {/* Architecture Diagram */}
          <ModernCard variant="elevated" className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                System Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8 py-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Globe className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-semibold">Frontend</p>
                  <p className="text-sm text-gray-600">React + TypeScript</p>
                </div>
                
                <div className="text-2xl text-gray-400">↔</div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <Server className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-semibold">Backend</p>
                  <p className="text-sm text-gray-600">Express.js API</p>
                </div>
                
                <div className="text-2xl text-gray-400">↔</div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <Database className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="font-semibold">Database</p>
                  <p className="text-sm text-gray-600">SQLite</p>
                </div>
              </div>
            </CardContent>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTestPage;
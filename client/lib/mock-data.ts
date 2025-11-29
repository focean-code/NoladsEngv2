import type { Service, Product, CompanyStats } from "@shared/api";

export const mockServices: Service[] = [
  {
    id: 1,
    name: "Power Systems Design",
    description: "End‑to‑end LV/MV design, load studies, and protection coordination.",
    short_description: "LV/MV design and studies",
    price_range: "Project‑based",
    category: "engineering",
    image_url: "/placeholder.svg",
    features: JSON.stringify(["Load studies", "Short‑circuit analysis", "Protection settings"]),
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Industrial Automation",
    description: "PLC, SCADA, and VFD integration with safety PLCs.",
    short_description: "PLC/SCADA/VFD",
    price_range: "Project‑based",
    category: "automation",
    image_url: "/placeholder.svg",
    features: JSON.stringify(["PLC programming", "HMI/SCADA", "Drives & motion"]),
    is_active: true,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockProducts: Product[] = [
  {
    id: 101,
    name: "Automatic Transfer Switch (ATS) 400A",
    description: "UL‑listed ATS with controller, ideal for hospitals and data rooms.",
    price: 2200,
    category: "power",
    image_url: "/placeholder.svg",
    images: ["/placeholder.svg"],
    specifications: JSON.stringify({ voltage: "415V", rating: "400A" }),
    stock_quantity: 8,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 102,
    name: "Motor Protection Circuit Breaker (MPCB)",
    description: "Adjustable thermal and magnetic trip with IP20 terminals.",
    price: 85,
    category: "controls",
    image_url: "/placeholder.svg",
    images: ["/placeholder.svg"],
    specifications: JSON.stringify({ rating: "0.63–1A", curve: "D" }),
    stock_quantity: 120,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockCompanyStats: CompanyStats = {
  established: 2010,
  incorporated: 2015,
  citiesCovered: "30+",
  workforce: "500+",
  clientBase: "100+",
  completedProjects: "1000+",
};

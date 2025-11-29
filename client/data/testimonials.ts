export type TestimonialItem = {
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number; // 1-5
  avatar?: string;
};

export const testimonials: TestimonialItem[] = [
  {
    name: "Grace Wanjiku",
    title: "Operations Manager",
    company: "Mombasa Steel Works",
    content:
      "Nolads Engineering modernized our plant power distribution with zero downtime. Their safety-first approach and documentation were world‑class.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=256&auto=format&fit=crop",
  },
  {
    name: "Samuel Otieno",
    title: "Head of Automation",
    company: "Coastal Foods Ltd",
    content:
      "Their PLC and SCADA integration cut our line stoppages by 32%. Support is responsive and deeply knowledgeable.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
  },
  {
    name: "Amina Yusuf",
    title: "Project Director",
    company: "KenPower EPC",
    content:
      "From design to commissioning, the team delivered ahead of schedule and passed all compliance audits on first inspection.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=256&auto=format&fit=crop",
  },
  {
    name: "Peter Mwangi",
    title: "Facilities Lead",
    company: "Ocean View Hospitals",
    content:
      "Generator sizing and ATS setup were flawless. We now have seamless power continuity for critical equipment.",
    rating: 4,
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=crop",
  },
  {
    name: "Lucy Njeri",
    title: "Maintenance Supervisor",
    company: "Harbor Logistics",
    content:
      "Great partners for preventive maintenance. The predictive monitoring dashboard has already prevented two incidents.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=256&auto=format&fit=crop",
  },
];

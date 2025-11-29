import React, { useState } from "react";
import { useSEO } from "../hooks/useSEO";
import { api } from "../lib/api";
import { Analytics } from "../lib/analytics";
import { useNotify } from "../components/NotificationSystem";
import { contactFormSchema, useFormValidation } from "../lib/validation";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  MessageCircle,
  CheckCircle,
  Building,
  Users,
  Headphones,
  Globe,
  Briefcase,
  FileText,
  Star,
} from "lucide-react";
import { QuoteRequestModal } from "../components/QuoteRequestModal";
import { Link } from "react-router-dom";
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
import { ModernInput, ModernTextarea } from "../components/ui/modern-input";
import { companyInfo } from "../src/companyData";

const ContactPage = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  
  useSEO({
    title: `Contact ${companyInfo.name} - Get Expert Electrical Engineering Support`,
    description: `Contact our electrical engineering experts for power systems, industrial automation, and safety solutions. Get professional consultation and project quotes.`,
    keywords: 'contact electrical engineer, power systems consultation, industrial automation support, electrical engineering quotes',
    canonical: typeof window !== 'undefined' ? `${window.location.origin}/contact` : undefined,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "mainEntity": {
        "@type": "Organization",
        "name": companyInfo.name,
        "url": typeof window !== 'undefined' ? window.location.origin : undefined,
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": companyInfo.offices[0]?.phone[0],
            "contactType": "customer service",
            "email": companyInfo.offices[0]?.email
          }
        ]
      }
    }
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    inquiryType: "general",
    project: "",
    timeline: "",
    budget: "",
    message: "",
    newsletter: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewData, setReviewData] = useState({
    name: "",
    email: "",
    content: "",
    serviceUsed: "",
    location: "",
    wouldRecommend: true,
    projectCompleted: ""
  });
  
  const { validate } = useFormValidation(contactFormSchema);
  const trackFormSubmission = (...args: any[]) => {
    // No-op or implement tracking logic here if needed
  };
  const notify = useNotify();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      notify.error('Error', 'Please provide a rating');
      return;
    }
    
    try {
      await api.testimonials.create({
        name: reviewData.name,
        content: reviewData.content,
        rating: rating,
        company: reviewData.location, // Using location as company
        position: reviewData.serviceUsed, // Using serviceUsed as position
        is_featured: false,
        is_active: false // Will be activated after review
      });
      
      notify.success('Thank you!', 'Your review has been submitted successfully and will be reviewed shortly.');
      setIsReviewOpen(false);
      setReviewData({
        name: "",
        email: "",
        content: "",
        serviceUsed: "",
        location: "",
        wouldRecommend: true,
        projectCompleted: ""
      });
      setRating(0);
    } catch (error) {
      notify.error('Error', 'Failed to submit your review. Please try again.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validation = validate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      notify.error('Form Error', 'Please fix the errors below and try again.');
      trackFormSubmission('contact_form', false);
      return;
    }
    
    setErrors({});
    
    try {
      const response = await api.contact.create({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        subject: formData.inquiryType,
        message: `Company: ${formData.company}\nPosition: ${formData.position}\nProject: ${formData.project}\n\nMessage: ${formData.message}`,
        status: 'unread'
      });

      if (response.success) {
        setSubmitted(true);
        notify.success('Message Sent!', 'Thank you for contacting us. We\'ll get back to you soon.');
        trackFormSubmission('contact_form', true);
        trackFormSubmission('contact_form', true);
        // If Analytics.trackEngagement is needed, implement or import it properly.
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        inquiryType: "general",
        project: "",
        timeline: "",
        budget: "",
        message: "",
        newsletter: false,
      });
      
    } catch (error) {
      notify.error('Submission Failed', 'There was an error sending your message. Please try again.');
      trackFormSubmission('contact_form', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfoCards = [
    {
      icon: Phone,
      title: "Main Office - Mombasa",
      primary: companyInfo.offices[0].phone[0],
      secondary: companyInfo.offices[0].phone[1],
      description: `${companyInfo.offices[0].address}\nEmail: ${companyInfo.offices[0].email}`,
    },
    {
      icon: MapPin,
      title: "Nairobi Office",
      primary: companyInfo.offices[2].address,
      secondary: companyInfo.offices[2].phone.join(" / "),
      description: companyInfo.offices[2].email,
    },
    {
      icon: Building,
      title: "GenParts Center",
      primary: companyInfo.offices[1].address,
      secondary: companyInfo.offices[1].phone.join(" / "),
      description: `Email: ${companyInfo.offices[1].email}`,
    },
  ];

  const inquiryTypes = [
    {
      id: "general",
      title: "General Inquiry",
      icon: MessageCircle,
      description: "General questions about our services",
    },
    {
      id: "project",
      title: "Project Consultation",
      icon: Building,
      description: "Discuss a specific project or requirement",
    },
    {
      id: "quote",
      title: "Request Quote",
      icon: FileText,
      description: "Get pricing for products or services",
    },
    {
      id: "support",
      title: "Technical Support",
      icon: Headphones,
      description: "Help with existing products or systems",
    },
    {
      id: "partnership",
      title: "Partnership",
      icon: Users,
      description: "Explore partnership opportunities",
    },
    {
      id: "career",
      title: "Career",
      icon: Briefcase,
      description: "Join our team of experts",
    },
  ];

  const offices = companyInfo.offices.map(office => ({
    name: office.name,
    address: `${office.address}${office.poBox ? `, ${office.poBox}` : ''}`,
    phone: office.phone.join(' / '),
    email: office.email,
    hours: [
      "Monday - Friday: 8:00 AM - 5:00 PM",
      "Saturday : 8:00 AM - 1:00 PM"
    ],
    image: "/placeholder.svg",
  }));

  const faqs = [
    {
      question: "What industries do you serve?",
      answer: `We serve a wide range of industries including manufacturing, energy, healthcare, data centers, commercial buildings, and more. Our solutions are tailored to meet specific industry requirements and standards.`,
    },
    {
      question: "Do you provide emergency services?",
      answer: `Yes, we offer 24/7 emergency services for critical electrical issues. Our emergency response team can be reached at +254722 611 884 for urgent situations.`,
    },
    {
      question: "How long does a typical project take?",
      answer: `Project timelines vary depending on scope and complexity. Simple installations may take a few days, while complex automation projects can take several months. We provide detailed timelines during the consultation phase.`,
    },
    {
      question: "Do you offer maintenance contracts?",
      answer: `Yes, we offer comprehensive maintenance contracts to ensure your electrical systems operate at peak performance. Our maintenance programs include regular inspections, preventive maintenance, and priority support.`,
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <ModernNavBar />
        <section className="section flex items-center justify-center min-h-[80vh]">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
            <ModernCard variant="elevated" className="card-md">
                <CardContent className="py-16 px-8">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">
                    Thank You!
                  </h1>
                  <p className="text-xl text-slate-600 mb-8">
                    Your message has been sent successfully. We'll get back to
                    you within 24 hours.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                      <ModernButton variant="primary">
                        Back to Home
                        <ArrowRight className="w-4 h-4" />
                      </ModernButton>
                    </Link>
                    <ModernButton
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </ModernButton>
                  </div>
                </CardContent>
              </ModernCard>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <ModernNavBar />

      {/* Hero Section */}
      <section className="bg-white/80 pt-24" style={{ paddingBottom: "5px" }}>
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Contact Us
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Let's Start a<span className="text-blue-600"> Conversation</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Ready to discuss your next electrical engineering project? Our
              team of experts is here to help you find the perfect solution for
              your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Form */}
      <section
        className="bg-white/80 flex flex-col"
        style={{ padding: "5px 0 10px" }}
      >
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-slide-in-left">
            <ModernCard className="card-md">
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <ModernInput
                        label="First Name *"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        errorMessage={errors.firstName}
                        required
                      />
                      <ModernInput
                        label="Last Name *"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        errorMessage={errors.lastName}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ModernInput
                        type="email"
                        label="Email *"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        errorMessage={errors.email}
                        required
                      />
                      <ModernInput
                        type="tel"
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        errorMessage={errors.phone}
                      />
                    </div>

                    {/* Company Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <ModernInput
                        label="Company *"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Enter your company name"
                        errorMessage={errors.company}
                        required
                      />
                      <ModernInput
                        label="Position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="Your job title"
                        errorMessage={errors.position}
                      />
                    </div>

                    {/* Inquiry Type */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        Inquiry Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {inquiryTypes.map((type) => (
                          <label
                            key={type.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.inquiryType === type.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-black hover:border-gray-800"
                            }`}
                          >
                            <input
                              type="radio"
                              name="inquiryType"
                              value={type.id}
                              checked={formData.inquiryType === type.id}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <type.icon className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-sm">
                                {type.title}
                              </div>
                              <div className="text-xs text-gray-700">
                                {type.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <ModernTextarea
                      label="Message *"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your project requirements"
                      errorMessage={errors.message}
                      required
                    />

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                          Project Timeline
                        </label>
                        <select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-black bg-gradient-to-br from-white to-slate-50 px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-800"
                        >
                          <option value="">Select timeline</option>
                          <option value="immediate">
                            Immediate (1-2 weeks)
                          </option>
                          <option value="short">Short term (1-3 months)</option>
                          <option value="medium">
                            Medium term (3-6 months)
                          </option>
                          <option value="long">Long term (6+ months)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                          Budget Range
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-black bg-gradient-to-br from-white to-slate-50 px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-800"
                        >
                          <option value="">Select budget range</option>
                          <option value="under-10k">Under 10,000 KSH</option>
                          <option value="10k-50k">10,000 - 50,000 KSH</option>
                          <option value="50k-100k">50,000 - 100,000 KSH</option>
                          <option value="100k-500k">100,000 - 500,000 KSH</option>
                          <option value="over-500k">Over 500,000 KSH</option>
                        </select>
                      </div>
                    </div>

                    {errors.inquiryType && (
                      <p className="text-red-500 text-sm">{errors.inquiryType}</p>
                    )}

                    <ModernButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full disabled:opacity-60"
                    >
                      <Send className="w-5 h-5" />
                      {isSubmitting ? 'Sending…' : 'Send Message'}
                    </ModernButton>
                  </form>
                </CardContent>
              </ModernCard>
            </div>

            {/* Contact Info and Quick Actions */}
            <div className="animate-slide-in-right space-y-8">
              {/* Contact Info Cards */}
              <div className="space-y-4">
                {contactInfoCards.map((info, index) => (
                  <ModernCard key={index} className="h-full card-md">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {info.title}
                          </h3>
                          <p className="text-slate-900 font-medium mb-1">
                            {info.primary}
                          </p>
                          <p className="text-slate-600 mb-2">
                            {info.secondary}
                          </p>
                          <p className="text-slate-500 text-sm">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </ModernCard>
                ))}
              </div>
              <div>
                <div className="space-y-4">
                  <Link to="/blog" />

                  <a href={`tel:${companyInfo.contactPersons.general.phone[0]}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container max-w-3xl mx-auto">
          <h3
            className="text-2xl font-semibold text-slate-900 mb-6 text-center"
            style={{ paddingTop: "50px", margin: "0 auto 24px" }}
          >
            Frequently Asked Questions
          </h3>
          <ModernCard className="card-md">
            {faqs.map((faq, index) => (
              <CardContent key={index} className="p-6">
                <h4 className="font-semibold text-slate-900 mb-2">
                  {faq.question}
                </h4>
                <p className="text-slate-600 text-sm">
                  {faq.answer}
                </p>
              </CardContent>
            ))}
          </ModernCard>
        </div>
      </section>

      {/* Office Locations */}
      <section style={{ padding: "10px 0" }}>
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Our Locations
            </div>
            <h2 className="type-h2 font-bold text-slate-900 mb-6">
              Visit Our
              <span className="text-blue-600"> Offices</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              With offices across multiple locations, we're always close to our
              clients. Visit us for in-person consultations and facility tours.
            </p>
          </div>

          <CardGrid cols={3} gap="lg">
            {offices.map((office, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ModernCard className="h-full overflow-hidden card-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      {office.name}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 text-sm">
                          {office.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 text-sm">
                          {office.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 text-sm">
                          {office.email}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="text-slate-600 text-sm">
                          {Array.isArray(office.hours)
                            ? office.hours.map((h, i) => (<p key={i}>{h}</p>))
                            : office.hours}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </ModernCard>
              </div>
            ))}
          </CardGrid>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-slate-50 py-12">
        <div className="container max-w-lg mx-auto text-center">
          <ModernCard className="relative card-md">
            <CardContent className="p-8">
              {!isReviewOpen ? (
                <>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                    Your Feedback Matters!
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Help us improve our services by sharing your experience with Nolads Engineering.
                  </p>
                  <ModernButton
                    variant="primary"
                    size="lg"
                    onClick={() => setIsReviewOpen(true)}
                    className="w-full md:w-auto"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Leave a Review
                  </ModernButton>
                </>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                    Share Your Experience
                  </h3>
                  <div className="space-y-6">
                    <div className="text-center">
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Rate Your Overall Experience
                      </label>
                      <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1 rounded-full transition-colors hover:scale-110 ${
                              rating >= star ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            <Star className="w-8 h-8 fill-current" />
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">
                        {rating === 5 ? "Excellent!" :
                         rating === 4 ? "Very Good" :
                         rating === 3 ? "Good" :
                         rating === 2 ? "Fair" :
                         rating === 1 ? "Poor" : "Click to rate"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ModernInput
                        label="Full Name"
                        name="reviewerName"
                        value={reviewData.name}
                        onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                      <ModernInput
                        label="Email Address"
                        type="email"
                        name="reviewerEmail"
                        value={reviewData.email}
                        onChange={(e) => setReviewData({ ...reviewData, email: e.target.value })}
                        placeholder="Your email"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Service Used
                        </label>
                        <select
                          name="serviceUsed"
                          value={reviewData.serviceUsed}
                          onChange={(e) => setReviewData({ ...reviewData, serviceUsed: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Select a service</option>
                          <option value="electrical">Electrical Installation</option>
                          <option value="construction">Building Construction</option>
                          <option value="genparts">GenParts Service</option>
                          <option value="other">Other Services</option>
                        </select>
                      </div>
                      
                      <ModernInput
                        label="Project Location"
                        name="location"
                        value={reviewData.location}
                        onChange={(e) => setReviewData({ ...reviewData, location: e.target.value })}
                        placeholder="e.g., Mombasa, Nairobi"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Project Completed
                        </label>
                        <select
                          name="projectCompleted"
                          value={reviewData.projectCompleted}
                          onChange={(e) => setReviewData({ ...reviewData, projectCompleted: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">When was it completed?</option>
                          <option value="last-week">Within last week</option>
                          <option value="last-month">Within last month</option>
                          <option value="last-3-months">Within last 3 months</option>
                          <option value="last-6-months">Within last 6 months</option>
                          <option value="last-year">Within last year</option>
                          <option value="over-year">Over a year ago</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Would You Recommend Us?
                        </label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="wouldRecommend"
                              checked={reviewData.wouldRecommend}
                              onChange={() => setReviewData({ ...reviewData, wouldRecommend: true })}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-900">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="wouldRecommend"
                              checked={!reviewData.wouldRecommend}
                              onChange={() => setReviewData({ ...reviewData, wouldRecommend: false })}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-900">No</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Your Review
                      </label>
                      <textarea
                        name="reviewContent"
                        value={reviewData.content}
                        onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                        placeholder="Share your experience with our service. What went well? What could we improve?"
                        className="w-full h-32 px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-4 border-t border-slate-200">
                    <ModernButton
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsReviewOpen(false);
                        setReviewData({
                          name: "",
                          email: "",
                          content: "",
                          serviceUsed: "",
                          location: "",
                          wouldRecommend: true,
                          projectCompleted: ""
                        });
                        setRating(0);
                      }}
                    >
                      Cancel
                    </ModernButton>
                    <ModernButton 
                      type="submit" 
                      variant="primary"
                      disabled={!rating || !reviewData.content.trim()}
                    >
                      Submit Review
                    </ModernButton>
                  </div>
                </form>
              )}
            </CardContent>
          </ModernCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600" style={{ padding: "30px 0" }}>
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="type-h2 font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Don't wait – reach out today and let's discuss how we can help you
              achieve your electrical engineering goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${companyInfo.contactPersons.general.phone[0]}`}>
                <ModernButton
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </ModernButton>
              </a>
              <ModernButton
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Get Quote
                <ArrowRight className="w-5 h-5" />
              </ModernButton>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Request Modal */}
            <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        items={[]} // Empty since this is a general quote request
        type="service"
        onSubmit={async (data) => {
          try {
            await api.quotes.create({
              project_name: data.project_name,
              description: data.description,
              requirements: data.requirements,
              budget_range: data.budget_range,
              timeline: data.timeline,
              status: 'pending',
              notes: data.notes
            });
            notify.success('Quote Request Sent', 'We will get back to you shortly with a detailed quote.');
          } catch (error) {
            notify.error('Error', 'Failed to submit quote request. Please try again.');
            throw error;
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container py-16">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo/logo1.png"
                    alt={`${companyInfo.name} Logo`}
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
              <h4 className="font-semibold text-lg mb-6">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{companyInfo.offices[0].phone.join(' / ')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">
                    {companyInfo.offices[0].email}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span className="text-slate-300">
                    {companyInfo.offices[0].address}
                    <br />
                    {companyInfo.offices[0].poBox}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "Services", href: "/services" },
                  { name: "Products", href: "/products" },
                  { name: "About", href: "/about" },
                  { name: "Blog", href: "/blog" },
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
              © {new Date().getFullYear()} {companyInfo.name}. All rights
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

export default ContactPage;

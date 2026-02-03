"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Address",
      details: ["Narmada Stadium", "Valley Road, Narmada", "India - 462001"],
    },
    {
      icon: "📞",
      title: "Phone",
      details: ["+91 123 456 7890", "+91 098 765 4321"],
    },
    {
      icon: "✉️",
      title: "Email",
      details: ["info@nvfc.com", "tickets@nvfc.com", "media@nvfc.com"],
    },
    {
      icon: "🕐",
      title: "Office Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 4:00 PM", "Sunday: Closed"],
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-200">
              Get in touch with Narmada Valley Football Club
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Send us a Message</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Your Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      disabled={isSubmitting}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Input
                    label="Subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                    disabled={isSubmitting}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nvfc-primary focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Tell us more about your inquiry..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{info.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-nvfc-dark mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Find Us</h2>
            <div className="aspect-video bg-gradient-to-br from-nvfc-primary to-nvfc-accent rounded-lg flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-xl font-semibold">Narmada Stadium</p>
                <p className="text-gray-200">Interactive map would be embedded here</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "How can I purchase tickets?",
                a: "Visit our Tickets page or contact our ticket office directly.",
              },
              {
                q: "Where can I buy official merchandise?",
                a: "Shop online at our Official Store or visit the stadium shop on match days.",
              },
              {
                q: "How do I become a member?",
                a: "Check out our Membership page for different plans and benefits.",
              },
              {
                q: "Can I tour the stadium?",
                a: "Yes! Stadium tours are available on non-match days. Contact us to book.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-bold text-nvfc-dark mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

export default function AboutPage() {
  const milestones = [
    { year: "2020", event: "Club Founded", description: "NVFC was established with a vision to become a leading football club" },
    { year: "2021", event: "First Season", description: "Competed in the regional league and finished 3rd" },
    { year: "2022", event: "League Champions", description: "Won our first league title in dramatic fashion" },
    { year: "2023", event: "Stadium Expansion", description: "Narmada Stadium capacity increased to 25,000" },
    { year: "2024", event: "Youth Academy Launch", description: "Opened state-of-the-art youth development facility" },
    { year: "2026", event: "European Ambitions", description: "Competing for continental qualification" },
  ];

  const values = [
    { icon: "⚽", title: "Excellence", description: "Striving for the highest standards on and off the pitch" },
    { icon: "🤝", title: "Community", description: "Building strong connections with our fans and local area" },
    { icon: "💪", title: "Integrity", description: "Playing with honesty, respect, and fair play" },
    { icon: "🌟", title: "Development", description: "Nurturing talent and helping players reach their potential" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hero-pattern text-white py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About NVFC</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              More than just a football club - we&apos;re a family, a community, and a symbol of pride for the Narmada Valley
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Story */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-nvfc-dark mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Founded in 2020, Narmada Valley Football Club emerged from a dream to bring top-tier football to the heart of the Narmada Valley. What started as a vision shared by a group of passionate football enthusiasts has grown into one of the region&apos;s most beloved sporting institutions.
              </p>
              <p>
                Our journey has been marked by determination, community support, and an unwavering commitment to excellence. From our humble beginnings in the regional leagues to competing at the highest levels, every step has been taken with our fans by our side.
              </p>
              <p>
                Today, NVFC stands as a beacon of sporting achievement and community pride. We&apos;re not just building a football club; we&apos;re creating a legacy that will inspire generations to come.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-nvfc-dark mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 text-center h-full">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-nvfc-dark mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-nvfc-dark mb-12 text-center">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 pb-12 border-l-2 border-nvfc-primary last:pb-0"
              >
                <div className="absolute -left-3 top-0 w-6 h-6 bg-nvfc-secondary rounded-full border-4 border-white" />
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-nvfc-primary text-white text-sm font-bold rounded-full">
                    {milestone.year}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-nvfc-dark mb-2">{milestone.event}</h3>
                <p className="text-gray-600">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-nvfc-dark mb-12 text-center">Management Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "John Smith", role: "Manager", bio: "Former professional player with 15 years of coaching experience" },
              { name: "Sarah Johnson", role: "Director of Football", bio: "Expert in player recruitment and development" },
              { name: "Michael Brown", role: "CEO", bio: "Business leader with a passion for football and community" },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-nvfc-primary to-nvfc-accent rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
                    👤
                  </div>
                  <h3 className="text-xl font-bold text-nvfc-dark mb-1">{member.name}</h3>
                  <p className="text-nvfc-primary font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { getTimeRemaining } from "@/lib/utils";

import { getAllNews, NewsArticle } from "@/lib/news";

export default function Home() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);

  // Fetch Latest News
  useEffect(() => {
    async function fetchNews() {
      const data = await getAllNews();
      const published = data.filter(item => item.isPublished).slice(0, 3);
      setLatestNews(published);
    }
    fetchNews();
  }, []);

  // Next match countdown (example: 7 days from now)
  useEffect(() => {
    const nextMatchDate = new Date();
    nextMatchDate.setDate(nextMatchDate.getDate() + 7);

    const interval = setInterval(() => {
      setCountdown(getTimeRemaining(nextMatchDate));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Standings Data
  const standings = [    { 
      position: 1, 
      team: "Leaders FC", 
      played: 20, 
      points: 48,
      logo: "⚡"
    },
    { 
      position: 2, 
      team: "NVFC", 
      played: 20, 
      points: 45,
      logo: "/logo.png"
    },
    { 
      position: 3, 
      team: "Champions United", 
      played: 20, 
      points: 42,
      logo: "🏆"
    },
    { 
      position: 4, 
      team: "City FC", 
      played: 20, 
      points: 38,
      logo: "🌟"
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <AnimatedHero
        title="Narmada Valley Football Club"
        subtitle="Experience the passion, pride, and glory of NVFC. Join us on our journey to greatness."
      >
        <Link href="/tickets" className="hero-cta">
          <Button variant="secondary" size="lg">
            Get Tickets
          </Button>
        </Link>
        <Link href="/membership" className="hero-cta">
          <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-nvfc-dark">
            Become a Member
          </Button>
        </Link>
      </AnimatedHero>

      {/* Next Match Countdown */}
      <section className="section-padding bg-nvfc-primary text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Next Match</h2>
            <p className="text-xl mb-8 text-nvfc-secondary">NVFC vs Rivals FC</p>
            
            <div className="flex justify-center gap-4 md:gap-8 mb-8">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Minutes", value: countdown.minutes },
                { label: "Seconds", value: countdown.seconds },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px]">
                    <div className="text-3xl md:text-5xl font-bold text-nvfc-secondary">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-sm md:text-base text-gray-300 mt-2">
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/tickets">
              <Button variant="secondary" size="lg">
                Book Your Tickets Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Latest News */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-nvfc-dark">Latest News</h2>
            <Link href="/news">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news) => (
              <Card key={news.id} hover className="overflow-hidden h-full flex flex-col">
                <div className="aspect-video bg-gradient-to-br from-nvfc-primary to-nvfc-accent flex items-center justify-center text-white text-4xl overflow-hidden relative">
                   {news.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={news.image} 
                            alt={news.title} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    ) : (
                        <span>📰</span>
                    )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-sm text-gray-500 mb-2">{news.date}</p>
                  <h3 className="text-xl font-bold mb-3 text-nvfc-dark line-clamp-2">{news.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{news.excerpt}</p>
                  <Link href={`/news/${news.slug || news.id}`}>
                    <Button variant="ghost" size="sm">
                      Read More →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* League Standings */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-nvfc-dark">League Standings</h2>
            <Link href="/fixtures">
              <Button variant="ghost">Full Table</Button>
            </Link>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-nvfc-primary text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Pos</th>
                    <th className="px-6 py-4 text-left">Team</th>
                    <th className="px-6 py-4 text-center">Played</th>
                    <th className="px-6 py-4 text-center">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team) => (
                    <motion.tr
                      key={team.position}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: team.position * 0.1 }}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        team.team === "NVFC" ? "bg-nvfc-secondary/10 font-bold" : ""
                      }`}
                    >
                      <td className="px-6 py-4">{team.position}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {team.logo.startsWith('/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={team.logo} 
                              alt={`${team.team} logo`} 
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-2xl">{team.logo}</span>
                          )}
                          <span>{team.team}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">{team.played}</td>
                      <td className="px-6 py-4 text-center font-bold">{team.points}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-hero-pattern text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Join the NVFC Family
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-200">
              Become a member today and enjoy exclusive benefits, priority ticket access, and much more.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/membership">
                <Button variant="secondary" size="lg">
                  Membership Plans
                </Button>
              </Link>
              <Link href="/store">
                <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-nvfc-dark">
                  Official Store
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

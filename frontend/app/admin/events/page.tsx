"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getActiveEvent, createEvent } from "@/lib/layouts";
import type { EventConfig } from "@/types/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";

export default function EventsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeEvent, setActiveEvent] = useState<EventConfig | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadActiveEvent();
    }
  }, [isAdmin]);

  async function loadActiveEvent() {
    setLoading(true);
    const event = await getActiveEvent();
    setActiveEvent(event);
    setLoading(false);
  }

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    const now = new Date();
    if (startDate < now) {
      alert("Start date must be in the future.");
      return;
    }
    if (endDate <= startDate) {
      alert("End date must be after start date.");
      return;
    }

    const result = await createEvent({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      active: true,
      createdBy: user.uid,
    });

    if (result.success) {
      alert("Event created successfully!");
      setShowCreateForm(false);
      loadActiveEvent();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Event Management</h1>
              <p className="text-gray-600">Create and manage special events with custom layouts</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "Cancel" : "Create Event"}
            </Button>
          </div>
        </motion.div>

        {/* Create Event Form */}
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-nvfc-dark mb-4">Create New Event</h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <Input label="Event Name" name="name" required placeholder="e.g., Navratri 2026" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nvfc-primary"
                    rows={3}
                    placeholder="Event description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    name="startDate"
                    type="datetime-local"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <Input
                    label="End Date"
                    name="endDate"
                    type="datetime-local"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Create Event
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Active Event */}
        {activeEvent ? (
          <Card className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-3">
                  Active Event
                </div>
                <h2 className="text-3xl font-bold text-nvfc-dark mb-2">{activeEvent.name}</h2>
                <p className="text-gray-600">{activeEvent.description}</p>
              </div>
              <div className="text-5xl">🎉</div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Start Date</div>
                <div className="font-semibold">{activeEvent.startDate.toDate().toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">End Date</div>
                <div className="font-semibold">{activeEvent.endDate.toDate().toLocaleString()}</div>
              </div>
            </div>

            {activeEvent.layoutId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700 font-semibold mb-1">Associated Layout</div>
                <div className="text-blue-900">{activeEvent.layoutId}</div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Events</h3>
            <p className="text-gray-600 mb-6">Create an event to enable event-based layouts</p>
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              Create Your First Event
            </Button>
          </Card>
        )}

        {/* Event Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🎨", title: "Custom Layouts", desc: "Assign special layouts to events" },
            { icon: "⏰", title: "Auto-Activation", desc: "Layouts activate based on dates" },
            { icon: "🔄", title: "Auto-Rollback", desc: "Returns to default after event" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="font-bold mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

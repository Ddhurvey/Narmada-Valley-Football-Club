"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface UnderConstructionProps {
  title: string;
  description: string;
  icon?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export default function UnderConstruction({
  title,
  description,
  icon = "🚧",
  primaryActionLabel = "Contact Us",
  primaryActionHref = "/contact",
  secondaryActionLabel = "Back to Admin",
  secondaryActionHref = "/admin",
}: UnderConstructionProps) {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-nvfc-primary/10 flex items-center justify-center text-4xl">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-nvfc-dark mb-2">{title}</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href={primaryActionHref}>
          <Button variant="primary">{primaryActionLabel}</Button>
        </a>
        <a href={secondaryActionHref}>
          <Button variant="ghost">{secondaryActionLabel}</Button>
        </a>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        We’re actively building this module. You’ll see updates here soon.
      </div>
    </Card>
  );
}

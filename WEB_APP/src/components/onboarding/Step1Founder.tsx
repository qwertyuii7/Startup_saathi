"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Briefcase, ArrowRight } from "lucide-react";

interface Step1FounderProps {
  initialData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  onNext: (data: { name: string; email: string; phone: string; role: string }) => void;
  isSaving?: boolean;
}

export function Step1Founder({ initialData, onNext, isSaving }: Step1FounderProps) {
  const [name, setName] = useState(initialData.name || "");
  const [email] = useState(initialData.email || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [role, setRole] = useState(initialData.role || "Founder");
  const [error, setError] = useState("");

  const roles = ["Founder", "Co-Founder", "CEO", "CTO", "Other"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setError("");
    onNext({ name: name.trim(), email, phone: phone.trim(), role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Let's get to know you
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Tell us who is leading this venture to configure your founder dossier.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name as per official records"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Email address (from sign-in)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              readOnly
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>
        </div>

        {/* Founder Role */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            Your Role in the Startup
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  role === r
                    ? "border-violet-600 bg-violet-50 text-violet-700 shadow-2xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Action */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-xs transition-all disabled:opacity-50"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

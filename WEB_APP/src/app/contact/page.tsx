"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  Phone,
} from "lucide-react";
import CardNav from "@/components/landing/CardNav";
import Footer from "@/components/Footer";

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
};

const contactMeta = [
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@startupsaathi.in",
    sub: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Bengaluru, Karnataka",
    sub: "India HQ",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Mon–Fri, 10am–7pm IST",
    sub: "Async responses on weekends",
  },
];

type FormState = "idle" | "submitting" | "success" | "error";

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "general",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormState>("idle");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const subjects = [
    { value: "general", label: "General Enquiry" },
    { value: "demo", label: "Book a Demo" },
    { value: "incubator", label: "Incubator / Accelerator Partnership" },
    { value: "support", label: "Technical Support" },
    { value: "press", label: "Press & Media" },
  ];

  const validate = (fields = form): FormErrors => {
    const errs: FormErrors = {};
    if (!fields.name.trim()) errs.name = "Full name is required.";
    if (!fields.email.trim()) {
      errs.email = "Email is required.";
    } else if (!validateEmail(fields.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!fields.message.trim()) {
      errs.message = "Message cannot be empty.";
    } else if (fields.message.trim().length < 20) {
      errs.message = "Please write at least 20 characters.";
    }
    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) {
      setErrors(validate(next));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields to show all errors
    const allTouched = Object.fromEntries(
      Object.keys(form).map((k) => [k, true])
    );
    setTouched(allTouched);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("submitting");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data?.error?.message || "Submission failed. Please try again.");
      }
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setErrors({ message: e instanceof Error ? e.message : "Submission failed. Please try again." });
    }
  };

  const handleReset = () => {
    setForm({ name: "", email: "", company: "", subject: "general", message: "" });
    setErrors({});
    setTouched({});
    setStatus("idle");
  };

  const fieldClass = (field: keyof FormErrors) =>
    `w-full px-4 py-3 bg-white border rounded-xl text-sm outline-none transition-all duration-150 ${
      touched[field] && errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/15"
        : "border-neutral-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
    }`;

  return (
    <div className="bg-white min-h-screen text-neutral-900 font-default selection:bg-violet-200">
      <CardNav
        baseColor="#0A0A0A"
        menuColor="#fff"
        buttonBgColor="#fff"
        buttonTextColor="#000"
        items={[
          {
            label: "Product",
            bgColor: "#1B1722",
            textColor: "#fff",
            links: [
              { label: "Scheme Discovery", href: "/dashboard" },
              { label: "Eligibility Simulator", href: "/simulator" },
            ],
          },
          {
            label: "Solutions",
            bgColor: "#2F293A",
            textColor: "#fff",
            links: [
              { label: "For Startups", href: "/startups" },
              { label: "For Incubators", href: "/incubators" },
            ],
          },
          {
            label: "Resources",
            bgColor: "#1B1722",
            textColor: "#fff",
            links: [
              { label: "Policy Updates", href: "/updates" },
              { label: "Contact Us", href: "/contact" },
            ],
          },
        ]}
      />

      {/* Hero */}
      <section className="relative bg-[#0A0A0A] pt-36 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6"
          >
            <MessageSquare className="w-4 h-4" />
            Get in touch
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white mb-4"
          >
            Contact Us
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-lg text-neutral-400 max-w-xl mx-auto"
          >
            Questions, partnerships, demos, or just a hello — we'd love to hear from
            you.
          </motion.p>
        </div>
      </section>

      {/* Contact meta + Form */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: meta */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-display font-medium text-neutral-900 mb-2">
                  We're here to help
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Whether you're a startup, incubator, or policy researcher — reach
                  out and we'll get back to you within one business day.
                </p>
              </motion.div>

              {contactMeta.map((meta, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i * 0.5}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <meta.icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-0.5">
                      {meta.label}
                    </p>
                    <p className="font-medium text-neutral-900 text-sm">{meta.value}</p>
                    <p className="text-xs text-neutral-400">{meta.sub}</p>
                  </div>
                </motion.div>
              ))}

              {/* Team Codeblitz */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={1.5}
                className="bg-white border border-neutral-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-display font-bold">
                    SS
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">Team IceCube</p>
                    <p className="text-xs text-neutral-400">Codeblitz 2.0</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Startup Saathi was built during Codeblitz 2.0 to help Indian
                  startups navigate the maze of government schemes.
                </p>
              </motion.div>
            </div>

            {/* Right: form */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={0.5}
              className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm"
            >
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-display font-medium text-neutral-900 mb-2">
                      Message sent!
                    </h3>
                    <p className="text-neutral-500 mb-8 max-w-sm">
                      Thanks for reaching out. We'll get back to you within one
                      business day.
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-medium text-sm transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : status === "error" ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-display font-medium text-neutral-900 mb-2">
                      Something went wrong
                    </h3>
                    <p className="text-neutral-500 mb-8 max-w-sm">
                      We couldn't send your message. Please try again or email us
                      directly at hello@startupsaathi.in
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                      Try again
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    noValidate
                    aria-label="Contact form"
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5"
                        >
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="contact-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            value={form.name}
                            onChange={handleChange}
                            onBlur={() => handleBlur("name")}
                            placeholder="Your full name"
                            className={`${fieldClass("name")} pl-9`}
                            aria-required="true"
                            aria-invalid={touched.name && !!errors.name}
                            aria-describedby={errors.name ? "name-error" : undefined}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <p id="name-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5"
                        >
                          Work Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur("email")}
                            placeholder="you@startup.in"
                            className={`${fieldClass("email")} pl-9`}
                            aria-required="true"
                            aria-invalid={touched.email && !!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                          />
                        </div>
                        {touched.email && errors.email && (
                          <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label
                        htmlFor="contact-company"
                        className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5"
                      >
                        Company / Startup
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="contact-company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          value={form.company}
                          onChange={handleChange}
                          placeholder="TechNova AI Pvt Ltd"
                          className={`${fieldClass("company")} pl-9`}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5"
                      >
                        Subject
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 transition-all appearance-none cursor-pointer"
                      >
                        {subjects.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5"
                      >
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        onBlur={() => handleBlur("message")}
                        placeholder="Tell us about your startup and what you need help with..."
                        className={`${fieldClass("message")} resize-none`}
                        aria-required="true"
                        aria-invalid={touched.message && !!errors.message}
                        aria-describedby={errors.message ? "message-error" : "message-hint"}
                      />
                      {touched.message && errors.message ? (
                        <p id="message-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {errors.message}
                        </p>
                      ) : (
                        <p id="message-hint" className="mt-1.5 text-xs text-neutral-400">
                          {form.message.length}/20 minimum characters
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      id="contact-submit"
                      disabled={status === "submitting"}
                      className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white disabled:text-neutral-400 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-neutral-400">
                      By submitting, you agree to our{" "}
                      <a href="#" className="underline hover:text-neutral-600 transition-colors">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

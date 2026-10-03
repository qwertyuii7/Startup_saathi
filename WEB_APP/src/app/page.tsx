import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { Statement } from "@/components/landing/Statement";
import { MCPFeature } from "@/components/landing/MCPFeature";
import CardNav from "@/components/landing/CardNav";

export default function Home() {
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
              { label: "Eligibility Simulator", href: "/simulator" }
            ]
          },
          {
            label: "Solutions", 
            bgColor: "#2F293A",
            textColor: "#fff",
            links: [
              { label: "For Startups", href: "/startups" },
              { label: "For Incubators", href: "/incubators" }
            ]
          },
          {
            label: "Resources",
            bgColor: "#1B1722", 
            textColor: "#fff",
            links: [
              { label: "Policy Updates", href: "/updates" },
              { label: "Contact Us", href: "/contact" }
            ]
          }
        ]}
      />

      <main className="w-full">
        <Hero />
        
        {/* Logo Cloud section */}
        <div className="border-b border-neutral-200 bg-neutral-50 py-16 overflow-hidden flex flex-col items-center justify-center">
           <p className="text-sm font-medium text-neutral-500 mb-8 tracking-wide uppercase">Trusted by modern Indian startups</p>
           <div className="flex flex-wrap gap-12 sm:gap-20 items-center justify-center opacity-60 grayscale px-6">
              <span className="text-2xl font-bold font-display tracking-tight">Razorpay</span>
              <span className="text-2xl font-bold font-display tracking-tight">Zerodha</span>
              <span className="text-2xl font-bold font-display tracking-tight">CRED</span>
              <span className="text-2xl font-bold font-display tracking-tight">Groww</span>
              <span className="text-2xl font-bold font-display tracking-tight">Meesho</span>
           </div>
        </div>

        <ProblemSolution />
        <HowItWorks />
        <Statement />
        <Features />
        <MCPFeature />
        <CTA />
      </main>


    </div>
  );
}

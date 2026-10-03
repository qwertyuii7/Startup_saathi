import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

export function FormsSection({ section, data, tokens, onSave }: any) {
  const [formData, setFormData] = useState<any>(data || {});
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setFormData(data || {});
    setHasUnsavedChanges(false);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true);
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    setHasUnsavedChanges(false);
  };

  const Field = ({ label, name, type = "text", placeholder = "", options = [] }: any) => {
    if (type === "textarea") {
      return (
        <div className="mb-5">
          <label className={`block text-sm font-medium mb-1.5 ${tokens.textMuted}`}>{label}</label>
          <textarea 
            name={name} 
            value={formData[name] || ""} 
            onChange={handleChange} 
            placeholder={placeholder}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border ${tokens.border} bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500`} 
          />
        </div>
      );
    }
    if (type === "select") {
      return (
        <div className="mb-5">
          <label className={`block text-sm font-medium mb-1.5 ${tokens.textMuted}`}>{label}</label>
          <select 
            name={name} 
            value={formData[name] || ""} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 rounded-xl border ${tokens.border} bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 [&>option]:text-black`}
          >
            <option value="">Select option</option>
            {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    if (type === "checkbox") {
       return (
         <div className="mb-5 flex items-center gap-3">
           <input 
             type="checkbox" 
             name={name} 
             checked={!!formData[name]} 
             onChange={handleCheckbox}
             className="w-5 h-5 rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
           />
           <label className={`text-sm font-medium ${tokens.text}`}>{label}</label>
         </div>
       );
    }
    return (
      <div className="mb-5">
        <label className={`block text-sm font-medium mb-1.5 ${tokens.textMuted}`}>{label}</label>
        <input 
          type={type} 
          name={name} 
          value={formData[name] || ""} 
          onChange={handleChange} 
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border ${tokens.border} bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500`} 
        />
      </div>
    );
  };

  const getFormConfig = () => {
    switch (section) {
      case "founder": return {
        title: "Founder Information",
        desc: "Personal details to identify the business owner.",
        fields: [
          { name: "fullName", label: "Full Name" },
          { name: "email", label: "Email Address", type: "email" },
          { name: "phone", label: "Phone Number" },
          { name: "role", label: "Professional Role", placeholder: "e.g., Founder & CEO" },
          { name: "location", label: "Location", placeholder: "e.g., Bengaluru, KA" },
          { name: "linkedin", label: "LinkedIn URL", type: "url" },
          { name: "bio", label: "Short Bio", type: "textarea" },
        ]
      };
      case "startup": return {
        title: "Startup Identity",
        desc: "Core information about your startup.",
        fields: [
          { name: "startupName", label: "Startup Name" },
          { name: "industry", label: "Industry", type: "select", options: ["Technology", "Healthcare", "Agriculture", "Fintech", "Edtech", "Other"] },
          { name: "sector", label: "Sector", placeholder: "e.g., SaaS, D2C, DeepTech" },
          { name: "startupStage", label: "Current Stage", type: "select", options: ["Ideation", "Validation", "Early Traction", "Scaling"] },
          { name: "state", label: "State of Operation" },
          { name: "city", label: "City" },
          { name: "website", label: "Website", type: "url" },
          { name: "description", label: "Brief Description", type: "textarea" },
        ]
      };
      case "legal": return {
        title: "Legal & Registration",
        desc: "Government registration identifiers used for scheme eligibility.",
        fields: [
          { name: "entityType", label: "Legal Entity Type", type: "select", options: ["Private Limited", "LLP", "Partnership", "Sole Proprietorship"] },
          { name: "incorporationDate", label: "Incorporation Date", type: "date" },
          { name: "dpiitStatus", label: "DPIIT Recognized?", type: "checkbox" },
          { name: "dpiitNumber", label: "DPIIT Certificate Number", placeholder: "DIPP12345" },
          { name: "gstStatus", label: "GST Registered?", type: "checkbox" },
          { name: "gstNumber", label: "GST Number" },
          { name: "cinNumber", label: "CIN Number" },
        ]
      };
      case "business": return {
        title: "Business & Market",
        desc: "Information to match you with specialized schemes and incubators.",
        fields: [
          { name: "businessModel", label: "Business Model", type: "select", options: ["B2B", "B2C", "B2B2C", "D2C", "Marketplace"] },
          { name: "targetMarket", label: "Target Market" },
          { name: "problemStatement", label: "Problem you are solving", type: "textarea" },
          { name: "solutionStatement", label: "Your Solution", type: "textarea" },
        ]
      };
      case "financial": return {
        title: "Financials",
        desc: "Revenue and funding details for grant eligibility.",
        fields: [
          { name: "fundingStatus", label: "Funding Status", type: "select", options: ["Bootstrapped", "Angel", "Seed", "Series A", "Series B+"] },
          { name: "fundingAmount", label: "Funding Amount Raised (INR)", type: "number" },
          { name: "annualTurnover", label: "Annual Turnover / Revenue (INR)", type: "number" },
          { name: "employees", label: "Current Team Size", type: "number" },
          { name: "isWomenLed", label: "Is Women Led? (51%+ stake)", type: "checkbox" },
        ]
      };
      default: return { title: "Form", desc: "", fields: [] };
    }
  };

  const config = getFormConfig();

  return (
    <div className={`p-8 rounded-2xl border ${tokens.border} ${tokens.cardBg}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-medium tracking-tight mb-2">{config.title}</h1>
        <p className={tokens.textMuted}>{config.desc}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {config.fields.map((f: any) => (
            <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
              <Field {...f} />
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="text-sm">
            {hasUnsavedChanges ? (
               <span className="text-amber-500 flex items-center gap-2">You have unsaved changes.</span>
            ) : (
               <span className={tokens.textMuted}>All changes saved to AROVA Profile.</span>
            )}
          </div>
          <button 
            type="submit" 
            disabled={saving || !hasUnsavedChanges}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              hasUnsavedChanges 
                ? "bg-violet-600 text-white hover:bg-violet-700" 
                : `bg-neutral-500/20 ${tokens.textMuted} cursor-not-allowed`
            }`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

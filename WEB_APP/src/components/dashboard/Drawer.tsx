"use client";

import { useDrawer } from "./DrawerProvider";
import { X, FileText, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Drawer() {
  const { isOpen, drawerType, drawerProps, closeDrawer } = useDrawer();

  const renderContent = () => {
    switch (drawerType) {
      case "proof":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-neutral-900 mb-2">Evidence of Match</h3>
              <p className="text-neutral-500 text-sm">We determined your eligibility based on this specific clause.</p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl" />
              <p className="text-emerald-900 leading-relaxed text-sm">
                "An entity shall be considered as a Startup up to a period of <mark className="bg-emerald-200/50 text-emerald-900 font-bold px-1 rounded">ten years</mark> from the date of incorporation/registration, if it is incorporated as a private limited company..."
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 text-sm mb-0.5">DPIIT Gazette Notification</h4>
                  <p className="text-xs text-neutral-500">Page 4 • Section 1(a)</p>
                </div>
              </div>
              <button className="text-neutral-400 hover:text-violet-600 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      
      case "simulator":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-neutral-900 mb-2">Try Changes</h3>
              <p className="text-neutral-500 text-sm">See how changing your profile affects this scheme.</p>
            </div>
            {/* Mock simulator UI */}
            <div className="space-y-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Turnover (in Cr)</label>
                <input type="range" min="1" max="100" defaultValue="5" className="w-full accent-violet-600" />
                <div className="flex justify-between text-xs text-neutral-400 mt-2">
                  <span>1 Cr</span>
                  <span>100 Cr</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full md:w-[420px] h-full bg-white shadow-2xl border-l border-neutral-200 flex flex-col pt-safe mt-auto md:mt-0 max-h-[85vh] md:max-h-full rounded-t-3xl md:rounded-t-none"
          >
            {/* Mobile Drag Handle */}
            <div className="w-full h-6 flex md:hidden items-center justify-center shrink-0" onClick={closeDrawer}>
               <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            <div className="flex items-center justify-end px-4 py-3 md:pt-6 border-b border-neutral-100 shrink-0">
              <button 
                onClick={closeDrawer}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {renderContent()}
            </div>
            
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}

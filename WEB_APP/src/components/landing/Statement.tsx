"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, useInView } from "framer-motion";

const baseSchemes = [
  "Startup India Seed Fund", "MUDRA Yojana", "CGTMSE", "PMEGP", "Stand-Up India", "PLI Scheme",
  "DPIIT Recognition", "Atal Innovation Mission", "SAMRIDH Scheme", "Venture Capital Assistance",
  "TIDE 2.0", "NIDHI PRAYAS", "Biotech Ignition Grant", "Dairy Entrepreneurship",
  "Aatmanirbhar Bharat", "Women Entrepreneurship", "MSME RuPAY", "ZED Certification",
  "Credit Guarantee Scheme", "National Seed Fund", "Digital India Bhashini", "MeitY Startup Hub",
  "Startup Leadership Program", "Make in India", "Skill India", "Kisan Credit Card",
  "Pradhan Mantri Kaushal Vikas", "ASPIRE", "SFURTI", "Coir Udyami Yojana",
  "National SC-ST Hub", "PM SVANidhi", "Ajeevika", "Udyam Registration",
  "Design Clinic Scheme", "Lean Manufacturing Competitiveness", "Technology Upgradation Fund",
  "Ambedkar Social Innovation", "Gen-Next Support", "Startup India Action Plan",
  "NIDHI EIR", "NIDHI SSS", "TDB Seed Funding", "BIPP", "SBIRI", "PACE",
  "SMILE Scheme", "Dairy Processing Fund", "Fisheries Infrastructure", "Animal Husbandry",
  "Swachh Bharat Grants", "Start-up Village Entrepreneurship", "USTTAD", "Nai Manzil",
  "Nai Roshni", "Pradhan Mantri Mudra"
];

// Double the quantity!
const schemes = [...baseSchemes, ...baseSchemes];

export function Statement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [bodies, setBodies] = useState<{ id: number; text: string; x: number; y: number; angle: number }[]>([]);
  
  // Trigger physics when the section comes into view
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!sceneRef.current || !isInView) return;

    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Events = Matter.Events;

    const width = sceneRef.current.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1000);
    const height = sceneRef.current.clientHeight || 800;

    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const runner = Runner.create();
    Runner.run(runner, engine);

    // Create boundaries (walls and floor)
    const wallOptions = { isStatic: true, render: { visible: false } };
    World.add(world, [
      Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions), // Floor
      Bodies.rectangle(-25, height / 2, 50, height, wallOptions), // Left Wall
      Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions), // Right Wall
      Bodies.rectangle(width / 2, -500, width, 50, wallOptions) // Ceiling (high up)
    ]);

    // Create pill bodies
    const pillBodies = schemes.map((text) => {
      const pillWidth = Math.max(120, text.length * 10 + 30);
      const pillHeight = 44;
      
      const x = Math.random() * (width - 150) + 75;
      const y = -100 - (Math.random() * 1000); // Rain from high above

      return Bodies.rectangle(x, y, pillWidth, pillHeight, {
        chamfer: { radius: pillHeight / 2 },
        restitution: 0.7, // Bouncier!
        friction: 0.1,
        frictionAir: 0.01,
        label: text
      });
    });

    World.add(world, pillBodies);

    // Mouse Interaction that doesn't break scrolling!
    const mouse = Mouse.create(sceneRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    // CRITICAL: Remove the mousewheel event listeners so the user can still scroll the page!
    if (mouse.element) {
        const remove = (type: string, fn: any) => {
           mouse.element.removeEventListener(type, fn);
        };
        const anyMouse = mouse as any;
        remove("wheel", anyMouse.mousewheel);
        remove("mousewheel", anyMouse.mousewheel);
        remove("DOMMouseScroll", anyMouse.mousewheel);
        remove("touchmove", anyMouse.mousemove);
    }

    World.add(world, mouseConstraint);

    const updateReactState = () => {
      const activeBodies = pillBodies.map(body => ({
        id: body.id,
        text: body.label,
        x: body.position.x,
        y: body.position.y,
        angle: body.angle
      }));
      setBodies(activeBodies);
    };

    Events.on(engine, "afterUpdate", updateReactState);

    return () => {
      Runner.stop(runner);
      Engine.clear(engine);
      if (engineRef.current) {
         World.clear(engineRef.current.world, false);
      }
    };
  }, [isInView]);

  return (
    <div ref={containerRef} className="relative bg-neutral-50 overflow-hidden border-b border-neutral-200 min-h-screen flex items-center justify-center">
      
      {/* Physics Container (Absolute) */}
      <div ref={sceneRef} className="absolute inset-0 z-0 overflow-hidden">
        {bodies.map((body) => (
           <div
             key={body.id}
             className="absolute top-0 left-0 flex items-center justify-center px-4 h-11 bg-white text-neutral-500 font-medium text-sm rounded-full border border-neutral-200 shadow-sm whitespace-nowrap select-none hover:text-blue-600 hover:border-blue-300 transition-colors cursor-grab active:cursor-grabbing"
             style={{
               transform: `translate(${body.x}px, ${body.y}px) translate(-50%, -50%) rotate(${body.angle}rad)`,
               width: Math.max(120, body.text.length * 10 + 30),
             }}
           >
              {body.text}
           </div>
        ))}
      </div>

      {/* Text Content (Foreground, pointer-events-none so mouse passes through to physics!) */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900 font-display leading-[1.2] bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/50"
        >
          Over <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-orange-500">₹5,000 Crores</span> in government startup funding goes unclaimed every year because of complex bureaucracy. <br className="hidden md:block mt-2" />
          <span className="text-neutral-500 text-xl sm:text-2xl md:text-3xl">Startup Saathi changes that.</span>
        </motion.p>
      </div>
      
    </div>
  );
}

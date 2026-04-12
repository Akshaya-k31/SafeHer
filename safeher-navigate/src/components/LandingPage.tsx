import { motion } from "framer-motion";
import { Shield, MapPin, AlertTriangle, Radio, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Shield, title: "Safety-Scored Routes", desc: "Routes evaluated on crime risk, lighting, and police proximity." },
  { icon: MapPin, title: "Bus Stop Safety Ratings", desc: "Every bus stop rated for lighting, crowd density, and security." },
  { icon: AlertTriangle, title: "Community Safety Reports", desc: "Real reports from women help keep the safety map current." },
  { icon: Radio, title: "Real-Time Risk Alerts", desc: "Live safety heatmaps and alerts for high-risk zones." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

interface LandingPageProps {
  onNavigate: () => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 container mx-auto px-6 py-32 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm">
              🛡️ Women Safety Navigation
            </span>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-primary-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Safe<span className="text-accent">Her</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto mb-4 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            The Safest Way Home, Designed for Her.
          </motion.p>
          <motion.p
            className="text-lg text-primary-foreground/75 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Choose the safest way home using safety-aware route analysis.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Button
              size="lg"
              onClick={onNavigate}
              className="gradient-accent text-accent-foreground px-8 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Safe Navigation <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          How SafeHer Keeps You <span className="text-primary">Safe</span>
        </motion.h2>
        <motion.p className="text-center text-muted-foreground max-w-lg mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
          We evaluate environmental safety indicators so you can travel with confidence.
        </motion.p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card rounded-2xl p-6 hover:shadow-xl transition-shadow group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 2}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-secondary/50 py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <motion.h2 className="text-3xl font-bold mb-6 text-foreground" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            Why SafeHer?
          </motion.h2>
          <motion.p className="text-muted-foreground text-lg leading-relaxed" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            Traditional navigation systems optimize for speed and distance. SafeHer changes the equation by evaluating
            <strong className="text-foreground"> crime risk, lighting conditions, traffic density, police proximity, </strong>
            and <strong className="text-foreground">community reports</strong> to recommend routes that prioritize your safety. Because getting home safe matters more than getting home fast.
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="font-bold text-lg text-primary mb-1">Safe<span className="text-accent">Her</span></p>
          <p className="text-sm text-muted-foreground">Hackathon MVP · Women Safety Navigation Platform</p>
          <p className="text-xs text-muted-foreground mt-2">Built with 💜 for a safer tomorrow</p>
        </div>
      </footer>
    </div>
  );
}

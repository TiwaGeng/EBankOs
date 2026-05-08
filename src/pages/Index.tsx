import Hero from "@/components/proposal/Hero";
import Overview from "@/components/proposal/Overview";
import Modules from "@/components/proposal/Modules";
import Roles from "@/components/proposal/Roles";
import Features from "@/components/proposal/Features";
import Reports from "@/components/proposal/Reports";
import Security from "@/components/proposal/Security";
import Database from "@/components/proposal/Database";
import Future from "@/components/proposal/Future";
import Footer from "@/components/proposal/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Hero />
      <Overview />
      <Roles />
      <Modules />
      <Features />
      <Reports />
      <Security />
      <Database />
      <Future />
      <Footer />
    </main>
  );
};

export default Index;

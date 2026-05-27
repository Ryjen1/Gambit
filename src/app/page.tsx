import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { DemoChat } from "@/components/DemoChat";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <main className="grid-bg noise" style={{ minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <DemoChat />
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('mousemove', function(e) {
              var el = document.querySelector('.cursor-spotlight');
              if (el) {
                el.style.setProperty('--x', e.clientX + 'px');
                el.style.setProperty('--y', e.clientY + 'px');
              }
            });
          `,
        }}
      />
      <div className="cursor-spotlight" />
    </main>
  );
}

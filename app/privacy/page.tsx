import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for GolfSimMap - the indoor golf simulator directory.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-cream mb-4">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none text-muted">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-cream text-lg mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, including when you create an account, 
            submit a venue, or contact us. This may include your name, email address, and business information.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">2. How We Use Information</h2>
          <p className="mb-4">
            We use the information we collect to provide and improve our services, communicate with you, 
            and personalize your experience on GolfSimMap.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">3. Information Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share information with service providers 
            who assist us in operating our platform.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">4. Data Security</h2>
          <p className="mb-4">
            We implement reasonable security measures to protect your personal information. However, 
            no method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">5. Your Rights</h2>
          <p className="mb-4">
            You may access, update, or delete your account information at any time by contacting us 
            at hello@golfsimmap.com.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">6. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes 
            by posting the new policy on this page.
          </p>

          <h2 className="text-cream text-lg mt-8 mb-4">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at hello@golfsimmap.com.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-subtle">
          <Link href="/" className="text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

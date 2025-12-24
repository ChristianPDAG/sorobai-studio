import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/en">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: December 22, 2024</p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sorobai Studio collects information necessary to provide our AI-powered development platform. 
                  This includes your GitHub account information (username, email, avatar), Stellar wallet address, 
                  and usage data related to AI interactions and smart contract development.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide and improve our AI-assisted development services</li>
                  <li>Process payments and manage your credit balance in USDC</li>
                  <li>Enable collaboration through the Community Hub</li>
                  <li>Facilitate bounty marketplace transactions</li>
                  <li>Communicate important updates about the platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your code and projects are stored securely and synced with your GitHub repositories. 
                  We implement industry-standard security measures to protect your data. Wallet transactions 
                  are processed directly on the Stellar network, and we never store your private keys.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. Public projects shared on the Community Hub 
                  are visible to all users. Private projects remain accessible only to you unless you 
                  explicitly choose to share them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, modify, or delete your personal information at any time. 
                  You can export your projects and disconnect your accounts from the platform settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@sorobai.studio" className="text-foreground underline">
                    privacy@sorobai.studio
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
              <h1 className="text-4xl font-serif font-bold mb-4">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: December 22, 2024</p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using Sorobai Studio, you accept and agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sorobai Studio provides an AI-powered integrated development environment (IDE) for creating, 
                  testing, and deploying smart contracts on the Stellar blockchain. Our services include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>AI-assisted code generation and explanation</li>
                  <li>Monaco-based code editor with Rust/Soroban support</li>
                  <li>Community Hub for sharing and discovering contracts</li>
                  <li>Bounty marketplace for connecting developers with clients</li>
                  <li>Credit-based payment system using USDC on Stellar</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You must connect a GitHub account and Stellar wallet to use our platform. You are responsible 
                  for maintaining the security of your accounts and for all activities that occur under your accounts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Payment and Credits</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sorobai Studio operates on a pay-as-you-go model using credits purchased with USDC. 
                  Credits are non-refundable once used for AI services. All transactions are processed 
                  on the Stellar network and are subject to network fees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You retain all rights to the code you create using Sorobai Studio. By publishing projects 
                  to the Community Hub, you grant other users the right to view, fork, and learn from your code. 
                  The Sorobai Studio platform and AI services remain the property of Sorobai Studio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Bounty Marketplace</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The bounty marketplace facilitates connections between clients and developers. Sorobai Studio 
                  provides escrow services but is not responsible for the quality of work delivered. Disputes 
                  should be resolved between parties, with platform mediation available upon request.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may not use Sorobai Studio to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Create malicious or fraudulent smart contracts</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Attempt to circumvent payment systems or credit mechanisms</li>
                  <li>Abuse AI services or attempt to extract training data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sorobai Studio is provided "as is" without warranties of any kind. We do not guarantee that 
                  AI-generated code is error-free or suitable for production use. You are responsible for 
                  testing and auditing all code before deployment to mainnet.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sorobai Studio shall not be liable for any indirect, incidental, special, or consequential 
                  damages arising from your use of the platform, including but not limited to losses from 
                  smart contract bugs, network issues, or marketplace disputes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Continued use of the platform 
                  after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, contact us at{' '}
                  <a href="mailto:legal@sorobai.studio" className="text-foreground underline">
                    legal@sorobai.studio
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

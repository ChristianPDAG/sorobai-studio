import { Sparkles, Users, Coins } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Transform natural language into optimized Soroban contracts. Our AI understands Rust, WebAssembly (WASM), and Stellar best practices.',
  },
  {
    icon: Users,
    title: 'Community Hub',
    description: 'Share, fork, and audit Soroban contracts with the community. Build on verified code and contribute to the Stellar ecosystem.',
  },
  {
    icon: Coins,
    title: 'Bounty Marketplace',
    description: 'Connect with clients or find talented developers. Secure escrow with XLM or USDC ensures trust and instant payments on Stellar.',
  },
];

export function Features() {
  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4 sm:mb-6">
            Everything you need to build on Stellar
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Sorobai Studio combines AI assistance, social collaboration, and economic incentives 
            for building DeFi, payments, remittances, and tokenized assets on Soroban.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background rounded-xl border p-6 sm:p-8 hover:shadow-lg transition-all hover:border-yellow-400/50"
            >
              <div className="rounded-full bg-yellow-400/10 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-5 sm:mb-6">
                <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{feature.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

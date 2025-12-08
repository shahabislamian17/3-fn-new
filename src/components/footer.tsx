
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Youtube, Linkedin, Twitter } from 'lucide-react';

const socialLinks = [
  { icon: Twitter, href: '#', name: 'Twitter' },
  { icon: Youtube, href: '#', name: 'YouTube' },
  { icon: Linkedin, href: '#', name: 'LinkedIn' },
];

const footerLinks = {
  platform: [
    { name: 'Projects', href: '/projects' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Learn It Hub', href: '/learn' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Risk Disclosure', href: '/risks' },
    { name: 'Fee Policy', href: '/fee-policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-full lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Logo />
              <span className="font-bold text-lg">3JN CrowdFunding</span>
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm">
              A multi-user crowdfunding platform for equity and royalty-based investments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
           <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 3JN CrowdFunding Platform. All rights reserved. Powered by AI.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {socialLinks.map((social) => (
               <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                <social.icon className="w-5 h-5" />
                <span className="sr-only">{social.name}</span>
               </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card mt-16">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-5 gap-8 px-6 py-12 text-sm">
        <div className="col-span-2">
          <div className="font-semibold text-foreground">AI Workplace Productivity Assistant</div>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Generate emails, summarize meetings, plan tasks, and research smarter — all in one professional workspace.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Product</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Company</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link to="/responsible-ai" className="hover:text-foreground">Responsible AI</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Legal</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © 2026 AI Workplace Productivity Assistant. All Rights Reserved.
      </div>
    </footer>
  );
}

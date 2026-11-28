import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-navy text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo size={36} light />
          <p className="mt-3 text-sm text-slate-300">
            Right service. Zero waiting. Book a token online and skip the line at government offices.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Citizens</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-brand-saffron" to="/book">Book a token</Link></li>
            <li><Link className="hover:text-brand-saffron" to="/track">Track your token</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Office staff</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-brand-saffron" to="/login">Staff and admin login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SahiSewaQ. Built as a digital governance project.
      </div>
    </footer>
  );
}
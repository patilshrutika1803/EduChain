import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Hash,
  QrCode,
  Building2,
  ArrowRight,
  FileCheck,
  Database,
  Link2,
  Eye,
  Users,
} from 'lucide-react';
import { PublicNav, PublicFooter } from '../../components/layout/PublicLayout';
import { useDemoAuth } from '../../auth/useDemoAuth';

const HOW_STEPS = [
  { n: '01', title: 'Issue a local demo', desc: 'An institution demo account saves fictional academic details in this browser.' },
  { n: '02', title: 'Calculate a hash', desc: 'The app calculates SHA-256 from the canonical credential fields; no signature is created.' },
  { n: '03', title: 'Blockchain integration', desc: 'Planned only: no blockchain transaction or proof is currently connected.' },
  { n: '04', title: 'Check local integrity', desc: 'The verifier compares the current local data with its stored hash in this browser.' },
];

const WHY_BLOCKCHAIN = [
  { icon: Shield, title: 'Local hash comparison (demo)', desc: 'Compares current local fields with their stored hash; this does not establish issuer authenticity.' },
  { icon: Link2, title: 'Decentralized reference (planned)', desc: 'No cryptographic proof is anchored to a public blockchain in this prototype.' },
  { icon: Building2, title: 'Issuer authorization (planned)', desc: 'No registry or smart contract checks which institutions may issue credentials.' },
  { icon: FileCheck, title: 'Credential lifecycle (planned)', desc: 'Suspension, reactivation, revocation, and persistent history are not implemented.' },
];

const FEATURES = [
  { icon: Hash, title: 'Credential Issuance', desc: 'Demo: review, hash, and save fictional credentials in browser localStorage' },
  { icon: QrCode, title: 'QR link sharing (demo)', desc: 'Share a URL containing only the credential ID; verification requires the same browser-local record.' },
  { icon: Link2, title: 'Blockchain Proof', desc: 'Planned: credential proof anchoring' },
  { icon: Shield, title: 'Tamper Detection', desc: 'Demo: compare the recomputed hash with the local stored hash' },
  { icon: FileCheck, title: 'Lifecycle Management (planned)', desc: 'Lifecycle transitions and persistent history are not implemented' },
  { icon: Building2, title: 'Institution Registry (planned)', desc: 'Issuer authorization is not connected' },
];

const TRUST_PILLARS = [
  { icon: Lock, title: 'Browser-local demo data', desc: 'Records live in this browser’s localStorage; it is not a secure or shared store.' },
  { icon: Hash, title: 'Local hash comparison', desc: 'A matching hash does not prove issuer authenticity and can be forged by modifying both data and hash.' },
  { icon: Link2, title: 'Blockchain not connected', desc: 'No transaction, digital signature, or blockchain-backed verification is available.' },
];

export function LandingPage() {
  const { role } = useDemoAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PublicNav />

      {/* Hero */}
      <section
        className="bg-white border-b border-slate-200 relative overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(ellipse at 70% 50%, rgba(37,99,235,0.04) 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, rgba(37,99,235,0.03) 0%, transparent 60%)`,
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(to right, #2563EB 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-16">
            {/* Left */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-6">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Frontend prototype — planned credential platform
              </div>
              <h1 className="text-4xl md:text-[2.75rem] font-black text-slate-900 leading-[1.1] mb-5 tracking-tight">
                Demonstrate Credential Integrity with{' '}
                <span className="text-blue-600">Local SHA-256.</span>
              </h1>
              <p className="text-base text-slate-600 mb-8 leading-relaxed max-w-md">
                A browser-local demonstration: issue fictional credentials, save them in this browser,
                and compare their SHA-256 hashes. Authentication is simulated; no issuer signature,
                shared registry, or blockchain integration is connected.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-sm shadow-blue-200"
                >
                  Verify a Credential <ArrowRight size={15} />
                </Link>
                {role ? (
                  <Link
                    to={`/${role}/dashboard`}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all text-sm"
                  >
                    Open my dashboard
                  </Link>
                ) : (
                  <Link
                    to="/institution/login"
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all text-sm"
                  >
                    Institution Login
                  </Link>
                )}
              </div>
            </div>

            {/* Planned architecture preview */}
            <div className="flex-shrink-0 relative w-full max-w-sm lg:max-w-[360px]">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-blue-500" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Shield size={13} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">EduChain</p>
                        <p className="text-[8px] text-slate-400 leading-none mt-0.5">PLANNED ARCHITECTURE</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['Credential data', 'SHA-256 hash', 'Digital signature', 'Blockchain anchor'].map(item => (
                      <div key={item} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                        <span className="text-slate-600">{item}</span>
                        <span className="text-xs font-medium text-slate-400">Planned</span>
                      </div>
                    ))}
                    <p className="pt-2 text-xs leading-relaxed text-slate-500">
                      No credential is represented or verified here. These capabilities are planned, not connected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section id="about" className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid sm:grid-cols-3 gap-6">
            {TRUST_PILLARS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl bg-blue-50/40 border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-6xl mx-auto px-6" id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">How EduChain Works</h2>
          <p className="text-slate-500 mt-2 text-sm">A browser-local demo workflow and a separate blockchain roadmap.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_STEPS.map((step, i) => (
            <div key={step.n} className="relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              {i < HOW_STEPS.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-slate-300 font-bold">
                  →
                </div>
              )}
              <div className="text-4xl font-black text-blue-50 mb-3 leading-none">{step.n}</div>
              <h3 className="font-bold text-slate-900 mb-1.5">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="bg-[#0f172a] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Why Blockchain?</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-xl mx-auto">
              Blockchain integration is not implemented here. The following are planned capabilities, not active services.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY_BLOCKCHAIN.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Architecture */}
      <section className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Privacy Architecture</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
              Demo records are stored in this browser&apos;s localStorage. It is not secure, authoritative, tamper-proof, or a shared data store.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                  <Database size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Browser-local demo</p>
                  <p className="text-xs text-slate-500">Local demo · this browser only</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {['Student Name', 'Student ID', 'Degree & Department', 'CGPA', 'Academic Metadata', 'Graduation Year'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <Lock size={12} className="text-slate-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Link2 size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Blockchain (planned only)</p>
                  <p className="text-xs text-slate-500">No on-chain data or proof is implemented</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {['Credential ID', 'SHA-256 hash', 'Issuer wallet', 'Issuer signature', 'Block timestamp', 'Lifecycle status'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <Hash size={12} className="text-blue-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-6 max-w-xl mx-auto">
            Use fictional data only. Browser-local records are not shared with other devices; no blockchain verification is performed.
          </p>
        </div>
      </section>

      {/* Issuer-Holder-Verifier */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Demo Roles: Issuer · Holder · Verifier</h2>
          <p className="text-slate-500 mt-2 text-sm">Role labels only; standards-based credential exchange and a shared registry are not connected.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { Icon: Building2, role: 'Issuer', who: 'Institution demo', desc: 'Creates and stores a fictional credential and its local SHA-256 hash. No signature or issuer authorization is performed.', border: 'border-blue-200', bg: 'bg-blue-50', iconColor: 'text-blue-600', labelColor: 'text-blue-600' },
            { Icon: Users, role: 'Holder', who: 'Student demo', desc: 'Views credentials matched to the signed-in demo email and shares a QR link containing the ID only.', border: 'border-slate-200', bg: 'bg-slate-100', iconColor: 'text-slate-600', labelColor: 'text-slate-400' },
            { Icon: Eye, role: 'Verifier', who: 'Local verifier', desc: 'Compares a local record with its hash. This does not authenticate an issuer or academic claim, and requires the same browser data.', border: 'border-green-200', bg: 'bg-green-50', iconColor: 'text-green-600', labelColor: 'text-green-600' },
          ].map(({ Icon, role, who, desc, border, bg, iconColor, labelColor }) => (
            <div key={role} className={`bg-white rounded-2xl border p-6 text-center shadow-sm ${border}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${bg}`}>
                <Icon size={20} className={iconColor} />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${labelColor}`}>{role}</p>
              <h3 className="font-bold text-slate-900 mb-2">{who}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Key Features</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl hover:bg-blue-50/30 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Verify a Credential</h2>
        <p className="text-slate-500 text-sm mb-8">Check a saved browser-local demo record and its SHA-256 integrity. Unknown IDs return NOT_FOUND.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/verify" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <QrCode size={16} /> Verify a Credential
          </Link>
          <Link to={role ? `/${role}/dashboard` : '/student/login'} className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            {role ? 'Open my dashboard' : 'Student Portal'}
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

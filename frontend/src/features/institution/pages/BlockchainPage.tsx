import { useState } from 'react';
import { Link2, Hash, Pen, Building2, CheckCircle, Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { NetworkBadge } from '../../../components/ui/NetworkBadge';

const FLOW_STEPS = [
  { icon: Building2, label: 'Institution Wallet', desc: 'Planned: an issuer wallet initiates issuance' },
  { icon: Hash, label: 'Credential Hash', desc: 'Demo: calculated locally; no blockchain transaction anchors this hash' },
  { icon: Pen, label: 'Digital Signature', desc: 'Planned: signature by the authorized issuer' },
  { icon: Link2, label: 'EduChainRegistry', desc: 'Planned: smart contract stores a proof on-chain' },
  { icon: CheckCircle, label: 'Blockchain Proof', desc: 'Planned: independently verifiable record' },
];

const CONTRACT_FUNCTIONS = [
  { name: 'registerInstitution()', category: 'Registry', description: 'Register a new institution wallet' },
  { name: 'authorizeInstitution()', category: 'Registry', description: 'Authorize an institution to issue credentials' },
  { name: 'revokeInstitution()', category: 'Registry', description: 'Revoke institution authorization' },
  { name: 'issueCredential()', category: 'Credential', description: 'Issue and anchor a credential proof' },
  { name: 'suspendCredential()', category: 'Lifecycle', description: 'Temporarily suspend a credential' },
  { name: 'reactivateCredential()', category: 'Lifecycle', description: 'Reactivate a suspended credential' },
  { name: 'revokeCredential()', category: 'Lifecycle', description: 'Permanently revoke a credential' },
  { name: 'getCredential()', category: 'Query', description: 'Query credential proof from registry' },
];

const CONTRACT_EVENTS = [
  { name: 'InstitutionAuthorized', description: 'Would indicate that an institution was authorized' },
  { name: 'InstitutionRevoked', description: 'Would indicate that an institution authorization was revoked' },
  { name: 'CredentialIssued', description: 'Would indicate that a credential proof was registered' },
  { name: 'CredentialSuspended', description: 'Would indicate that a credential was suspended' },
  { name: 'CredentialReactivated', description: 'Would indicate that a credential was reactivated' },
  { name: 'CredentialRevoked', description: 'Would indicate that a credential was revoked' },
];

export function BlockchainPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'contract'>('overview');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Blockchain</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Not connected — blockchain integration is not implemented.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NetworkBadge network="Not connected" />
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
        <p>
          <strong>Planned architecture:</strong> the design intends to store cryptographic proofs
          on-chain and keep personal student data off-chain. This demo stores fictional credentials
          in browser localStorage and calculates hashes locally; no database, blockchain, or issuer
          wallet is connected.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'contract', label: 'Smart Contract' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selectedTab === tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${selectedTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'overview' && (
        <div className="space-y-5">
          {/* Contract info */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">EduChainRegistry Contract</h2>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                Not deployed
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Contract Address</p>
                <span className="text-sm text-slate-500">Not deployed</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Network</p>
                <NetworkBadge network="Not connected" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Institution Wallet</p>
                <span className="text-sm text-slate-500">Not connected</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Authorization</p>
                <span className="text-xs text-slate-500">Not configured</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-600 space-y-1">
              <p className="text-slate-500">No issuer is connected.</p>
            </div>
            <div className="flex gap-3 mt-4">
              <span className="text-xs text-slate-500">Explorer unavailable — no contract is deployed.</span>
            </div>
          </Card>

          {/* Blockchain flow */}
          <Card padding="lg">
            <h2 className="font-semibold text-slate-900 mb-5">Credential Issuance Flow</h2>
            <div className="flex flex-col gap-0">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <step.icon size={15} className="text-blue-600" />
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className="w-px h-8 bg-blue-200 my-1" />
                    )}
                  </div>
                  <div className="pb-6 pt-1.5">
                    <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Off-chain / On-chain summary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card padding="md" className="border-slate-200 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Planned Off-Chain Data</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {['Student Name', 'Student ID', 'Degree & Department', 'CGPA', 'Academic Metadata'].map(item => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />{item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card padding="md" className="border-blue-200 bg-blue-50">
              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Planned On-Chain Proof</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {['Credential Hash', 'Issuer Wallet Address', 'Digital Signature', 'Block Timestamp', 'Lifecycle Status'].map(item => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-blue-500 rounded-full" />{item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {selectedTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <Info size={13} /> No transaction records exist. The prototype is not connected to a blockchain network.
          </div>
          <Card><p className="text-sm text-slate-500 text-center py-8">No blockchain transactions yet.</p></Card>
        </div>
      )}

      {selectedTab === 'contract' && (
        <div className="space-y-5">
          <Card padding="lg">
            <h2 className="font-semibold text-slate-900 mb-1">Planned Contract Functions</h2>
            <p className="text-xs text-slate-500 mb-4">Conceptual interface only; no contract is deployed or callable.</p>
            <div className="divide-y divide-slate-100">
              {CONTRACT_FUNCTIONS.map(fn => (
                <div key={fn.name} className="flex items-start gap-3 py-3">
                  <code className="font-mono text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                    {fn.name}
                  </code>
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">{fn.description}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded flex-shrink-0">
                    {fn.category}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card padding="lg">
            <h2 className="font-semibold text-slate-900 mb-4">Planned Contract Events</h2>
            <div className="divide-y divide-slate-100">
              {CONTRACT_EVENTS.map(ev => (
                <div key={ev.name} className="flex items-start gap-3 py-3">
                  <div className="w-2 h-2 bg-slate-300 rounded-full flex-shrink-0 mt-1.5" />
                  <div>
                    <code className="font-mono text-xs text-green-800 font-semibold">{ev.name}</code>
                    <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="flex items-start gap-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-xs text-slate-600">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            The EduChainRegistry smart contract is planned only. No contract is deployed, callable, or connected to this demo.
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, FileCheck2, Shield, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface KYCProfile {
  id: string;
  name: string;
  type: 'individual' | 'entity';
  status: 'pending' | 'verified' | 'flagged' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdDate: Date;
  verificationDate?: Date;
  expiryDate: Date;
  sanctionsScreening: 'clear' | 'pending' | 'flagged';
  pepScreening: 'clear' | 'flagged';
  documents: string[];
  requestedDocuments: string[];
}

interface BeneficialOwner {
  id: string;
  profileId: string;
  name: string;
  ownership: number;
  relationship: string;
  jurisdiction: string;
  riskFactors: string[];
  verified: boolean;
}

interface SanctionsHit {
  id: string;
  investor: string;
  listType: string;
  matchStrength: 'exact' | 'partial' | 'fuzzy';
  dateDetected: Date;
  status: 'pending-review' | 'false-positive' | 'confirmed' | 'escalated';
  resolution?: string;
}

const DEMO_KYC_PROFILES: KYCProfile[] = [
  {
    id: 'kyc-001',
    name: 'Apex Capital Partners',
    type: 'entity',
    status: 'verified',
    riskLevel: 'low',
    createdDate: new Date('2025-06-01'),
    verificationDate: new Date('2025-06-15'),
    expiryDate: new Date('2027-06-15'),
    sanctionsScreening: 'clear',
    pepScreening: 'clear',
    documents: ['Registration', 'Articles of Incorporation', 'Beneficial Ownership Form'],
    requestedDocuments: [],
  },
  {
    id: 'kyc-002',
    name: 'Horizon Funds LLC',
    type: 'entity',
    status: 'verified',
    riskLevel: 'medium',
    createdDate: new Date('2025-05-10'),
    verificationDate: new Date('2025-05-25'),
    expiryDate: new Date('2027-05-25'),
    sanctionsScreening: 'clear',
    pepScreening: 'clear',
    documents: ['Registration', 'Fund Documents', 'UBO Declaration'],
    requestedDocuments: [],
  },
  {
    id: 'kyc-003',
    name: 'Sterling Advisors Inc',
    type: 'entity',
    status: 'pending',
    riskLevel: 'high',
    createdDate: new Date(Date.now() - 604800000),
    expiryDate: new Date(Date.now() + 15552000000),
    sanctionsScreening: 'pending',
    pepScreening: 'clear',
    documents: ['Registration', 'Beneficial Ownership Form'],
    requestedDocuments: ['Source of funds memo'],
  },
  {
    id: 'kyc-004',
    name: 'Merlin Capital Partners',
    type: 'entity',
    status: 'flagged',
    riskLevel: 'critical',
    createdDate: new Date(Date.now() - 1209600000),
    expiryDate: new Date(Date.now() + 15552000000),
    sanctionsScreening: 'flagged',
    pepScreening: 'flagged',
    documents: ['Registration', 'UBO Declaration', 'Sanctions Screening Report'],
    requestedDocuments: ['Enhanced due-diligence certification'],
  },
];

const DEMO_BENEFICIAL_OWNERS: BeneficialOwner[] = [
  { id: 'bo-001', profileId: 'kyc-001', name: 'John Smith', ownership: 35, relationship: 'Founder & Managing Partner', jurisdiction: 'US - Delaware', riskFactors: [], verified: true },
  { id: 'bo-002', profileId: 'kyc-001', name: 'Jane Doe', ownership: 30, relationship: 'Co-Founder & Partner', jurisdiction: 'US - New York', riskFactors: [], verified: true },
  { id: 'bo-003', profileId: 'kyc-001', name: 'Apex Holdings Ltd', ownership: 35, relationship: 'Parent Company', jurisdiction: 'Cayman Islands', riskFactors: ['Offshore jurisdiction', 'Layered ownership'], verified: true },
  { id: 'bo-004', profileId: 'kyc-002', name: 'Robert Johnson', ownership: 50, relationship: 'Managing Member', jurisdiction: 'US - California', riskFactors: [], verified: true },
  { id: 'bo-005', profileId: 'kyc-002', name: 'Horizon Investment Fund', ownership: 50, relationship: 'Fund Vehicle', jurisdiction: 'US - Delaware', riskFactors: [], verified: true },
  { id: 'bo-006', profileId: 'kyc-003', name: 'Unknown UBO', ownership: 100, relationship: 'Pending Verification', jurisdiction: 'Unknown', riskFactors: ['UBO not yet identified', 'Complex structure'], verified: false },
  { id: 'bo-007', profileId: 'kyc-004', name: 'Merlin Offshore Holdings', ownership: 82, relationship: 'Controlling Member', jurisdiction: 'BVI', riskFactors: ['Offshore jurisdiction', 'PEP relationship under review'], verified: false },
];

const DEMO_SANCTIONS_HITS: SanctionsHit[] = [
  {
    id: 'sanc-001',
    investor: 'Merlin Capital Partners',
    listType: 'OFAC SDN',
    matchStrength: 'partial',
    dateDetected: new Date(Date.now() - 259200000),
    status: 'pending-review',
  },
  {
    id: 'sanc-002',
    investor: 'Sterling Advisors Inc',
    listType: 'EU Consolidated List',
    matchStrength: 'fuzzy',
    dateDetected: new Date(Date.now() - 432000000),
    status: 'false-positive',
    resolution: 'Name similarity - different entity',
  },
];

export function KYCCompliance() {
  const [profiles, setProfiles] = useState<KYCProfile[]>(DEMO_KYC_PROFILES);
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>(DEMO_BENEFICIAL_OWNERS);
  const [sanctionsHits, setSanctionsHits] = useState<SanctionsHit[]>(DEMO_SANCTIONS_HITS);
  const [selectedProfileId, setSelectedProfileId] = useState(DEMO_KYC_PROFILES[0].id);
  const [auditLog, setAuditLog] = useState<string[]>([
    'KYC cockpit loaded with investor profiles, ownership records, and sanctions-review queues.',
  ]);

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0];
  const selectedOwners = beneficialOwners.filter((owner) => owner.profileId === selectedProfile?.id);

  const summary = useMemo(() => {
    return {
      verified: profiles.filter((p) => p.status === 'verified').length,
      pending: profiles.filter((p) => p.status === 'pending').length,
      flagged: profiles.filter((p) => p.status === 'flagged').length,
      unresolvedHits: sanctionsHits.filter((hit) => hit.status === 'pending-review' || hit.status === 'escalated').length,
    };
  }, [profiles, sanctionsHits]);

  const addLog = (message: string) => setAuditLog((current) => [message, ...current].slice(0, 6));

  const requestDocuments = () => {
    if (!selectedProfile) return;
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === selectedProfile.id
          ? {
              ...profile,
              requestedDocuments: Array.from(new Set([...profile.requestedDocuments, 'Updated beneficial-owner attestation'])),
              status: profile.status === 'verified' ? profile.status : 'pending',
            }
          : profile,
      ),
    );
    addLog(`Morgan requested updated beneficial-owner attestation from ${selectedProfile.name}.`);
  };

  const verifyProfile = () => {
    if (!selectedProfile) return;
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === selectedProfile.id
          ? {
              ...profile,
              status: 'verified',
              riskLevel: profile.riskLevel === 'critical' ? 'high' : profile.riskLevel,
              sanctionsScreening: profile.sanctionsScreening === 'pending' ? 'clear' : profile.sanctionsScreening,
              verificationDate: new Date(),
              documents: Array.from(new Set([...profile.documents, 'Compliance approval memo'])),
            }
          : profile,
      ),
    );
    addLog(`Compliance verified ${selectedProfile.name} and attached an approval memo.`);
  };

  const verifyOwner = (ownerId: string) => {
    const owner = beneficialOwners.find((candidate) => candidate.id === ownerId);
    setBeneficialOwners((current) => current.map((candidate) => (candidate.id === ownerId ? { ...candidate, verified: true, riskFactors: [] } : candidate)));
    if (owner) addLog(`UBO review completed for ${owner.name}; ownership record moved to verified.`);
  };

  const markFalsePositive = (hitId: string) => {
    const hit = sanctionsHits.find((candidate) => candidate.id === hitId);
    setSanctionsHits((current) =>
      current.map((candidate) =>
        candidate.id === hitId
          ? { ...candidate, status: 'false-positive', resolution: 'Analyst cleared as false positive after identifier review' }
          : candidate,
      ),
    );
    if (hit) addLog(`Sanctions hit for ${hit.investor} cleared as false positive and retained in the archive.`);
  };

  const escalateHit = (hitId: string) => {
    const hit = sanctionsHits.find((candidate) => candidate.id === hitId);
    setSanctionsHits((current) =>
      current.map((candidate) =>
        candidate.id === hitId ? { ...candidate, status: 'escalated', resolution: 'Escalated to compliance officer and approval lock' } : candidate,
      ),
    );
    if (hit) addLog(`Sanctions hit for ${hit.investor} escalated to compliance officer with approval lock.`);
  };

  const getStatusColor = (status: KYCProfile['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'flagged':
        return 'bg-orange-500/20 text-orange-200 border-orange-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-200 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500/20 text-red-200';
      case 'high':
        return 'bg-orange-500/20 text-orange-200';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-200';
      default:
        return 'bg-blue-500/20 text-blue-200';
    }
  };

  return (
    <div className="space-y-6" data-testid="kyc-workflow">
      <div>
        <h1 className="text-3xl font-bold text-foreground">KYC Compliance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Working KYC cockpit for investor verification, UBO remediation, document requests, sanctions escalation, and retained review notes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="border-border p-3">
          <p className="mb-1 text-xs text-muted-foreground">Total Profiles</p>
          <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5 p-3">
          <p className="mb-1 text-xs text-muted-foreground">Verified</p>
          <p className="text-2xl font-bold text-emerald-400">{summary.verified}</p>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5 p-3">
          <p className="mb-1 text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{summary.pending}</p>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5 p-3">
          <p className="mb-1 text-xs text-muted-foreground">Open Hits</p>
          <p className="text-2xl font-bold text-red-400">{summary.unresolvedHits}</p>
        </Card>
      </div>

      <Card className="border-cyan-500/25 bg-cyan-500/5 p-4" data-testid="kyc-audit-log">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <FileCheck2 className="h-4 w-4" /> KYC workflow audit log
        </div>
        <div className="grid gap-2">
          {auditLog.map((item, index) => (
            <p key={`${item}-${index}`} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">
              {item}
            </p>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">KYC Profiles</TabsTrigger>
          <TabsTrigger value="beneficial">Beneficial Owners</TabsTrigger>
          <TabsTrigger value="sanctions">Sanctions Screening</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="h-fit border-border p-4 lg:col-span-1">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Investors</h2>
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${selectedProfile?.id === profile.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-border hover:border-border/80 hover:bg-muted/30'}`}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">{profile.type.toUpperCase()}</p>
                      </div>
                      <Badge variant="outline" className={`whitespace-nowrap text-xs ${getStatusColor(profile.status)}`}>
                        {profile.status.toUpperCase()}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {selectedProfile && (
              <Card className="border-cyan-500/30 bg-cyan-500/5 p-6 lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{selectedProfile.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedProfile.type.charAt(0).toUpperCase() + selectedProfile.type.slice(1)} • Created {selectedProfile.createdDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(selectedProfile.status)}`}>
                          {selectedProfile.status.toUpperCase()}
                        </Badge>
                        <Badge className={`text-xs ${getRiskColor(selectedProfile.riskLevel)}`}>{selectedProfile.riskLevel.toUpperCase()} RISK</Badge>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/30 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          {selectedProfile.sanctionsScreening === 'clear' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : selectedProfile.sanctionsScreening === 'pending' ? <Clock className="h-4 w-4 text-yellow-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                          <p className="text-xs font-semibold text-foreground">Sanctions Screening</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{selectedProfile.sanctionsScreening.toUpperCase()}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          {selectedProfile.pepScreening === 'clear' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                          <p className="text-xs font-semibold text-foreground">PEP Screening</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{selectedProfile.pepScreening.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  {selectedProfile.verificationDate ? (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <p className="mb-1 text-sm font-semibold text-emerald-400">Verified</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedProfile.verificationDate.toLocaleDateString()} • Expires {selectedProfile.expiryDate.toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                      <p className="mb-1 text-sm font-semibold text-amber-300">Verification pending</p>
                      <p className="text-xs text-muted-foreground">Route missing documents or verify when source evidence clears.</p>
                    </div>
                  )}

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Documents on File</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.documents.map((doc) => (
                        <Badge key={doc} variant="secondary">{doc}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Outstanding Requests</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.requestedDocuments.length > 0 ? selectedProfile.requestedDocuments.map((doc) => (
                        <Badge key={doc} variant="outline" className="border-amber-300/40 text-amber-200">{doc}</Badge>
                      )) : <span className="text-xs text-muted-foreground">No outstanding document requests.</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" onClick={verifyProfile}>Verify profile</Button>
                    <Button className="flex-1" variant="outline" onClick={requestDocuments}>Request documents</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="beneficial" className="mt-4 space-y-4">
          {selectedProfile && selectedOwners.length > 0 ? (
            <Card className="border-border p-4">
              <h2 className="mb-4 text-sm font-semibold text-foreground">{selectedProfile.name} - Beneficial Ownership Structure</h2>
              <div className="space-y-3">
                {selectedOwners.map((owner) => (
                  <div key={owner.id} className="rounded-lg border border-border p-4 hover:bg-muted/30">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{owner.name}</h4>
                        <p className="text-xs text-muted-foreground">{owner.relationship}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-cyan-400">{owner.ownership}%</p>
                        <Badge variant="outline" className={owner.verified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-200'}>
                          {owner.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Jurisdiction</span>
                      <span className="font-semibold text-foreground">{owner.jurisdiction}</span>
                    </div>

                    {owner.riskFactors.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-orange-400">Risk Factors</p>
                        <div className="flex flex-wrap gap-1">
                          {owner.riskFactors.map((factor) => (
                            <Badge key={factor} variant="secondary" className="text-xs">{factor}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-cyan-500" style={{ width: `${owner.ownership}%` }} />
                    </div>

                    <Button className="mt-3" variant="outline" disabled={owner.verified} onClick={() => verifyOwner(owner.id)}>
                      {owner.verified ? <><CheckCircle2 className="mr-2 h-4 w-4" /> UBO verified</> : <><Users className="mr-2 h-4 w-4" /> Verify UBO record</>}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="border-border p-6">
              <p className="text-center text-sm text-muted-foreground">Select a profile to view beneficial ownership structure</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sanctions" className="mt-4 space-y-4">
          {sanctionsHits.length > 0 ? (
            sanctionsHits.map((hit) => (
              <Card key={hit.id} className="border-border p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{hit.investor}</h3>
                    <p className="text-sm text-muted-foreground">{hit.listType} • Detected {hit.dateDetected.toLocaleDateString()}</p>
                  </div>
                  <Badge className={hit.status === 'pending-review' ? 'bg-yellow-500/20 text-yellow-200' : hit.status === 'false-positive' ? 'bg-blue-500/20 text-blue-200' : hit.status === 'escalated' ? 'bg-purple-500/20 text-purple-200' : 'bg-red-500/20 text-red-200'}>
                    {hit.status.toUpperCase().replace('-', ' ')}
                  </Badge>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Match Strength</p>
                    <Badge variant="outline" className={hit.matchStrength === 'exact' ? 'bg-red-500/20 text-red-200' : hit.matchStrength === 'partial' ? 'bg-orange-500/20 text-orange-200' : 'bg-yellow-500/20 text-yellow-200'}>
                      {hit.matchStrength.toUpperCase()}
                    </Badge>
                  </div>
                  {hit.resolution && (
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Resolution</p>
                      <p className="text-sm font-semibold text-foreground">{hit.resolution}</p>
                    </div>
                  )}
                </div>

                {hit.status === 'pending-review' || hit.status === 'escalated' ? (
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" onClick={() => markFalsePositive(hit.id)}>
                      Mark as false positive
                    </Button>
                    <Button className="flex-1" variant="outline" onClick={() => escalateHit(hit.id)}>
                      <Shield className="mr-2 h-4 w-4" /> Escalate
                    </Button>
                  </div>
                ) : null}
              </Card>
            ))
          ) : (
            <Card className="border-border p-6">
              <p className="text-center text-sm text-muted-foreground">No sanctions screening hits</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { KYCCompliance as default };

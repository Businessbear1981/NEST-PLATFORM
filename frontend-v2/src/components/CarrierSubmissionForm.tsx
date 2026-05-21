import React from 'react';
import { DollarSign, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface SuretyProviderOption {
  id: string;
  name: string;
  rating: string;
  capacity: number;
  premiumRange: [number, number];
  turnaround: number;
  specialties: string[];
}

export interface SuretyQuoteOption {
  id: string;
  provider: string;
  coverage: number;
  term: number;
  premium: number;
  riskFactors: string[];
  status: 'pending' | 'quoted' | 'accepted' | 'rejected';
}

interface CarrierSubmissionFormProps {
  providers: SuretyProviderOption[];
  quotes: SuretyQuoteOption[];
  onRequestQuote: (provider: SuretyProviderOption) => void;
  onAcceptQuote: (quoteId: string) => void;
}

export function CarrierSubmissionForm({
  providers,
  quotes,
  onRequestQuote,
  onAcceptQuote,
}: CarrierSubmissionFormProps) {
  return (
    <div className="space-y-5" data-testid="carrier-submission-form">
      <Card className="border-slate-700 bg-slate-950/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300">
            <Send className="h-5 w-5" />
            Carrier Submission Form
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Submit packet requests to qualified carriers, track underwriting status, and receive premium quotes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Card key={provider.id} className="border-slate-700 bg-slate-900/70 transition-all hover:border-cyan-500/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm font-semibold text-cyan-300">{provider.name}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">Carrier rating: {provider.rating}</p>
                    </div>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-sm font-bold text-emerald-200">
                      {provider.rating}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="font-semibold text-foreground">${(provider.capacity / 1_000_000).toFixed(0)}M</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Turnaround</p>
                      <p className="font-semibold text-foreground">{provider.turnaround} days</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Premium range</p>
                      <p className="font-semibold text-amber-200">{provider.premiumRange[0]}% - {provider.premiumRange[1]}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.specialties.map((specialty) => (
                        <span key={specialty} className="rounded bg-slate-800 px-2 py-1 text-xs text-cyan-200">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => onRequestQuote(provider)} className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
                    Request Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-950/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300">
            <DollarSign className="h-5 w-5" />
            Premium Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No quotes requested yet</p>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <div key={quote.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{quote.provider}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(quote.coverage / 1_000_000).toFixed(1)}M coverage • {quote.term} years
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-300">${quote.premium.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Annual premium</p>
                      <span className="mt-2 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">
                        {quote.status}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3 border-b border-slate-700 pb-3">
                    <p className="mb-2 text-xs text-muted-foreground">Risk factors</p>
                    <div className="flex flex-wrap gap-1">
                      {quote.riskFactors.map((factor) => (
                        <span key={factor} className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => onAcceptQuote(quote.id)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Negotiate
                    </Button>
                  </div>
                  {quote.status === 'accepted' && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                      <ShieldCheck className="h-4 w-4" /> Quote accepted and routed to approval workflow.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { Star, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_SURETY_PROVIDERS } from '@shared/suretyDemo';

interface ProviderMatchingPanelProps {
  dealId: string;
  selectedProviders?: string[];
  onSelectProvider?: (providerId: string) => void;
}

export function ProviderMatchingPanel({
  dealId,
  selectedProviders = [],
  onSelectProvider,
}: ProviderMatchingPanelProps) {
  const providers = DEMO_SURETY_PROVIDERS;

  // Sort by rating and response time
  const sortedProviders = [...providers].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.responseTime - b.responseTime;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Provider Matching</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {providers.length} qualified providers available • {selectedProviders.length} selected
        </p>
      </div>

      {/* Providers Grid */}
      <div className="space-y-3">
        {sortedProviders.map((provider) => {
          const isSelected = selectedProviders.includes(provider.id);
          const premiumEstimate = Math.round(
            50000000 * ((provider.premiumRange.min + provider.premiumRange.max) / 2 / 100)
          );

          return (
            <Card
              key={provider.id}
              className={`p-4 border-2 transition-colors cursor-pointer ${
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-border hover:border-border/80 hover:bg-accent/30'
              }`}
              onClick={() => onSelectProvider?.(provider.id)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-lg">{provider.name}</h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{provider.rating}/5</span>
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProvider?.(provider.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Capacity</p>
                    <p className="font-semibold text-foreground">${provider.capacity}M</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Premium Range</p>
                    <p className="font-semibold text-foreground">
                      {provider.premiumRange.min}% - {provider.premiumRange.max}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Est. Premium</p>
                    <p className="font-semibold text-foreground">
                      ${(premiumEstimate / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Response Time</p>
                    <p className="font-semibold text-foreground">{provider.responseTime}d</p>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs capitalize">
                        {specialty.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Contact & Notes */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${provider.contactEmail}`} className="hover:text-foreground">
                      {provider.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${provider.contactPhone}`} className="hover:text-foreground">
                      {provider.contactPhone}
                    </a>
                  </div>
                </div>

                {provider.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">{provider.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedProviders.length > 0 && (
        <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
          <p className="text-sm font-semibold text-emerald-700 mb-2">Selected Providers</p>
          <div className="space-y-1">
            {selectedProviders.map((providerId) => {
              const provider = providers.find((p) => p.id === providerId);
              if (!provider) return null;
              return (
                <div key={providerId} className="text-sm text-emerald-700">
                  • {provider.name} ({provider.premiumRange.min}% - {provider.premiumRange.max}% premium)
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

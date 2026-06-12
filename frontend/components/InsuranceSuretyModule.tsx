import React from 'react';
import { CompleteSuretyModule } from '@/components/CompleteSuretyModule';

interface InsuranceSuretyModuleProps {
  dealId?: string;
  dealName?: string;
}

export function InsuranceSuretyModule({ dealId = 'deal-1', dealName = 'Riverside Mixed-Use Portfolio' }: InsuranceSuretyModuleProps) {
  return (
    <section
      data-testid="insurance-surety-module"
      aria-label={`Insurance and surety workspace for ${dealName}`}
      data-deal-id={dealId}
      className="space-y-4"
    >
      <CompleteSuretyModule />
    </section>
  );
}

export default InsuranceSuretyModule;

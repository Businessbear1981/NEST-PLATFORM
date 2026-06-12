"use client";
import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PaymentMethod {
  id: string;
  type: 'wire' | 'ach' | 'card';
  label: string;
  details: string;
  isDefault: boolean;
}

interface Receipt {
  id: string;
  date: Date;
  amount: number;
  method: string;
  reference: string;
  status: 'confirmed' | 'pending';
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'wire1',
    type: 'wire',
    label: 'Wire Transfer',
    details: 'Bank: Chase Manhattan • Account: ••••5678',
    isDefault: true,
  },
  {
    id: 'ach1',
    type: 'ach',
    label: 'ACH Transfer',
    details: 'Routing: 021000021 • Account: ••••1234',
    isDefault: false,
  },
  {
    id: 'card1',
    type: 'card',
    label: 'Credit Card',
    details: 'Visa ending in 4242',
    isDefault: false,
  },
];

export function PaymentProcessing({ amount, invoiceId }: { amount: number; invoiceId?: string }) {
  const [selectedMethod, setSelectedMethod] = useState<string>(paymentMethods[0].id);
  const [paymentAmount, setPaymentAmount] = useState<number>(amount);
  const [step, setStep] = useState<'method' | 'review' | 'confirm'>('method');
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const handlePayment = () => {
    const newReceipt: Receipt = {
      id: `REC-${Date.now()}`,
      date: new Date(),
      amount: paymentAmount,
      method: paymentMethods.find((m) => m.id === selectedMethod)?.label || 'Unknown',
      reference: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'pending',
    };
    setReceipt(newReceipt);
    setStep('confirm');
  };

  const selectedPaymentMethod = paymentMethods.find((m) => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-cyan-500" />
          Payment Processing
        </h2>
        <p className="text-muted-foreground mt-1">Amount Due: ${paymentAmount.toLocaleString()}</p>
        {invoiceId && (
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-[#C4A048]">
            Payment prefilled for {invoiceId}
          </p>
        )}
      </div>

      {step === 'method' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#C4A048]">Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedMethod === method.id
                      ? 'border-cyan-500 bg-[#C4A048]/10'
                      : 'border-[#1E4A2E] bg-[#0D2218] hover:border-[#1E4A2E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === method.id ? 'border-cyan-500 bg-cyan-500' : 'border-[#1E4A2E]'
                      }`}
                    >
                      {selectedMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.details}</p>
                    </div>
                    {method.isDefault && <Badge className="bg-cyan-600 text-white">Default</Badge>}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#1E4A2E]">
              <label className="text-sm font-semibold text-foreground mb-2 block">Payment Amount</label>
              <div className="flex gap-2">
                <span className="text-2xl font-bold text-[#C4A048]">$</span>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="flex-1 bg-[#1E4A2E] border border-[#1E4A2E] rounded px-3 py-2 text-foreground text-lg"
                />
              </div>
            </div>

            <Button onClick={() => setStep('review')} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              Continue to Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#C4A048]">Review Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#0D2218] rounded-lg border border-[#1E4A2E] space-y-3">
              {invoiceId && (
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Invoice</p>
                  <p className="font-mono text-[#C4A048]">{invoiceId}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-semibold text-foreground">{selectedPaymentMethod?.label}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Amount</p>
                <p className="font-bold text-[#C4A048]">${paymentAmount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Processing Fee</p>
                <p className="text-foreground">$0.00</p>
              </div>
              <div className="border-t border-[#1E4A2E] pt-3 flex justify-between">
                <p className="font-semibold text-foreground">Total</p>
                <p className="text-xl font-bold text-[#C4A048]">${paymentAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep('method')} variant="outline" className="flex-1 border-[#1E4A2E]">
                Back
              </Button>
              <Button onClick={handlePayment} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                Confirm Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && receipt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Payment Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 font-semibold mb-2">Payment successfully processed</p>
              <p className="text-sm text-muted-foreground">
                Your payment has been submitted and is pending confirmation from your bank.
              </p>
            </div>

            <div className="p-4 bg-[#0D2218] rounded-lg border border-[#1E4A2E] space-y-3">
              {invoiceId && (
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Invoice</p>
                  <p className="font-mono text-[#C4A048]">{invoiceId}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-muted-foreground">Receipt ID</p>
                <p className="font-mono text-[#C4A048]">{receipt.id}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Reference</p>
                <p className="font-mono text-foreground">{receipt.reference}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Payment Method</p>
                <p className="text-foreground">{receipt.method}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Amount</p>
                <p className="font-bold text-green-400">${receipt.amount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Date</p>
                <p className="text-foreground">{receipt.date.toLocaleString()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Status</p>
                <Badge className="bg-yellow-600 text-white">{receipt.status.toUpperCase()}</Badge>
              </div>
            </div>

            <div className="p-4 bg-[#0D2218] rounded-lg border border-[#1E4A2E]">
              <p className="text-sm text-muted-foreground mb-2">What happens next?</p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2">
                  <span className="text-[#C4A048]">•</span>
                  <span>Your bank will process the payment within 1-2 business days</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C4A048]">•</span>
                  <span>You'll receive a confirmation email once the payment clears</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#C4A048]">•</span>
                  <span>Your invoice will be updated to reflect the payment</span>
                </li>
              </ul>
            </div>

            <Button onClick={() => setStep('method')} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              Make Another Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

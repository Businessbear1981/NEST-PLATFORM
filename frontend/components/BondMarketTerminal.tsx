"use client";
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Phone, Send, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAllBonds,
  getMTMPrice,
  getBondOrders,
  getInvestorBook,
  getPortfolioMetrics,
  simulateMTMUpdate,
} from '@shared/bondDeskDemo';

export function BondMarketTerminal() {
  const bonds = getAllBonds();
  const metrics = getPortfolioMetrics();
  const [selectedBond, setSelectedBond] = useState(bonds[0]?.id);
  const [mtmPrices, setMtmPrices] = useState(() => {
    const prices: Record<string, any> = {};
    bonds.forEach((b) => {
      prices[b.id] = getMTMPrice(b.id);
    });
    return prices;
  });

  // Simulate MTM updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMtmPrices((prev) => {
        const updated = { ...prev };
        bonds.forEach((b) => {
          updated[b.id] = simulateMTMUpdate(b.id);
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [bonds]);

  const selectedBondData = bonds.find((b) => b.id === selectedBond);
  const selectedMTM = mtmPrices[selectedBond];
  const selectedOrders = getBondOrders(selectedBond);
  const selectedBook = getInvestorBook(selectedBond);

  const getPriceColor = (price: number) => {
    if (price > 100) return 'text-emerald-400';
    if (price < 100) return 'text-red-400';
    return 'text-amber-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bond Market Terminal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live trading desk with MTM pricing, call/put mechanics, and investor book
        </p>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Bonds</p>
          <p className="text-2xl font-bold text-foreground">{metrics.totalBonds}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground mb-1">Face Value</p>
          <p className="text-2xl font-bold text-foreground">${metrics.totalFaceValue}M</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground mb-1">Avg Coupon</p>
          <p className="text-2xl font-bold text-foreground">{metrics.avgCoupon.toFixed(2)}%</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
          <p className="text-2xl font-bold text-foreground">{metrics.avgDuration.toFixed(1)}y</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground mb-1">Avg Spread</p>
          <p className="text-2xl font-bold text-foreground">{metrics.avgSpreadBps.toFixed(0)}bp</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bond List */}
        <Card className="p-4 border-border lg:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Portfolio</h2>
          <div className="space-y-2">
            {bonds.map((bond) => {
              const mtp = mtmPrices[bond.id];
              return (
                <button
                  key={bond.id}
                  onClick={() => setSelectedBond(bond.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedBond === bond.id
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-border hover:border-border/80 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{bond.cusip}</p>
                      <p className="text-xs text-muted-foreground">{bond.issuer}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {bond.rating}
                    </Badge>
                  </div>
                  {mtp && (
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-mono font-bold ${getPriceColor(mtp.cleanPrice)}`}>
                        {mtp.cleanPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">{bond.coupon}%</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Detail View */}
        <div className="lg:col-span-2 space-y-4">
          {selectedBondData && selectedMTM && (
            <>
              {/* MTM Ticker */}
              <Card className="p-6 border-cyan-500/30 bg-cyan-500/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Clean Price</p>
                    <p className={`text-3xl font-bold font-mono ${getPriceColor(selectedMTM.cleanPrice)}`}>
                      {selectedMTM.cleanPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">YTM</p>
                    <p className="text-3xl font-bold font-mono text-amber-400">
                      {selectedMTM.ytm.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Spread</p>
                    <p className="text-3xl font-bold font-mono text-red-400">
                      {selectedMTM.spreadTreasuryBps.toFixed(0)}bp
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Duration</p>
                    <p className="text-3xl font-bold font-mono text-blue-400">
                      {selectedMTM.duration.toFixed(1)}y
                    </p>
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="book">Investor Book</TabsTrigger>
                  <TabsTrigger value="mechanics">Call/Put</TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-4">
                  <Card className="p-4 border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Recent Orders</h3>
                    <div className="space-y-2">
                      {selectedOrders.length > 0 ? (
                        selectedOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className={
                                    order.side === 'buy'
                                      ? 'bg-emerald-500/20 text-emerald-700'
                                      : 'bg-red-500/20 text-red-700'
                                  }
                                >
                                  {order.side.toUpperCase()}
                                </Badge>
                                <span className="text-sm font-semibold text-foreground">
                                  {order.quantity}M @ {order.price.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {order.investor} • {order.status}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent orders
                        </p>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Investor Book Tab */}
                <TabsContent value="book" className="mt-4">
                  <Card className="p-4 border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Investor Allocations</h3>
                    {selectedBook ? (
                      <div className="space-y-3">
                        {selectedBook.investors.map((inv, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">
                                {inv.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  inv.status === 'allocated'
                                    ? 'bg-emerald-500/20 text-emerald-700'
                                    : 'bg-yellow-500/20 text-yellow-700'
                                }
                              >
                                {inv.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                ${inv.allocation}M ({inv.percentage}%)
                              </span>
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500"
                                  style={{ width: `${inv.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-foreground">
                              Total Allocated
                            </span>
                            <span className="font-bold text-emerald-400">
                              ${selectedBook.totalAllocated}M
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-foreground">
                              Total Indicated
                            </span>
                            <span className="font-bold text-yellow-400">
                              ${selectedBook.totalIndicated}M
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No investor book data
                      </p>
                    )}
                  </Card>
                </TabsContent>

                {/* Call/Put Tab */}
                <TabsContent value="mechanics" className="mt-4">
                  <Card className="p-4 border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Call/Put Schedule
                    </h3>
                    {selectedBondData.callSchedule || selectedBondData.putSchedule ? (
                      <div className="space-y-4">
                        {selectedBondData.callSchedule && (
                          <div>
                            <h4 className="text-xs font-semibold text-amber-400 mb-2">
                              CALL SCHEDULE
                            </h4>
                            <div className="space-y-2">
                              {selectedBondData.callSchedule.map((call, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded bg-muted/30"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {call.date.toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {call.optionality.toUpperCase()} CALL
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-amber-400">
                                      {call.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedBondData.putSchedule && (
                          <div>
                            <h4 className="text-xs font-semibold text-emerald-400 mb-2">
                              PUT SCHEDULE
                            </h4>
                            <div className="space-y-2">
                              {selectedBondData.putSchedule.map((put, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded bg-muted/30"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {put.date.toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      PUT OPTION
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-400">
                                      {put.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No call/put schedule
                      </p>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

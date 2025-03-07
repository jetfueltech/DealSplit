"use client";

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DateFilterDialog } from "./date-filter-dialog";
import { DarkModeContext } from "../../layout";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { usePayouts } from "@/lib/hooks";
import { Payout } from "@/lib/storage";

type FinancialData = {
  totalPayouts: number;
  totalFeesPaid: number;
  totalManagementFees: number;
  totalNetReceived: number;
  payoutDetails: Payout[];
};

export default function Dashboard() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [showPayoutDetails, setShowPayoutDetails] = useState(false);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [showManagementDetails, setShowManagementDetails] = useState(false);
  const [showNetDetails, setShowNetDetails] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ from: Date; to: Date } | undefined>();
  const { payouts } = usePayouts();
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalPayouts: 0,
    totalFeesPaid: 0,
    totalManagementFees: 0,
    totalNetReceived: 0,
    payoutDetails: [],
    clientTotals: {},
    feeTotals: {},
    clientNetTotals: {},
    managementFeeTotals: {},
  });

  const toggleDetails = (type: 'payouts' | 'fees' | 'management' | 'net') => {
    if (type === 'payouts') setShowPayoutDetails(!showPayoutDetails);
    if (type === 'fees') setShowFeeDetails(!showFeeDetails);
    if (type === 'management') setShowManagementDetails(!showManagementDetails);
    if (type === 'net') setShowNetDetails(!showNetDetails);
  };

  const handleDateFilter = (range: { from: Date; to: Date } | undefined) => {
    setDateFilter(range);
  };

  const filterPayoutsByDate = (payouts: Payout[]) => {
    if (!dateFilter?.from || !dateFilter?.to) return payouts;
    
    return payouts.filter(payout => {
      const payoutDate = parseISO(payout.dateCreated);
      return isWithinInterval(payoutDate, { start: dateFilter.from, end: dateFilter.to });
    });
  };

  useEffect(() => {
    const calculateTotals = (payouts: PayoutDetails[]) => {
      const totalPayouts = payouts.reduce((sum, payout) => sum + payout.totalAmount, 0);
      
      // Calculate management fee totals by client
      const managementFeeTotals = payouts.reduce((acc, payout) => {
        const managementFee = payout.fees.find(fee => fee.name === "Management Fee")?.amount || 0;
        payout.clients.forEach(client => {
          acc[client] = (acc[client] || 0) + managementFee;
        });
        return acc;
      }, {} as Record<string, number>);

      // Calculate fee totals by type
      const feeTotals = payouts.reduce((acc, payout) => {
        payout.fees.forEach(fee => {
          acc[fee.name] = (acc[fee.name] || 0) + fee.amount;
        });
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate client totals
      const clientTotals = payouts.reduce((acc, payout) => {
        payout.clients.forEach((client, index) => {
          acc[client] = (acc[client] || 0) + payout.totalAmount;
        });
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate net received by client
      const clientNetTotals = payouts.reduce((acc, payout) => {
        payout.clients.forEach((client, index) => {
          acc[client] = (acc[client] || 0) + payout.finalPayout;
        });
        return acc;
      }, {} as Record<string, number>);
      const totalFees = payouts.reduce((sum, payout) => {
        return sum + payout.fees.reduce((feeSum, fee) => feeSum + fee.amount, 0);
      }, 0);

      return {
        totalPayouts,
        totalFeesPaid: Object.values(feeTotals).reduce((sum, amount) => sum + amount, 0),
        totalNetReceived: Object.values(clientNetTotals).reduce((sum, amount) => sum + amount, 0),
        totalManagementFees: Object.values(managementFeeTotals).reduce((sum, amount) => sum + amount, 0),
        payoutDetails: payouts,
        feeTotals,
        clientTotals,
        clientNetTotals,
        managementFeeTotals,
      };
    };

    const filteredPayouts = filterPayoutsByDate(payouts);
    setFinancialData(calculateTotals(filteredPayouts));
  }, [dateFilter, payouts]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "dark bg-black" : "bg-white"}`}>
      <div className="mx-auto max-w-screen-xl px-4 py-12">
        {/* Minimal Header */}
        <header className="mb-16 flex items-center justify-between">
          <div className="text-xs font-light tracking-widest text-gray-400">DEAL SPLIT TRACKER</div>
          <button
            onClick={toggleDarkMode}
            className={`h-6 w-6 rounded-full ${isDarkMode ? "bg-white" : "bg-black"}`}
            aria-label="Toggle dark mode"
          />
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 gap-24 md:grid-cols-2">
          {/* Financial Data Section */}
          <section>
            <div className="space-y-16">
              {/* Financial Metrics */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-12">
                {/* Date Filter */}
                <div className="flex items-center space-x-4">
                  <DateFilterDialog onDateChange={handleDateFilter} isDarkMode={isDarkMode} />
                </div>

                {/* Total Payouts */}
                <div className="relative">
                  <button
                    onClick={() => toggleDetails('payouts')}
                    className="w-full text-left"
                  >
                  <p
                    className={`mb-1 text-xs font-light tracking-widest ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    TOTAL RECEIVED
                  </p>
                  <div className="flex items-center justify-between">
                    <p className={`font-mono text-5xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>
                      ${financialData.totalPayouts.toLocaleString()}
                    </p>
                    {showPayoutDetails ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
                  </button>
                  
                  {showPayoutDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {Object.entries(financialData.clientTotals).map(([client, amount]) => (
                        <div
                          key={client}
                          className={`flex justify-between py-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          <div>
                            <p className="font-light">{client}</p>
                          </div>
                          <p className="font-mono">${amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Total Fees */}
                <div className="relative">
                  <button
                    onClick={() => toggleDetails('fees')}
                    className="w-full text-left"
                  >
                  <p
                    className={`mb-1 text-xs font-light tracking-widest ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    TOTAL FEES PAID
                  </p>
                  <div className="flex items-center justify-between">
                    <p className={`font-mono text-5xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>
                      ${financialData.totalFeesPaid.toLocaleString()}
                    </p>
                    {showFeeDetails ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
                  </button>

                  {showFeeDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {Object.entries(financialData.feeTotals).map(([feeName, amount]) => (
                        <div
                          key={feeName}
                          className={`flex justify-between py-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          <div>
                            <p className="font-light">{feeName}</p>
                          </div>
                          <p className="font-mono">${amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Management Fees */}
                <div className="relative">
                  <button
                    onClick={() => toggleDetails('management')}
                    className="w-full text-left"
                  >
                  <p
                    className={`mb-1 text-xs font-light tracking-widest ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    TOTAL MANAGEMENT FEES
                  </p>
                  <div className="flex items-center justify-between">
                    <p className={`font-mono text-5xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>
                      ${financialData.totalManagementFees.toLocaleString()}
                    </p>
                    {showManagementDetails ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
                  </button>

                  {showManagementDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {Object.entries(financialData.managementFeeTotals).map(([client, amount]) => (
                        <div
                          key={client}
                          className={`flex justify-between py-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          <div>
                            <p className="font-light">{client}</p>
                          </div>
                          <p className="font-mono">${amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Net Received */}
                <div className="relative">
                  <button
                    onClick={() => toggleDetails('net')}
                    className="w-full text-left"
                  >
                  <p
                    className={`mb-1 text-xs font-light tracking-widest ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    TOTAL PAYOUTS
                  </p>
                  <div className="flex items-center justify-between">
                    <p className={`font-mono text-5xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>
                      ${financialData.totalNetReceived.toLocaleString()}
                    </p>
                    {showNetDetails ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
                  </button>

                  {showNetDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {Object.entries(financialData.clientNetTotals).map(([client, amount]) => (
                        <div
                          key={client}
                          className={`flex justify-between py-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          <div>
                            <p className="font-light">{client}</p>
                          </div>
                          <p className="font-mono">${amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Actions Section */}
          <section className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <button
                onClick={() => router.push("/new-payout")}
                className={`group w-full border-b ${isDarkMode ? "border-gray-800 text-white" : "border-gray-200 text-black"} pb-4 text-left text-lg font-light transition-all duration-300 hover:pb-6`}
              >
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                  New Payout
                </span>
              </button>

              <button
                onClick={() => router.push("/payout-log")}
                className={`group w-full border-b ${isDarkMode ? "border-gray-800 text-white" : "border-gray-200 text-black"} pb-4 text-left text-lg font-light transition-all duration-300 hover:pb-6`}
              >
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                  View Payout Log
                </span>
              </button>

              <button
                onClick={() => router.push("/clients")}
                className={`group w-full border-b ${isDarkMode ? "border-gray-800 text-white" : "border-gray-200 text-black"} pb-4 text-left text-lg font-light transition-all duration-300 hover:pb-6`}
              >
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                  Manage Clients
                </span>
              </button>

              <button
                onClick={() => router.push("/developers")}
                className={`group w-full border-b ${isDarkMode ? "border-gray-800 text-white" : "border-gray-200 text-black"} pb-4 text-left text-lg font-light transition-all duration-300 hover:pb-6`}
              >
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                  Manage Developers
                </span>
              </button>

              <button
                className={`group w-full border-b ${isDarkMode ? "border-gray-800 text-white" : "border-gray-200 text-black"} pb-4 text-left text-lg font-light transition-all duration-300 hover:pb-6`}
              >
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                  AI Agent // JAI
                </span>
              </button>
            </motion.div>
          </section>
        </main>
      </div>
    </div>
  );
}
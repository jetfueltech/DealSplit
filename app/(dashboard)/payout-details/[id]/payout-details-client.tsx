"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DarkModeContext } from "../../../layout";

type TimelineEvent = {
  status: "Not Paid" | "Pending" | "Payment Complete";
  timestamp: string;
};

type Payout = {
  id: string;
  developer: string;
  totalAmount: number;
  status: "Not Paid" | "Pending" | "Payment Complete";
  dateCreated: string;
  clients: string[];
  projects: string[];
  timeline: TimelineEvent[];
  fees: { name: string; amount: number }[];
  finalPayout: number;
};

interface PayoutDetailsClientProps {
  initialPayout: Payout;
}

export default function PayoutDetailsClient({ initialPayout }: PayoutDetailsClientProps) {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [payout, setPayout] = useState<Payout>(initialPayout);

  const updateStatus = (newStatus: "Not Paid" | "Pending" | "Payment Complete") => {
    const updatedPayout = {
      ...payout,
      status: newStatus,
      timeline: [...payout.timeline, { status: newStatus, timestamp: new Date().toISOString() }],
    };
    setPayout(updatedPayout);
    // Here you would normally update the backend as well
  };

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
        <main>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            <h1 className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Payout Details</h1>

            <div className={`space-y-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              <p>Developer: {payout.developer}</p>
              <p>Total Amount: ${payout.totalAmount.toFixed(2)}</p>
              <p>Status: {payout.status}</p>
              <p>Date Created: {payout.dateCreated}</p>
              <p>Clients: {payout.clients.join(", ")}</p>
              <p>Projects: {payout.projects.join(", ")}</p>
            </div>

            <div className="space-y-4">
              <h2 className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Fee Breakdown</h2>
              {payout.fees.map((fee, index) => (
                <div key={index} className={`flex justify-between ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span>{fee.name}</span>
                  <span>${fee.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className={`flex justify-between text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>
                <span>Final Payout</span>
                <span>${payout.finalPayout.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Status Timeline</h2>
              {payout.timeline.map((event, index) => (
                <div key={index} className={`flex justify-between ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span>{event.status}</span>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-x-4">
              {payout.status !== "Payment Complete" && (
                <>
                  {payout.status === "Not Paid" && (
                    <button
                      onClick={() => updateStatus("Pending")}
                      className={`border-b ${isDarkMode ? "border-white text-white" : "border-black text-black"} p-2 text-center text-sm font-light transition-all duration-300 hover:bg-opacity-10 ${isDarkMode ? "hover:bg-white" : "hover:bg-black"}`}
                    >
                      Mark as Pending
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus("Payment Complete")}
                    className={`border-b ${isDarkMode ? "border-white text-white" : "border-black text-black"} p-2 text-center text-sm font-light transition-all duration-300 hover:bg-opacity-10 ${isDarkMode ? "hover:bg-white" : "hover:bg-black"}`}
                  >
                    Mark as Paid
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </main>

        {/* Back to Payout Log Button */}
        <footer className="mt-12">
          <button
            onClick={() => router.push("/payout-log")}
            className={`group flex items-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <span className="mr-2 inline-block transition-transform duration-300 group-hover:-translate-x-2">←</span>
            <span className="text-sm font-light">Back to Payout Log</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
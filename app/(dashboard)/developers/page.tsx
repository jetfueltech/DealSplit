"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DarkModeContext } from "../../layout";
import { useDevelopers } from "@/lib/hooks";
import { Archive, Plus } from "lucide-react";

import { Developer } from "@/lib/storage";

export default function Developers() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [developers, updateDevelopers] = useDevelopers();
  const [newDeveloper, setNewDeveloper] = useState({ name: "", email: "" });

  const addDeveloper = () => {
    if (newDeveloper.name.trim() && newDeveloper.email.trim()) {
      updateDevelopers([
        ...developers,
        {
          id: Date.now().toString(),
          name: newDeveloper.name,
          email: newDeveloper.email,
          isArchived: false,
        },
      ]);
      setNewDeveloper({ name: "", email: "" });
    }
  };

  const toggleArchiveDeveloper = (developerId: string) => {
    updateDevelopers(
      developers.map((developer) =>
        developer.id === developerId
          ? {
              ...developer,
              isArchived: !developer.isArchived,
            }
          : developer
      )
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "dark bg-black" : "bg-white"}`}>
      <div className="mx-auto max-w-screen-xl px-4 py-12">
        {/* Header */}
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
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Developers</h1>
            </div>

            {/* Add Developer Form */}
            <div className="flex items-end space-x-4">
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  value={newDeveloper.name}
                  onChange={(e) => setNewDeveloper({ ...newDeveloper, name: e.target.value })}
                  placeholder="Developer name"
                  className={`w-full bg-transparent p-2 font-light outline-none ${
                    isDarkMode ? "text-white placeholder:text-gray-600" : "text-black placeholder:text-gray-400"
                  }`}
                />
                <input
                  type="email"
                  value={newDeveloper.email}
                  onChange={(e) => setNewDeveloper({ ...newDeveloper, email: e.target.value })}
                  placeholder="Developer email"
                  className={`w-full bg-transparent p-2 font-light outline-none ${
                    isDarkMode ? "text-white placeholder:text-gray-600" : "text-black placeholder:text-gray-400"
                  }`}
                />
              </div>
              <button onClick={addDeveloper}>
                <Plus className={isDarkMode ? "text-white" : "text-black"} />
              </button>
            </div>

            {/* Developers List */}
            <div className="space-y-4">
              {developers.map((developer) => (
                <motion.div
                  key={developer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center justify-between border-b ${
                    isDarkMode ? "border-gray-800" : "border-gray-200"
                  } pb-4 ${developer.isArchived ? "opacity-50" : ""}`}
                >
                  <div className="space-y-1">
                    <h2
                      className={`text-lg font-light ${isDarkMode ? "text-white" : "text-black"} ${
                        developer.isArchived ? "line-through" : ""
                      }`}
                    >
                      {developer.name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{developer.email}</p>
                  </div>
                  <button onClick={() => toggleArchiveDeveloper(developer.id)}>
                    <Archive className={isDarkMode ? "text-white" : "text-black"} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Back Button */}
        <footer className="mt-12">
          <button
            onClick={() => router.push("/dashboard")}
            className={`group flex items-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <span className="mr-2 inline-block transition-transform duration-300 group-hover:-translate-x-2">←</span>
            <span className="text-sm font-light">Back to Dashboard</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
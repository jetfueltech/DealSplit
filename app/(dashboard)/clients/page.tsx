"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DarkModeContext } from "../../layout";
import { useClients } from "@/lib/hooks";
import { Archive, Plus } from "lucide-react";

import { Client } from "@/lib/storage";

export default function Clients() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [clients, updateClients] = useClients();
  const [newClientName, setNewClientName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const addClient = () => {
    if (newClientName.trim()) {
      updateClients([
        ...clients,
        {
          id: Date.now().toString(),
          name: newClientName,
          projects: [],
          isArchived: false,
        },
      ]);
      setNewClientName("");
    }
  };

  const addProject = (clientId: string) => {
    if (newProjectName.trim()) {
      updateClients(
        clients.map((client) =>
          client.id === clientId
            ? {
                ...client,
                projects: [
                  ...client.projects,
                  {
                    id: Date.now().toString(),
                    name: newProjectName,
                    status: "incomplete",
                    isArchived: false,
                  },
                ],
              }
            : client
        )
      );
      setNewProjectName("");
      setSelectedClient(null);
    }
  };

  const toggleArchiveClient = (clientId: string) => {
    updateClients(
      clients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              isArchived: !client.isArchived,
            }
          : client
      )
    );
  };

  const toggleArchiveProject = (clientId: string, projectId: string) => {
    updateClients(
      clients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              projects: client.projects.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      isArchived: !project.isArchived,
                    }
                  : project
              ),
            }
          : client
      )
    );
  };

  const updateProjectStatus = (clientId: string, projectId: string) => {
    updateClients(
      clients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              projects: client.projects.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      status: project.status === "incomplete" ? "complete" : project.status === "complete" ? "archived" : "incomplete",
                      isArchived: project.status === "complete",
                    }
                  : project
              ),
            }
          : client
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
            className="space-y-16"
          >
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Clients</h1>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addClient()}
                  placeholder="New client name"
                  className={`bg-transparent p-2 font-light outline-none ${
                    isDarkMode ? "text-white placeholder:text-gray-600" : "text-black placeholder:text-gray-400"
                  }`}
                />
                <button onClick={addClient}>
                  <Plus className={isDarkMode ? "text-white" : "text-black"} />
                </button>
              </div>
            </div>

            {/* Active Clients */}
            <div className="space-y-8">
              <h2 className={`text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Active Clients</h2>
              {clients.filter(client => !client.isArchived).map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2
                      className={`text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      {client.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                      {selectedClient === client.id ? (
                        <>
                          <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addProject(client.id)}
                            placeholder="New project name"
                            className={`bg-transparent p-2 font-light outline-none ${
                              isDarkMode ? "text-white placeholder:text-gray-600" : "text-black placeholder:text-gray-400"
                            }`}
                            autoFocus
                          />
                          <button onClick={() => addProject(client.id)}>
                            <Plus className={isDarkMode ? "text-white" : "text-black"} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setSelectedClient(client.id)}>
                          <Plus className={isDarkMode ? "text-white" : "text-black"} />
                        </button>
                      )}
                      <button onClick={() => toggleArchiveClient(client.id)}>
                        <Archive className={isDarkMode ? "text-white" : "text-black"} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pl-4">
                    {client.projects.filter(project => !project.isArchived).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between"
                      >
                        <p
                          className={`font-light ${isDarkMode ? "text-gray-300" : "text-gray-700"} ${
                            project.status === "complete"
                              ? "line-through decoration-green-500"
                              : ""
                          }`}
                        >
                          {project.name}
                        </p>
                        <button
                          onClick={() => updateProjectStatus(client.id, project.id)}
                          className={`text-sm font-light ${
                            project.status === "complete"
                              ? "text-green-500"
                              : project.status === "archived"
                              ? isDarkMode
                                ? "text-gray-400"
                                : "text-gray-600"
                              : isDarkMode
                              ? "text-white"
                              : "text-black"
                          }`}
                        >
                          {project.status === "complete"
                            ? "Complete"
                            : project.status === "archived"
                            ? "Archived"
                            : "Mark Complete"}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Archived Clients */}
            <div className="space-y-8">
              <h2 className={`text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Archived</h2>
              {clients.filter(client => client.isArchived).map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <h2
                      className={`text-xl font-light line-through ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      {client.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <button onClick={() => toggleArchiveClient(client.id)}>
                        <Archive className={isDarkMode ? "text-white" : "text-black"} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pl-4">
                    {client.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between opacity-50"
                      >
                        <p
                          className={`font-light line-through ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {project.name}
                        </p>
                        <button
                          onClick={() => toggleArchiveProject(client.id, project.id)}
                          className={`text-sm font-light ${
                            isDarkMode
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Archived
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
              {clients.filter(client => client.isArchived).length === 0 && (
                <p className={`text-sm font-light ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  No archived clients
                </p>
              )}
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
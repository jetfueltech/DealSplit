"use client";

import { useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useClients, useDevelopers, usePayouts, useCustomFees } from "@/lib/hooks";
import { DarkModeContext } from "../../layout";
import { ChevronDown, ChevronUp, Plus, X, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectSeparator } from "@/components/ui/select";

type Project = {
  clientId: string;
  projectId: string;
  amount: string;
};

import { Client, Developer } from "@/lib/storage";

type Fee = {
  name: string;
  value: number;
  type: "percentage" | "fixed";
  id?: string;
  isDefault?: boolean;
};

const defaultFees: Fee[] = [
  { id: "platform-fee", name: "Platform Fee", value: 10, type: "percentage", isDefault: true },
  { id: "management-fee", name: "Management Fee", value: 15, type: "percentage", isDefault: true },
  { id: "payment-fee", name: "Payment Fee", value: 2.9, type: "percentage", isDefault: true },
];

export default function NewPayout() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState("");
  const [projects, setProjects] = useState<Project[]>([{ clientId: "", projectId: "", amount: "" }]);
  const [selectedFees, setSelectedFees] = useState<Fee[]>(defaultFees);
  const [clients, updateClients] = useClients();
  const [developers, updateDevelopers] = useDevelopers();
  const { addPayout } = usePayouts();
  const { customFees, addCustomFee, deleteCustomFee } = useCustomFees();

  // New state for form inputs
  const [newDeveloper, setNewDeveloper] = useState({ name: "", email: "" });
  const [newClient, setNewClient] = useState({ name: "" });
  const [newProject, setNewProject] = useState({ name: "", clientId: "" });

  // Dialog open states
  const [isDeveloperDialogOpen, setIsDeveloperDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSelectFeeDialogOpen, setIsSelectFeeDialogOpen] = useState(false);
  const [newFee, setNewFee] = useState({ name: "", value: "", type: "percentage" });

  const handleAddDeveloper = () => {
    if (newDeveloper.name && newDeveloper.email) {
      const developer = {
        id: Date.now().toString(),
        name: newDeveloper.name,
        email: newDeveloper.email,
      };
      updateDevelopers([...developers, developer]);
      setNewDeveloper({ name: "", email: "" });
      setIsDeveloperDialogOpen(false);
    }
  };

  const handleAddClient = () => {
    if (newClient.name) {
      const client = {
        id: Date.now().toString(),
        name: newClient.name,
        projects: [],
      };
      updateClients([...clients, client]);
      setNewClient({ name: "" });
      setIsClientDialogOpen(false);
    }
  };

  const handleAddProject = () => {
    if (newProject.name && newProject.clientId) {
      updateClients(clients.map(client => {
        if (client.id === newProject.clientId) {
          return {
            ...client,
            projects: [...client.projects, {
              id: Date.now().toString(),
              name: newProject.name,
              status: "incomplete"
            }]
          };
        }
        return client;
      }));
      setNewProject({ name: "", clientId: "" });
      setIsProjectDialogOpen(false);
    }
  };

  const handleAddFee = () => {
    if (newFee.name && newFee.value) {
      const fee = {
        name: newFee.name,
        value: Number(newFee.value),
        type: newFee.type as "percentage" | "fixed"
      };
      
      addCustomFee(fee);
      setNewFee({ name: "", value: "", type: "percentage" });
      setIsFeeDialogOpen(false);
    }
  };

  const handleSelectFee = (fee: Fee) => {
    if (!selectedFees.find(f => f.name === fee.name)) {
      setSelectedFees([...selectedFees, fee]);
    }
  };

  const handleRemoveFee = (feeName: string) => {
    setSelectedFees(selectedFees.filter(fee => fee.name !== feeName));
  };

  const handleDeleteFee = (feeId: string) => {
    deleteCustomFee(feeId);
    setSelectedFees(prev => prev.filter(fee => !customFees.find(cf => cf.id === feeId)));
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || "";
  };

  const getProjectName = (clientId: string, projectId: string) => {
    return clients.find(c => c.id === clientId)?.projects.find(p => p.id === projectId)?.name || "";
  };

  const getAvailableProjects = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.projects || [];
  };

  const [calculatedFees, setCalculatedFees] = useState({
    totalPayment: 0,
    feeBreakdown: [] as { name: string; amount: number }[],
    totalFees: 0,
    finalPayout: 0,
  });

  const addProject = () => {
    setProjects([...projects, { client: "", project: "", amount: "" }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    if (field === "clientId") {
      // Reset project when client changes
      const updatedProjects = [...projects];
      updatedProjects[index] = { ...updatedProjects[index], clientId: value, projectId: "", amount: "" };
      setProjects(updatedProjects);
      return;
    }

    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  const updateFee = (index: number, field: keyof Fee, value: string | number) => {
    const updatedFees = [...selectedFees];
    updatedFees[index] = { ...updatedFees[index], [field]: field === "value" ? Number(value) : value };
    setSelectedFees(updatedFees);
  };

  const toggleFeeType = (index: number) => {
    const updatedFees = [...selectedFees];
    const fee = updatedFees[index];
    fee.type = fee.type === "percentage" ? "fixed" : "percentage";
    setSelectedFees(updatedFees);
  };

  const calculateFees = () => {
    const totalPayment = projects.reduce((sum, project) => sum + (Number.parseFloat(project.amount) || 0), 0);
    let remainingAmount = totalPayment;
    const feeBreakdown = [];

    for (const fee of selectedFees) {
      const feeAmount =
        fee.type === "percentage"
          ? (fee.name === "Payment Fee" ? remainingAmount : totalPayment) * (fee.value / 100)
          : fee.value;
      feeBreakdown.push({ name: fee.name, amount: feeAmount });
      if (fee.name === "Payment Fee") {
        remainingAmount -= feeAmount;
      }
    }

    const totalFees = feeBreakdown.reduce((sum, fee) => sum + fee.amount, 0);
    const finalPayout = totalPayment - totalFees;

    return {
      totalPayment,
      feeBreakdown,
      totalFees,
      finalPayout,
    };
  };

  useEffect(() => {
    const calculated = calculateFees();
    setCalculatedFees(calculated);
  }, [projects, selectedFees]);

  const handleSaveClick = () => {
    const selectedDeveloper = developers.find(dev => dev.id === selectedDeveloperId);
    if (!selectedDeveloper) {
      toast.error("Please select a developer");
      return;
    }

    const validProjects = projects.filter(p => p.clientId && p.projectId && p.amount);
    if (validProjects.length === 0) {
      toast.error("Please add at least one valid project");
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const savePayout = () => {
    const selectedDeveloper = developers.find(dev => dev.id === selectedDeveloperId);
    const validProjects = projects.filter(p => p.clientId && p.projectId && p.amount);

    const payout = {
      id: Date.now().toString(),
      developer: selectedDeveloper.name,
      totalAmount: calculatedFees.totalPayment,
      status: "Not Paid" as const,
      dateCreated: new Date().toISOString(),
      clients: validProjects.map(p => getClientName(p.clientId)),
      projects: validProjects.map(p => getProjectName(p.clientId, p.projectId)),
      fees: calculatedFees.feeBreakdown,
      finalPayout: calculatedFees.finalPayout,
    };

    addPayout(payout);
    toast.success("Payout has been saved successfully");
    router.push("/payout-log");
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
            <h1 className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>New Payout</h1>

            {/* Developer Field */}
            <div>
              <label
                htmlFor="developer"
                className={`mb-2 block text-xs font-light tracking-widest ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                DEVELOPER
              </label>
              <Select
                value={selectedDeveloperId}
                onValueChange={setSelectedDeveloperId}
              >
                <SelectTrigger className={`w-full border-b bg-transparent p-2 font-light ${
                  isDarkMode ? "border-gray-700 text-white hover:bg-gray-900" : "border-gray-300 text-black hover:bg-gray-50"
                }`}>
                  <SelectValue placeholder="Select Developer" />
                </SelectTrigger>
                <SelectContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsDeveloperDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Developer
                  </Button>
                  {developers.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Table */}
            <div>
              <h2 className={`mb-4 text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Projects</h2>
              {projects.map((project, index) => (
                <div key={index} className="mb-4 grid grid-cols-3 gap-4">
                  <Select
                    value={project.clientId}
                    onValueChange={(value) => updateProject(index, "clientId", value)}
                  >
                    <SelectTrigger className={`border-b bg-transparent p-2 font-light ${
                      isDarkMode ? "border-gray-700 text-white hover:bg-gray-900" : "border-gray-300 text-black hover:bg-gray-50"
                    }`}>
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsClientDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Client
                      </Button>
                      {clients.filter(client => !client.isArchived).map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={project.projectId}
                    onValueChange={(value) => updateProject(index, "projectId", value)}
                    disabled={!project.clientId}
                  >
                    <SelectTrigger className={`border-b bg-transparent p-2 font-light ${
                      isDarkMode ? "border-gray-700 text-white hover:bg-gray-900" : "border-gray-300 text-black hover:bg-gray-50"
                    } ${!project.clientId ? "opacity-50" : ""}`}>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setNewProject({ ...newProject, clientId: project.clientId });
                          setIsProjectDialogOpen(true);
                        }}
                        disabled={!project.clientId}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Project
                      </Button>
                      {getAvailableProjects(project.clientId)
                        .filter(proj => !proj.isArchived)
                        .map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <span className={`absolute left-2 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={project.amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericValue = value.replace(/[^0-9]/g, '');
                        updateProject(index, "amount", numericValue);
                      }}
                      className={`w-full border-b bg-transparent pl-6 pr-2 py-2 font-light outline-none ${
                        isDarkMode ? "border-gray-700 text-white" : "border-gray-300 text-black"
                      }`}
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addProject}
                className={`mt-4 border-b ${isDarkMode ? "border-gray-700 text-white" : "border-gray-300 text-black"} p-2 text-sm font-light`}
              >
                + Add Project
              </button>
            </div>

            {/* Fees Section */}
            <div className="space-y-4">
              <h2 className={`mb-4 text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Fees</h2>

              <button
                onClick={() => setIsSelectFeeDialogOpen(true)}
                className={`flex items-center gap-2 border-b ${
                  isDarkMode ? "border-gray-700 text-white" : "border-gray-300 text-black"
                } p-2 text-sm font-light`}
              >
                <Plus className="h-4 w-4" />
                Add Fee
              </button>

              <table className="w-full">
                <tbody>
                  {selectedFees.map((fee, index) => (
                    <tr key={fee.id || fee.name} className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
                      <td className={`py-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{fee.name}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-end space-x-4">
                          <input
                            type="number"
                            value={fee.value}
                            onChange={(e) => updateFee(index, "value", e.target.value)}
                            className={`w-24 bg-transparent p-1 text-right font-light outline-none ${
                              isDarkMode ? "border-gray-700 text-white" : "border-gray-300 text-black"
                            }`}
                          />
                          <button
                            onClick={() => toggleFeeType(index)}
                            className={`min-w-[30px] text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {fee.type === "percentage" ? "%" : "$"}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 pl-4 w-10">
                        <button
                          onClick={() => handleRemoveFee(fee.name)}
                          className={`text-sm ${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"}`}
                          title="Remove fee"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Select Fee Dialog */}
            <Dialog open={isSelectFeeDialogOpen} onOpenChange={setIsSelectFeeDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Fee</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSelectFeeDialogOpen(false);
                      setIsFeeDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Fee
                  </Button>
                  
                  {customFees.length > 0 && (
                    <>
                      <SelectSeparator />
                      <div className="space-y-2">
                        {customFees.map((fee) => (
                          <Button
                            key={fee.id}
                            variant="ghost"
                            className="w-full justify-between"
                            onClick={() => {
                              handleSelectFee(fee);
                              setIsSelectFeeDialogOpen(false);
                            }}
                            disabled={selectedFees.some(f => f.name === fee.name)}
                          >
                            <span>{fee.name}</span>
                            <span>({fee.value}{fee.type === "percentage" ? "%" : "$"})</span>
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Fee Calculation Summary */}
            <div className="space-y-4">
              <h2 className={`mb-4 text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>Fee Calculation</h2>

              <div className={`flex justify-between ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <span>Total Payment</span>
                <span>${calculatedFees.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {calculatedFees.feeBreakdown.map((fee, index) => (
                <div key={index} className={`flex justify-between ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span>{fee.name}</span>
                  <span>${fee.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}

              <div
                className={`flex justify-between text-lg font-light ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                <span>Total Fees</span>
                <span>${calculatedFees.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className={`flex justify-between text-xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>
                <span>Final Payout</span>
                <span>${calculatedFees.finalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveClick}
              className={`w-full border-b ${isDarkMode ? "border-white text-white" : "border-black text-black"} p-4 text-center text-lg font-light transition-all duration-300 hover:bg-opacity-10 ${isDarkMode ? "hover:bg-white" : "hover:bg-black"}`}
            >
              Save Payout
            </button>
          </motion.div>
        </main>

        {/* Back to Dashboard Button */}
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

      {/* Add Developer Dialog */}
      <Dialog open={isDeveloperDialogOpen} onOpenChange={setIsDeveloperDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Developer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Developer Name"
              value={newDeveloper.name}
              onChange={(e) => setNewDeveloper({ ...newDeveloper, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Developer Email"
              value={newDeveloper.email}
              onChange={(e) => setNewDeveloper({ ...newDeveloper, email: e.target.value })}
            />
            <Button onClick={handleAddDeveloper}>Add Developer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Client Name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            />
            <Button onClick={handleAddClient}>Add Client</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            />
            <Button onClick={handleAddProject}>Add Project</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Fee Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feeName">Fee Name</Label>
              <Input
                id="feeName"
                placeholder="Fee Name"
                value={newFee.name}
                onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeValue">Fee Value</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="feeValue"
                  type="number"
                  placeholder="Fee Value"
                  value={newFee.value}
                  onChange={(e) => setNewFee({ ...newFee, value: e.target.value })}
                />
                <Button
                  variant="outline"
                  onClick={() => setNewFee({ ...newFee, type: newFee.type === "percentage" ? "fixed" : "percentage" })}
                  className="min-w-[50px]"
                >
                  {newFee.type === "percentage" ? "%" : "$"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFeeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFee}>Add Fee</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Payout Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payout</DialogTitle>
            <DialogDescription>
              Please review the payout details before saving
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Developer</h3>
                <p className="text-sm text-muted-foreground">
                  {developers.find(dev => dev.id === selectedDeveloperId)?.name}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Projects</h3>
                {projects.filter(p => p.clientId && p.projectId && p.amount).map((project, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    <p>{getClientName(project.clientId)} - {getProjectName(project.clientId, project.projectId)}</p>
                    <p className="font-mono">${parseInt(project.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Fee Breakdown</h3>
                {calculatedFees.feeBreakdown.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm text-muted-foreground">
                    <span>{fee.name}</span>
                    <span className="font-mono">${fee.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Summary</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Total Payment</span>
                    <span className="font-mono">${calculatedFees.totalPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Fees</span>
                    <span className="font-mono">${calculatedFees.totalFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Final Payout</span>
                    <span className="font-mono">${calculatedFees.finalPayout.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePayout}>
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
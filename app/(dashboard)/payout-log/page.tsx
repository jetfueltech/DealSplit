"use client";

import { useContext, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DarkModeContext } from "../../layout";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronDown, LayoutList, Columns } from "lucide-react";
import { format } from "date-fns";
import { usePayouts } from "@/lib/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Payout } from "@/lib/storage";

export default function PayoutLog() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [editingFee, setEditingFee] = useState<{ id: string; amount: string } | null>(null);
  const { payouts, updateStatus, deletePayout } = usePayouts();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [payoutToDelete, setPayoutToDelete] = useState<Payout | null>(null);

  const filteredPayouts = useMemo(() => {
    let filtered = payouts.filter(
      (payout) =>
        (payout.developer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payout.clients.some((client) => client.toLowerCase().includes(searchTerm.toLowerCase())) ||
          payout.projects.some((project) => project.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (statusFilter === "All" || payout.status === statusFilter),
    );
    
    filtered = filtered.sort((a, b) => {
      return sortOrder === "desc" ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount;
    });
    return filtered;
  }, [payouts, searchTerm, statusFilter, sortOrder]);

  const handleStatusUpdate = (payoutId: string, newStatus: Payout["status"]) => {
    updateStatus(payoutId, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Payment Complete":
        return "bg-green-500/10 text-green-500";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "Canceled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const handleViewDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (payout: Payout) => {
    setPayoutToDelete(payout);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (payoutToDelete) {
      deletePayout(payoutToDelete.id);
      setIsDeleteDialogOpen(false);
      setPayoutToDelete(null);
      toast.success("Payout deleted successfully");
    }
  };

  const ListView = () => (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Developer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Clients</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((payout) => (
            <TableRow key={payout.id}>
              <TableCell className="font-medium">{payout.developer}</TableCell>
              <TableCell>{format(new Date(payout.dateCreated), "MMM d, yyyy")}</TableCell>
              <TableCell>{payout.clients.join(", ")}</TableCell>
              <TableCell>{payout.projects.join(", ")}</TableCell>
              <TableCell className="font-mono">${payout.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                <Select
                  value={payout.status}
                  onValueChange={(value: Payout["status"]) => handleStatusUpdate(payout.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      <Badge className={getStatusColor(payout.status)} variant="secondary">
                        {payout.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Paid">Not Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Payment Complete">Payment Complete</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  className="mr-2"
                  size="sm"
                  onClick={() => handleViewDetails(payout)}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteClick(payout)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const KanbanView = () => {
    const columns = ["Not Paid", "Pending", "Payment Complete"];
    
    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-[768px] gap-4">
          {columns.map((column) => (
            <div
              key={column}
              className={`flex-1 rounded-lg border border-border p-4 ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              <h3 className={`mb-4 text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
                {column}
              </h3>
              <div className="space-y-3">
                {payouts
                  .filter((payout) => payout.status === column)
                  .map((payout) => (
                    <motion.div
                      key={payout.id}
                      className={`rounded-lg border border-border p-4 ${
                        isDarkMode ? "bg-black" : "bg-white"
                      }`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
                        {payout.developer}
                      </h4>
                      <span className="font-mono text-sm">
                        ${payout.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {payout.clients.join(", ")}
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-2"
                      >
                        <Select
                          value={payout.status}
                          onValueChange={(value: Payout["status"]) =>
                            handleStatusUpdate(payout.id, value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              <Badge
                                className={getStatusColor(payout.status)}
                                variant="secondary"
                              >
                                {payout.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Paid">Not Paid</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Payment Complete">Payment Complete</SelectItem>
                            <SelectItem value="Canceled">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(payout)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteClick(payout)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
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
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-black"}`}>
                Payout Log
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("list")}
                >
                  <LayoutList className="mr-2 h-4 w-4" />
                  List
                </Button>
                <Button
                  variant={view === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("kanban")}
                >
                  <Columns className="mr-2 h-4 w-4" />
                  Kanban
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search payouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-md border border-input bg-transparent py-2 pl-10 pr-4 text-sm ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Not Paid">Not Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Payment Complete">Payment Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            {view === "list" ? <ListView /> : <KanbanView />}
          </motion.div>
        </main>

        {/* Back Button */}
        <footer className="mt-12">
          <button
            onClick={() => router.push("/dashboard")}
            className={`group flex items-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <span className="mr-2 inline-block transition-transform duration-300 group-hover:-translate-x-2">
              ←
            </span>
            <span className="text-sm font-light">Back to Dashboard</span>
          </button>
        </footer>
      </div>

      {/* Payout Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              Complete breakdown of the payout
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedPayout && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Developer</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayout.developer}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Projects</h3>
                  <div className="space-y-2">
                    {selectedPayout.clients.map((client, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        <p>{client} - {selectedPayout.projects[index]}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Fee Breakdown</h3>
                  {selectedPayout.fees.map((fee, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{fee.name}</span>
                        {fee.name === "Payment Fee" && (
                          <>
                            {editingFee?.id === selectedPayout.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={editingFee.amount}
                                  onChange={(e) => setEditingFee({ ...editingFee, amount: e.target.value })}
                                  className="w-24"
                                  autoFocus
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (editingFee.amount && !isNaN(Number(editingFee.amount))) {
                                      const updatedPayout = {
                                        ...selectedPayout,
                                        fees: selectedPayout.fees.map(f =>
                                          f.name === "Payment Fee" ? { ...f, amount: Number(editingFee.amount) } : f
                                        ),
                                        finalPayout: selectedPayout.totalAmount - (
                                          selectedPayout.fees.reduce((sum, f) => 
                                            f.name === "Payment Fee" ? sum : sum + f.amount, 0
                                          ) + Number(editingFee.amount)
                                        ),
                                      };
                                      updateStatus(selectedPayout.id, selectedPayout.status, updatedPayout);
                                      setSelectedPayout(updatedPayout);
                                      setEditingFee(null);
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingFee(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingFee({ id: selectedPayout.id, amount: fee.amount.toString() })}
                              >
                                Edit
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      <span className="font-mono">${fee.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Summary</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Payment</span>
                      <span className="font-mono">${selectedPayout.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Fees</span>
                      <span className="font-mono">
                        ${(selectedPayout.totalAmount - selectedPayout.finalPayout).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Final Payout</span>
                      <span className="font-mono">${selectedPayout.finalPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payout? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
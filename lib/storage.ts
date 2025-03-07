type PayoutStatus = "Not Paid" | "Pending" | "Payment Complete" | "Canceled";

export interface Payout {
  id: string;
  developer: string;
  totalAmount: number;
  status: PayoutStatus;
  dateCreated: string;
  clients: string[];
  projects: string[];
  fees: { name: string; amount: number }[];
  finalPayout: number;
}

export interface Client {
  id: string;
  name: string;
  projects: { id: string; name: string; status: string }[];
  isArchived?: boolean;
}

export interface Developer {
  id: string;
  name: string;
  email: string;
  isArchived?: boolean;
}

export interface CustomFee {
  id: string;
  name: string;
  value: number;
  type: "percentage" | "fixed";
}

const STORAGE_KEYS = {
  PAYOUTS: 'payouts',
  CLIENTS: 'clients',
  DEVELOPERS: 'developers',
  CUSTOM_FEES: 'custom_fees',
} as const;

export const storage = {
  getPayouts(): Payout[] {
    const data = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
    return data ? JSON.parse(data) : [];
  },

  savePayout(payout: Payout) {
    const payouts = this.getPayouts();
    const updatedPayouts = [...payouts, payout];
    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(updatedPayouts));
    return payout;
  },

  updatePayoutStatus(id: string, status: PayoutStatus, updatedPayout?: Payout) {
    const payouts = this.getPayouts();
    const updatedPayouts = payouts.map(payout =>
      payout.id === id ? (updatedPayout || { ...payout, status }) : payout
    );
    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(updatedPayouts));
  },

  deletePayout(id: string) {
    const payouts = this.getPayouts();
    const updatedPayouts = payouts.filter(payout => payout.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(updatedPayouts));
  },

  getClients(): Client[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },

  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  getDevelopers(): Developer[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEVELOPERS);
    return data ? JSON.parse(data) : [];
  },

  saveDevelopers(developers: Developer[]) {
    localStorage.setItem(STORAGE_KEYS.DEVELOPERS, JSON.stringify(developers));
  },

  getCustomFees(): CustomFee[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_FEES);
    return data ? JSON.parse(data) : [];
  },

  saveCustomFee(fee: Omit<CustomFee, "id">) {
    const fees = this.getCustomFees();
    const newFee = { ...fee, id: Date.now().toString() };
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FEES, JSON.stringify([...fees, newFee]));
    return newFee;
  },

  deleteCustomFee(id: string) {
    const fees = this.getCustomFees();
    const updatedFees = fees.filter(fee => fee.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FEES, JSON.stringify(updatedFees));
  },
};
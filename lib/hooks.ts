import { useEffect, useState } from 'react';
import { storage, Payout, Client, Developer, CustomFee } from './storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    setPayouts(storage.getPayouts());
  }, []);

  const addPayout = (payout: Payout) => {
    const newPayout = storage.savePayout(payout);
    setPayouts(prev => [...prev, newPayout]);
  };

  const updateStatus = (id: string, status: Payout['status'], updatedPayout?: Payout) => {
    storage.updatePayoutStatus(id, status, updatedPayout);
    setPayouts(prev => prev.map(payout =>
      payout.id === id ? (updatedPayout || { ...payout, status }) : payout
    ));
  };

  const deletePayout = (id: string) => {
    storage.deletePayout(id);
    setPayouts(prev => prev.filter(payout => payout.id !== id));
  };

  return { payouts, addPayout, updateStatus, deletePayout };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(storage.getClients());
  }, []);

  const updateClients = (newClients: Client[]) => {
    storage.saveClients(newClients);
    setClients(newClients);
  };

  return [clients, updateClients] as const;
}

export function useDevelopers() {
  const [developers, setDevelopers] = useState<Developer[]>([]);

  useEffect(() => {
    setDevelopers(storage.getDevelopers());
  }, []);

  const updateDevelopers = (newDevelopers: Developer[]) => {
    storage.saveDevelopers(newDevelopers);
    setDevelopers(newDevelopers);
  };

  return [developers, updateDevelopers] as const;
}

export function useCustomFees() {
  const [customFees, setCustomFees] = useState<CustomFee[]>([]);

  useEffect(() => {
    setCustomFees(storage.getCustomFees());
  }, []);

  const addCustomFee = (fee: Omit<CustomFee, "id">) => {
    const newFee = storage.saveCustomFee(fee);
    setCustomFees(prev => [...prev, newFee]);
    return newFee;
  };

  const deleteCustomFee = (id: string) => {
    storage.deleteCustomFee(id);
    setCustomFees(prev => prev.filter(fee => fee.id !== id));
  };

  return { customFees, addCustomFee, deleteCustomFee };
}
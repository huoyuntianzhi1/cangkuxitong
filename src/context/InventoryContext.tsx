import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material, Transaction, TransactionType, InventoryData, SystemLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface InventoryContextType {
  materials: Material[];
  transactions: Transaction[];
  logs: SystemLog[];
  addMaterial: (material: Omit<Material, 'id' | 'currentStock'>, initialStock?: number) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  recordTransaction: (materialId: string, type: TransactionType, quantity: number, remarks: string) => void;
  importData: (data: InventoryData) => void;
  clearData: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dental_clinic_inventory_data';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on initial mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as InventoryData;
        setMaterials(parsed.materials || []);
        setTransactions(parsed.transactions || []);
        setLogs(parsed.logs || []);
      } catch (e) {
        console.error('Failed to parse local storage data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ materials, transactions, logs }));
    }
  }, [materials, transactions, logs, isLoaded]);

  const addLog = (action: string, details: string) => {
    setLogs(prev => [{ id: uuidv4(), timestamp: new Date().toISOString(), action, details }, ...prev]);
  };

  const addMaterial = (material: Omit<Material, 'id' | 'currentStock'>, initialStock: number = 0) => {
    const newId = uuidv4();
    const newMaterial: Material = {
      ...material,
      id: newId,
      currentStock: initialStock, // Starts at initialStock
    };
    setMaterials(prev => [...prev, newMaterial]);

    if (initialStock > 0) {
      const newTransaction: Transaction = {
        id: uuidv4(),
        materialId: newId,
        type: 'IN',
        quantity: initialStock,
        date: new Date().toISOString(),
        unitPriceAtTransaction: material.unitPrice,
        totalCost: initialStock * material.unitPrice,
        remarks: '期初初始库存录入',
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }

    addLog('新增物料', `新增了物料 [${material.name}]，期初库存: ${initialStock} ${material.unit}`);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        addLog('修改物料', `修改了物料信息 [${m.name}] -> ${updates.name || m.name}`);
        return { ...m, ...updates };
      }
      return m;
    }));
  };

  const deleteMaterial = (id: string) => {
    const m = materials.find(x => x.id === id);
    if (m) {
      addLog('删除物料', `删除了物料 [${m.name}]`);
    }
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const recordTransaction = (materialId: string, type: TransactionType, quantity: number, remarks: string) => {
    setMaterials(prevMaterials => {
      let unitPrice = 0;
      let mName = '';
      
      const newMaterials = prevMaterials.map(m => {
        if (m.id === materialId) {
          unitPrice = m.unitPrice;
          mName = m.name;
          const newStock = type === 'IN' ? m.currentStock + quantity : m.currentStock - quantity;
          return { ...m, currentStock: newStock };
        }
        return m;
      });

      const newTransaction: Transaction = {
        id: uuidv4(),
        materialId,
        type,
        quantity,
        date: new Date().toISOString(),
        unitPriceAtTransaction: unitPrice,
        totalCost: quantity * unitPrice,
        remarks,
      };

      setTransactions(prevT => [newTransaction, ...prevT]);
      addLog('库存流转', `[${mName}] ${type === 'IN' ? '入库' : '出库'} ${quantity}，备注: ${remarks}`);

      return newMaterials;
    });
  };

  const importData = (data: InventoryData) => {
    setMaterials(data.materials || []);
    setTransactions(data.transactions || []);
    setLogs(data.logs || []);
    addLog('系统恢复', '执行了本地数据导入恢复操作');
  };

  const clearData = () => {
    if (window.confirm('您确定要清空所有数据吗？此操作不可逆转！')) {
      setMaterials([]);
      setTransactions([]);
      setLogs([]);
      // Log will be cleared, so no need to add log here. Alternatively add one after clearing.
    }
  };

  if (!isLoaded) return null; // Avoid rendering before hydration

  return (
    <InventoryContext.Provider value={{
      materials,
      transactions,
      logs,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      recordTransaction,
      importData,
      clearData
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export type Category = '宣传物料' | '礼品赠品' | '装饰布置' | '办公耗材' | '其他';

export interface Material {
  id: string;
  name: string;
  category: Category | string;
  unit: string;          // 单位，如：个、箱、件
  unitPrice: number;     // 单价
  safeStock: number;     // 安全库存预警线
  currentStock: number;  // 当前库存数量
}

export type TransactionType = 'IN' | 'OUT'; // IN: 入库/采购, OUT: 出库/使用

export interface Transaction {
  id: string;
  materialId: string;
  type: TransactionType;
  quantity: number;
  date: string;           // ISO 8601 string
  unitPriceAtTransaction: number; // 发生操作时的单价，用于快照
  totalCost: number;      // quantity * unitPriceAtTransaction
  remarks: string;        // 备注、使用人或活动名称
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface InventoryData {
  materials: Material[];
  transactions: Transaction[];
  logs?: SystemLog[];
}

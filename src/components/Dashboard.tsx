import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../lib/utils';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { materials, transactions } = useInventory();

  const totalItems = materials.length;
  const totalValue = materials.reduce((acc, m) => acc + (m.currentStock * m.unitPrice), 0);
  
  const lowStockItems = materials.filter(m => m.currentStock <= m.safeStock);

  // Financial summary of the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthInboundCost = thisMonthTransactions
    .filter(t => t.type === 'IN')
    .reduce((acc, t) => acc + t.totalCost, 0);

  const monthOutboundValue = thisMonthTransactions
    .filter(t => t.type === 'OUT')
    .reduce((acc, t) => acc + t.totalCost, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">仪表盘</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-600">总物料种类</h3>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalItems} 个</div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-600">库存总价值</h3>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalValue)}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-600">本月采购成本</h3>
            <ArrowDownToLine className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(monthInboundCost)}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-600">本月使用价值</h3>
            <ArrowUpFromLine className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(monthOutboundValue)}</div>
        </div>
      </div>

      {/* Safety Stock Alerts */}
      <div className="rounded-xl border border-rose-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-rose-50/50 p-4 border-b border-rose-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <h3 className="font-semibold text-rose-800">库存预警 ({lowStockItems.length})</h3>
        </div>
        <div className="p-0">
          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              当前所有物料库存充足。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs tracking-wider text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 border-b">物料名称</th>
                    <th className="px-4 py-3 border-b">分类</th>
                    <th className="px-4 py-3 border-b text-right">安全库存</th>
                    <th className="px-4 py-3 border-b text-right">当前库存</th>
                    <th className="px-4 py-3 border-b text-right">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{item.safeStock} {item.unit}</td>
                      <td className="px-4 py-3 text-right font-semibold text-rose-600">{item.currentStock} {item.unit}</td>
                      <td className="px-4 py-3 text-right">
                        {item.currentStock === 0 ? (
                          <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">已耗尽</span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">库存不足</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { ArrowDownToLine, ArrowUpFromLine, Search } from 'lucide-react';

export default function Transactions() {
  const { transactions, materials } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  const getMaterialName = (id: string) => {
    const m = materials.find(m => m.id === id);
    return m ? m.name : '未知物料 (已删除)';
  };

  const filteredTransactions = transactions.filter(t => {
    const mName = getMaterialName(t.materialId).toLowerCase();
    const remarks = t.remarks.toLowerCase();
    return mName.includes(searchTerm.toLowerCase()) || remarks.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">出入库明细</h2>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="搜索物料名称或备注..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            暂无出入库记录。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs tracking-wider text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 border-b w-40">时间</th>
                  <th className="px-4 py-3 border-b">操作类型</th>
                  <th className="px-4 py-3 border-b">物料名称</th>
                  <th className="px-4 py-3 border-b text-right">数量</th>
                  <th className="px-4 py-3 border-b text-right">单价(时戳)</th>
                  <th className="px-4 py-3 border-b text-right">总成本/价值</th>
                  <th className="px-4 py-3 border-b">备注/活动</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((t) => {
                  const mName = getMaterialName(t.materialId);
                  const isOut = t.type === 'OUT';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {formatDateTime(t.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isOut ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {isOut ? <ArrowUpFromLine className="w-3 h-3" /> : <ArrowDownToLine className="w-3 h-3" />}
                          {isOut ? '出库使用' : '入库采购'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{mName}</td>
                      <td className={`px-4 py-3 text-right font-medium ${isOut ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {isOut ? '-' : '+'}{t.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {formatCurrency(t.unitPriceAtTransaction)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {formatCurrency(t.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {t.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

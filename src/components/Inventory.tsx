import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../lib/utils';
import { Plus, Edit2, Archive, ArrowDownToLine, ArrowUpFromLine, Search } from 'lucide-react';
import { Material, TransactionType } from '../types';

interface MaterialFormData {
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  safeStock: number;
  initialStock: number;
}

const CATEGORIES = ['宣传物料', '礼品赠品', '装饰布置', '办公耗材', '其他'];

export default function Inventory() {
  const { materials, addMaterial, updateMaterial, recordTransaction, deleteMaterial } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'NONE' | 'ADD_EDIT' | 'TRANSACTION'>('NONE');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  // Forms state
  const [materialForm, setMaterialForm] = useState<MaterialFormData>({
    name: '', category: CATEGORIES[0], unit: '个', unitPrice: 0, safeStock: 10, initialStock: 0
  });
  
  // Transaction Form state
  const [txType, setTxType] = useState<TransactionType>('IN');
  const [txQuantity, setTxQuantity] = useState(1);
  const [txRemarks, setTxRemarks] = useState('');

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingMaterial(null);
    setMaterialForm({ name: '', category: CATEGORIES[0], unit: '个', unitPrice: 0, safeStock: 10, initialStock: 0 });
    setActiveModal('ADD_EDIT');
  };

  const openEditModal = (m: Material) => {
    setEditingMaterial(m);
    setMaterialForm({ name: m.name, category: m.category, unit: m.unit, unitPrice: m.unitPrice, safeStock: m.safeStock, initialStock: 0 });
    setActiveModal('ADD_EDIT');
  };

  const openTxModal = (m: Material, type: TransactionType) => {
    setEditingMaterial(m);
    setTxType(type);
    setTxQuantity(1);
    setTxRemarks(type === 'IN' ? '日常采购' : '活动使用');
    setActiveModal('TRANSACTION');
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const { initialStock, ...materialData } = materialForm;
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, materialData);
    } else {
      addMaterial(materialData, initialStock);
    }
    setActiveModal('NONE');
  };

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || txQuantity <= 0) return;
    
    // basic validation
    if (txType === 'OUT' && txQuantity > editingMaterial.currentStock) {
      if (!window.confirm(`当前库存不足 (${editingMaterial.currentStock})，是否继续强制出库造成负库存？`)) {
        return;
      }
    }
    
    recordTransaction(editingMaterial.id, txType, txQuantity, txRemarks);
    setActiveModal('NONE');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">库存物料管理</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="搜索物料名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition"
          >
            <Plus className="h-4 w-4" />
            新增物料
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            暂无物料信息，点击右上角"新增物料"开始录入。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs tracking-wider text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 border-b">物料信息</th>
                  <th className="px-4 py-3 border-b text-right">单价</th>
                  <th className="px-4 py-3 border-b text-right">当前库存</th>
                  <th className="px-4 py-3 border-b text-right">资金占用</th>
                  <th className="px-4 py-3 border-b">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((m) => {
                  const isLowStock = m.currentStock <= m.safeStock;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800 text-base">{m.name}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {m.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                            安全库存: {m.safeStock}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-600">
                        {formatCurrency(m.unitPrice)} / {m.unit}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-base">
                        <span className={isLowStock ? "text-rose-600" : "text-emerald-600"}>
                          {m.currentStock} {m.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-slate-700">
                        {formatCurrency(m.currentStock * m.unitPrice)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            title="入库"
                            onClick={() => openTxModal(m, 'IN')}
                            className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </button>
                          <button
                            title="出库"
                            onClick={() => openTxModal(m, 'OUT')}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
                          >
                            <ArrowUpFromLine className="w-4 h-4" />
                          </button>
                          <button
                            title="编辑"
                            onClick={() => openEditModal(m)}
                            className="p-1.5 text-slate-500 bg-slate-100 rounded hover:bg-slate-200 transition ml-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* ADD/EDIT MATERIAL MODAL */}
            {activeModal === 'ADD_EDIT' && (
              <form onSubmit={handleSaveMaterial}>
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {editingMaterial ? '编辑物料信息' : '新增物料'}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">物料名称</label>
                    <input required type="text" value={materialForm.name} onChange={e => setMaterialForm({...materialForm, name: e.target.value})} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">分类</label>
                      <select value={materialForm.category} onChange={e => setMaterialForm({...materialForm, category: e.target.value})} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">单位 (如:个/件)</label>
                      <input required type="text" value={materialForm.unit} onChange={e => setMaterialForm({...materialForm, unit: e.target.value})} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">采购单价/成本 (元)</label>
                      <input required type="number" step="0.01" min="0" value={materialForm.unitPrice} onChange={e => setMaterialForm({...materialForm, unitPrice: parseFloat(e.target.value) || 0})} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">安全库存</label>
                      <input required type="number" min="0" value={materialForm.safeStock} onChange={e => setMaterialForm({...materialForm, safeStock: parseInt(e.target.value) || 0})} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    </div>
                  </div>
                  {!editingMaterial && (
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <label className="text-sm font-medium text-slate-700">录入期初库存数量 (选填)</label>
                      <p className="text-xs text-slate-500 mb-2">如果您并非从零建立台账，可在此填写当前已有的库存数量。</p>
                      <input type="number" min="0" value={materialForm.initialStock} onChange={e => setMaterialForm({...materialForm, initialStock: parseInt(e.target.value) || 0})} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="例如: 50" />
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                  <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition">取消</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700 transition">保存物料</button>
                </div>
              </form>
            )}

            {/* TRANSACTION MODAL */}
            {activeModal === 'TRANSACTION' && (
              <form onSubmit={handleSaveTx}>
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    {txType === 'IN' ? <ArrowDownToLine className="text-emerald-500 w-5 h-5"/> : <ArrowUpFromLine className="text-blue-500 w-5 h-5"/>}
                    {txType === 'IN' ? '物料入库采购' : '活动物料出库'}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-sm">
                    <div className="text-slate-500 mb-1">目标物料:</div>
                    <div className="font-semibold text-slate-800 text-base">{editingMaterial?.name} <span className="font-normal text-slate-500 ml-2">当前库存: {editingMaterial?.currentStock} {editingMaterial?.unit}</span></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">{txType === 'IN' ? '入库/采购数量' : '使用领出数量'}</label>
                    <div className="relative">
                      <input required type="number" min="1" value={txQuantity} onChange={e => setTxQuantity(parseInt(e.target.value) || 0)} className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-sm">{editingMaterial?.unit}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">备注说明 / 活动名称</label>
                    <input required type="text" value={txRemarks} onChange={e => setTxRemarks(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder={txType === 'IN' ? '例如：双十一采购批次' : '例如：周末正畸引流活动'} />
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">预计产生资金占用核算:</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(txQuantity * (editingMaterial?.unitPrice || 0))}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                  <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition">取消</button>
                  <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded transition ${txType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>确认{txType === 'IN' ? '入库' : '出库'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

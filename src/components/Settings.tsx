import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const { materials, transactions, logs, importData, clearData } = useInventory();
  const [importStr, setImportStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleExport = () => {
    const data = { materials, transactions, logs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `活动物料系统备份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importStr);
      if (Array.isArray(data.materials) && Array.isArray(data.transactions)) {
        importData(data);
        setImportStr('');
        setErrorMsg('');
        alert('数据恢复成功！');
      } else {
        setErrorMsg('JSON 数据格式不正确，缺少 materials 或 transactions 数组。');
      }
    } catch (e) {
      setErrorMsg('非法的 JSON 格式。请检查您的备份文件。');
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">设置与数据备份</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">1. 导出备份 (本地保存)</h3>
        <p className="text-sm text-slate-500">
          此系统的数据仅保存在您的本地浏览器中。为了防止数据丢失，请定期导出并妥善保存备份文件。
        </p>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition"
        >
          <Download className="h-4 w-4" />
          下载备份文件 (.json)
        </button>
      </div>

      <hr className="border-slate-200" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">2. 导入恢复功能</h3>
        <p className="text-sm text-slate-500">
          将之前下载的 .json 备份文件内容用记事本打开，复制粘贴到下方文本框中进行恢复。
          <strong>注意：此操作将覆盖您当前的本地数据。</strong>
        </p>
        
        <textarea
          className="w-full h-48 rounded-md border border-slate-300 p-3 text-sm font-mono text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          placeholder='{"materials": [], "transactions": []}'
          value={importStr}
          onChange={e => setImportStr(e.target.value)}
        />
        {errorMsg && <p className="text-sm text-rose-500 font-medium">{errorMsg}</p>}
        
        <button
          onClick={handleImport}
          disabled={!importStr}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded shadow-sm focus:outline-none transition ${!importStr ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
        >
          <Upload className="h-4 w-4" />
          恢复数据
        </button>
      </div>

      <hr className="border-slate-200" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-rose-600">危险操作</h3>
        <button
          onClick={clearData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-medium rounded hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 transition"
        >
          <Trash2 className="h-4 w-4" />
          清空所有本地数据
        </button>
      </div>
    </div>
  );
}

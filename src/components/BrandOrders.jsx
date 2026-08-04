import React, { useState } from 'react';

export default function BrandOrders({ orders, products, sellers, onConfirmOrder, onShipOrder, onDeliverOrder, onRejectOrder }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  
  // Rejection Form states
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonText, setRejectReasonText] = useState('');

  const pendingOrdersCount = orders.filter(o => o.status === "PENDING").length;

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  const getFriendlyRejectReason = (reason) => {
    if (!reason) return '';
    const reasons = {
      "STOCK_MISMATCH": "สต็อกคลาดเคลื่อน / สินค้าหมด",
      "PRICE_VIOLATION": "ราคาขายปลีกต่ำกว่าราคากลาง",
      "INVALID_ADDRESS": "ที่อยู่ไม่ถูกต้อง",
      "OTHER": "อื่นๆ"
    };
    for (const key in reasons) {
      if (reason.startsWith(key)) {
        return reason.replace(key, reasons[key]);
      }
    }
    return reason;
  };

  const handleOpenRejectModal = (orderId) => {
    setRejectingOrderId(orderId);
    setRejectReason('');
    setRejectReasonText('');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason) return;

    let fullReason = rejectReason;
    if (rejectReason === "OTHER" || rejectReason === "PRICE_VIOLATION") {
      fullReason = `${rejectReason} - ${rejectReasonText}`;
    }

    onRejectOrder(rejectingOrderId, fullReason);
    setRejectingOrderId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-title">รายการสั่งซื้อตัวแทน (Order Verification)</h2>
        <p className="text-text-caption text-sm">ตรวจสอบความถูกต้อง ยืนยันสต็อกสินค้า และดำเนินการจัดส่ง (Sync MyOrder)</p>
      </div>

      {/* Order Sub-Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { key: 'ALL', label: 'ทั้งหมด' },
          { key: 'PENDING', label: 'รอตรวจสอบ', badge: pendingOrdersCount },
          { key: 'CONFIRMED', label: 'ยืนยันแล้ว' },
          { key: 'SHIPPING', label: 'กำลังจัดส่ง' },
          { key: 'DELIVERED', label: 'ส่งสำเร็จ' },
          { key: 'REJECTED', label: 'ปฏิเสธ' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-3xl font-medium text-xs transition-all ${
              activeTab === tab.key
                ? 'bg-brand-primary-subtle border-brand-primary text-brand-primary font-semibold'
                : 'bg-white border-slate-200 text-text-body hover:bg-slate-50'
            }`}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className="bg-status-error-bg text-status-error-text text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-text-title font-semibold">
                <th className="p-4 border-b border-slate-100">เลขที่ใบสั่งซื้อ</th>
                <th className="p-4 border-b border-slate-100">ตัวแทนจำหน่าย</th>
                <th className="p-4 border-b border-slate-100">ชื่อลูกค้า / โทรศัพท์</th>
                <th className="p-4 border-b border-slate-100">รายการสินค้า</th>
                <th className="p-4 border-b border-slate-100">ยอดเก็บปลายทาง (COD)</th>
                <th className="p-4 border-b border-slate-100">สถานะ</th>
                <th className="p-4 border-b border-slate-100">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-10 text-text-caption font-medium">
                    ไม่มีรายการคำสั่งซื้อในสถานะนี้
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => {
                  const product = products.find(p => p.id === o.productId) || { name: 'สินค้าไม่มีในคลัง', image: '' };
                  const seller = sellers.find(s => s.id === o.sellerId) || { name: 'ตัวแทนทั่วไป' };

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-text-title">
                        #{o.id}
                        <span className="block text-[11px] text-text-caption font-normal mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString("th-TH")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-brand-primary">{seller.name}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{o.customerName}</div>
                        <span className="text-xs text-text-caption block mt-0.5">
                          <i className="fa-solid fa-phone text-[10px]"></i> {o.customerPhone}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" alt="" />
                          <div>
                            <div className="font-semibold text-text-title">{product.name}</div>
                            <span className="text-xs text-text-caption block mt-0.5">
                              {o.qty} ชิ้น x {o.sellingPrice.toLocaleString()} THB
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {o.totalAmount.toLocaleString()} THB
                      </td>
                      <td className="p-4">
                        {o.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-warning-bg text-status-warning-text">
                            <i className="fa-solid fa-hourglass-start text-[10px]"></i> รอตรวจสอบ
                          </span>
                        )}
                        {o.status === "CONFIRMED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-brand-secondary">
                            <i className="fa-solid fa-circle-check text-[10px]"></i> ยืนยันสต็อกแล้ว
                          </span>
                        )}
                        {o.status === "SHIPPING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-brand-ai">
                            <i className="fa-solid fa-truck-fast text-[10px]"></i> กำลังจัดส่ง
                          </span>
                        )}
                        {o.status === "DELIVERED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success-text">
                            <i className="fa-solid fa-circle-check text-[10px]"></i> ส่งสำเร็จ
                          </span>
                        )}
                        {o.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-error-bg text-status-error-text" title={o.rejectReason}>
                            <i className="fa-solid fa-circle-xmark text-[10px]"></i> ปฏิเสธแล้ว
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {o.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => onConfirmOrder(o.id)}
                                className="px-3 py-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-3xl shadow-button transition-colors"
                              >
                                <i className="fa-solid fa-check mr-1"></i> ยืนยัน (ตัดสต็อก)
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(o.id)}
                                className="px-3 py-1 border border-status-error-text text-status-error-text hover:bg-status-error-bg text-xs font-semibold rounded-3xl transition-colors"
                              >
                                <i className="fa-solid fa-ban mr-1"></i> ปฏิเสธ
                              </button>
                            </>
                          )}
                          {o.status === "CONFIRMED" && (
                            <button
                              onClick={() => onShipOrder(o.id)}
                              className="px-3 py-1 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-xs font-semibold rounded-3xl shadow-button transition-colors"
                            >
                              <i className="fa-solid fa-truck mr-1"></i> จัดส่งและออกเลขพัสดุ
                            </button>
                          )}
                          {o.status === "SHIPPING" && (
                            <button
                              onClick={() => onDeliverOrder(o.id)}
                              className="px-3 py-1 border border-status-success-text text-status-success-text hover:bg-status-success-bg text-xs font-semibold rounded-3xl transition-colors"
                            >
                              <i className="fa-solid fa-house-chimney-user mr-1"></i> ส่งพัสดุสำเร็จ
                            </button>
                          )}
                          {o.status === "DELIVERED" && (
                            <span className="text-xs text-status-success-text font-medium">
                              เสร็จสมบูรณ์ ({o.trackingNumber})
                            </span>
                          )}
                          {o.status === "REJECTED" && (
                            <span className="text-xs text-status-error-text font-medium max-w-[150px] block truncate" title={getFriendlyRejectReason(o.rejectReason)}>
                              {getFriendlyRejectReason(o.rejectReason)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Rejection Reason */}
      {rejectingOrderId && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[420px] shadow-modal overflow-hidden animate-fade-in">
            <div className="p-5 bg-status-error-bg border-b border-red-100 flex justify-between items-center">
              <h3 className="font-semibold text-status-error-text text-base flex items-center gap-2">
                <i className="fa-solid fa-ban"></i> ปฏิเสธคำสั่งซื้อ #{rejectingOrderId}
              </h3>
              <button 
                onClick={() => setRejectingOrderId(null)} 
                className="text-text-caption hover:bg-slate-100 hover:text-text-title w-8 h-8 rounded-full flex items-center justify-center text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleRejectSubmit}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-status-error-text leading-normal">
                  ระบุเหตุผลในการปฏิเสธการยืนยันออเดอร์นี้ เพื่อแจ้งกลับตัวแทนจำหน่ายในระบบ
                </p>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text-title text-sm">สาเหตุการปฏิเสธ <span className="text-status-error-text">*</span></label>
                  <select 
                    value={rejectReason} 
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary"
                    required
                  >
                    <option value="">-- โปรดเลือกสาเหตุ --</option>
                    <option value="STOCK_MISMATCH">สต็อกคลาดเคลื่อน / สินค้าหมดชั่วคราว</option>
                    <option value="PRICE_VIOLATION">ราคาขายปลีกผิดกฎเงื่อนไขควบคุมของแบรนด์</option>
                    <option value="INVALID_ADDRESS">ที่อยู่จัดส่งและเบอร์ติดต่อไม่ถูกต้อง</option>
                    <option value="OTHER">อื่นๆ (กรุณาระบุ)</option>
                  </select>
                </div>

                {(rejectReason === "OTHER" || rejectReason === "PRICE_VIOLATION") && (
                  <div className="flex flex-col gap-1.5 animate-fade-in">
                    <label className="font-semibold text-text-title text-sm">รายละเอียดเพิ่มเติม</label>
                    <textarea 
                      value={rejectReasonText}
                      onChange={e => setRejectReasonText(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary" 
                      rows="2"
                      placeholder="ระบุเหตุผลโดยย่อ..."
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setRejectingOrderId(null)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-status-error text-white font-semibold rounded-3xl hover:bg-red-600 shadow-button text-sm"
                >
                  ยืนยันการปฏิเสธ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';

export default function BrandOrders({ orders, products, sellers, onConfirmOrder, onShipOrder, onDeliverOrder, onRejectOrder, onApproveClaimReplace, onApproveClaimRefund, onRejectClaim }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  
  // Rejection Form states
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonText, setRejectReasonText] = useState('');

  // Claim Form states
  const [claimRejectOrderId, setClaimRejectOrderId] = useState(null);
  const [claimRejectReason, setClaimRejectReason] = useState('');
  const [claimReplaceOrderId, setClaimReplaceOrderId] = useState(null);
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [claimRefundOrderId, setClaimRefundOrderId] = useState(null);
  const [claimRefundResponsibility, setClaimRefundResponsibility] = useState('brand');

  const pendingOrdersCount = orders.filter(o => o.status === "PENDING").length;

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CLAIMS') return o.status.startsWith('CLAIM_');
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
          { key: 'CLAIMS', label: 'คำขอเคลมสินค้า', badge: orders.filter(o => o.status === 'CLAIM_PENDING').length },
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
                        {o.status === "CLAIM_PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
                            <i className="fa-solid fa-circle-notch text-[10px] animate-spin"></i> ยื่นคำขอเคลม
                          </span>
                        )}
                        {o.status === "CLAIM_APPROVED_REPLACE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            <i className="fa-solid fa-circle-check text-[10px]"></i> เคลมสำเร็จ (ส่งของใหม่)
                          </span>
                        )}
                        {o.status === "CLAIM_APPROVED_REFUND" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            <i className="fa-solid fa-rotate-left text-[10px]"></i> เคลมสำเร็จ (คืนเงินแล้ว)
                          </span>
                        )}
                        {o.status === "CLAIM_REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800" title={o.claimRejectReason}>
                            <i className="fa-solid fa-circle-xmark text-[10px]"></i> ปฏิเสธคำขอเคลม
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
                          {o.status === "CLAIM_PENDING" && (
                            <div className="flex flex-col gap-2">
                              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-text-body space-y-1.5 max-w-[280px]">
                                <div><strong>ประเภท:</strong> {o.claimType === 'WRONG_PRODUCT' ? 'ส่งสินค้าผิด' : o.claimType === 'DAMAGED_PRODUCT' ? 'สินค้าเสียหาย' : 'อื่นๆ'}</div>
                                <div className="leading-normal"><strong>เหตุผล:</strong> {o.claimReason}</div>
                                {o.claimEvidence && (
                                  <a href={o.claimEvidence} target="_blank" rel="noopener noreferrer" className="block text-brand-primary font-semibold hover:underline mt-1">
                                    <i className="fa-solid fa-image text-[10px] mr-1"></i> ดูรูปภาพหลักฐาน
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    setClaimReplaceOrderId(o.id);
                                    setNewTrackingNumber("TH" + Math.floor(100000000 + Math.random() * 900000000) + "RE");
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-3xl transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  <i className="fa-solid fa-truck-ramp-box text-[10px]"></i> อนุมัติส่งของใหม่
                                </button>
                                <button
                                  onClick={() => {
                                    setClaimRefundOrderId(o.id);
                                    setClaimRefundResponsibility('brand');
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold rounded-3xl transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  <i className="fa-solid fa-rotate-left text-[10px]"></i> อนุมัติคืนเงิน
                                </button>
                                <button
                                  onClick={() => {
                                    setClaimRejectOrderId(o.id);
                                    setClaimRejectReason('');
                                  }}
                                  className="px-2.5 py-1 border border-slate-300 hover:bg-slate-50 text-text-body text-[11px] font-semibold rounded-3xl transition-colors"
                                >
                                  ปฏิเสธ
                                </button>
                              </div>
                            </div>
                          )}
                          {o.status === "CLAIM_APPROVED_REPLACE" && (
                            <span className="text-xs text-indigo-600 font-medium">
                              ส่งของทดแทนแล้ว ({o.trackingNumber})
                            </span>
                          )}
                          {o.status === "CLAIM_APPROVED_REFUND" && (
                            <span className="text-xs text-rose-600 font-bold">
                              คืนเงินเสร็จสมบูรณ์
                            </span>
                          )}
                          {o.status === "CLAIM_REJECTED" && (
                            <span className="text-xs text-slate-500 font-medium max-w-[180px] block truncate" title={o.claimRejectReason}>
                              ปฏิเสธเคลม: {o.claimRejectReason}
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

      {/* Modal: Claim Rejection Reason */}
      {claimRejectOrderId && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[420px] shadow-modal overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-text-title text-base flex items-center gap-2">
                <i className="fa-solid fa-ban text-slate-600"></i> ปฏิเสธคำร้องขอเคลมสินค้า #{claimRejectOrderId}
              </h3>
              <button 
                onClick={() => setClaimRejectOrderId(null)} 
                className="text-text-caption hover:bg-slate-200 hover:text-text-title w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!claimRejectReason) return;
              onRejectClaim(claimRejectOrderId, claimRejectReason);
              setClaimRejectOrderId(null);
            }}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="claim-reject-reason-textarea" className="font-semibold text-text-title text-sm">เหตุผลในการปฏิเสธคำขอเคลม <span className="text-status-error-text">*</span></label>
                  <textarea 
                    id="claim-reject-reason-textarea"
                    value={claimRejectReason}
                    onChange={e => setClaimRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-primary" 
                    rows="3"
                    placeholder="ระบุเหตุผลในการไม่รับเคลมสินค้าออเดอร์นี้..."
                    required
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setClaimRejectOrderId(null)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-3xl shadow-button text-sm"
                >
                  ยืนยันปฏิเสธการเคลม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Claim Replacement Tracking Number */}
      {claimReplaceOrderId && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[420px] shadow-modal overflow-hidden animate-scale-up">
            <div className="p-5 bg-indigo-50 border-b border-indigo-150 flex justify-between items-center">
              <h3 className="font-semibold text-indigo-800 text-base flex items-center gap-2">
                <i className="fa-solid fa-truck-ramp-box"></i> อนุมัติส่งสินค้าใหม่ทดแทน #{claimReplaceOrderId}
              </h3>
              <button 
                onClick={() => setClaimReplaceOrderId(null)} 
                className="text-text-caption hover:bg-indigo-100 hover:text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              onApproveClaimReplace(claimReplaceOrderId, newTrackingNumber);
              setClaimReplaceOrderId(null);
            }}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="claim-replace-tracking-input" className="font-semibold text-text-title text-sm">เลขพัสดุสำหรับสินค้าชิ้นใหม่ <span className="text-status-error-text">*</span></label>
                  <input 
                    id="claim-replace-tracking-input"
                    type="text" 
                    value={newTrackingNumber}
                    onChange={e => setNewTrackingNumber(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-primary font-mono font-semibold"
                    required
                    placeholder="ใส่เลขพัสดุใหม่ หรือใช้เลขสุ่มที่มีให้"
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setClaimReplaceOrderId(null)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-3xl shadow-button text-sm"
                >
                  ยืนยันส่งสินค้าใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Claim Refund Responsibility Selection */}
      {claimRefundOrderId && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[450px] shadow-modal overflow-hidden animate-scale-up">
            <div className="p-5 bg-rose-50 border-b border-rose-150 flex justify-between items-center">
              <h3 className="font-semibold text-rose-800 text-base flex items-center gap-2">
                <i className="fa-solid fa-rotate-left"></i> เลือกผู้รับผิดชอบงานเคลม #{claimRefundOrderId}
              </h3>
              <button 
                onClick={() => setClaimRefundOrderId(null)} 
                className="text-text-caption hover:bg-rose-100 hover:text-rose-800 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              onApproveClaimRefund(claimRefundOrderId, claimRefundResponsibility);
              setClaimRefundOrderId(null);
            }}>
              <div className="p-6 space-y-4">
                <p className="text-xs text-text-body leading-relaxed">
                  กรุณาตรวจสอบและเลือกฝ่ายที่ต้องรับผิดชอบค่าคืนเงินสำหรับลูกค้าคนนี้ ระบบจะทำการคืนเงินผ่าน Stripe โดยอัตโนมัติ
                </p>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="responsibility" 
                      value="brand"
                      checked={claimRefundResponsibility === 'brand'}
                      onChange={() => setClaimRefundResponsibility('brand')}
                      className="mt-1 accent-rose-600"
                    />
                    <div>
                      <span className="font-bold text-sm text-text-title block">แบรนด์เป็นผู้รับผิดชอบ (Brand responsible)</span>
                      <span className="text-[11px] text-text-caption mt-0.5 block leading-normal">
                        ยอดคืนเงิน + ค่าธรรมเนียม Stripe จะหักออกจากยอด Settlement ของแบรนด์ทันที (หากยอดไม่พอกลายเป็นหนี้ค้างชำระสะสม)
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="responsibility" 
                      value="carrier"
                      checked={claimRefundResponsibility === 'carrier'}
                      onChange={() => setClaimRefundResponsibility('carrier')}
                      className="mt-1 accent-rose-600"
                    />
                    <div>
                      <span className="font-bold text-sm text-text-title block">บริษัทขนส่งรับผิดชอบ (Carrier responsible)</span>
                      <span className="text-[11px] text-text-caption mt-0.5 block leading-normal">
                        แพลตฟอร์ม (MyMarket) สำรองเงินคืนลูกค้าทันที และส่งเรื่องเคลมสินค้ากับระบบขนส่ง MyOrder เพื่อเรียกคืนค่าชดเชยภายหลัง
                      </span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setClaimRefundOrderId(null)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-3xl shadow-button text-sm"
                >
                  ยืนยันการอนุมัติคืนเงิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

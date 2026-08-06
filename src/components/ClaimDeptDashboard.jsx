import React, { useState } from 'react';

export default function ClaimDeptDashboard({ 
  orders, 
  products, 
  sellers, 
  onApproveClaimReplace, 
  onApproveClaimRefund, 
  onApproveClaimRepair, 
  onRejectClaim,
  onProposeBrandRefund
}) {
  const [activeFilter, setActiveFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [selectedClaimOrder, setSelectedClaimOrder] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Resolution Form States
  const [resolutionType, setResolutionType] = useState('REFUND'); // REFUND, REPLACE, REPAIR
  const [refundResponsibility, setRefundResponsibility] = useState('brand'); // brand, carrier
  const [replacementTracking, setReplacementTracking] = useState('');
  const [rejectReasonText, setRejectReasonText] = useState('');

  // Filter claim cases
  const claimOrders = orders.filter(o => 
    o.status === 'CLAIM_PENDING' || 
    o.status === 'CLAIM_BRAND_APPROVAL_PENDING' || 
    o.status === 'CLAIM_APPROVED_REFUND' || 
    o.status === 'CLAIM_APPROVED_REPLACE' || 
    o.status === 'CLAIM_APPROVED_REPAIR' || 
    o.status === 'CLAIM_REJECTED'
  );

  const filteredClaims = claimOrders.filter(o => {
    if (activeFilter === 'PENDING') {
      return o.status === 'CLAIM_PENDING' || o.status === 'CLAIM_BRAND_APPROVAL_PENDING';
    }
    if (activeFilter === 'APPROVED') {
      return o.status === 'CLAIM_APPROVED_REFUND' || 
             o.status === 'CLAIM_APPROVED_REPLACE' || 
             o.status === 'CLAIM_APPROVED_REPAIR';
    }
    if (activeFilter === 'REJECTED') return o.status === 'CLAIM_REJECTED';
    return true; // ALL
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CLAIM_PENDING':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-full animate-pulse">รอตรวจสอบ</span>;
      case 'CLAIM_BRAND_APPROVAL_PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-250 text-[10px] font-bold rounded-full animate-pulse">รอแบรนด์อนุมัติชดเชย</span>;
      case 'CLAIM_APPROVED_REFUND':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-150 text-[10px] font-bold rounded-full">อนุมัติ (คืนเงิน)</span>;
      case 'CLAIM_APPROVED_REPLACE':
        return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-150 text-[10px] font-bold rounded-full">อนุมัติ (เปลี่ยนของใหม่)</span>;
      case 'CLAIM_APPROVED_REPAIR':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-250 text-[10px] font-bold rounded-full">อนุมัติ (ส่งซ่อม)</span>;
      case 'CLAIM_REJECTED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-655 border border-slate-200 text-[10px] font-bold rounded-full">ปฏิเสธคำร้อง</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-clipboard-check text-amber-500"></i> ศูนย์จัดการงานเคลมสินค้า (MyOrder Claim Center)
            </h2>
            <p className="text-text-caption text-xs mt-1">
              เจ้าหน้าที่ฝ่ายตรวจสอบคำร้องเคลมพัสดุและระบุทางช่วยเหลือลูกค้า (Resolutions) ให้กับสินค้าชำรุดหรือส่งผิด
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex gap-4">
            <div className="bg-amber-50 border border-amber-150 px-4 py-2.5 rounded-xl text-center">
              <div className="text-xl font-bold text-amber-700">
                {claimOrders.filter(o => o.status === 'CLAIM_PENDING').length}
              </div>
              <div className="text-[10px] text-amber-800 font-semibold uppercase">เคสรอตรวจ</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-150 px-4 py-2.5 rounded-xl text-center">
              <div className="text-xl font-bold text-emerald-700">
                {claimOrders.filter(o => o.status.startsWith('CLAIM_APPROVED')).length}
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold uppercase">อนุมัติแล้ว</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-2">
        {[
          { key: 'PENDING', label: 'รอตรวจสอบ', icon: 'fa-hourglass-half' },
          { key: 'APPROVED', label: 'อนุมัติแล้ว', icon: 'fa-circle-check' },
          { key: 'REJECTED', label: 'ปฏิเสธแล้ว', icon: 'fa-ban' },
          { key: 'ALL', label: 'คำขอทั้งหมด', icon: 'fa-list' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold rounded-3xl transition-all duration-200 ${
              activeFilter === tab.key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-text-body hover:bg-slate-100'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Claims List Table/Grid */}
      {filteredClaims.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-card">
          <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <h3 className="text-slate-800 font-bold mb-1">ไม่พบคำร้องขอเคลมสินค้า</h3>
          <p className="text-text-caption text-xs">คำร้องแจ้งเคลมในกลุ่มที่คุณเลือกมีจำนวนเป็นศูนย์ในขณะนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClaims.map(claim => {
            const product = products.find(p => p.id === claim.productId);
            const seller = sellers.find(s => s.id === claim.sellerId);
            
            return (
              <div key={claim.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row gap-5">
                {/* Left Side: Order & Client Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">เลขที่ออเดอร์: #{claim.id}</span>
                    {getStatusBadge(claim.status)}
                  </div>
                  
                  <div className="text-xs text-text-body space-y-1 bg-slate-50 p-3 rounded-xl text-left">
                    <div><strong>สินค้าที่เคลม:</strong> {product?.name || "ไม่ระบุ"} (x{claim.qty})</div>
                    <div><strong>ผู้ขาย (Seller):</strong> {seller?.name || "ไม่ระบุ"}</div>
                    <div><strong>ข้อมูลลูกค้า:</strong> {claim.customerName} ({claim.customerPhone})</div>
                    <div>
                      <strong>ช่องทางชำระเงิน:</strong>{' '}
                      {claim.paymentMethod === 'STRIPE' ? (
                        <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-150 font-semibold text-[10px]">Stripe Checkout</span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-150 font-semibold text-[10px]">Cash on Delivery</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Side: Claim Details & Evidence */}
                <div className="flex-1 space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 text-left">
                  <h4 className="font-bold text-xs text-text-title uppercase tracking-wider block">รายละเอียดการเคลม</h4>
                  
                  <div className="text-xs text-text-body space-y-2">
                    <div><strong>ประเภทปัญหา:</strong> {claim.claimType === 'WRONG_PRODUCT' ? 'ส่งสินค้าผิดแบบ' : claim.claimType === 'DAMAGED_PRODUCT' ? 'สินค้าเสียหายระหว่างขนส่ง' : 'อื่นๆ'}</div>
                    <div className="leading-relaxed bg-amber-50/50 border border-amber-100/50 p-2.5 rounded-lg text-slate-700">
                      <strong>เหตุผล:</strong> {claim.claimReason}
                    </div>
                    {claim.claimRejectReason && (
                      <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg text-rose-805">
                        <strong>ปฏิเสธเนื่องจาก:</strong> {claim.claimRejectReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Evidence Preview & Actions */}
                <div className="w-full md:w-[240px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 gap-3 text-left">
                  <div>
                    <h4 className="font-bold text-xs text-text-title uppercase tracking-wider block mb-2">รูปถ่ายหลักฐาน</h4>
                    {claim.claimEvidence ? (
                      <a 
                        href={claim.claimEvidence} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block relative rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity bg-slate-50 h-[80px]"
                      >
                        <img src={claim.claimEvidence} alt="หลักฐานเคลม" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">คลิกดูรูปเต็ม</span>
                      </a>
                    ) : (
                      <div className="text-xs text-slate-400 italic">ไม่มีแนบรูปภาพมา</div>
                    )}
                  </div>

                  {claim.status === 'CLAIM_PENDING' && (
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => {
                          setSelectedClaimOrder(claim);
                          setResolutionType('REFUND');
                          setRefundResponsibility('brand');
                          setReplacementTracking("TH" + Math.floor(100000000 + Math.random() * 900000000) + "RE");
                          setShowApproveModal(true);
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-3xl text-xs text-center shadow-sm flex items-center justify-center gap-1"
                      >
                        <i className="fa-solid fa-circle-check"></i> อนุมัติเคลม
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClaimOrder(claim);
                          setRejectReasonText('');
                          setShowRejectModal(true);
                        }}
                        className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-text-body font-semibold rounded-3xl text-xs text-center"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  )}

                  {claim.status === 'CLAIM_APPROVED_REPLACE' && (
                    <div className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-150 p-2 rounded-xl">
                      <i className="fa-solid fa-truck-ramp-box mr-1"></i> อนุมัติเปลี่ยนของใหม่สำเร็จ เลขพัสดุ: <strong>{claim.trackingNumber}</strong>
                    </div>
                  )}

                  {claim.status === 'CLAIM_APPROVED_REPAIR' && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl">
                      <i className="fa-solid fa-screwdriver-wrench mr-1"></i> ออกใบซ่อมบำรุงแล้ว เลขนำส่ง: <strong>{claim.repairTrackingNumber}</strong>
                    </div>
                  )}

                  {claim.status === 'CLAIM_APPROVED_REFUND' && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-150 p-2 rounded-xl">
                      <i className="fa-solid fa-rotate-left mr-1"></i> คืนเงินเข้าบัญชีลูกค้าสำเร็จแล้ว
                    </div>
                  )}

                  {claim.status === 'CLAIM_BRAND_APPROVAL_PENDING' && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl">
                      <i className="fa-solid fa-hourglass-half mr-1"></i> เสนอให้แบรนด์รับผิดชอบค่าคืนเงินชดเชยแล้ว รอแบรนด์กดยอมรับความรับผิดชอบ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Approve Resolution Choice */}
      {showApproveModal && selectedClaimOrder && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[480px] shadow-modal overflow-hidden animate-scale-up">
            <div className="p-5 bg-emerald-50 border-b border-emerald-150 flex justify-between items-center">
              <h3 className="font-semibold text-emerald-800 text-base flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i> ดำเนินการอนุมัติการเคลม #{selectedClaimOrder.id}
              </h3>
              <button 
                onClick={() => setShowApproveModal(false)} 
                className="text-text-caption hover:bg-emerald-100 hover:text-emerald-800 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (resolutionType === 'REFUND') {
                if (refundResponsibility === 'brand') {
                  onProposeBrandRefund(selectedClaimOrder.id);
                } else {
                  onApproveClaimRefund(selectedClaimOrder.id, 'carrier');
                }
              } else if (resolutionType === 'REPLACE') {
                onApproveClaimReplace(selectedClaimOrder.id, replacementTracking);
              } else if (resolutionType === 'REPAIR') {
                onApproveClaimRepair(selectedClaimOrder.id);
              }
              setShowApproveModal(false);
            }}>
              <div className="p-6 space-y-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text-title text-sm">เลือกวิธีการแก้ปัญหา (Resolution) <span className="text-status-error-text">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'REFUND', label: 'คืนเงิน', icon: 'fa-rotate-left' },
                      { type: 'REPLACE', label: 'เปลี่ยนของใหม่', icon: 'fa-truck-ramp-box' },
                      { type: 'REPAIR', label: 'ส่งซ่อมสินค้า', icon: 'fa-screwdriver-wrench' }
                    ].map(res => (
                      <button
                        key={res.type}
                        type="button"
                        onClick={() => setResolutionType(res.type)}
                        className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                          resolutionType === res.type
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                        }`}
                      >
                        <i className={`fa-solid ${res.icon} text-sm`}></i>
                        <span>{res.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional fields based on Resolution selection */}
                {resolutionType === 'REFUND' && (
                  <div className="space-y-3 p-3 bg-slate-50 border border-slate-100 rounded-xl animate-fade-in">
                    <span className="font-bold text-xs text-text-title block">ฝ่ายผู้รับผิดชอบคืนเงิน (Responsibility):</span>
                    
                    <label className="flex items-start gap-2.5 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        name="refund-responsibility" 
                        value="brand"
                        checked={refundResponsibility === 'brand'}
                        onChange={() => setRefundResponsibility('brand')}
                        className="mt-1 accent-emerald-600"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">แบรนด์เป็นผู้รับผิดชอบ</span>
                        <span className="text-[10px] text-text-caption block mt-0.5 leading-normal">
                          หักลดจาก Settlement ของแบรนด์สะสม (เป็นหนี้ Outstanding หากยอดไม่พอ)
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        name="refund-responsibility" 
                        value="carrier"
                        checked={refundResponsibility === 'carrier'}
                        onChange={() => setRefundResponsibility('carrier')}
                        className="mt-1 accent-emerald-600"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">บริษัทขนส่งรับผิดชอบ</span>
                        <span className="text-[10px] text-text-caption block mt-0.5 leading-normal">
                          แพลตฟอร์มสำรองจ่ายทันที และยื่นคำร้องกับขนส่งทีหลัง แบรนด์ไม่เสียยอด Settlement
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                {resolutionType === 'REPLACE' && (
                  <div className="space-y-3 p-3 bg-slate-50 border border-slate-100 rounded-xl animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="replace-tracking" className="font-bold text-xs text-text-title block">รหัสพัสดุชิ้นใหม่สำหรับจัดส่งสินค้าทดแทน:</label>
                      <input 
                        id="replace-tracking"
                        type="text"
                        value={replacementTracking}
                        onChange={e => setReplacementTracking(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono focus:outline-none focus:border-emerald-550"
                        required
                      />
                      <span className="text-[9px] text-text-caption leading-relaxed block mt-1">
                        ระบบจะสร้างคำสั่งจัดส่งใหม่ไปยังศูนย์พัสดุเพื่อจัดเตรียมสิ่งของใหม่ส่งให้แก่ที่อยู่เดิมของลูกค้า
                      </span>
                    </div>
                  </div>
                )}

                {resolutionType === 'REPAIR' && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl animate-fade-in text-xs text-text-body leading-relaxed">
                    <i className="fa-solid fa-circle-info text-amber-600 mr-1"></i>
                    ระบบจะสร้าง <strong>Repair Service Order</strong> พร้อมออกบาร์โค้ดนำส่งไปรษณีย์คืนเพื่อให้ลูกค้านำสินค้าชำรุดส่งเข้ามาที่ศูนย์ซ่อมบำรุง
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-3xl shadow-button text-sm"
                >
                  ยืนยันการอนุมัติ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reject Case */}
      {showRejectModal && selectedClaimOrder && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[420px] shadow-modal overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-text-title text-base flex items-center gap-2">
                <i className="fa-solid fa-ban text-slate-600"></i> ปฏิเสธคำร้องเคลม #{selectedClaimOrder.id}
              </h3>
              <button 
                onClick={() => setShowRejectModal(false)} 
                className="text-text-caption hover:bg-slate-200 hover:text-text-title w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!rejectReasonText) return;
              onRejectClaim(selectedClaimOrder.id, rejectReasonText);
              setShowRejectModal(false);
            }}>
              <div className="p-6 space-y-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reject-reason-input" className="font-semibold text-text-title text-sm">เหตุผลในการปฏิเสธ <span className="text-status-error-text">*</span></label>
                  <textarea 
                    id="reject-reason-input"
                    value={rejectReasonText}
                    onChange={e => setRejectReasonText(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary"
                    rows="3"
                    placeholder="กรุณาระบุเหตุผลอย่างละเอียด..."
                    required
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-3xl shadow-button text-sm"
                >
                  ปฏิเสธคำขอเคลม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

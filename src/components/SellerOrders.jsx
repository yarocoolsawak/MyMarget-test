import React, { useState, useEffect } from 'react';

export default function SellerOrders({ orders, products, sellerCatalog, activeSellerId, onCreateOrder, onCheckPaymentStatus, sellerStripeConnected, onCreateClaimLink, onSubmitCustomerClaim }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimOrderId, setClaimOrderId] = useState(null);
  const [customerPortalOrder, setCustomerPortalOrder] = useState(null);
  const [claimType, setClaimType] = useState('DAMAGED_PRODUCT');
  const [claimReason, setClaimReason] = useState('');
  const [claimEvidence, setClaimEvidence] = useState('https://images.unsplash.com/photo-1594818866585-14e579f48934?q=80&w=300');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [sellingPrice, setSellingPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Validation states
  const [stockCount, setStockCount] = useState(0);
  const [minPriceAllowed, setMinPriceAllowed] = useState(0);
  const [priceError, setPriceError] = useState(false);
  const [stockError, setStockError] = useState(false);

  const myOrders = orders.filter(o => o.sellerId === activeSellerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Sync selected product details
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      const catalogItem = sellerCatalog.find(c => c.productId === selectedProductId);
      if (product && catalogItem) {
        setStockCount(product.stock);
        setMinPriceAllowed(product.dealerPrice);
        setSellingPrice(catalogItem.sellingPrice);
        setStockError(qty > product.stock);
        setPriceError(catalogItem.sellingPrice < product.dealerPrice);
      }
    } else {
      setStockCount(0);
      setMinPriceAllowed(0);
      setSellingPrice('');
      setStockError(false);
      setPriceError(false);
    }
  }, [selectedProductId, products, sellerCatalog]);

  // Handle inputs changing
  const handleQtyChange = (val) => {
    const numeric = parseInt(val) || 0;
    setQty(numeric);
    setStockError(numeric > stockCount);
  };

  const handlePriceChange = (val) => {
    const numeric = parseFloat(val) || 0;
    setSellingPrice(numeric);
    setPriceError(numeric < minPriceAllowed);
  };

  const openOrderModal = () => {
    if (sellerCatalog.length === 0) {
      alert("กรุณาเพิ่มสินค้าเข้าร้านค้าของคุณก่อนที่จะดำเนินรายการสั่งซื้อ");
      return;
    }
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedProductId('');
    setQty(1);
    setPaymentMethod('COD');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId || priceError || stockError || !customerName || !customerPhone || !customerAddress) return;

    if (paymentMethod === 'STRIPE' && !sellerStripeConnected) {
      alert("กรุณาเชื่อมต่อบัญชีรับเงิน Stripe ก่อนดำเนินรายการสั่งซื้อแบบโอนเงิน");
      return;
    }

    onCreateOrder({
      productId: selectedProductId,
      qty,
      sellingPrice: parseFloat(sellingPrice),
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod
    });

    setIsModalOpen(false);
  };

  // Calculations for Order Summary Box
  const totalAmount = (parseFloat(sellingPrice) || 0) * qty;
  const totalCost = minPriceAllowed * qty;
  const netProfit = totalAmount - totalCost;

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

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-title">รายการสั่งซื้อและติดตามพัสดุ (Orders & Tracking)</h2>
          <p className="text-text-caption text-sm">สร้างออเดอร์ปลายทาง (COD) ให้ลูกค้า ติดตามสถานะจัดส่งจากคลังสินค้าหลักของแบรนด์</p>
        </div>
        <button 
          onClick={openOrderModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-semibold rounded-3xl shadow-button hover:shadow-button-hover active:translate-y-[1px] transition-all duration-200"
        >
          <i className="fa-solid fa-file-invoice-dollar"></i> สร้างออเดอร์ใหม่ (COD)
        </button>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-text-title font-semibold">
                <th className="p-4 border-b border-slate-100">เลขที่ใบสั่งซื้อ</th>
                <th className="p-4 border-b border-slate-100">ชื่อลูกค้า / โทรศัพท์</th>
                <th className="p-4 border-b border-slate-100">รายการสินค้า</th>
                <th className="p-4 border-b border-slate-100">ราคาขายปลีก</th>
                <th className="p-4 border-b border-slate-100">กำไรที่คุณได้รับ</th>
                <th className="p-4 border-b border-slate-100">สถานะ (MyOrder)</th>
                <th className="p-4 border-b border-slate-100">เลขพัสดุ / ขนส่ง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-10 text-text-caption font-medium">
                    ไม่มีรายการออเดอร์ของร้านค้าคุณ
                  </td>
                </tr>
              ) : (
                myOrders.map(o => {
                  const product = products.find(p => p.id === o.productId) || { name: 'สินค้าที่ไม่มีในคลัง', image: '' };

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-text-title">
                        #{o.id}
                        <span className="block text-[11px] text-text-caption font-normal mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString("th-TH")}
                        </span>
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
                        <span className="font-bold text-status-success-text">+{o.profit.toLocaleString()} THB</span>
                      </td>
                      <td className="p-4">
                        {o.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-warning-bg text-status-warning-text">
                            <i className="fa-solid fa-hourglass-start text-[10px]"></i> รอตรวจสอบ
                          </span>
                        )}
                        {o.status === "CONFIRMED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-brand-secondary">
                            <i className="fa-solid fa-circle-check text-[10px]"></i> รับออเดอร์แล้ว
                          </span>
                        )}
                        {o.status === "SHIPPING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-brand-ai">
                            <i className="fa-solid fa-truck-fast text-[10px]"></i> ระหว่างขนส่ง
                          </span>
                        )}
                        {o.status === "DELIVERED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success-text">
                            <i className="fa-solid fa-check-double text-[10px]"></i> สำเร็จ (โอนกำไร)
                          </span>
                        )}
                        {o.status === "CLAIM_PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
                            <i className="fa-solid fa-circle-notch text-[10px] animate-spin"></i> รอตรวจสอบการเคลม
                          </span>
                        )}
                        {o.status === "CLAIM_APPROVED_REPLACE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            <i className="fa-solid fa-circle-check text-[10px]"></i> เคลมสำเร็จ (ส่งสินค้าใหม่)
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
                            <i className="fa-solid fa-triangle-exclamation text-[10px]"></i> ถูกยกเลิก
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs">
                        {o.status === "PENDING" && (
                          o.paymentMethod === 'STRIPE' ? (
                            o.stripePaymentUrl ? (
                              <div className="flex flex-col gap-1.5 max-w-[160px]">
                                <span className="text-[10px] text-slate-500 font-medium">ลูกค้าชำระเงินออนไลน์ (Stripe)</span>
                                <div className="flex items-center gap-1">
                                  <a href={o.stripePaymentUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-[10px] font-semibold rounded-md inline-flex items-center gap-1 shadow-sm transition-colors">
                                    <i className="fa-solid fa-external-link text-[8px]"></i> จ่ายเงิน
                                  </a>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(o.stripePaymentUrl);
                                      alert("คัดลอกลิงก์การชำระเงินไปยังคลิปบอร์ดแล้ว! สามารถส่งลิงก์นี้ให้ลูกค้าได้ทันที");
                                    }}
                                    className="w-6 h-6 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 flex items-center justify-center border border-slate-200"
                                    title="คัดลอกลิงก์"
                                  >
                                    <i className="fa-regular fa-copy text-[10px]"></i>
                                  </button>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => onCheckPaymentStatus(o.id)}
                                  className="px-2 py-0.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-medium text-slate-600 rounded flex items-center justify-center gap-1 transition-all mt-0.5"
                                >
                                  <i className="fa-solid fa-rotate text-[8px] text-slate-400"></i> เช็คสถานะจ่ายเงิน
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">กำลังสร้างลิงก์ชำระเงิน...</span>
                            )
                          ) : (
                            <span className="text-text-caption">แบรนด์กำลังตรวจสอบสต็อก</span>
                          )
                        )}
                        {o.status === "CONFIRMED" && (
                          <div className="flex flex-col">
                            <span className="text-text-caption">กำลังเตรียมแพ็คสินค้า</span>
                            {o.paymentMethod === 'STRIPE' && (
                              <span className="text-[10px] text-status-success-text font-bold mt-0.5">
                                <i className="fa-solid fa-circle-check text-[9px]"></i> ชำระเงินแล้ว (Stripe)
                              </span>
                            )}
                          </div>
                        )}
                        {o.status === "SHIPPING" && (
                          <div>
                            <div className="font-semibold text-brand-ai">{o.trackingNumber}</div>
                            <span className="text-text-caption block mt-0.5">{o.carrier}</span>
                          </div>
                        )}
                        {o.status === "DELIVERED" && (
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-status-success-text">{o.trackingNumber}</div>
                            <span className="text-[10px] text-text-caption block font-medium">กำไรโอนเข้ากระเป๋าแล้ว</span>
                            <button
                              onClick={() => onCreateClaimLink(o.id)}
                              className="px-2 py-0.5 mt-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-md flex items-center justify-center gap-1 transition-all shadow-sm"
                            >
                              <i className="fa-solid fa-link"></i> สร้างลิงก์แจ้งเคลม
                            </button>
                          </div>
                        )}
                        {o.status === "CLAIM_LINK_CREATED" && (
                          <div className="flex flex-col gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-250 rounded w-fit">
                              <i className="fa-solid fa-link mr-1"></i> ลิงก์เคลมถูกสร้างแล้ว
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(o.claimLink || `http://localhost:5173/claim?order_id=${o.id}`);
                                  alert("คัดลอกลิงก์ส่งให้ลูกค้าเรียบร้อยแล้ว!");
                                }}
                                className="px-2 py-0.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-semibold rounded-md flex items-center justify-center gap-1 transition-all"
                                title="คัดลอกลิงก์ส่งให้ลูกค้า"
                              >
                                <i className="fa-solid fa-copy text-[10px]"></i> คัดลอก
                              </button>
                              <button
                                onClick={() => {
                                  setCustomerPortalOrder(o);
                                  setClaimType('DAMAGED_PRODUCT');
                                  setClaimReason('');
                                  setClaimEvidence('https://images.unsplash.com/photo-1594818866585-14e579f48934?q=80&w=600');
                                }}
                                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-semibold rounded-md flex items-center justify-center gap-1 transition-all shadow-sm"
                                title="จำลองเป็นหน้าจอที่ลูกค้าเปิดลิงก์แจ้งเคลม"
                              >
                                <i className="fa-solid fa-window-restore text-[10px]"></i> เปิดกรอกเคลม
                              </button>
                            </div>
                          </div>
                        )}
                        {o.status === "CLAIM_PENDING" && (
                          <div className="flex flex-col gap-0.5">
                            <div className="font-semibold text-amber-700">รอตรวจสอบ ({o.claimType === 'WRONG_PRODUCT' ? 'สินค้าผิด' : o.claimType === 'DAMAGED_PRODUCT' ? 'สินค้าชำรุด' : 'อื่นๆ'})</div>
                            <span className="text-[10px] text-text-caption block truncate max-w-[150px]" title={o.claimReason}>{o.claimReason}</span>
                          </div>
                        )}
                        {o.status === "CLAIM_APPROVED_REPLACE" && (
                          <div>
                            <div className="font-semibold text-indigo-600">{o.trackingNumber}</div>
                            <span className="text-text-caption block mt-0.5">{o.carrier}</span>
                          </div>
                        )}
                        {o.status === "CLAIM_APPROVED_REFUND" && (
                          <div className="flex flex-col">
                            <span className="font-bold text-rose-600">คืนเงินเต็มจำนวน</span>
                            <span className="text-[10px] text-text-caption block mt-0.5 font-medium">ดึงยอดและกำไรคืนแล้ว</span>
                          </div>
                        )}
                        {o.status === "CLAIM_APPROVED_REPAIR" && (
                          <div className="flex flex-col">
                            <span className="font-bold text-amber-700"><i className="fa-solid fa-screwdriver-wrench text-[10px] mr-1"></i> ส่งซ่อมสินค้า</span>
                            <span className="text-[10px] text-text-caption block mt-0.5 font-medium truncate max-w-[150px]" title={o.repairTrackingNumber}>
                              {o.repairTrackingNumber}
                            </span>
                          </div>
                        )}
                        {o.status === "CLAIM_REJECTED" && (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-600">คำขอถูกปฏิเสธ</span>
                            <span className="text-[10px] text-status-error-text block mt-0.5 font-medium truncate max-w-[150px]" title={o.claimRejectReason}>เหตุผล: {o.claimRejectReason}</span>
                          </div>
                        )}
                        {o.status === "REJECTED" && (
                          <span className="text-status-error-text font-medium" title={o.rejectReason}>
                            ปฏิเสธ: {getFriendlyRejectReason(o.rejectReason)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Order */}
      {isModalOpen && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[720px] shadow-modal overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-text-title text-base flex items-center gap-2">
                <i className="fa-solid fa-file-circle-plus text-brand-secondary"></i> สร้างคำสั่งซื้อใหม่ (เก็บเงินปลายทาง COD)
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-text-caption hover:bg-slate-100 hover:text-text-title w-8 h-8 rounded-full flex items-center justify-center text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                {/* Left Section: Customer Info */}
                <div className="space-y-4">
                  <h4 className="font-bold text-text-title text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                    <i className="fa-solid fa-user-tag text-slate-500"></i> ข้อมูลผู้รับปลายทาง (ลูกค้า)
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-xs">ชื่อ-นามสกุล ผู้รับพัสดุ <span className="text-status-error-text">*</span></label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs focus:outline-none focus:border-brand-secondary"
                      required
                      placeholder="เช่น นายสมชาย ใจดี"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-xs">เบอร์โทรศัพท์ผู้รับ <span className="text-status-error-text">*</span></label>
                    <input 
                      type="tel" 
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs focus:outline-none focus:border-brand-secondary"
                      required
                      placeholder="เช่น 0891234567"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-xs">ที่อยู่สำหรับจัดส่งอย่างละเอียด <span className="text-status-error-text">*</span></label>
                    <textarea 
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs focus:outline-none focus:border-brand-secondary"
                      rows="3"
                      required
                      placeholder="เลขที่ ซอย ถนน แขวง เขต จังหวัด รหัสไปรษณีย์"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-xs">ช่องทางการชำระเงิน <span className="text-status-error-text">*</span></label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs focus:outline-none focus:border-brand-secondary"
                      required
                    >
                      <option value="COD">เก็บเงินปลายทาง (COD)</option>
                      <option value="STRIPE">
                        {sellerStripeConnected 
                          ? "โอนเงินผ่านระบบ (Stripe - บัตรเครดิต/เดบิต)" 
                          : "โอนเงินผ่านระบบ (Stripe - กรุณาเชื่อมบัญชีที่แดชบอร์ด)"}
                      </option>
                    </select>
                    {paymentMethod === 'STRIPE' && !sellerStripeConnected && (
                      <span className="text-[10px] text-status-error-text font-semibold mt-1">
                        <i className="fa-solid fa-triangle-exclamation"></i> กรุณาเชื่อมต่อบัญชีรับเงิน Stripe ที่ "แผงควบคุมของฉัน" ก่อนสร้างออเดอร์โอนเงิน
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section: Product selection and total */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  <h4 className="font-bold text-text-title text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                    <i className="fa-solid fa-cart-shopping text-slate-500"></i> ข้อมูลรายการขายและราคา
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-xs">เลือกสินค้าจากหน้าร้านของคุณ <span className="text-status-error-text">*</span></label>
                    <select
                      value={selectedProductId}
                      onChange={e => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs focus:outline-none focus:border-brand-secondary"
                      required
                    >
                      <option value="">-- โปรดเลือกสินค้าของคุณ --</option>
                      {sellerCatalog.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return product ? (
                          <option key={item.productId} value={product.id}>
                            {product.name} (ราคาคุณ: {item.sellingPrice} THB)
                          </option>
                        ) : null;
                      })}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-text-title text-xs">จำนวนชิ้น <span className="text-status-error-text">*</span></label>
                      <input 
                        type="number" 
                        value={qty}
                        onChange={e => handleQtyChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs focus:outline-none focus:border-brand-secondary"
                        required 
                        min="1"
                        disabled={!selectedProductId}
                      />
                      {selectedProductId && (
                        <span className={`text-[10px] ${stockError ? 'text-status-error-text font-semibold' : 'text-text-caption'}`}>
                          สต็อกคงคลัง: {stockCount} ชิ้น
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-text-title text-xs">ราคาขายต่อชิ้น (THB) <span className="text-status-error-text">*</span></label>
                      <input 
                        type="number" 
                        value={sellingPrice}
                        onChange={e => handlePriceChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs focus:outline-none focus:border-brand-secondary"
                        required 
                        min="1"
                        disabled={!selectedProductId}
                      />
                      {selectedProductId && priceError && (
                        <span className="text-[10px] text-status-error-text font-semibold">
                          ห้ามต่ำกว่าราคากลาง ({minPriceAllowed} THB)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2 mt-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-body font-medium">ยอดเก็บเงินปลายทางรวม (COD):</span>
                      <span className="text-base font-bold text-brand-secondary">
                        {priceError ? "ผิดกฎราคากลาง" : `${totalAmount.toLocaleString()} THB`}
                      </span>
                    </div>
                    <div className="flex justify-between text-text-caption">
                      <span>ราคาทุนแบรนด์ (Dealer Cost):</span>
                      <span>{priceError ? "---" : `${totalCost.toLocaleString()} THB`}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                      <span>ส่วนต่างกำไรสุทธิของคุณ:</span>
                      {priceError ? (
                        <span className="text-status-error-text">---</span>
                      ) : (
                        <span className="text-status-success-text">+{netProfit.toLocaleString()} THB</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={priceError || stockError || !selectedProductId || (paymentMethod === 'STRIPE' && !sellerStripeConnected)}
                  className={`px-5 py-2 text-white font-semibold rounded-3xl shadow-button text-sm transition-all ${
                    (priceError || stockError || !selectedProductId || (paymentMethod === 'STRIPE' && !sellerStripeConnected))
                      ? 'bg-slate-300 cursor-not-allowed opacity-50' 
                      : 'bg-brand-secondary hover:bg-brand-secondary-hover'
                  }`}
                >
                  ส่งคำสั่งซื้อเข้าระบบ MyOrder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customer Claim Portal (Simulated browser view) */}
      {customerPortalOrder && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/60 backdrop-blur-[5px] flex items-center justify-center z-[1000] animate-fade-in p-4">
          <div className="bg-white rounded-2xl w-full max-w-[550px] shadow-modal overflow-hidden animate-scale-up border border-slate-200">
            {/* Simulated Browser Bar */}
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <i className="fa-solid fa-lock text-[10px] text-green-600"></i> MyMarket Customer Claim Portal
                </span>
                <button 
                  onClick={() => setCustomerPortalOrder(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-450 font-mono truncate shadow-inner flex items-center gap-2">
                <i className="fa-solid fa-globe text-slate-400"></i>
                <span>http://localhost:5173/claim?order_id={customerPortalOrder.id}</span>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              onSubmitCustomerClaim(customerPortalOrder.id, {
                claimType,
                claimReason,
                claimEvidence
              });
              setCustomerPortalOrder(null);
            }}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1.5 text-left">
                  <h4 className="font-bold text-xs text-text-title uppercase tracking-wider block">รายละเอียดคำสั่งซื้อ</h4>
                  <div className="text-xs text-text-body space-y-1">
                    <div><strong>เลขที่คำสั่งซื้อ:</strong> #{customerPortalOrder.id}</div>
                    <div><strong>สินค้า:</strong> {products.find(p => p.id === customerPortalOrder.productId)?.name} (x{customerPortalOrder.qty})</div>
                    <div><strong>ผู้ซื้อ:</strong> {customerPortalOrder.customerName}</div>
                    <div><strong>เบอร์โทร:</strong> {customerPortalOrder.customerPhone}</div>
                    <div>
                      <strong>ช่องทางชำระเงิน:</strong>{' '}
                      {customerPortalOrder.paymentMethod === 'STRIPE' ? (
                        <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-155 font-semibold text-[10px]">Stripe Checkout</span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-155 font-semibold text-[10px]">Cash on Delivery</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="customer-claim-type" className="font-semibold text-text-title text-sm">ปัญหาที่พบ / สาเหตุการเคลม <span className="text-status-error-text">*</span></label>
                  <select 
                    id="customer-claim-type"
                    value={claimType} 
                    onChange={e => setClaimType(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary"
                    required
                  >
                    <option value="DAMAGED_PRODUCT">สินค้าชำรุดเสียหาย / แตกหัก / เสียหายระหว่างขนส่ง</option>
                    <option value="WRONG_PRODUCT">ได้รับสินค้าไม่ถูกต้อง / ผิดแบบ / ผิดขนาด</option>
                    <option value="OTHER">อื่นๆ (กรุณาระบุด้านล่าง)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="customer-claim-reason" className="font-semibold text-text-title text-sm">รายละเอียดเพิ่มเติมจากลูกค้า <span className="text-status-error-text">*</span></label>
                  <textarea 
                    id="customer-claim-reason"
                    value={claimReason}
                    onChange={e => setClaimReason(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary" 
                    rows="3"
                    placeholder="กรุณาอธิบายปัญหาที่เกิดขึ้น..."
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="customer-claim-evidence" className="font-semibold text-text-title text-sm">ลิงก์แนบรูปภาพ / วิดีโอหลักฐานการชำรุด <span className="text-slate-400 font-normal">(ถ้ามี)</span></label>
                  <input 
                    id="customer-claim-evidence"
                    type="text" 
                    value={claimEvidence}
                    onChange={e => setClaimEvidence(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary"
                    placeholder="ใส่ URL รูปภาพความเสียหาย"
                  />
                  {claimEvidence && (
                    <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden max-h-[140px] flex items-center justify-center bg-slate-50">
                      <img src={claimEvidence} className="h-full max-h-[140px] object-contain" alt="หลักฐานเคลมจากลูกค้า" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setCustomerPortalOrder(null)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-3xl shadow-button text-sm"
                >
                  ส่งข้อมูลแจ้งเคลมสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

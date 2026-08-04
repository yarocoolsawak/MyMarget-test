import React from 'react';

export default function SellerDashboard({ sellers, orders, activeSellerId }) {
  const sellerObj = sellers.find(s => s.id === activeSellerId) || { name: "ตัวแทนจำหน่าย", tier: "Standard Seller", totalSales: 0 };
  
  // Calculations
  const myOrders = orders.filter(o => o.sellerId === activeSellerId && o.status !== "REJECTED");
  const myRevenue = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const myProfit = myOrders.reduce((sum, o) => sum + o.profit, 0); // profit is (Retail - Dealer) * qty
  const deliveredOrders = orders.filter(o => o.sellerId === activeSellerId && o.status === "DELIVERED").length;

  // Tier progress (using 20,000 THB revenue target for simulator)
  const targetRev = 20000;
  const percentage = Math.min(100, Math.round((myRevenue / targetRev) * 100));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-title">แผงควบคุมรายได้ (Seller Performance Dashboard)</h2>
        <p className="text-text-caption text-sm">ติดตามผลกำไร ยอดขาย และเป้าหมายการขายเพื่อเพิ่มระดับการเป็นตัวแทน</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-brand-secondary-subtle text-brand-secondary">
            <i className="fa-solid fa-chart-bar"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">ยอดขายของฉัน (COD)</span>
            <span className="block text-xl font-bold text-text-title mt-0.5">{myRevenue.toLocaleString()} THB</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200 border-l-4 border-l-status-success">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-status-success-bg text-status-success-text">
            <i className="fa-solid fa-wallet"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">ส่วนต่างกำไรสุทธิ</span>
            <span className="block text-xl font-bold text-status-success-text mt-0.5">+{myProfit.toLocaleString()} THB</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-status-warning-bg text-status-warning-text">
            <i className="fa-solid fa-truck-ramp-box"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">ออเดอร์ส่งสำเร็จ</span>
            <span className="block text-xl font-bold text-text-title mt-0.5">{deliveredOrders} รายการ</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-brand-ai-subtle text-brand-ai">
            <i className="fa-solid fa-medal"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">ระดับตัวแทน (Tier)</span>
            <span className="block text-lg font-bold text-brand-primary mt-0.5">{sellerObj.tier}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tier Progress */}
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-card flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-text-title text-base">ความคืบหน้าเพื่อปรับระดับ (Tier Progress)</h3>
          </div>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-brand-secondary">Standard (0 THB)</span>
              <span className="text-text-caption">
                {myRevenue >= targetRev ? "Pro Seller (สำเร็จ!)" : `Pro Seller (${targetRev.toLocaleString()} THB)`}
              </span>
            </div>
            
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            <p className="text-xs text-text-caption italic mt-1 leading-normal">
              {myRevenue >= targetRev 
                ? "ยินดีด้วย! คุณเป็น Pro Seller เรียบร้อยแล้ว รับข้อเสนอส่วนลดราคาสินค้าพิเศษจากแบรนด์!"
                : `คุณมียอดขายขาดอีกเพียง ${(targetRev - myRevenue).toLocaleString()} THB เพื่อเลื่อนขั้นรับส่วนลดต้นทุนราคากลางเพิ่ม 5%!`}
            </p>
          </div>
        </div>

        {/* Guardrail Policy */}
        <div className="lg:col-span-6 bg-brand-ai-subtle/30 border border-brand-ai-subtle rounded-2xl p-6 shadow-card relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-brand-ai">
              <i className="fa-solid fa-sparkles"></i>
              <h3 className="font-semibold text-text-title text-sm">ระบบสแกนตรวจสอบราคากลาง</h3>
            </div>
            <span className="text-[10px] font-bold bg-brand-ai-subtle text-brand-ai px-2 py-0.5 rounded-full">คุ้มครองราคา</span>
          </div>
          <div className="text-xs text-text-body leading-relaxed">
            <strong>นโยบายควบคุมราคากลาง (Price Integrity Guardrail):</strong>
            <p className="mt-2">
              คุณสามารถกำหนดราคาขายปลีกเองเพื่อหากำไรส่วนต่างได้อย่างอิสระ แต่ระบบจะไม่ยอมให้ตั้งราคาขายปลีกต่ำกว่าราคากลาง (Dealer Price) ที่แบรนด์กำหนด เพื่อปกป้องผลประโยชน์ของเครือข่ายตัวแทนทั้งหมดและภาพลักษณ์สินค้า
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

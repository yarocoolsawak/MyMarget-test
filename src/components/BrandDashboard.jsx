import React from 'react';

export default function BrandDashboard({ products, sellers, orders, stripeConnected, stripeAccountId, onOpenStripeConnect, onDisconnectStripe }) {
  // 1. Calculations
  const validOrders = orders.filter(o => o.status !== "REJECTED");
  const totalRev = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCom = validOrders.reduce((sum, o) => sum + o.profit, 0); // profit is seller margin
  const completedOrdersCount = orders.filter(o => o.status === "DELIVERED").length;
  const activeSellersCount = sellers.filter(s => s.status === "ACTIVE").length;

  // 2. Top Sellers
  const sellerStats = sellers.map(seller => {
    const sellerOrders = orders.filter(o => o.sellerId === seller.id && o.status !== "REJECTED");
    const sales = sellerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      name: seller.name,
      sales: sales,
      orders: sellerOrders.length,
    };
  }).sort((a, b) => b.sales - a.sales);

  // 3. AI Insights engine
  const lowStockProducts = products.filter(p => p.stock < 10);
  const pendingOrders = orders.filter(o => o.status === "PENDING");

  let aiInsightText = "";
  if (pendingOrders.length > 0) {
    aiInsightText = (
      <span>
        พบคำสั่งซื้อใหม่จำนวน <strong>{pendingOrders.length} รายการ</strong> ที่รอการยืนยันและตรวจสอบสต็อก แนะนำให้ตรวจสอบที่เมนู "รายการสั่งซื้อ" ทันที เพื่อป้องกันความล่าช้าในการส่งสินค้าแบบเก็บเงินปลายทาง (COD)
      </span>
    );
  } else if (lowStockProducts.length > 0) {
    aiInsightText = (
      <span>
        <strong>แจ้งเตือนสต็อกต่ำ:</strong> สินค้า <strong>"{lowStockProducts[0].name}"</strong> เหลือเพียง {lowStockProducts[0].stock} ชิ้นในคลัง แนะนำให้เติมสินค้าเข้าสู่ระบบหลักเพื่อไม่ให้ตัวแทนจำหน่ายเสียโอกาสทางการเสนอขาย
      </span>
    );
  } else {
    aiInsightText = (
      <span>
        ภาพรวมเครือข่ายของแบรนด์ดำเนินงานได้ดี ยอดขายรวมโตขึ้นอย่างต่อเนื่อง พฤติกรรมการตั้งราคาขายปลีกของตัวแทนจำหน่ายทั้งหมดอยู่ในกรอบมาตรฐานควบคุม (Price Integrity)
      </span>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-title">แดชบอร์ดภาพรวม (Brand Owner Dashboard)</h2>
          <p className="text-text-caption text-sm">วิเคราะห์ผลการขายและยอดรวมจากเครือข่ายตัวแทนของคุณแบบเรียลไทม์</p>
        </div>
        <div className="flex items-center gap-3">
          {stripeConnected ? (
            <>
              <div className="flex items-center gap-2 bg-status-success-bg border border-green-200 px-4 py-2 rounded-3xl text-xs font-semibold text-status-success-text">
                <i className="fa-brands fa-stripe text-lg"></i>
                <span>เชื่อมบัญชีรับเงินแล้ว ({stripeAccountId})</span>
                <button 
                  onClick={onDisconnectStripe}
                  className="ml-2 text-slate-400 hover:text-status-error-text transition-colors"
                  title="ยกเลิกการเชื่อมต่อ"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
              <a 
                href={`https://dashboard.stripe.com/${stripeAccountId}/test/dashboard`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-3xl transition-all shadow-sm"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> ดูแดชบอร์ด Stripe
              </a>
            </>
          ) : (
            <button 
              onClick={onOpenStripeConnect}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#635BFF] hover:bg-[#5048e5] text-white text-xs font-semibold rounded-3xl shadow-button transition-all duration-200 animate-pulse"
            >
              <i className="fa-brands fa-stripe text-lg"></i> เชื่อมบัญชีรับเงิน (Stripe)
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-brand-primary-subtle text-brand-primary">
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">ยอดขายรวมเครือข่าย</span>
            <span className="block text-xl font-bold text-text-title mt-0.5">{totalRev.toLocaleString()} THB</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-status-success-bg text-status-success-text">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">คำสั่งซื้อสำเร็จ</span>
            <span className="block text-xl font-bold text-text-title mt-0.5">{completedOrdersCount} ออเดอร์</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-status-warning-bg text-status-warning-text">
            <i className="fa-solid fa-users-viewfinder"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">ตัวแทนที่แอคทีฟ</span>
            <span className="block text-xl font-bold text-text-title mt-0.5">{activeSellersCount} ราย</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200 border-l-4 border-l-brand-ai">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-brand-ai-subtle text-brand-ai">
            <i className="fa-solid fa-robot"></i>
          </div>
          <div>
            <span className="text-xs text-text-caption font-medium">ค่าคอมมิชชันจ่ายแล้ว</span>
            <span className="block text-xl font-bold text-text-title mt-0.5">{totalCom.toLocaleString()} THB</span>
          </div>
        </div>
      </div>

      {/* Grid Layout for Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insight Card */}
        <div className="lg:col-span-5 bg-brand-ai-subtle/30 border border-brand-ai-subtle rounded-2xl p-6 shadow-card relative overflow-hidden">
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-gradient-my-ai opacity-5 blur-2xl rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-brand-ai">
              <i className="fa-solid fa-sparkles animate-pulse"></i>
              <h3 className="font-semibold text-text-title">MyOrder Intelligence Insights</h3>
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-brand-ai-subtle text-brand-ai px-2 py-0.5 rounded-full">Live AI</span>
          </div>
          <div className="text-sm text-text-body leading-relaxed">
            {aiInsightText}
          </div>
        </div>

        {/* Top Sellers Card */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-card">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-base font-semibold text-text-title">ตัวแทนยอดขายสูงสุด</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-text-title font-semibold">
                  <th className="p-3 border-b-2 border-slate-100">ชื่อตัวแทน</th>
                  <th className="p-3 border-b-2 border-slate-100">ยอดขายสะสม</th>
                  <th className="p-3 border-b-2 border-slate-100">จำนวนคำสั่งซื้อ</th>
                  <th className="p-3 border-b-2 border-slate-100">สถานะร้าน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerStats.map((seller, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold text-text-title">{seller.name}</td>
                    <td className="p-3 font-bold">{seller.sales.toLocaleString()} THB</td>
                    <td className="p-3">{seller.orders} ออเดอร์</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success-text">
                        ใช้งานอยู่
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

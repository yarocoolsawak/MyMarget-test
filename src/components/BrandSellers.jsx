import React from 'react';

export default function BrandSellers({ sellers, orders, onOnboardSeller }) {
  const handleOnboard = () => {
    const name = prompt("ระบุชื่อร้านค้าของตัวแทนใหม่ที่ได้รับอนุมัติ:");
    if (!name) return;
    onOnboardSeller(name);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-title">เครือข่ายตัวแทนจำหน่าย (Seller Network)</h2>
          <p className="text-text-caption text-sm">สิทธิ์การเข้าถึง อัตราส่วนต่างกำไร และการวิเคราะห์รายบุคคล</p>
        </div>
        <button 
          onClick={handleOnboard}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-3xl shadow-button hover:shadow-button-hover active:translate-y-[1px] transition-all duration-200"
        >
          <i className="fa-solid fa-user-plus"></i> อนุมัติตัวแทนใหม่
        </button>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map(s => {
          const activeOrdersCount = orders.filter(o => o.sellerId === s.id && o.status !== "REJECTED").length;
          const totalProfit = orders.filter(o => o.sellerId === s.id && o.status !== "REJECTED").reduce((sum, o) => sum + o.profit, 0);

          return (
            <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card flex flex-col gap-4">
              <div className="flex items-center gap-4.5 border-b border-slate-100 pb-3">
                <img src={s.avatar} alt={s.name} className="w-11 h-11 rounded-full border border-slate-100 bg-slate-50" />
                <div>
                  <h4 className="font-semibold text-text-title text-sm">{s.name}</h4>
                  <span className="text-[10px] text-text-caption tracking-wider block mt-0.5">ID: {s.id.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2.5 text-xs text-text-body">
                <div className="flex justify-between">
                  <span className="text-text-caption">ระดับตัวแทน:</span>
                  <span className="font-semibold text-brand-secondary">{s.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-caption">ยอดขายรวมส่งสำเร็จ:</span>
                  <span className="font-semibold text-text-title">{s.totalSales.toLocaleString()} THB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-caption">คอมมิชชันสะสม:</span>
                  <span className="font-semibold text-status-success-text">+{totalProfit.toLocaleString()} THB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-caption">จำนวนออเดอร์:</span>
                  <span className="font-semibold text-text-title">{activeOrdersCount} ออเดอร์</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

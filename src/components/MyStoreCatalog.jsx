import React from 'react';

export default function MyStoreCatalog({ sellerCatalog, products, onRemoveFromCatalog, onEditPrice, onNavigateToBrowse }) {
  
  if (sellerCatalog.length === 0) {
    return (
      <div className="text-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl shadow-card mt-4 animate-fade-in">
        <i className="fa-solid fa-cart-flatbed-suitcase text-5xl text-slate-300 mb-4 block"></i>
        <h3 className="text-lg font-semibold text-text-title mb-2">ร้านของคุณยังไม่มีสินค้าสำหรับเสนอขาย</h3>
        <p className="text-xs text-text-caption mb-6 max-w-sm mx-auto">ไปที่แท็บ "หาสินค้าไปขาย" และเลือกสินค้าแบรนด์เข้าสู่ร้านค้าของคุณเพื่อเริ่มสร้างรายได้ได้ทันที</p>
        <button 
          onClick={onNavigateToBrowse}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-semibold rounded-3xl shadow-button active:translate-y-[1px] transition-all"
        >
          เลือกชมสินค้าตอนนี้
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-title">ร้านค้าของฉัน (My Store Catalog)</h2>
        <p className="text-text-caption text-sm">จัดการราคาสินค้าที่คุณขาย ปรับเปลี่ยนราคาตามกลยุทธ์การขายปลีก (ห้ามต่ำกว่าราคากลาง)</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-text-title font-semibold">
                <th className="p-4 border-b border-slate-100">ภาพสินค้า</th>
                <th className="p-4 border-b border-slate-100">ชื่อสินค้า</th>
                <th className="p-4 border-b border-slate-100">ราคากลาง (Dealer Price)</th>
                <th className="p-4 border-b border-slate-100">ราคาขายปลีกของคุณ (Selling Price)</th>
                <th className="p-4 border-b border-slate-100">ส่วนต่างกำไรต่อชิ้น</th>
                <th className="p-4 border-b border-slate-100">จำนวนสต็อกคงคลัง</th>
                <th className="p-4 border-b border-slate-100">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellerCatalog.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                const margin = item.sellingPrice - product.dealerPrice;

                return (
                  <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-slate-100" alt="" />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-text-title">{product.name}</div>
                      <span className="text-xs text-text-caption block mt-1 line-clamp-1">{product.description}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-600">
                      {product.dealerPrice.toLocaleString()} THB
                    </td>
                    <td className="p-4 font-bold text-brand-secondary text-base">
                      {item.sellingPrice.toLocaleString()} THB
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-status-success-text text-sm">+{margin.toLocaleString()} THB</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {product.stock} ชิ้น
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditPrice(product)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-secondary-subtle text-brand-secondary hover:bg-brand-secondary hover:text-white transition-all"
                          title="ปรับปรุงราคา"
                        >
                          <i className="fa-solid fa-sliders text-xs"></i>
                        </button>
                        <button
                          onClick={() => onRemoveFromCatalog(product.id, product.name)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-status-error-bg text-status-error-text hover:bg-status-error hover:text-white transition-all"
                          title="ถอนสินค้าออกจากร้าน"
                        >
                          <i className="fa-solid fa-circle-minus text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

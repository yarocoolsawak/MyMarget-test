import React, { useState, useEffect } from 'react';

export default function BrowseCatalog({ products, sellerCatalog, onConfigureCatalog }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [validationError, setValidationError] = useState(false);

  // Active products only
  const activeProducts = products.filter(p => p.status === "ACTIVE");

  const openConfigModal = (product) => {
    setSelectedProduct(product);
    const existing = sellerCatalog.find(c => c.productId === product.id);
    // Default proposed price: Dealer price + 15% markup rounded up to nearest 10
    const defaultPrice = existing ? existing.sellingPrice : Math.ceil((product.dealerPrice * 1.15) / 10) * 10;
    setSellingPrice(defaultPrice);
  };

  useEffect(() => {
    if (selectedProduct && sellingPrice) {
      setValidationError(parseFloat(sellingPrice) < selectedProduct.dealerPrice);
    } else {
      setValidationError(false);
    }
  }, [sellingPrice, selectedProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || validationError || !sellingPrice) return;

    onConfigureCatalog(selectedProduct.id, parseFloat(sellingPrice));
    setSelectedProduct(null);
  };

  const dealerPrice = selectedProduct ? selectedProduct.dealerPrice : 0;
  const numericSellingPrice = parseFloat(sellingPrice) || 0;
  const profit = numericSellingPrice - dealerPrice;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-title">หาสินค้าขายดีเข้าหน้าร้าน (Browse Brand Products)</h2>
        <p className="text-text-caption text-sm">เลือกสินค้าของแบรนด์ไปแสดงขาย กำหนดราคาปลีก และรับส่วนต่างเมื่อออเดอร์ส่งสำเร็จ</p>
      </div>

      {activeProducts.length === 0 ? (
        <div className="text-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl shadow-card">
          <i className="fa-solid fa-boxes-packing text-4xl text-slate-300 mb-4 block"></i>
          <h3 className="text-base font-semibold text-text-title">ไม่มีสินค้าแอคทีฟจากแบรนด์ในขณะนี้</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeProducts.map(p => {
            const catalogItem = sellerCatalog.find(c => c.productId === p.id);
            const isInCatalog = !!catalogItem;

            return (
              <div key={p.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col">
                <img src={p.image} alt={p.name} className="h-40 w-full object-cover bg-slate-100" />
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-semibold text-text-title text-sm mb-1.5 line-clamp-1">{p.name}</h4>
                  <p className="text-xs text-text-caption line-clamp-2 leading-relaxed mb-4 flex-grow">{p.description}</p>
                  
                  <div className="flex justify-between items-baseline border-t border-slate-100 pt-3 mb-3">
                    <span className="text-[10px] text-text-caption uppercase font-semibold">ราคากลางต้นทุน:</span>
                    <span className="text-base font-bold text-brand-primary">{p.dealerPrice.toLocaleString()} THB</span>
                  </div>

                  <div className="text-xs text-text-caption mb-4 flex items-center gap-1.5">
                    <i className="fa-solid fa-cubes text-[10px]"></i> สต็อกพร้อมส่ง: <strong className="text-text-title">{p.stock} ชิ้น</strong>
                  </div>

                  <div className="mb-4">
                    {isInCatalog ? (
                      <div className="text-xs text-status-success-text font-semibold bg-status-success-bg border border-green-100 rounded-lg p-2">
                        <div className="flex justify-between">
                          <span>ราคาของคุณ:</span>
                          <span>{catalogItem.sellingPrice.toLocaleString()} THB</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-text-caption mt-0.5 font-normal">
                          <span>ส่วนต่างกำไร:</span>
                          <span className="text-status-success-text">{(catalogItem.sellingPrice - p.dealerPrice).toLocaleString()} THB</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-text-caption italic p-2 bg-slate-50 rounded-lg">
                        ยังไม่ถูกเพิ่มเข้าร้านค้าของคุณ
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openConfigModal(p)}
                    className={`w-full py-2 text-xs font-semibold rounded-3xl active:translate-y-[1.5px] transition-all duration-200 ${
                      isInCatalog
                        ? 'border border-brand-secondary text-brand-secondary hover:bg-brand-secondary-subtle'
                        : 'bg-brand-secondary text-white hover:bg-brand-secondary-hover shadow-button'
                    }`}
                  >
                    <i className={isInCatalog ? "fa-solid fa-pen mr-1" : "fa-solid fa-circle-plus mr-1"}></i>
                    {isInCatalog ? "ปรับราคาขายปลีก" : "เพิ่มเข้าร้านค้าเพื่อขาย"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Configure retail price */}
      {selectedProduct && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[450px] shadow-modal overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-text-title text-base flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-brand-secondary"></i> เพิ่มสินค้าเข้าสู่ร้านค้าของคุณ
              </h3>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-text-caption hover:bg-slate-100 hover:text-text-title w-8 h-8 rounded-full flex items-center justify-center text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <img src={selectedProduct.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-grow">
                    <h4 className="font-semibold text-text-title text-sm mb-1">{selectedProduct.name}</h4>
                    <span className="text-[10px] text-text-caption block uppercase">รหัส: {selectedProduct.id.toUpperCase()}</span>
                    <span className="inline-block mt-2 text-xs font-semibold bg-brand-primary-subtle text-brand-primary px-2.5 py-0.5 rounded-full">
                      ราคากลาง Dealer: {selectedProduct.dealerPrice.toLocaleString()} THB
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text-title text-sm">ตั้งราคาเสนอขายปลีกของร้านคุณ (THB) <span className="text-status-error-text">*</span></label>
                  <input 
                    type="number" 
                    value={sellingPrice} 
                    onChange={e => setSellingPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-base font-bold focus:outline-none focus:border-brand-secondary"
                    required 
                    min="1" 
                  />
                  {validationError && (
                    <span className="text-xs text-status-error-text font-medium flex items-center gap-1 mt-1">
                      <i className="fa-solid fa-circle-exclamation"></i> ราคาขายปลีกห้ามต่ำกว่าราคากลางที่แบรนด์กำหนด ({selectedProduct.dealerPrice} THB)
                    </span>
                  )}
                </div>

                {/* Calculator */}
                <div className="border-t border-dashed border-slate-200 pt-4">
                  <h4 className="text-[11px] font-bold text-text-caption uppercase tracking-wider mb-2.5">เครื่องคำนวณกำไรโดยประมาณ (ต่อชิ้น)</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-body">ราคาขายปลีกของคุณ:</span>
                      <span className="font-semibold text-text-title">{numericSellingPrice.toLocaleString()} THB</span>
                    </div>
                    <div className="flex justify-between text-text-caption">
                      <span>หักราคากลางของแบรนด์:</span>
                      <span>-{dealerPrice.toLocaleString()} THB</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                      <span>ส่วนต่างกำไรสุทธิ:</span>
                      {validationError ? (
                        <span className="text-status-error-text">ติดลบ (ไม่ผ่านเกณฑ์)</span>
                      ) : (
                        <span className="text-status-success-text">+{profit.toLocaleString()} THB</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border border-slate-200 text-text-body font-semibold rounded-3xl hover:bg-slate-100 text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={validationError}
                  className={`px-5 py-2 text-white font-semibold rounded-3xl shadow-button text-sm transition-all ${
                    validationError 
                      ? 'bg-slate-300 cursor-not-allowed opacity-50' 
                      : 'bg-brand-secondary hover:bg-brand-secondary-hover'
                  }`}
                >
                  ยืนยันนำเข้าสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

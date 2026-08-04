import React, { useState } from 'react';

export default function ProductManagement({ products, onAddProduct, onUpdateStock, onDeleteProduct, onEditProduct }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [dealerPrice, setDealerPrice] = useState('');
  const [stock, setStock] = useState('');
  const [shippingSetting, setShippingSetting] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dealerPrice || !stock) return;

    onAddProduct({
      name,
      dealerPrice: parseFloat(dealerPrice),
      stock: parseInt(stock),
      shippingSetting,
      image: image.trim()
    });

    // Reset Form
    setName('');
    setDealerPrice('');
    setStock('');
    setShippingSetting('');
    setImage('');
    setIsModalOpen(false);
  };

  const handleUpdateStock = (productId, currentStock, productName) => {
    const newStockStr = prompt(`ระบุจำนวนสต็อกใหม่ของ "${productName}":`, currentStock);
    if (newStockStr === null) return;
    
    const newStock = parseInt(newStockStr);
    if (isNaN(newStock) || newStock < 0) {
      alert("กรุณาระบุตัวเลขจำนวนสต็อกที่มากกว่าหรือเท่ากับ 0");
      return;
    }
    onUpdateStock(productId, newStock);
  };

  const handleEditProduct = (productId, currentPrice, productName) => {
    const newPriceStr = prompt(`แก้ไขราคากลาง (Dealer Price) ของ "${productName}":`, currentPrice);
    if (newPriceStr === null) return;
    
    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("กรุณาระบุราคาที่มากกว่า 0");
      return;
    }
    onEditProduct(productId, newPrice);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-title">การจัดการสินค้า (Product Management)</h2>
          <p className="text-text-caption text-sm">สร้างสินค้า กำหนดราคากลาง (Dealer Price) และตั้งค่าเงื่อนไขการจัดส่ง</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-3xl shadow-button hover:shadow-button-hover active:translate-y-[1px] transition-all duration-200"
        >
          <i className="fa-solid fa-plus"></i> เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-text-title font-semibold">
                <th className="p-4 border-b border-slate-100">ภาพสินค้า</th>
                <th className="p-4 border-b border-slate-100">ชื่อสินค้า</th>
                <th className="p-4 border-b border-slate-100">ราคากลาง (Dealer Price)</th>
                <th className="p-4 border-b border-slate-100">จำนวนสต็อก</th>
                <th className="p-4 border-b border-slate-100">ผู้รับผิดชอบค่าส่ง</th>
                <th className="p-4 border-b border-slate-100">สถานะการขาย</th>
                <th className="p-4 border-b border-slate-100">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-text-title">{p.name}</div>
                    <span className="text-xs text-text-caption block mt-1 line-clamp-1">{p.description}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    {p.dealerPrice.toLocaleString()} THB
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{p.stock} ชิ้น</span>
                      <button 
                        onClick={() => handleUpdateStock(p.id, p.stock, p.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-200 text-slate-500 transition-colors"
                        title="ปรับสต็อก"
                      >
                        <i className="fa-solid fa-pen-to-square text-xs"></i>
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    {p.shippingSetting === "BRAND" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-secondary-subtle text-brand-secondary">แบรนด์ดูแลค่าส่ง</span>
                    ) : p.shippingSetting === "CUSTOMER" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-warning-bg text-status-warning-text">ลูกค้าจ่ายค่าส่ง</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">ยังไม่ตั้งค่าส่ง</span>
                    )}
                  </td>
                  <td className="p-4">
                    {p.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-bg text-status-success-text">
                        <i className="fa-solid fa-circle-check text-[10px]"></i> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                        <i className="fa-solid fa-circle-minus text-[10px]"></i> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProduct(p.id, p.dealerPrice, p.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-primary-subtle text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
                        title="แก้ไขสินค้า"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(p.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-status-error-bg text-status-error-text hover:bg-status-error hover:text-white transition-all"
                        title="ลบสินค้า"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in">
          <div className="bg-white rounded-2xl w-11/12 max-w-[500px] shadow-modal overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-text-title text-base flex items-center gap-2">
                <i className="fa-solid fa-circle-plus text-brand-primary"></i> เพิ่มสินค้าใหม่เข้าระบบ
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-text-caption hover:bg-slate-100 hover:text-text-title w-8 h-8 rounded-full flex items-center justify-center text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text-title text-sm">ชื่อสินค้า <span className="text-status-error-text">*</span></label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary-subtle" 
                    required 
                    placeholder="เช่น เนื้อชิ้นวากิว A5" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-sm">ราคากลาง Dealer Price (THB) <span class="text-status-error-text">*</span></label>
                    <input 
                      type="number" 
                      value={dealerPrice} 
                      onChange={e => setDealerPrice(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary-subtle" 
                      required 
                      min="1" 
                      placeholder="ราคาส่งขั้นต่ำ" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-sm">จำนวนสต็อกคงเหลือ <span class="text-status-error-text">*</span></label>
                    <input 
                      type="number" 
                      value={stock} 
                      onChange={e => setStock(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary-subtle" 
                      required 
                      min="0" 
                      placeholder="จำนวนสินค้าในคลัง" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text-title text-sm">การจัดการค่าส่งสินค้า <span className="text-status-error-text">*</span></label>
                  <select 
                    value={shippingSetting} 
                    onChange={e => setShippingSetting(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary-subtle" 
                    required
                  >
                    <option value="">-- โปรดเลือกข้อตกลงค่าจัดส่ง --</option>
                    <option value="CUSTOMER">ลูกค้าเป็นผู้รับผิดชอบค่าขนส่ง (คำนวณตามจริง)</option>
                    <option value="BRAND">แบรนด์สนับสนุนค่าส่งให้ (ส่งฟรีสำหรับตัวแทน)</option>
                  </select>
                  <span className="text-[11px] text-text-caption">หากยังไม่กำหนดค่าจัดส่ง สินค้าจะมีสถานะเป็น Inactive ทันที</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-text-title text-sm">ลิงก์รูปภาพสินค้า (เว้นว่างได้)</label>
                  <input 
                    type="url" 
                    value={image} 
                    onChange={e => setImage(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary-subtle" 
                    placeholder="https://example.com/image.jpg" 
                  />
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
                  className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-3xl hover:bg-brand-primary-hover shadow-button text-sm"
                >
                  ยืนยันบันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

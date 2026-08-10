import React, { useState } from 'react';

export default function PromptPayModal({ isOpen, onClose, order, onSimulateSuccess }) {
  if (!isOpen || !order) return null;

  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    // Simulate a brief network delay
    setTimeout(() => {
      onSimulateSuccess(order.id);
      setLoading(false);
      onClose();
    }, 1200);
  };

  // Generate a real scannable PromptPay QR code image from promptpay.io using a mock corporate ID and the order amount
  const qrCodeUrl = `https://promptpay.io/0812345678/${order.totalAmount}.png`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-2xl border border-slate-100 overflow-hidden animate-scale-up font-sans">
        
        {/* Navy header banner simulating typical Thai banking design */}
        <div className="bg-[#112F55] p-5 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold text-[#112F55] text-lg">
              QR
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Thai QR Payment</h3>
              <p className="text-[10px] text-slate-300">ระบบจำลองการจ่ายเงินผ่านบัญชีพร้อมเพย์</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center">
          
          {/* Order info card */}
          <div className="bg-slate-50 w-full rounded-xl p-4 mb-5 border border-slate-100 text-xs text-text-body space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-caption">หมายเลขออเดอร์:</span>
              <span className="font-bold text-text-title">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-caption">ชื่อลูกค้า:</span>
              <span className="font-semibold text-text-title">{order.customerName}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-1.5 font-bold text-sm">
              <span className="text-text-title">ยอดเงินที่ต้องชำระ:</span>
              <span className="text-[#112F55]">${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB</span>
            </div>
          </div>

          {/* QR Code Frame */}
          <div className="bg-white border-2 border-slate-100 rounded-xl p-4 shadow-sm inline-block relative">
            <img 
              src={qrCodeUrl} 
              alt="PromptPay QR Code" 
              className="w-48 h-48 mx-auto" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://api.dicebear.com/7.x/identicon/svg?seed=promptpay";
              }}
            />
            {/* PromptPay watermark at the bottom of the QR container */}
            <div className="mt-2 text-[10px] font-bold text-[#112F55] tracking-wider uppercase">
              PROMPTPAY
            </div>
          </div>

          <p className="text-[10px] text-text-caption mt-4 leading-relaxed max-w-[280px]">
            * สแกน QR Code ด้านบนด้วยแอปพลิเคชันธนาคารเพื่อจำลองยอด หรือกดปุ่มอนุมัติจ่ายเงินจำลองด้านล่างเพื่อชำระเงินสำเร็จทันที
          </p>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-5 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-xs font-semibold text-text-body rounded-lg hover:bg-white transition-all"
          >
            ปิดหน้าจอ
          </button>
          <button
            type="button"
            onClick={handleSimulate}
            disabled={loading}
            className="px-5 py-2 bg-[#112F55] hover:bg-[#1A4171] text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                <span>กำลังชำระเงิน...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check"></i>
                <span>จำลองการจ่ายเงินสำเร็จ</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

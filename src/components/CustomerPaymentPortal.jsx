import React, { useState } from 'react';

export default function CustomerPaymentPortal({ orderId, orders, products, onSimulateSuccess }) {
  const order = orders.find(o => o.id === orderId);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-card max-w-[480px] w-full">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-4">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
          <h3 className="text-lg font-bold text-text-title mb-2">ไม่พบออเดอร์นี้ในระบบ</h3>
          <p className="text-text-body text-sm mb-6">
            ลิงก์ชำระเงินนี้ไม่ถูกต้อง หรือออเดอร์อาจถูกยกเลิกแล้ว กรุณาตรวจสอบกับผู้ขายใหม่อีกครั้ง
          </p>
          <a href="/" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-text-title font-semibold text-xs rounded-xl transition-all">
            กลับไปหน้าหลัก
          </a>
        </div>
      </div>
    );
  }

  const product = products.find(p => p.id === order.productId);
  const qrCodeUrl = `https://promptpay.io/0812345678/${order.totalAmount}.png`;

  const handleSimulate = async () => {
    setLoading(true);
    setTimeout(() => {
      onSimulateSuccess(order.id);
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `PromptPay-Order-${order.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (success || order.status === 'CONFIRMED' || order.status === 'DELIVERED' || order.status === 'SETTLED') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-card max-w-[480px] w-full animate-scale-up border-t-4 border-t-green-500">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-3xl mx-auto mb-4">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h3 className="text-lg font-bold text-text-title mb-2">ชำระเงินสำเร็จเรียบร้อย</h3>
          <p className="text-text-body text-sm mb-6 leading-relaxed">
            ขอบคุณสำหรับการชำระเงิน ออเดอร์หมายเลข <span className="font-bold">#{order.id}</span> ได้รับการชำระเงินเรียบร้อยและกำลังดำเนินขั้นตอนการจัดส่งสินค้า
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-text-body mb-6 text-left space-y-1.5 border border-slate-100">
            <div className="flex justify-between">
              <span>รายการสินค้า:</span>
              <span className="font-semibold text-text-title">{product?.name} (x{order.qty})</span>
            </div>
            <div className="flex justify-between">
              <span>ยอดชำระ:</span>
              <span className="font-bold text-[#112F55]">{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB</span>
            </div>
            <div className="flex justify-between">
              <span>ช่องทาง:</span>
              <span className="font-semibold text-text-title">PromptPay QR</span>
            </div>
          </div>
          <p className="text-[10px] text-text-caption">คุณสามารถปิดแท็บหน้าต่างนี้ได้ทันที</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl max-w-[450px] w-full overflow-hidden animate-scale-up">
        
        {/* Navy Thai QR Header */}
        <div className="bg-[#112F55] p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-bold text-[#112F55] text-xl mx-auto mb-2.5">
            QR
          </div>
          <h2 className="font-bold text-lg leading-tight">Thai QR Payment</h2>
          <p className="text-xs text-slate-300 mt-1">ชำระเงินผ่านบริการพร้อมเพย์สำหรับคำสั่งซื้อ #{order.id}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center">
          
          {/* Order Details summary */}
          <div className="bg-slate-50 w-full rounded-xl p-4.5 mb-6 border border-slate-100 text-xs text-text-body space-y-2">
            <div className="flex justify-between">
              <span className="text-text-caption">สินค้า:</span>
              <span className="font-bold text-text-title">{product?.name} (x{order.qty})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-caption">ผู้ขาย (Seller):</span>
              <span className="font-semibold text-text-title">Seller ID #{order.sellerId}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-sm">
              <span className="text-text-title">ยอดเงินที่ต้องชำระ:</span>
              <span className="text-[#112F55]">${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB</span>
            </div>
          </div>

          {/* QR Frame with scan button */}
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm inline-block relative">
            <img 
              src={qrCodeUrl} 
              alt="PromptPay QR Code" 
              className="w-52 h-52 mx-auto"
            />
            <div className="mt-2 text-[10px] font-bold text-[#112F55] tracking-wider uppercase text-center">
              PROMPTPAY
            </div>
          </div>

          <div className="flex gap-3 w-full mt-6">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-text-body text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-download"></i> เซฟรูปภาพ QR
            </button>
            {order.stripePaymentUrl && (
              <a
                href={order.stripePaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-credit-card"></i> จ่ายผ่านบัตรเครดิต
              </a>
            )}
          </div>

          <p className="text-[10px] text-text-caption mt-6 leading-relaxed text-center max-w-[320px]">
            * เซฟรูปภาพสแกนด้วยแอปพลิเคชันธนาคาร หรือหากกำลังทดสอบระบบ ให้กดปุ่มด้านล่างเพื่อยืนยันชำระเงินสำเร็จได้ทันที
          </p>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#112F55] hover:bg-[#1A4171] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                <span>กำลังชำระเงิน...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check"></i>
                <span>จำลองการชำระเงินสำเร็จ (PromptPay)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

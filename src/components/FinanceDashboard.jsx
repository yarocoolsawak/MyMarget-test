import React, { useState, useEffect } from 'react';

export default function FinanceDashboard({ stripeConnected, stripeAccountId, stripeMainAccountId, role, onOpenStripeConnect }) {
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Load withdrawal history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`mymarket_payouts_${stripeAccountId}`);
    if (savedHistory) {
      try {
        setWithdrawHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse payout history", e);
      }
    }
  }, [stripeAccountId]);

  // Fetch balance and bank account details
  const fetchStripeFinanceData = async () => {
    if (!stripeConnected || !stripeAccountId) return;
    setLoading(true);
    try {
      // 1. Fetch balance
      const balRes = await fetch(`/api/get-stripe-balance?account_id=${stripeAccountId}`);
      const balData = await balRes.json();
      if (!balData.error) {
        const avail = balData.available?.reduce((sum, item) => sum + item.amount, 0) || 0;
        const pend = balData.pending?.reduce((sum, item) => sum + item.amount, 0) || 0;
        setBalance({ available: avail / 100, pending: pend / 100 }); // convert cents to USD
      }

      // 2. Fetch bank/account info
      const accRes = await fetch(`/api/get-account-details?account_id=${stripeAccountId}`);
      const accData = await accRes.json();
      if (!accData.error) {
        setBankInfo(accData);
      }
    } catch (err) {
      console.error("Error fetching Stripe finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStripeFinanceData();
  }, [stripeConnected, stripeAccountId]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(payoutAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;
    if (amountVal > balance.available) {
      alert("ยอดเงินที่พร้อมถอนไม่เพียงพอ");
      return;
    }

    setPayoutLoading(true);
    try {
      const cents = Math.round(amountVal * 100);
      const res = await fetch('/api/create-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: stripeAccountId,
          amount: cents
        })
      });
      const payout = await res.json();

      if (payout.error) {
        alert(`ถอนเงินไม่สำเร็จ: ${payout.error}`);
      } else {
        // Save to history
        const newRecord = {
          id: payout.id || `po_${Math.random().toString(36).substr(2, 9)}`,
          amount: amountVal,
          currency: 'USD',
          status: payout.status || 'paid', // Stripe mock payouts are immediately paid in test mode
          created: new Date().toLocaleString('th-TH'),
          bankName: bankInfo?.bankName || "Stripe Test Bank",
          last4: bankInfo?.last4 || "9991"
        };
        const updatedHistory = [newRecord, ...withdrawHistory];
        setWithdrawHistory(updatedHistory);
        localStorage.setItem(`mymarket_payouts_${stripeAccountId}`, JSON.stringify(updatedHistory));
        
        // Refresh balance
        await fetchStripeFinanceData();
        setShowWithdrawModal(false);
        setPayoutAmount('');
        alert("ทำรายการสั่งถอนเงินสำเร็จ! ยอดเงินจะถูกโอนเข้าบัญชีธนาคารปลายทางของคุณ");
      }
    } catch (err) {
      console.error("Payout error:", err);
      alert("เกิดข้อผิดพลาดในการทำรายการสั่งถอนเงิน");
    } finally {
      setPayoutLoading(false);
    }
  };

  const isBrand = role === 'brand';
  const themeColor = isBrand ? 'brand-primary' : 'brand-secondary';
  const themeBg = isBrand ? 'bg-brand-primary-subtle text-brand-primary' : 'bg-brand-secondary-subtle text-brand-secondary';
  const themeButton = isBrand ? 'bg-brand-primary hover:bg-brand-primary/90 text-white' : 'bg-brand-secondary hover:bg-brand-secondary/90 text-white';

  return (
    <div className="animate-fade-in">
      {/* Title Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-title">การเงินและยอดเงินโอน (Finance & Payouts)</h2>
          <p className="text-text-caption text-sm">ตรวจสอบยอดคงเหลือ ถอนเงินสะสม และติดตามสถานะประวัติการทำรายการการเงินของคุณ</p>
        </div>
        <div className="flex items-center gap-3">
          {stripeConnected ? (
            <div className="flex items-center gap-2 bg-status-success-bg border border-green-200 px-4 py-2 rounded-3xl text-xs font-semibold text-status-success-text">
              <i className="fa-brands fa-stripe text-lg"></i>
              <span>เชื่อมต่อ Stripe Connect เรียบร้อย ({stripeAccountId})</span>
            </div>
          ) : (
            <button 
              onClick={onOpenStripeConnect}
              className={`inline-flex items-center gap-2 px-4.5 py-2.5 ${themeButton} text-xs font-semibold rounded-3xl shadow-button transition-all duration-200 animate-pulse`}
            >
              <i className="fa-brands fa-stripe text-lg"></i> เชื่อมบัญชี Stripe เพื่อรับเงิน
            </button>
          )}
        </div>
      </div>

      {!stripeConnected ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-card max-w-[600px] mx-auto mt-8">
          <div className={`w-16 h-16 rounded-full ${themeBg} flex items-center justify-center text-3xl mx-auto mb-4`}>
            <i className="fa-solid fa-wallet"></i>
          </div>
          <h3 className="text-lg font-bold text-text-title mb-2">บัญชี Stripe Connect ยังไม่ได้เชื่อมต่อ</h3>
          <p className="text-text-body text-sm mb-6">
            คุณจำเป็นต้องทำการเชื่อมโยงบัญชี Stripe เข้ากับระบบ MyMarket ก่อนเพื่อใช้ในการดึงข้อมูลยอดคงเหลือสะสม และสั่งจ่ายเงิน (Payout) เข้าบัญชีธนาคารจริงของคุณ
          </p>
          <button 
            onClick={onOpenStripeConnect}
            className={`inline-flex items-center gap-2 px-6 py-3 ${themeButton} text-sm font-semibold rounded-3xl shadow-button transition-all`}
          >
            <i className="fa-brands fa-stripe text-lg"></i> เชื่อมบัญชีรับเงิน (Stripe) ทันที
          </button>
        </div>
      ) : (
        <>
          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={fetchStripeFinanceData} 
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs text-text-caption hover:text-text-body transition-colors font-medium"
            >
              <i className={`fa-solid fa-arrows-rotate ${loading ? 'animate-spin' : ''}`}></i>
              <span>ดึงข้อมูลล่าสุดจาก Stripe</span>
            </button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Available Balance */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden border-t-4 border-t-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-text-caption font-semibold uppercase tracking-wider block">ยอดเงินที่พร้อมถอน</span>
                  <span className="text-xs text-slate-400 font-medium">(Available Balance)</span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-500 text-lg">
                  <i className="fa-solid fa-money-bill-trend-up"></i>
                </div>
              </div>
              <div className="mt-2">
                <span className="block text-3xl font-extrabold text-text-title">${balance.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                <span className="block text-xs text-text-caption mt-1">ประมาณ {(balance.available * 34).toLocaleString(undefined, { maximumFractionDigits: 0 })} THB</span>
              </div>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                disabled={balance.available <= 0}
                className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-xs text-center transition-all ${
                  balance.available > 0 
                    ? themeButton + ' shadow-sm' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <i className="fa-solid fa-money-bill-transfer mr-1.5"></i> ถอนเงินเข้าธนาคาร
              </button>
            </div>

            {/* Pending Balance */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden border-t-4 border-t-amber-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-text-caption font-semibold uppercase tracking-wider block">ยอดเงินรอดำเนินการ</span>
                  <span className="text-xs text-slate-400 font-medium">(Pending Balance)</span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-500 text-lg">
                  <i className="fa-solid fa-hourglass-half"></i>
                </div>
              </div>
              <div className="mt-2">
                <span className="block text-3xl font-extrabold text-text-title">${balance.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                <span className="block text-xs text-text-caption mt-1">ประมาณ {(balance.pending * 34).toLocaleString(undefined, { maximumFractionDigits: 0 })} THB</span>
              </div>
              <p className="text-[10px] text-text-caption mt-6.5 leading-relaxed">
                * ยอดเงินจากคำสั่งซื้อที่อยู่ระหว่างกระบวนการเคลียร์บัตรเครดิตของลูกค้า จะย้ายไปเป็นยอดพร้อมถอนโดยอัตโนมัติภายใน 2 วันทำการ
              </p>
            </div>

            {/* Linked Bank Account Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden border-t-4 border-t-slate-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-text-caption font-semibold uppercase tracking-wider block">บัญชีธนาคารปลายทาง</span>
                  <span className="text-xs text-slate-400 font-medium">(Linked Bank Account)</span>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 text-slate-500 text-lg">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
              </div>
              
              {bankInfo ? (
                <div className="mt-3 text-sm text-text-body space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-text-caption text-xs">ธนาคาร:</span>
                    <span className="font-semibold text-text-title text-xs">{bankInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-text-caption text-xs">เลขบัญชี:</span>
                    <span className="font-bold text-text-title text-xs">•••• {bankInfo.last4}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-text-caption text-xs">ประเทศ / สกุลเงิน:</span>
                    <span className="font-semibold text-text-title text-xs">{bankInfo.country} / {bankInfo.defaultCurrency?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-text-caption">สถานะรับเงิน (Payouts):</span>
                    <span className="text-green-500 font-bold">เปิดใช้งานอยู่</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-text-caption animate-pulse">
                  กำลังดึงข้อมูลบัญชีผู้รับเงิน...
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal History Table */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-semibold text-text-title">ประวัติการสั่งถอนเงินออกจาก Stripe</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-text-title font-semibold">
                    <th className="p-3 border-b-2 border-slate-100 text-xs">รหัสรายการ (Payout ID)</th>
                    <th className="p-3 border-b-2 border-slate-100 text-xs">วันเวลาที่ถอน</th>
                    <th className="p-3 border-b-2 border-slate-100 text-xs">ส่งเงินไปที่</th>
                    <th className="p-3 border-b-2 border-slate-100 text-xs">จำนวนเงิน</th>
                    <th className="p-3 border-b-2 border-slate-100 text-xs">สถานะ Stripe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawHistory.length > 0 ? (
                    withdrawHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono text-xs text-text-caption">{item.id}</td>
                        <td className="p-3 text-xs text-text-body">{item.created}</td>
                        <td className="p-3 text-xs text-text-title">
                          <span className="font-semibold">{item.bankName}</span> (•••• {item.last4})
                        </td>
                        <td className="p-3 font-extrabold text-xs text-text-title">
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.currency}
                        </td>
                        <td className="p-3 text-xs">
                          {item.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-status-success-bg text-status-success-text">
                              <i className="fa-solid fa-circle-check text-[10px]"></i> สำเร็จ (Paid)
                            </span>
                          ) : item.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-status-error-bg text-status-error-text">
                              <i className="fa-solid fa-circle-xmark text-[10px]"></i> ล้มเหลว (Failed)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-status-warning-bg text-status-warning-text animate-pulse">
                              <i className="fa-solid fa-circle-notch text-[10px] animate-spin"></i> กำลังดำเนินการ (In transit)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-xs text-text-caption">
                        ยังไม่มีประวัติการส่งคำสั่งจ่ายเงิน (Payout) สำหรับบัญชีนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payout / Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="border-b border-slate-100 p-5 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <i className={`fa-solid fa-money-bill-transfer text-${themeColor}`}></i>
                <h3 className="font-bold text-text-title">คำขอสั่งถอนเงินเข้าบัญชีธนาคาร</h3>
              </div>
              <button 
                onClick={() => {
                  setShowWithdrawModal(false);
                  setPayoutAmount('');
                }}
                className="text-slate-400 hover:text-text-body transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleWithdraw}>
              <div className="p-6 space-y-5">
                {/* Balance Info */}
                <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center text-xs">
                  <span className="text-text-caption font-medium">ยอดคงเหลือที่ถอนได้ทั้งหมด:</span>
                  <span className="font-extrabold text-text-title text-sm text-green-600">${balance.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                </div>

                {/* Amount input */}
                <div>
                  <label htmlFor="payout-amount-input" className="block text-xs font-semibold text-text-title mb-2">จำนวนเงินที่ต้องการถอน (USD)</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                      $
                    </div>
                    <input
                      id="payout-amount-input"
                      type="number"
                      step="0.01"
                      min="1"
                      max={balance.available}
                      required
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="0.00"
                      className="block w-full pl-9 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-bold"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        onClick={() => setPayoutAmount(balance.available.toString())}
                        className={`text-[10px] font-bold uppercase ${themeBg} px-2 py-1 rounded-md`}
                      >
                        ถอนทั้งหมด
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                {payoutAmount && parseFloat(payoutAmount) > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4.5 space-y-2.5 border border-slate-100 text-xs">
                    <span className="font-semibold text-text-title block border-b border-slate-200 pb-2 mb-2">สรุปรายการคำขอ:</span>
                    <div className="flex justify-between">
                      <span className="text-text-caption">จำนวนที่สั่งถอน:</span>
                      <span className="font-bold text-text-title">${parseFloat(payoutAmount).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-status-success-text">
                      <span>ค่าธรรมเนียมการถอน:</span>
                      <span className="font-bold">ฟรีค่าธรรมเนียม</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2.5 font-bold text-sm">
                      <span className="text-text-title">ยอดเงินสุทธิที่จะได้รับ:</span>
                      <span className="text-green-600">${parseFloat(payoutAmount).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2.5 text-[11px]">
                      <span className="text-text-caption">เข้าบัญชีธนาคาร:</span>
                      <span className="font-semibold text-text-title">{bankInfo?.bankName} (•••• {bankInfo?.last4})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-5 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setPayoutAmount('');
                  }}
                  className="px-5 py-2.5 border border-slate-200 text-xs font-semibold text-text-body rounded-xl hover:bg-white transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading || !payoutAmount || parseFloat(payoutAmount) <= 0 || parseFloat(payoutAmount) > balance.available}
                  className={`px-5 py-2.5 ${themeButton} text-xs font-semibold rounded-xl transition-all shadow-button flex items-center gap-1.5 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                >
                  {payoutLoading ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>กำลังส่งคำขอถอนเงิน...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-check"></i>
                      <span>ยืนยันการถอนเงิน</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';

export default function StripeConnectModal({ role, isOpen, onClose, onConnect }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmitDetails = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API redirect/onboarding progress
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-connect-account-silent');
      const data = await response.json();
      
      let accountIdToUse;
      if (data.accountId) {
        accountIdToUse = data.accountId;
      } else {
        console.warn("Silent Stripe Connect returned error, falling back to mock ID:", data.error);
        accountIdToUse = "acct_" + Math.random().toString(36).substr(2, 10).toUpperCase();
      }

      onConnect(role, { email, phone, bankAccount, accountId: accountIdToUse, mainAccountId: data.mainAccountId || '' });
      setStep(1);
      setEmail('');
      setPhone('');
      setBankAccount('');
      onClose();
    } catch (err) {
      console.warn("Silent Stripe Connect request failed, falling back to mock ID:", err);
      const mockAccountId = "acct_" + Math.random().toString(36).substr(2, 10).toUpperCase();
      onConnect(role, { email, phone, bankAccount, accountId: mockAccountId });
      setStep(1);
      setEmail('');
      setPhone('');
      setBankAccount('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-900/60 backdrop-blur-[4px] flex items-center justify-center z-[2100] animate-fade-in">
      <div className="bg-[#635BFF] text-white rounded-2xl w-11/12 max-w-[450px] shadow-modal overflow-hidden animate-fade-in flex flex-col">
        {/* Stripe Header Branding */}
        <div className="p-6 pb-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <i className="fa-brands fa-stripe text-4xl"></i>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Express Onboarding</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all"
          >
            &times;
          </button>
        </div>

        {/* Modal Content */}
        <div className="bg-slate-50 text-slate-800 p-6 flex-grow flex flex-col gap-6">
          
          {/* Onboarding Steps Indicators */}
          <div className="flex justify-between items-center text-xs font-semibold px-4">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#635BFF] text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              <span className={step >= 1 ? 'text-[#635BFF]' : 'text-slate-400'}>กรอกข้อมูล</span>
            </div>
            <div className="h-[2px] bg-slate-200 flex-grow mx-4"></div>
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#635BFF] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span className={step >= 2 ? 'text-[#635BFF]' : 'text-slate-400'}>ยืนยันบัญชีปลายทาง</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#635BFF] rounded-full animate-spin"></div>
              <p className="text-xs text-text-caption font-semibold">กำลังเชื่อมโยงข้อมูลกับระบบ Stripe Connect...</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <form onSubmit={handleSubmitDetails} className="space-y-4">
                  <div className="text-xs text-text-body leading-relaxed bg-[#635BFF]/5 border border-[#635BFF]/10 rounded-xl p-4">
                    <strong>ระบบเชื่อมบัญชี Stripe Connect:</strong>
                    <p className="mt-1 text-slate-600">
                      กรุณากรอกข้อมูลของคุณเพื่อลงทะเบียนเปิดบัญชีรับเงินแบบร้านค้ากับ Stripe (ระบบจำลอง) เพื่อใช้เป็นบัญชีรับยอดเงินจากการจำหน่ายสินค้า
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-semibold text-text-title text-xs">อีเมลบัญชีผู้ใช้ <span className="text-status-error-text">*</span></label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#635BFF]"
                      required
                      placeholder="example@mymarket.com"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-semibold text-text-title text-xs">เบอร์โทรศัพท์สำหรับรับ SMS OTP <span className="text-status-error-text">*</span></label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#635BFF]"
                      required
                      placeholder="เช่น 0891234567"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#635BFF] hover:bg-[#5048e5] text-white font-semibold text-xs rounded-xl shadow-button transition-all duration-200 mt-2"
                  >
                    ถัดไป (กรอกข้อมูลธนาคาร)
                  </button>
                </form>
              )}

              {step === 2 && (
                <div className="space-y-5 text-left">
                  <div className="text-xs text-text-body leading-relaxed bg-status-success-bg border border-green-100 rounded-xl p-4">
                    <i className="fa-solid fa-shield-halved text-status-success-text mr-1"></i> ยืนยันข้อมูลตัวตนเสร็จเรียบร้อย!
                    <p className="mt-1 text-slate-600">ขั้นตอนสุดท้าย: กรอกหมายเลขบัญชีธนาคารเพื่อรับเงินโอนออก (Payout)</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-text-title text-xs">เลขที่บัญชีธนาคาร หรือเบอร์ PromptPay <span className="text-status-error-text">*</span></label>
                    <input 
                      type="text" 
                      value={bankAccount}
                      onChange={e => setBankAccount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#635BFF] font-bold"
                      required
                      placeholder="เช่น 012-3-45678-9 หรือ 0891234567"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-all"
                    >
                      ย้อนกลับ
                    </button>
                    <button 
                      type="button"
                      onClick={handleCompleteOnboarding}
                      className="w-2/3 py-2.5 bg-[#635BFF] hover:bg-[#5048e5] text-white font-semibold text-xs rounded-xl shadow-button transition-all duration-200"
                    >
                      ยืนยันและเชื่อมต่อ Stripe Connect
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_SELLERS,
  DEFAULT_ORDERS,
  DEFAULT_SELLER_CATALOG
} from './mockData';

// Brand Components
import BrandDashboard from './components/BrandDashboard';
import ProductManagement from './components/ProductManagement';
import BrandOrders from './components/BrandOrders';
import BrandSellers from './components/BrandSellers';

// Seller Components
import SellerDashboard from './components/SellerDashboard';
import BrowseCatalog from './components/BrowseCatalog';
import MyStoreCatalog from './components/MyStoreCatalog';
import SellerOrders from './components/SellerOrders';
import StripeConnectModal from './components/StripeConnectModal';
import FinanceDashboard from './components/FinanceDashboard';

export default function App() {
  // --- STATE SECTIONS ---
  const [currentRole, setCurrentRole] = useState('brand');
  const [activeBrandTab, setActiveBrandTab] = useState('dashboard');
  const [activeSellerTab, setActiveSellerTab] = useState('dashboard');

  const switchRole = (role) => {
    setCurrentRole(role);
  };
  
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerCatalog, setSellerCatalog] = useState([]);

  const [brandPendingSettlement, setBrandPendingSettlement] = useState(0);
  const [brandOutstandingBalance, setBrandOutstandingBalance] = useState(0);
  const [brandAccountStatus, setBrandAccountStatus] = useState('ACTIVE');
  
  const [toasts, setToasts] = useState([]);
  
  const [brandStripeConnected, setBrandStripeConnected] = useState(true);
  const [brandStripeAccountId, setBrandStripeAccountId] = useState('acct_1U0zHSBrPGkr2X5w');
  const [brandStripeMainAccountId, setBrandStripeMainAccountId] = useState('acct_1U0e7YPcKKk6xz69');
  const [sellerStripeConnected, setSellerStripeConnected] = useState(true);
  const [sellerStripeAccountId, setSellerStripeAccountId] = useState('acct_1U0zHVBcWQdyiTVi');
  const [sellerStripeMainAccountId, setSellerStripeMainAccountId] = useState('acct_1U0e7YPcKKk6xz69');
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeModalRole, setStripeModalRole] = useState('brand');
  
  const activeSellerId = 's2'; // fixed active seller for prototype testing

  // --- INITIALIZE & SAVE ---
  useEffect(() => {
    const raw = localStorage.getItem('mymarket_react_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setProducts(parsed.products || DEFAULT_PRODUCTS);
        setSellers(parsed.sellers || DEFAULT_SELLERS);
        setOrders(parsed.orders || DEFAULT_ORDERS);
        setSellerCatalog(parsed.sellerCatalog || DEFAULT_SELLER_CATALOG);
        setBrandStripeConnected(parsed.brandStripeConnected !== undefined ? parsed.brandStripeConnected : true);
        setBrandStripeAccountId(parsed.brandStripeAccountId || 'acct_1U0zHSBrPGkr2X5w');
        setBrandStripeMainAccountId(parsed.brandStripeMainAccountId || 'acct_1U0e7YPcKKk6xz69');
        setSellerStripeConnected(parsed.sellerStripeConnected !== undefined ? parsed.sellerStripeConnected : true);
        setSellerStripeAccountId(parsed.sellerStripeAccountId !== undefined ? parsed.sellerStripeAccountId : 'acct_1U0zHVBcWQdyiTVi');
        setSellerStripeMainAccountId(parsed.sellerStripeMainAccountId !== undefined ? parsed.sellerStripeMainAccountId : 'acct_1U0e7YPcKKk6xz69');
        setBrandPendingSettlement(parsed.brandPendingSettlement || 0);
        setBrandOutstandingBalance(parsed.brandOutstandingBalance || 0);
        setBrandAccountStatus(parsed.brandAccountStatus || 'ACTIVE');
        return;
      } catch (e) {
        console.error("Failed to parse localStorage state", e);
      }
    }
    // Load Defaults
    setProducts([...DEFAULT_PRODUCTS]);
    setSellers([...DEFAULT_SELLERS]);
    setOrders([...DEFAULT_ORDERS]);
    setSellerCatalog([...DEFAULT_SELLER_CATALOG]);
    setBrandPendingSettlement(0);
    setBrandOutstandingBalance(0);
    setBrandAccountStatus('ACTIVE');
  }, []);

  // Handle Stripe Redirect verification (Payments & Connect Onboarding)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. Payment Success Redirect
    const success = urlParams.get('payment_success');
    const orderId = urlParams.get('order_id');
    const sessionId = urlParams.get('session_id');
    const connectedAccountId = urlParams.get('connected_account_id');

    if (success === 'true' && orderId && sessionId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        handleCheckPaymentStatusAfterRedirect(orderId, sessionId, connectedAccountId);
      }, 800);
      return;
    }

    // 2. Stripe Connect Onboarding Success Redirect
    const connectStatus = urlParams.get('stripe_connect_status');
    const connectRole = urlParams.get('role');
    const connectAccountId = urlParams.get('account_id');

    if (connectStatus === 'success' && connectRole && connectAccountId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        handleConnectStripe(connectRole, { accountId: connectAccountId });
      }, 800);
    } else if (connectStatus === 'refresh' && connectRole) {
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("เชื่อมต่อไม่สำเร็จ", "คุณยกเลิกการลงทะเบียน หรือเซสชันหมดอายุก่อนจะเสร็จสิ้นบนหน้าเว็บ Stripe", "error");
    }
  }, []);

  const saveState = (updatedProducts, updatedSellers, updatedOrders, updatedCatalog, extraState = {}) => {
    const nextPendingSettlement = extraState.brandPendingSettlement !== undefined ? extraState.brandPendingSettlement : brandPendingSettlement;
    const nextOutstandingBalance = extraState.brandOutstandingBalance !== undefined ? extraState.brandOutstandingBalance : brandOutstandingBalance;
    const nextAccountStatus = extraState.brandAccountStatus !== undefined ? extraState.brandAccountStatus : brandAccountStatus;

    localStorage.setItem('mymarket_react_state', JSON.stringify({
      products: updatedProducts || products,
      sellers: updatedSellers || sellers,
      orders: updatedOrders || orders,
      sellerCatalog: updatedCatalog || sellerCatalog,
      brandStripeConnected: extraState.brandStripeConnected !== undefined ? extraState.brandStripeConnected : brandStripeConnected,
      brandStripeAccountId: extraState.brandStripeAccountId !== undefined ? extraState.brandStripeAccountId : brandStripeAccountId,
      brandStripeMainAccountId: extraState.brandStripeMainAccountId !== undefined ? extraState.brandStripeMainAccountId : brandStripeMainAccountId,
      sellerStripeConnected: extraState.sellerStripeConnected !== undefined ? extraState.sellerStripeConnected : sellerStripeConnected,
      sellerStripeAccountId: extraState.sellerStripeAccountId !== undefined ? extraState.sellerStripeAccountId : sellerStripeAccountId,
      sellerStripeMainAccountId: extraState.sellerStripeMainAccountId !== undefined ? extraState.sellerStripeMainAccountId : sellerStripeMainAccountId,
      brandPendingSettlement: nextPendingSettlement,
      brandOutstandingBalance: nextOutstandingBalance,
      brandAccountStatus: nextAccountStatus
    }));
  };

  // --- GLOBAL TOAST SYSTEM ---
  const showToast = (title, message, type = 'success', undoCallback = null) => {
    const id = Date.now();
    const newToast = { id, title, message, type, undoCallback };
    
    setToasts(prev => [newToast, ...prev]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- RESET SIMULATOR ---
  const handleResetSimulator = () => {
    if (confirm("คุณต้องการรีเซ็ตข้อมูลตัวจำลองทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?")) {
      setProducts([...DEFAULT_PRODUCTS]);
      setSellers([...DEFAULT_SELLERS]);
      setOrders([...DEFAULT_ORDERS]);
      setSellerCatalog([...DEFAULT_SELLER_CATALOG]);
      setBrandStripeConnected(true);
      setBrandStripeAccountId('acct_1U0zHSBrPGkr2X5w');
      setBrandStripeMainAccountId('acct_1U0e7YPcKKk6xz69');
      setSellerStripeConnected(true);
      setSellerStripeAccountId('acct_1U0zHVBcWQdyiTVi');
      setSellerStripeMainAccountId('acct_1U0e7YPcKKk6xz69');
      setBrandPendingSettlement(0);
      setBrandOutstandingBalance(0);
      setBrandAccountStatus('ACTIVE');
      localStorage.removeItem('mymarket_react_state');
      showToast("รีเซ็ตสำเร็จ", "ข้อมูลจำลองได้ถูกปรับกลับเป็นค่าเริ่มต้นแล้ว", "success");
    }
  };

  const handleConnectStripe = (role, details) => {
    if (role === 'brand') {
      setBrandStripeConnected(true);
      setBrandStripeAccountId(details.accountId);
      setBrandStripeMainAccountId(details.mainAccountId || '');
      saveState(null, null, null, null, {
        brandStripeConnected: true,
        brandStripeAccountId: details.accountId,
        brandStripeMainAccountId: details.mainAccountId || ''
      });
      showToast("เชื่อมต่อ Stripe สำเร็จ", `บัญชีรับเงินของแบรนด์ได้รับการเชื่อมต่อแล้ว (${details.accountId})`, "success");
    } else {
      setSellerStripeConnected(true);
      setSellerStripeAccountId(details.accountId);
      setSellerStripeMainAccountId(details.mainAccountId || '');
      saveState(null, null, null, null, {
        sellerStripeConnected: true,
        sellerStripeAccountId: details.accountId,
        sellerStripeMainAccountId: details.mainAccountId || ''
      });
      showToast("เชื่อมต่อ Stripe สำเร็จ", `บัญชีรับเงินของตัวแทนได้รับการเชื่อมต่อแล้ว (${details.accountId})`, "success");
    }
  };

  const handleDisconnectStripe = (role) => {
    if (role === 'brand') {
      setBrandStripeConnected(false);
      setBrandStripeAccountId('');
      setBrandStripeMainAccountId('');
      saveState(null, null, null, null, {
        brandStripeConnected: false,
        brandStripeAccountId: '',
        brandStripeMainAccountId: ''
      });
      showToast("ยกเลิกการเชื่อมต่อ", "ยกเลิกการเชื่อมต่อบัญชีรับเงินของแบรนด์เรียบร้อยแล้ว", "warning");
    } else {
      setSellerStripeConnected(false);
      setSellerStripeAccountId('');
      setSellerStripeMainAccountId('');
      saveState(null, null, null, null, {
        sellerStripeConnected: false,
        sellerStripeAccountId: '',
        sellerStripeMainAccountId: ''
      });
      showToast("ยกเลิกการเชื่อมต่อ", "ยกเลิกการเชื่อมต่อบัญชีรับเงินของตัวแทนจำหน่ายเรียบร้อยแล้ว", "warning");
    }
  };

  const handleOpenStripeConnect = (role) => {
    setStripeModalRole(role);
    setStripeModalOpen(true);
  };

  // --- STATE ACTIONS ---

  // Brand Owner Actions
  const handleAddProduct = (newProd) => {
    const updatedProducts = [
      ...products,
      {
        id: "p" + (products.length + 1),
        description: "สินค้าเพิ่มใหม่โดยเจ้าของแบรนด์ มีการควบคุมราคากลางสำหรับการจำหน่าย",
        status: newProd.shippingSetting ? "ACTIVE" : "INACTIVE",
        image: newProd.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(newProd.name)}`,
        ...newProd
      }
    ];
    setProducts(updatedProducts);
    saveState(updatedProducts, null, null, null);
    showToast("บันทึกสินค้าสำเร็จ", `สินค้า "${newProd.name}" ได้ถูกเพิ่มเข้าสู่ระบบ MyMarket แล้ว`, "success");
  };

  const handleUpdateStock = (productId, newStock) => {
    const updatedProducts = products.map(p => p.id === productId ? { ...p, stock: newStock } : p);
    setProducts(updatedProducts);
    saveState(updatedProducts, null, null, null);
    showToast("อัปเดตสต็อกแล้ว", `ปรับจำนวนสต็อกสินค้าสำเร็จ`, "success");
  };

  const handleEditProduct = (productId, newPrice) => {
    const updatedProducts = products.map(p => p.id === productId ? { ...p, dealerPrice: newPrice } : p);
    setProducts(updatedProducts);
    saveState(updatedProducts, null, null, null);
    showToast("แก้ไขสำเร็จ", `ปรับปรุงราคากลาง Dealer Price สำเร็จ`, "success");
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const backupProducts = [...products];
    const backupCatalog = [...sellerCatalog];

    const updatedProducts = products.filter(p => p.id !== productId);
    const updatedCatalog = sellerCatalog.filter(c => c.productId !== productId);

    setProducts(updatedProducts);
    setSellerCatalog(updatedCatalog);
    saveState(updatedProducts, null, null, updatedCatalog);

    showToast("ลบสินค้าสำเร็จ", `ลบ "${product.name}" ออกจากระบบแล้ว`, "warning", () => {
      setProducts(backupProducts);
      setSellerCatalog(backupCatalog);
      saveState(backupProducts, null, null, backupCatalog);
      showToast("กู้คืนสำเร็จ", "สินค้าได้รับการกู้คืนเรียบร้อยแล้ว", "success");
    });
  };

  const handleConfirmOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const product = products.find(p => p.id === order.productId);
    if (!product) {
      showToast("ไม่พบสินค้า", "ไม่พบสินค้าในสต็อกหลัก", "error");
      return;
    }

    if (product.stock < order.qty) {
      showToast("สต็อกไม่พอ", `สินค้าในคลังมีจำนวนไม่พอสำหรับคำสั่งซื้อนี้`, "error");
      return;
    }

    const updatedProducts = products.map(p => p.id === order.productId ? { ...p, stock: p.stock - order.qty } : p);
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: 'CONFIRMED' } : o);

    setProducts(updatedProducts);
    setOrders(updatedOrders);
    saveState(updatedProducts, null, updatedOrders, null);
    showToast("ยืนยันออเดอร์แล้ว", `ยืนยันสต็อกออเดอร์ #${orderId} สำเร็จ`, "success");
  };

  const handleRejectOrder = (orderId, rejectReason) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: 'REJECTED', rejectReason } : o);
    setOrders(updatedOrders);
    saveState(null, null, updatedOrders, null);
    showToast("ปฏิเสธคำสั่งซื้อแล้ว", `ยกเลิกการดำเนินรายการคำสั่งซื้อ #${orderId}`, "warning");
  };

  const handleShipOrder = (orderId) => {
    const trackNum = "TH" + Math.floor(100000000 + Math.random() * 900000000) + "MY";
    const updatedOrders = orders.map(o => o.id === orderId ? {
      ...o,
      status: 'SHIPPING',
      trackingNumber: trackNum,
      carrier: "MyOrder Logistics (COD Service)"
    } : o);

    setOrders(updatedOrders);
    saveState(null, null, updatedOrders, null);
    showToast("จัดส่งพัสดุแล้ว", `สร้างเลขพัสดุ ${trackNum} สำเร็จ`, "success");
  };

  const handleDeliverOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrders = orders.map(o => o.id === orderId ? { 
      ...o, 
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString()
    } : o);
    
    // Upgrade active seller stats
    const updatedSellers = sellers.map(s => {
      if (s.id === order.sellerId) {
        const newSales = s.totalSales + order.totalAmount;
        return {
          ...s,
          totalSales: newSales,
          ordersCount: s.ordersCount + 1,
          tier: newSales >= 20000 ? "Pro Seller" : s.tier
        };
      }
      return s;
    });

    const brandShareThb = order.dealerPrice * order.qty;
    const brandShareUsd = Math.round((brandShareThb / 34) * 100) / 100;
    const nextPending = Math.round((brandPendingSettlement + brandShareUsd) * 100) / 100;

    setOrders(updatedOrders);
    setSellers(updatedSellers);
    setBrandPendingSettlement(nextPending);
    
    saveState(null, updatedSellers, updatedOrders, null, { brandPendingSettlement: nextPending });
    showToast("ส่งมอบพัสดุสำเร็จ", `ปิดงานจัดส่งออเดอร์ #${orderId} และนำเงินเข้ายอด Settlement รอโอนหลังผ่านช่วงเคลม (7 วัน) เรียบร้อย`, "success");
  };

  const handleClaimOrder = (orderId, claimDetails) => {
    const updatedOrders = orders.map(o => o.id === orderId ? {
      ...o,
      status: 'CLAIM_PENDING',
      claimType: claimDetails.claimType,
      claimReason: claimDetails.claimReason,
      claimEvidence: claimDetails.claimEvidence,
      claimRejectReason: ""
    } : o);

    setOrders(updatedOrders);
    saveState(null, null, updatedOrders, null);
    showToast("ยื่นคำร้องเคลมสำเร็จ", `ส่งเรื่องเคลมสำหรับออเดอร์ #${orderId} แล้ว รอแบรนด์ตรวจสอบ`, "success");
  };

  const handleApproveClaimReplace = (orderId, newTrackingNumber) => {
    const updatedOrders = orders.map(o => o.id === orderId ? {
      ...o,
      status: 'CLAIM_APPROVED_REPLACE',
      trackingNumber: newTrackingNumber || ("TH" + Math.floor(100000000 + Math.random() * 900000000) + "RE"),
      carrier: "MyOrder Logistics (Replacement)"
    } : o);

    setOrders(updatedOrders);
    saveState(null, null, updatedOrders, null);
    showToast("อนุมัติเคลมสำเร็จ", `เปลี่ยนสินค้าออเดอร์ #${orderId} และจัดส่งชิ้นใหม่เรียบร้อย`, "success");
  };

  const handleApproveClaimRefund = async (orderId, responsibility = 'brand') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      if (order.paymentMethod === 'STRIPE' && order.stripeSessionId) {
        showToast("กำลังดำเนินการ", "กำลังทำเรื่องคืนเงินผ่าน Stripe...", "warning");
        const response = await fetch('/api/refund-stripe-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: order.stripeSessionId,
            brandTransferId: order.brandTransferId || null,
            sellerTransferId: order.sellerTransferId || null
          })
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
      }

      // Revert sales and profit stats from Seller
      const updatedSellers = sellers.map(s => {
        if (s.id === order.sellerId) {
          const newSales = Math.max(0, s.totalSales - order.totalAmount);
          return {
            ...s,
            totalSales: newSales,
            ordersCount: Math.max(0, s.ordersCount - 1),
            tier: newSales >= 20000 ? "Pro Seller" : "Standard Seller"
          };
        }
        return s;
      });

      // Calculate ledger adjustments
      let nextPending = brandPendingSettlement;
      let nextOutstanding = brandOutstandingBalance;
      let nextStatus = brandAccountStatus;

      if (responsibility === 'brand') {
        const refundAmountThb = order.totalAmount;
        const refundAmountUsd = Math.round((refundAmountThb / 34) * 100) / 100;
        const stripeFeeUsd = Math.round((refundAmountUsd * 0.029 + 0.3) * 100) / 100;
        const totalDeduction = refundAmountUsd + stripeFeeUsd;

        if (nextPending >= totalDeduction) {
          nextPending = Math.round((nextPending - totalDeduction) * 100) / 100;
        } else {
          const unpaid = Math.round((totalDeduction - nextPending) * 100) / 100;
          nextPending = 0;
          nextOutstanding = Math.round((nextOutstanding + unpaid) * 100) / 100;
        }

        // Determine holds
        if (nextOutstanding >= 200) {
          nextStatus = 'ORDER_HOLD';
        } else if (nextOutstanding >= 100) {
          nextStatus = 'SETTLEMENT_HOLD';
        } else {
          nextStatus = 'ACTIVE';
        }
      }

      const updatedOrders = orders.map(o => o.id === orderId ? {
        ...o,
        status: 'CLAIM_APPROVED_REFUND',
        claimResponsibility: responsibility
      } : o);

      setOrders(updatedOrders);
      setSellers(updatedSellers);
      setBrandPendingSettlement(nextPending);
      setBrandOutstandingBalance(nextOutstanding);
      setBrandAccountStatus(nextStatus);

      saveState(null, updatedSellers, updatedOrders, null, {
        brandPendingSettlement: nextPending,
        brandOutstandingBalance: nextOutstanding,
        brandAccountStatus: nextStatus
      });

      const respText = responsibility === 'brand' 
        ? `หักจากยอด Settlement แบรนด์แล้ว (หนี้คงค้างสะสม: $${nextOutstanding} USD)`
        : 'สำรองเงินคืนโดยแพลตฟอร์ม รอเรียกเก็บจากขนส่ง';

      showToast("คืนเงินสำเร็จ", `อนุมัติคำขอคืนเงินออเดอร์ #${orderId} (${respText})`, "success");
    } catch (err) {
      console.error(err);
      showToast("คืนเงินล้มเหลว", `ไม่สามารถทำรายการคืนเงินผ่าน Stripe: ${err.message}`, "error");
    }
  };

  const handleRejectClaim = (orderId, rejectReason) => {
    const updatedOrders = orders.map(o => o.id === orderId ? {
      ...o,
      status: 'CLAIM_REJECTED',
      claimRejectReason: rejectReason
    } : o);

    setOrders(updatedOrders);
    saveState(null, null, updatedOrders, null);
    showToast("ปฏิเสธคำขอเคลมแล้ว", `ส่งผลการปฏิเสธสำหรับออเดอร์ #${orderId} เรียบร้อย`, "warning");
  };

  const handleProcessSettlement = async () => {
    // Find all DELIVERED orders
    const eligibleOrders = orders.filter(o => o.status === 'DELIVERED');
    if (eligibleOrders.length === 0) {
      showToast("ไม่มีออเดอร์พร้อมโอน", "ไม่พบออเดอร์สถานะ 'ส่งสำเร็จ' ที่ยังไม่ได้ประมวลผลการโอนเงิน", "warning");
      return;
    }

    showToast("กำลังประมวลผล", "กำลังประมวลผลการคำนวณส่วนแบ่งและหักลบหนี้ค้างชำระ...", "warning");
    
    let currentOutstanding = brandOutstandingBalance;
    let currentPending = brandPendingSettlement;
    const updatedOrders = [...orders];

    for (const order of eligibleOrders) {
      const product = products.find(p => p.id === order.productId);
      if (!product) continue;

      const brandShareThb = product.dealerPrice * order.qty;
      let brandShareUsd = Math.round((brandShareThb / 34) * 100) / 100;
      
      const sellerShareThb = order.profit;
      const sellerShareUsd = Math.round((sellerShareThb / 34) * 100) / 100;

      // Deduct outstanding debt from Brand Share first
      let brandTransferUsd = brandShareUsd;
      if (currentOutstanding > 0) {
        if (brandTransferUsd >= currentOutstanding) {
          brandTransferUsd = Math.round((brandTransferUsd - currentOutstanding) * 100) / 100;
          currentOutstanding = 0;
        } else {
          currentOutstanding = Math.round((currentOutstanding - brandTransferUsd) * 100) / 100;
          brandTransferUsd = 0;
        }
      }

      // Perform Stripe Transfers
      let brandTransferId = null;
      let sellerTransferId = null;

      if (order.paymentMethod === 'STRIPE' && order.stripeSessionId) {
        try {
          const response = await fetch('/api/process-delayed-transfers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brandStripeAccountId: brandStripeAccountId,
              sellerStripeAccountId: sellerStripeAccountId,
              brandAmount: Math.round(brandTransferUsd * 100), // convert to cents
              sellerAmount: Math.round(sellerShareUsd * 100), // convert to cents
              sessionId: order.stripeSessionId,
              orderId: order.id
            })
          });
          const data = await response.json();
          console.log(`Delayed transfers results for #${order.id}:`, data);
          if (data.success && data.results) {
            const brandResult = data.results.find(r => r.type === 'brand' && r.status === 'success');
            const sellerResult = data.results.find(r => r.type === 'seller' && r.status === 'success');
            if (brandResult) brandTransferId = brandResult.id;
            if (sellerResult) sellerTransferId = sellerResult.id;
          }
        } catch (err) {
          console.error(`Failed to transfer for order ${order.id}:`, err);
        }
      }

      // Deduct from pending settlement since it's now settled
      currentPending = Math.max(0, Math.round((currentPending - brandShareUsd) * 100) / 100);

      // Update status to SETTLED and record transfer IDs
      const idx = updatedOrders.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        updatedOrders[idx] = { 
          ...updatedOrders[idx], 
          status: 'SETTLED',
          brandTransferId: brandTransferId,
          sellerTransferId: sellerTransferId
        };
      }
    }

    // Determine brand status after outstanding updates
    let nextStatus = 'ACTIVE';
    if (currentOutstanding >= 200) {
      nextStatus = 'ORDER_HOLD';
    } else if (currentOutstanding >= 100) {
      nextStatus = 'SETTLEMENT_HOLD';
    }

    setOrders(updatedOrders);
    setBrandPendingSettlement(currentPending);
    setBrandOutstandingBalance(currentOutstanding);
    setBrandAccountStatus(nextStatus);

    saveState(null, null, updatedOrders, null, {
      brandPendingSettlement: currentPending,
      brandOutstandingBalance: currentOutstanding,
      brandAccountStatus: nextStatus
    });

    showToast("ประมวลผลโอนเงินเสร็จสิ้น", "โอนส่วนแบ่งและกำไรเข้ากระเป๋าบัญชีเชื่อมต่อสำเร็จแล้ว", "success");
  };

  const handleOnboardSeller = (name) => {
    const seed = encodeURIComponent(name);
    const updatedSellers = [
      ...sellers,
      {
        id: "s" + (sellers.length + 1),
        name,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
        totalSales: 0,
        ordersCount: 0,
        tier: "Standard Seller",
        status: "ACTIVE"
      }
    ];
    setSellers(updatedSellers);
    saveState(null, updatedSellers, null, null);
    showToast("อนุมัติตัวแทนใหม่แล้ว", `ร้าน "${name}" เข้าร่วมเครือข่าย MyMarket แล้ว`, "success");
  };

  // Seller Actions
  const handleConfigureCatalog = (productId, sellingPrice) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = sellerCatalog.findIndex(c => c.productId === productId);
    let updatedCatalog = [];

    if (existingIndex > -1) {
      updatedCatalog = sellerCatalog.map((c, i) => i === existingIndex ? { ...c, sellingPrice } : c);
    } else {
      updatedCatalog = [...sellerCatalog, { productId, sellingPrice }];
    }

    setSellerCatalog(updatedCatalog);
    saveState(null, null, null, updatedCatalog);
    showToast("นำเข้าสินค้าแล้ว", `เพิ่ม "${product.name}" ในหน้าร้านปลีกของคุณสำเร็จ`, "success");
  };

  const handleRemoveFromCatalog = (productId, productName) => {
    const catalogItem = sellerCatalog.find(c => c.productId === productId);
    if (!catalogItem) return;

    const backupCatalog = [...sellerCatalog];
    const updatedCatalog = sellerCatalog.filter(c => c.productId !== productId);
    
    setSellerCatalog(updatedCatalog);
    saveState(null, null, null, updatedCatalog);

    showToast("นำสินค้าออกสำเร็จ", `ถอน "${productName}" ออกจากร้านค้าสำเร็จ`, "warning", () => {
      setSellerCatalog(backupCatalog);
      saveState(null, null, null, backupCatalog);
      showToast("กู้คืนสำเร็จ", "นำสินค้าคืนสู่ร้านค้าแล้ว", "success");
    });
  };

  const handleCreateOrder = async (formValues) => {
    if (brandAccountStatus === 'ORDER_HOLD') {
      showToast("สั่งซื้อไม่ได้", "แบรนด์นี้ถูกระงับรับสั่งซื้อชั่วคราวเนื่องจากมียอดหนี้ค้างชำระสะสมเกินวงเงิน ($200 USD)", "error");
      return;
    }

    const orderId = "MM-" + Math.floor(1004 + Math.random() * 8999);
    const product = products.find(p => p.id === formValues.productId);
    const profit = (formValues.sellingPrice - product.dealerPrice) * formValues.qty;

    const newOrder = {
      id: orderId,
      sellerId: activeSellerId,
      createdAt: new Date().toISOString(),
      dealerPrice: product.dealerPrice,
      totalAmount: formValues.sellingPrice * formValues.qty,
      profit,
      paymentMethod: formValues.paymentMethod || "COD",
      status: "PENDING",
      trackingNumber: "",
      carrier: "",
      rejectReason: "",
      stripeSessionId: "",
      stripePaymentUrl: "",
      stripeConnectedAccountId: formValues.paymentMethod === 'STRIPE' ? (currentRole === 'seller' ? sellerStripeAccountId : brandStripeAccountId) : "",
      ...formValues
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    saveState(null, null, updatedOrders, null);

    if (formValues.paymentMethod === 'STRIPE') {
      try {
        const brandAmount = product.dealerPrice * formValues.qty;
        const sellerAmount = (formValues.sellingPrice - product.dealerPrice) * formValues.qty;

        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: formValues.productId,
            name: product.name,
            amount: formValues.sellingPrice,
            qty: formValues.qty,
            orderId: orderId,
            sellerStripeAccountId: sellerStripeAccountId,
            brandStripeAccountId: brandStripeAccountId,
            brandAmount: brandAmount,
            sellerAmount: sellerAmount
          })
        });
        const data = await response.json();
        if (data.url) {
          const finalOrders = updatedOrders.map(o => o.id === orderId ? {
            ...o,
            stripeSessionId: data.id,
            stripePaymentUrl: data.url
          } : o);
          setOrders(finalOrders);
          saveState(null, null, finalOrders, null);
          showToast("สร้างลิงก์จ่ายเงินสำเร็จ", "คัดลอกลิงก์ส่งให้ลูกค้าชำระเงิน หรือกดที่ 'จ่ายเงิน' เพื่อสแกนจ่ายเงิน", "success");
        } else {
          throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างเซสชัน");
        }
      } catch (err) {
        console.error(err);
        const rolledBack = updatedOrders.filter(o => o.id !== orderId);
        setOrders(rolledBack);
        saveState(null, null, rolledBack, null);
        showToast("ส่งออเดอร์ไม่สำเร็จ", `เกิดข้อผิดพลาดกับระบบ Stripe: ${err.message}`, "error");
      }
    } else {
      showToast("ส่งคำสั่งซื้อสำเร็จ", `ออเดอร์ #${orderId} ถูกส่งไปยังระบบ MyOrder เรียบร้อย`, "success", () => {
        // Undo order
        const undoneOrders = orders.filter(o => o.id !== orderId);
        setOrders(undoneOrders);
        saveState(null, null, undoneOrders, null);
        showToast("ยกเลิกออเดอร์สำเร็จ", `ยกเลิกรายการออเดอร์ #${orderId} เรียบร้อย`, "warning");
      });
    }
  };

  const handleCheckPaymentStatus = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.stripeSessionId) return;

    try {
      showToast("กำลังตรวจสอบ", "กำลังดึงข้อมูลการชำระเงินจาก Stripe...", "warning");
      const connAccId = order.stripeConnectedAccountId || "";
      const response = await fetch(`/api/check-session-status?session_id=${order.stripeSessionId}${connAccId ? `&connected_account_id=${connAccId}` : ''}`);
      const data = await response.json();
      
      if (data.payment_status === 'paid') {
        const updatedProducts = products.map(p => p.id === order.productId ? { ...p, stock: Math.max(0, p.stock - order.qty) } : p);
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: 'CONFIRMED' } : o);
        
        setProducts(updatedProducts);
        setOrders(updatedOrders);
        saveState(updatedProducts, null, updatedOrders, null);
        showToast("ชำระเงินสำเร็จ!", `ออเดอร์ #${orderId} ได้รับชำระเงินเรียบร้อยแล้ว แบรนด์กดยืนยันตัดสต็อกให้อัตโนมัติ`, "success");
      } else {
        showToast("ยังไม่ได้ชำระเงิน", "ระบบ Stripe ไม่พบสถานะการจ่ายเงินที่สำเร็จของลิงก์นี้", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("ตรวจสอบล้มเหลว", `เกิดข้อผิดพลาด: ${err.message}`, "error");
    }
  };

  const handleCheckPaymentStatusAfterRedirect = async (orderId, sessionId, connectedAccountId) => {
    try {
      const response = await fetch(`/api/check-session-status?session_id=${sessionId}${connectedAccountId ? `&connected_account_id=${connectedAccountId}` : ''}`);
      const data = await response.json();
      
      if (data.payment_status === 'paid') {
        const raw = localStorage.getItem('mymarket_react_state');
        if (raw) {
          const parsed = JSON.parse(raw);
          const currentOrders = parsed.orders || [];
          const currentProducts = parsed.products || [];

          const order = currentOrders.find(o => o.id === orderId);
          if (order && order.status === 'PENDING') {
            const updatedProducts = currentProducts.map(p => p.id === order.productId ? { ...p, stock: Math.max(0, p.stock - order.qty) } : p);
            const updatedOrders = currentOrders.map(o => o.id === orderId ? { ...o, status: 'CONFIRMED' } : o);

            setProducts(updatedProducts);
            setOrders(updatedOrders);
            localStorage.setItem('mymarket_react_state', JSON.stringify({
              ...parsed,
              products: updatedProducts,
              orders: updatedOrders
            }));
            
            showToast("ยินดีด้วย! ชำระเงินสำเร็จ", `ออเดอร์ #${orderId} ได้รับการชำระเงินเรียบร้อย ระบบได้ยืนยันการจัดส่งออเดอร์แล้ว`, "success");
          }
        }
      }
    } catch (err) {
      console.error("Error auto-verifying payment redirect:", err);
    }
  };

  // --- STATS BADGES HELPER ---
  const pendingOrdersCount = orders.filter(o => o.status === "PENDING").length;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Top Global Bar */}
      <header className="h-[70px] bg-white border-b border-slate-100 flex justify-between items-center px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-store text-[28px] bg-gradient-to-r from-brand-secondary to-brand-primary bg-clip-text text-transparent"></i>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-text-title tracking-tight leading-none">MyMarket</h1>
            <span className="text-[10px] text-text-caption mt-0.5">powered by MyOrder</span>
          </div>
        </div>

        {/* Role Selector Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-3xl border border-slate-200">
          <button 
            onClick={() => switchRole('brand')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-3xl transition-all duration-300 ${
              currentRole === 'brand' 
                ? 'bg-brand-primary text-white shadow-button' 
                : 'text-text-body hover:text-text-title'
            }`}
          >
            <i className="fa-solid fa-user-tie text-xs"></i> เจ้าของแบรนด์ (Brand Owner)
          </button>
          <button 
            onClick={() => switchRole('seller')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-3xl transition-all duration-300 ${
              currentRole === 'seller' 
                ? 'bg-brand-secondary text-white shadow-button' 
                : 'text-text-body hover:text-text-title'
            }`}
          >
            <i className="fa-solid fa-users text-xs"></i> ตัวแทนจำหน่าย (Seller)
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-3">
          <img 
            src={currentRole === 'brand' ? "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" : (sellers.find(s => s.id === activeSellerId)?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix")} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border border-slate-100 bg-brand-primary-subtle"
          />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-text-title text-sm">
              {currentRole === 'brand' ? "Brand Admin (คุณกิตติ)" : (sellers.find(s => s.id === activeSellerId)?.name || "Seller")}
            </span>
            <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-md w-fit ${
              currentRole === 'brand' ? 'bg-brand-primary' : 'bg-brand-secondary'
            }`}>
              {currentRole === 'brand' ? "Owner" : (sellers.find(s => s.id === activeSellerId)?.tier || "Standard")}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-grow min-h-[calc(100vh-70px)]">
        
        {/* Sidebar Nav */}
        <aside className="w-[260px] bg-white border-r border-slate-100 py-6 px-4 flex-shrink-0">
          <nav className="flex flex-col gap-2">
            {currentRole === 'brand' ? (
              <>
                <button 
                  onClick={() => setActiveBrandTab('dashboard')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeBrandTab === 'dashboard'
                      ? 'bg-brand-primary-subtle text-brand-primary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-chart-pie text-base ${activeBrandTab === 'dashboard' ? 'text-brand-primary' : 'text-text-caption'}`}></i>
                  <span>แดชบอร์ดภาพรวม</span>
                </button>
                <button 
                  onClick={() => setActiveBrandTab('products')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeBrandTab === 'products'
                      ? 'bg-brand-primary-subtle text-brand-primary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-boxes-stacked text-base ${activeBrandTab === 'products' ? 'text-brand-primary' : 'text-text-caption'}`}></i>
                  <span>การจัดการสินค้า</span>
                </button>
                <button 
                  onClick={() => setActiveBrandTab('orders')}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all relative ${
                    activeBrandTab === 'orders'
                      ? 'bg-brand-primary-subtle text-brand-primary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid fa-receipt text-base ${activeBrandTab === 'orders' ? 'text-brand-primary' : 'text-text-caption'}`}></i>
                    <span>รายการสั่งซื้อ</span>
                  </div>
                  {pendingOrdersCount > 0 && (
                    <span className="bg-status-error-bg text-status-error-text text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveBrandTab('sellers')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeBrandTab === 'sellers'
                      ? 'bg-brand-primary-subtle text-brand-primary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-network-wired text-base ${activeBrandTab === 'sellers' ? 'text-brand-primary' : 'text-text-caption'}`}></i>
                  <span>เครือข่ายตัวแทน</span>
                </button>
                <button 
                  onClick={() => setActiveBrandTab('finance')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeBrandTab === 'finance'
                      ? 'bg-brand-primary-subtle text-brand-primary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-wallet text-base ${activeBrandTab === 'finance' ? 'text-brand-primary' : 'text-text-caption'}`}></i>
                  <span>การเงิน (Finance)</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveSellerTab('dashboard')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeSellerTab === 'dashboard'
                      ? 'bg-brand-secondary-subtle text-brand-secondary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-chart-line text-base ${activeSellerTab === 'dashboard' ? 'text-brand-secondary' : 'text-text-caption'}`}></i>
                  <span>แผงควบคุมของฉัน</span>
                </button>
                <button 
                  onClick={() => setActiveSellerTab('browse')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeSellerTab === 'browse'
                      ? 'bg-brand-secondary-subtle text-brand-secondary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-magnifying-glass-plus text-base ${activeSellerTab === 'browse' ? 'text-brand-secondary' : 'text-text-caption'}`}></i>
                  <span>หาสินค้าไปขาย</span>
                </button>
                <button 
                  onClick={() => setActiveSellerTab('store')}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all relative ${
                    activeSellerTab === 'store'
                      ? 'bg-brand-secondary-subtle text-brand-secondary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid fa-shop text-base ${activeSellerTab === 'store' ? 'text-brand-secondary' : 'text-text-caption'}`}></i>
                    <span>ร้านค้าของฉัน</span>
                  </div>
                  {sellerCatalog.length > 0 && (
                    <span className="bg-brand-secondary-subtle text-brand-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {sellerCatalog.length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveSellerTab('orders')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeSellerTab === 'orders'
                      ? 'bg-brand-secondary-subtle text-brand-secondary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-dolly text-base ${activeSellerTab === 'orders' ? 'text-brand-secondary' : 'text-text-caption'}`}></i>
                  <span>ออเดอร์และจัดส่ง</span>
                </button>
                <button 
                  onClick={() => setActiveSellerTab('finance')}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-left w-full transition-all ${
                    activeSellerTab === 'finance'
                      ? 'bg-brand-secondary-subtle text-brand-secondary font-bold'
                      : 'text-text-body hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid fa-wallet text-base ${activeSellerTab === 'finance' ? 'text-brand-secondary' : 'text-text-caption'}`}></i>
                  <span>การเงิน (Finance)</span>
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Viewport Content */}
        <main className="flex-grow p-8 overflow-y-auto max-w-[1200px] mx-auto w-full">
          {currentRole === 'brand' ? (
            <>
              {activeBrandTab === 'dashboard' && (
                <BrandDashboard 
                  products={products} 
                  sellers={sellers} 
                  orders={orders} 
                  stripeConnected={brandStripeConnected}
                  stripeAccountId={brandStripeAccountId}
                  stripeMainAccountId={brandStripeMainAccountId}
                  onOpenStripeConnect={() => handleOpenStripeConnect('brand')}
                  onDisconnectStripe={() => handleDisconnectStripe('brand')}
                />
              )}
              {activeBrandTab === 'products' && (
                <ProductManagement 
                  products={products} 
                  onAddProduct={handleAddProduct}
                  onUpdateStock={handleUpdateStock}
                  onDeleteProduct={handleDeleteProduct}
                  onEditProduct={handleEditProduct}
                />
              )}
              {activeBrandTab === 'orders' && (
                <BrandOrders 
                  orders={orders} 
                  products={products}
                  sellers={sellers}
                  onConfirmOrder={handleConfirmOrder}
                  onShipOrder={handleShipOrder}
                  onDeliverOrder={handleDeliverOrder}
                  onRejectOrder={handleRejectOrder}
                  onApproveClaimReplace={handleApproveClaimReplace}
                  onApproveClaimRefund={handleApproveClaimRefund}
                  onRejectClaim={handleRejectClaim}
                />
              )}
              {activeBrandTab === 'sellers' && (
                <BrandSellers 
                  sellers={sellers} 
                  orders={orders} 
                  onOnboardSeller={handleOnboardSeller} 
                />
              )}
              {activeBrandTab === 'finance' && (
                <FinanceDashboard 
                  stripeConnected={brandStripeConnected}
                  stripeAccountId={brandStripeAccountId}
                  stripeMainAccountId={brandStripeMainAccountId}
                  role="brand"
                  onOpenStripeConnect={() => handleOpenStripeConnect('brand')}
                  brandPendingSettlement={brandPendingSettlement}
                  brandOutstandingBalance={brandOutstandingBalance}
                  brandAccountStatus={brandAccountStatus}
                  onProcessSettlement={handleProcessSettlement}
                />
              )}
            </>
          ) : (
            <>
               {activeSellerTab === 'dashboard' && (
                <SellerDashboard 
                  sellers={sellers} 
                  orders={orders} 
                  activeSellerId={activeSellerId} 
                  stripeConnected={sellerStripeConnected}
                  stripeAccountId={sellerStripeAccountId}
                  stripeMainAccountId={sellerStripeMainAccountId}
                  onOpenStripeConnect={() => handleOpenStripeConnect('seller')}
                  onDisconnectStripe={() => handleDisconnectStripe('seller')}
                />
              )}
              {activeSellerTab === 'browse' && (
                <BrowseCatalog 
                  products={products} 
                  sellerCatalog={sellerCatalog} 
                  onConfigureCatalog={handleConfigureCatalog} 
                />
              )}
              {activeSellerTab === 'store' && (
                <MyStoreCatalog 
                  sellerCatalog={sellerCatalog}
                  products={products}
                  onRemoveFromCatalog={handleRemoveFromCatalog}
                  onEditPrice={(prod) => {
                    setActiveSellerTab('browse');
                    // We set tab to browse catalog and defer configure price trigger
                    setTimeout(() => {
                      const cardBtn = document.querySelector(`[onclick*='openConfigurePriceModal'][onclick*='${prod.id}']`);
                      if (cardBtn) cardBtn.click();
                    }, 100);
                  }}
                  onNavigateToBrowse={() => setActiveSellerTab('browse')}
                />
              )}
              {activeSellerTab === 'orders' && (
                 <SellerOrders 
                  orders={orders}
                  products={products}
                  sellerCatalog={sellerCatalog}
                  activeSellerId={activeSellerId}
                  onCreateOrder={handleCreateOrder}
                  onCheckPaymentStatus={handleCheckPaymentStatus}
                  sellerStripeConnected={sellerStripeConnected}
                  onClaimOrder={handleClaimOrder}
                />
              )}
              {activeSellerTab === 'finance' && (
                <FinanceDashboard 
                  stripeConnected={sellerStripeConnected}
                  stripeAccountId={sellerStripeAccountId}
                  stripeMainAccountId={sellerStripeMainAccountId}
                  role="seller"
                  onOpenStripeConnect={() => handleOpenStripeConnect('seller')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Reset Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={handleResetSimulator}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-700 text-xs font-semibold rounded-3xl transition-all shadow-md"
          title="ล้างข้อมูลจำลองกลับเป็นค่าเริ่มต้น"
        >
          <i className="fa-solid fa-rotate-left"></i> รีเซ็ตตัวจำลอง
        </button>
      </div>

      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3 w-full max-w-[360px]">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`bg-white border-l-4 rounded-lg shadow-modal p-4 flex items-start gap-3.5 border border-slate-100 transition-all duration-300 animate-fade-in ${
              t.type === 'success' ? 'border-l-status-success' : t.type === 'warning' ? 'border-l-status-warning' : 'border-l-status-error'
            }`}
          >
            <div className="text-base mt-0.5">
              {t.type === 'success' && <i className="fa-solid fa-circle-check text-status-success-text"></i>}
              {t.type === 'warning' && <i className="fa-solid fa-circle-exclamation text-status-warning-text"></i>}
              {t.type === 'error' && <i className="fa-solid fa-circle-xmark text-status-error-text"></i>}
            </div>
            <div className="flex-grow text-left">
              <div className="font-bold text-text-title text-sm">{t.title}</div>
              <div className="text-xs text-text-body mt-0.5 leading-normal">{t.message}</div>
              {t.undoCallback && (
                <button 
                  onClick={() => {
                    t.undoCallback();
                    removeToast(t.id);
                  }}
                  className="mt-2 text-xs font-bold text-brand-secondary hover:underline bg-slate-50 px-2 py-1 rounded"
                >
                  ยกเลิกรายการ (Undo)
                </button>
              )}
            </div>
            <button 
              onClick={() => removeToast(t.id)} 
              className="text-text-caption hover:text-text-title text-base"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
 
      {/* Stripe Connect Simulation Modal */}
      <StripeConnectModal 
        role={stripeModalRole}
        isOpen={stripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
        onConnect={handleConnectStripe}
      />
    </div>
  );
}

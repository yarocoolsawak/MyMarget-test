// ========================================================
// MyMarket Platform State & Logic Controller (app.js)
// Client-side reactive prototype with localStorage sync
// ========================================================

// --- INITIAL STATE & MOCK DATA ---
const DEFAULT_PRODUCTS = [
    {
        id: "p1",
        name: "เนื้อวากิวญี่ปุ่น Ribeye A5 (Premium Wagyu)",
        description: "เนื้อริบอายวากิว นำเข้าจากญี่ปุ่น เกรด A5 ลายไขมันแทรกสวยงาม นุ่มละลายในปาก",
        dealerPrice: 1250,
        stock: 45,
        shippingSetting: "BRAND", // free shipping by brand
        status: "ACTIVE",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "p2",
        name: "น้ำมันเห็ดทรัฟเฟิลขาวสูตรเข้มข้น (White Truffle Oil)",
        description: "น้ำมันมะกอกกลิ่นเห็ดทรัฟเฟิลขาว นำเข้าจากอิตาลี เพิ่มความหอมหรูหราให้ทุกเมนู",
        dealerPrice: 420,
        stock: 80,
        shippingSetting: "CUSTOMER", // customer pays shipping
        status: "ACTIVE",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "p3",
        name: "กล่องอาหารเยื่อพืชรักษ์โลก (Eco Biodegradable Boxes)",
        description: "กล่องใส่อาหารเป็นมิตรต่อสิ่งแวดล้อม ย่อยสลายได้เองตามธรรมชาติ แพ็ค 50 ชิ้น",
        dealerPrice: 180,
        stock: 120,
        shippingSetting: "CUSTOMER",
        status: "ACTIVE",
        image: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "p4",
        name: "ข้าวหอมมะลิทุ่งกุลาร้องไห้เกรดพรีเมียม (Organic Jasmine Rice)",
        description: "ข้าวหอมมะลิอินทรีย์ ปลูกในแหล่งดินดีทุ่งกุลาร้องไห้ หอม นุ่ม เมล็ดเรียวยาวสวย",
        dealerPrice: 220,
        stock: 60,
        shippingSetting: "", // Missing shipping settings -> INACTIVE
        status: "INACTIVE",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300"
    }
];

const DEFAULT_SELLERS = [
    {
        id: "s1",
        name: "สมชาย คิทเช่น (Somchai Kitchen)",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Somchai",
        totalSales: 35400,
        ordersCount: 15,
        tier: "Pro Seller",
        status: "ACTIVE"
    },
    {
        id: "s2",
        name: "อนงค์ อาหารสด (Anong Fresh Food)",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Anong",
        totalSales: 18200,
        ordersCount: 8,
        tier: "Standard Seller",
        status: "ACTIVE"
    },
    {
        id: "s3",
        name: "วิชัย กิ๊ฟช็อป (Wichai Store)",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wichai",
        totalSales: 0,
        ordersCount: 0,
        tier: "Standard Seller",
        status: "ACTIVE"
    }
];

const DEFAULT_ORDERS = [
    {
        id: "MM-1001",
        sellerId: "s1",
        customerName: "คุณมงคล สุขใจ",
        customerPhone: "0812345678",
        customerAddress: "99/1 ม.5 ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120",
        productId: "p1",
        qty: 2,
        sellingPrice: 1500,
        dealerPrice: 1250,
        totalAmount: 3000,
        profit: 500,
        paymentMethod: "COD",
        status: "DELIVERED",
        createdAt: "2026-08-01T10:30:00.000Z",
        trackingNumber: "TH-COD-998231",
        carrier: "MyOrder Logistics",
        rejectReason: ""
    },
    {
        id: "MM-1002",
        sellerId: "s1",
        customerName: "คุณนลินี รักดี",
        customerPhone: "0898765432",
        customerAddress: "456 ซ.ลาดพร้าว 101 แขวงคลองเจ้าคุณสิงห์ เขตวังทองหลาง กทม. 10310",
        productId: "p2",
        qty: 3,
        sellingPrice: 500,
        dealerPrice: 420,
        totalAmount: 1500,
        profit: 240,
        paymentMethod: "COD",
        status: "SHIPPING",
        createdAt: "2026-08-03T14:15:00.000Z",
        trackingNumber: "TH-COD-998245",
        carrier: "MyOrder Logistics",
        rejectReason: ""
    },
    {
        id: "MM-1003",
        sellerId: "s2",
        customerName: "คุณเกรียงไกร เก่งกาจ",
        customerPhone: "0861112222",
        customerAddress: "12/3 ถ.สุเทพ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200",
        productId: "p3",
        qty: 10,
        sellingPrice: 220,
        dealerPrice: 180,
        totalAmount: 2200,
        profit: 400,
        paymentMethod: "COD",
        status: "PENDING",
        createdAt: "2026-08-04T02:00:00.000Z",
        trackingNumber: "",
        carrier: "",
        rejectReason: ""
    }
];

const DEFAULT_SELLER_CATALOG = [
    { productId: "p1", sellingPrice: 1450 },
    { productId: "p2", sellingPrice: 490 },
    { productId: "p3", sellingPrice: 200 }
];

// --- CORE SYSTEM STATE ---
let state = {
    currentRole: "brand", // "brand" | "seller"
    activeBrandTab: "dashboard",
    activeSellerTab: "dashboard",
    products: [],
    sellers: [],
    orders: [],
    sellerCatalog: [], // Items selected by the "active" seller (s2 as our mockup active seller)
    activeSellerId: "s2", // Standard Seller role testing simulator anchor
    undoTimeoutId: null
};

// --- DATA ACCESS PERSISTENCE ---
function saveToStorage() {
    localStorage.setItem("mymarket_state", JSON.stringify({
        products: state.products,
        sellers: state.sellers,
        orders: state.orders,
        sellerCatalog: state.sellerCatalog
    }));
}

function loadFromStorage() {
    const raw = localStorage.getItem("mymarket_state");
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            state.products = parsed.products || DEFAULT_PRODUCTS;
            state.sellers = parsed.sellers || DEFAULT_SELLERS;
            state.orders = parsed.orders || DEFAULT_ORDERS;
            state.sellerCatalog = parsed.sellerCatalog || DEFAULT_SELLER_CATALOG;
            return;
        } catch (e) {
            console.error("Failed to parse storage, resetting to defaults", e);
        }
    }
    resetToDefaults();
}

function resetToDefaults() {
    state.products = [...DEFAULT_PRODUCTS];
    state.sellers = [...DEFAULT_SELLERS];
    state.orders = [...DEFAULT_ORDERS];
    state.sellerCatalog = [...DEFAULT_SELLER_CATALOG];
    saveToStorage();
}

function resetState() {
    if (confirm("คุณต้องการรีเซ็ตข้อมูลตัวจำลองทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?")) {
        resetToDefaults();
        showToast("รีเซ็ตสำเร็จ", "ข้อมูลจำลองได้ถูกปรับกลับเป็นค่าเริ่มต้นแล้ว", "success");
        initApp();
    }
}

// --- INIT APP ---
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    loadFromStorage();
    
    // Default Role: Brand Owner
    switchRole("brand");
}

// --- ROLE SWITCHING ---
function switchRole(role) {
    state.currentRole = role;
    document.body.className = `role-${role}`;
    
    // DOM Toggles
    const brandPanel = document.getElementById("brand-panel");
    const sellerPanel = document.getElementById("seller-panel");
    const brandBtn = document.getElementById("btn-role-brand");
    const sellerBtn = document.getElementById("btn-role-seller");
    
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");
    const userRoleBadge = document.getElementById("user-role-badge");

    if (role === "brand") {
        brandPanel.style.display = "flex";
        sellerPanel.style.display = "none";
        brandBtn.classList.add("active");
        sellerBtn.classList.remove("active");
        
        // Profile Info
        userAvatar.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";
        userName.textContent = "Brand Admin (คุณกิตติ)";
        userRoleBadge.textContent = "Owner";
        userRoleBadge.className = "role-badge";

        renderBrandTab(state.activeBrandTab);
    } else {
        brandPanel.style.display = "none";
        sellerPanel.style.display = "flex";
        brandBtn.classList.remove("active");
        sellerBtn.classList.add("active");
        
        // Profile Info (Using Active Seller Profile s2)
        const sellerObj = state.sellers.find(s => s.id === state.activeSellerId) || state.sellers[1];
        userAvatar.src = sellerObj.avatar;
        userName.textContent = sellerObj.name;
        userRoleBadge.textContent = sellerObj.tier;
        userRoleBadge.className = "role-badge seller";

        renderSellerTab(state.activeSellerTab);
    }

    updatePendingBadges();
}

// --- TAB NAVIGATIONS ---
function switchTab(role, tabId, element) {
    if (element) {
        // Remove active class from siblings
        const navItems = element.parentElement.querySelectorAll(".nav-item");
        navItems.forEach(item => item.classList.remove("active"));
        element.classList.add("active");
    }

    if (role === "brand") {
        state.activeBrandTab = tabId;
        renderBrandTab(tabId);
    } else {
        state.activeSellerTab = tabId;
        renderSellerTab(tabId);
    }
}

function renderBrandTab(tabId) {
    const tabs = document.querySelectorAll("#brand-panel .tab-content");
    tabs.forEach(tab => tab.classList.remove("active"));
    
    const activeTab = document.getElementById(`brand-tab-${tabId}`);
    if (activeTab) activeTab.classList.add("active");

    if (tabId === "dashboard") {
        renderBrandDashboard();
    } else if (tabId === "products") {
        renderBrandProducts();
    } else if (tabId === "orders") {
        renderBrandOrders("ALL");
    } else if (tabId === "sellers") {
        renderBrandSellers();
    }
}

function renderSellerTab(tabId) {
    const tabs = document.querySelectorAll("#seller-panel .tab-content");
    tabs.forEach(tab => tab.classList.remove("active"));
    
    const activeTab = document.getElementById(`seller-tab-${tabId}`);
    if (activeTab) activeTab.classList.add("active");

    if (tabId === "dashboard") {
        renderSellerDashboard();
    } else if (tabId === "browse") {
        renderSellerBrowse();
    } else if (tabId === "store") {
        renderSellerStore();
    } else if (tabId === "orders") {
        renderSellerOrders();
    }
}

// Update badges on sidebars
function updatePendingBadges() {
    const pendingOrdersCount = state.orders.filter(o => o.status === "PENDING").length;
    const brandBadge = document.getElementById("brand-pending-badge");
    
    if (pendingOrdersCount > 0) {
        brandBadge.textContent = pendingOrdersCount;
        brandBadge.classList.remove("hide");
    } else {
        brandBadge.classList.add("hide");
    }

    const sellerCatalogCount = state.sellerCatalog.length;
    const sellerBadge = document.getElementById("seller-catalog-count");
    if (sellerCatalogCount > 0) {
        sellerBadge.textContent = sellerCatalogCount;
        sellerBadge.classList.remove("hide");
    } else {
        sellerBadge.classList.add("hide");
    }

    // Pending in orders sub-tab
    const pendingSubTab = document.getElementById("brand-orders-pending-count");
    if (pendingSubTab) {
        pendingSubTab.textContent = pendingOrdersCount;
    }
}


// ========================================================
// --- BRAND OWNER LOGIC ---
// ========================================================

function renderBrandDashboard() {
    // 1. Calculate stats
    // Only count completed (delivered) or orders in progress (confirmed, shipping)
    const validOrders = state.orders.filter(o => o.status !== "REJECTED");
    const totalRev = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCom = validOrders.reduce((sum, o) => sum + o.profit, 0); // profit is seller commission margin
    const completedOrdersCount = state.orders.filter(o => o.status === "DELIVERED").length;
    const activeSellersCount = state.sellers.filter(s => s.status === "ACTIVE").length;

    document.getElementById("brand-stat-revenue").textContent = `${totalRev.toLocaleString()} THB`;
    document.getElementById("brand-stat-orders").textContent = `${completedOrdersCount} ออเดอร์`;
    document.getElementById("brand-stat-sellers").textContent = `${activeSellersCount} ราย`;
    document.getElementById("brand-stat-commission").textContent = `${totalCom.toLocaleString()} THB`;

    // 2. Generate Top Sellers list
    // Calculate dynamically from orders
    const sellerStats = state.sellers.map(seller => {
        const sellerOrders = state.orders.filter(o => o.sellerId === seller.id && o.status !== "REJECTED");
        const sales = sellerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        return {
            name: seller.name,
            sales: sales,
            orders: sellerOrders.length,
            status: seller.status
        };
    }).sort((a, b) => b.sales - a.sales);

    const tbody = document.getElementById("brand-top-sellers-list");
    tbody.innerHTML = "";
    
    sellerStats.forEach(seller => {
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: 600; color: var(--text-title);">${seller.name}</td>
                <td><strong>${seller.sales.toLocaleString()} THB</strong></td>
                <td>${seller.orders}</td>
                <td><span class="status-pill active">ใช้งานอยู่</span></td>
            </tr>
        `;
    });

    // 3. AI Insights engine
    const aiInsightText = document.getElementById("brand-ai-insight");
    const lowStockProducts = state.products.filter(p => p.stock < 10);
    const pendingOrders = state.orders.filter(o => o.status === "PENDING");
    
    if (pendingOrders.length > 0) {
        aiInsightText.innerHTML = `พบคำสั่งซื้อใหม่จำนวน <strong>${pendingOrders.length} รายการ</strong> ที่รอการยืนยันและตรวจสอบสต็อก แนะนำให้ตรวจสอบที่เมนู "รายการสั่งซื้อ" ทันที เพื่อป้องกันความล่าช้าในการส่งสินค้าแบบเก็บเงินปลายทาง (COD)`;
    } else if (lowStockProducts.length > 0) {
        aiInsightText.innerHTML = `<strong>แจ้งเตือนสต็อกต่ำ:</strong> สินค้า <strong>"${lowStockProducts[0].name}"</strong> เหลือเพียง ${lowStockProducts[0].stock} ชิ้นในคลัง แนะนำให้เติมสินค้าเข้าสู่ระบบหลักเพื่อไม่ให้ตัวแทนจำหน่ายเสียโอกาสทางการเสนอขาย`;
    } else {
        aiInsightText.innerHTML = `ภาพรวมเครือข่ายของแบรนด์ดำเนินงานได้ดี ยอดขายรวมโตขึ้นอย่างต่อเนื่อง พฤติกรรมการตั้งราคาขายปลีกของตัวแทนจำหน่ายทั้งหมดอยู่ในกรอบมาตรฐานควบคุม (Price Integrity)`;
    }
}

function renderBrandProducts() {
    const tbody = document.getElementById("brand-products-list");
    tbody.innerHTML = "";

    state.products.forEach(p => {
        const statusBadge = p.status === "ACTIVE" 
            ? `<span class="status-pill active"><i class="fa-solid fa-circle-check"></i> Active</span>`
            : `<span class="status-pill inactive"><i class="fa-solid fa-circle-minus"></i> Inactive</span>`;
            
        const shippingText = p.shippingSetting === "BRAND"
            ? `<span class="status-pill confirmed">แบรนด์ดูแลค่าส่ง</span>`
            : p.shippingSetting === "CUSTOMER"
                ? `<span class="status-pill pending">ลูกค้าจ่ายค่าส่ง</span>`
                : `<span class="status-pill rejected" style="background-color:#fee2e2;">ยังไม่ตั้งค่าส่ง</span>`;

        tbody.innerHTML += `
            <tr>
                <td><img src="${p.image}" alt="${p.name}" class="table-product-img"></td>
                <td>
                    <div class="table-product-title">${p.name}</div>
                    <span class="help-block">${p.description.substring(0, 50)}...</span>
                </td>
                <td><strong>${p.dealerPrice.toLocaleString()} THB</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>${p.stock} ชิ้น</span>
                        <button class="icon-btn" onclick="updateBrandStock('${p.id}')" title="ปรับสต็อก"><i class="fa-solid fa-pen-to-square"></i></button>
                    </div>
                </td>
                <td>${shippingText}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn primary" onclick="editBrandProduct('${p.id}')" title="แก้ไขสินค้า"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn danger" onclick="deleteBrandProduct('${p.id}')" title="ลบสินค้า"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function handleBrandAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById("p-name").value;
    const dealerPrice = parseFloat(document.getElementById("p-dealer-price").value);
    const stock = parseInt(document.getElementById("p-stock").value);
    const shippingSetting = document.getElementById("p-shipping").value;
    const imageUrl = document.getElementById("p-image").value;

    const newProduct = {
        id: "p" + (state.products.length + 1),
        name,
        description: "สินค้าเพิ่มใหม่โดยเจ้าของแบรนด์ มีการควบคุมราคากลางสำหรับการจำหน่าย",
        dealerPrice,
        stock,
        shippingSetting,
        status: shippingSetting ? "ACTIVE" : "INACTIVE",
        image: imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`
    };

    state.products.push(newProduct);
    saveToStorage();
    
    closeModal("add-product-modal");
    document.getElementById("form-add-product").reset();
    
    renderBrandProducts();
    updatePendingBadges();
    showToast("บันทึกสินค้าสำเร็จ", `สินค้า "${name}" ได้ถูกเพิ่มเข้าสู่ระบบ MyMarket แล้ว`, "success");
}

function updateBrandStock(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    const newStockStr = prompt(`ระบุจำนวนสต็อกใหม่ของ "${product.name}":`, product.stock);
    if (newStockStr === null) return;
    
    const newStock = parseInt(newStockStr);
    if (isNaN(newStock) || newStock < 0) {
        showToast("ข้อมูลไม่ถูกต้อง", "กรุณาระบุตัวเลขจำนวนสต็อกที่มากกว่าหรือเท่ากับ 0", "error");
        return;
    }

    product.stock = newStock;
    saveToStorage();
    renderBrandProducts();
    showToast("อัปเดตสต็อกแล้ว", `อัปเดตสต็อก "${product.name}" เป็น ${newStock} ชิ้นสำเร็จ`, "success");
}

function deleteBrandProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`คุณต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) {
        // Keep a backup for undo
        const backupIndex = state.products.indexOf(product);
        state.products = state.products.filter(p => p.id !== productId);
        
        // Also remove from seller catalog if any
        const catalogBackup = [...state.sellerCatalog];
        state.sellerCatalog = state.sellerCatalog.filter(c => c.productId !== productId);
        
        saveToStorage();
        renderBrandProducts();
        
        // Toast with undo
        showToast("ลบสินค้าสำเร็จ", `ลบ "${product.name}" ออกจากระบบแล้ว`, "warning", () => {
            state.products.splice(backupIndex, 0, product);
            state.sellerCatalog = catalogBackup;
            saveToStorage();
            renderBrandProducts();
            updatePendingBadges();
            showToast("กู้คืนสำเร็จ", "สินค้าได้รับการกู้คืนเรียบร้อยแล้ว", "success");
        });
    }
}

function editBrandProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    const newPriceStr = prompt(`แก้ไขราคากลาง (Dealer Price) ของ "${product.name}":`, product.dealerPrice);
    if (newPriceStr === null) return;
    
    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice <= 0) {
        showToast("ข้อมูลไม่ถูกต้อง", "กรุณาระบุราคาที่มากกว่า 0", "error");
        return;
    }

    product.dealerPrice = newPrice;
    saveToStorage();
    renderBrandProducts();
    showToast("แก้ไขสำเร็จ", "ปรับปรุงราคากลางสำเร็จ", "success");
}

let activeBrandOrderFilter = "ALL";
function filterBrandOrders(status, button) {
    activeBrandOrderFilter = status;
    
    // Set active button
    const buttons = document.querySelectorAll("#brand-tab-orders .sub-tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    if (button) {
        button.classList.add("active");
    }

    renderBrandOrders(status);
}

function renderBrandOrders(filterStatus = "ALL") {
    const tbody = document.getElementById("brand-orders-list");
    tbody.innerHTML = "";

    const filtered = state.orders.filter(o => {
        if (filterStatus === "ALL") return true;
        return o.status === filterStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color:var(--text-caption);">ไม่มีรายการคำสั่งซื้อในสถานะนี้</td></tr>`;
        return;
    }

    filtered.forEach(o => {
        const product = state.products.find(p => p.id === o.productId) || { name: "ไม่พบสินค้าในคลัง", image: "" };
        const sellerObj = state.sellers.find(s => s.id === o.sellerId) || { name: "ตัวแทนทั่วไป" };
        
        let statusBadge = "";
        let actionButtons = "";

        // Status badge mapper
        if (o.status === "PENDING") {
            statusBadge = `<span class="status-pill pending"><i class="fa-solid fa-hourglass-start"></i> รอตรวจสอบ</span>`;
            actionButtons = `
                <button class="btn btn-sm btn-primary" onclick="confirmBrandOrder('${o.id}')"><i class="fa-solid fa-check"></i> ยืนยัน (ตัดสต็อก)</button>
                <button class="btn btn-sm btn-outline btn-danger" onclick="openRejectOrderModal('${o.id}')"><i class="fa-solid fa-ban"></i> ปฏิเสธ</button>
            `;
        } else if (o.status === "CONFIRMED") {
            statusBadge = `<span class="status-pill confirmed"><i class="fa-solid fa-circle-check"></i> ยืนยันสต็อกแล้ว</span>`;
            actionButtons = `
                <button class="btn btn-sm btn-secondary" onclick="shipBrandOrder('${o.id}')"><i class="fa-solid fa-truck"></i> จัดส่งและออกเลขพัสดุ</button>
            `;
        } else if (o.status === "SHIPPING") {
            statusBadge = `<span class="status-pill shipping"><i class="fa-solid fa-truck-fast"></i> กำลังส่งพัสดุ</span>`;
            actionButtons = `
                <button class="btn btn-sm btn-outline" style="color:var(--status-success-text); border-color:var(--status-success);" onclick="deliverBrandOrder('${o.id}')"><i class="fa-solid fa-house-chimney-user"></i> ส่งพัสดุสำเร็จ</button>
            `;
        } else if (o.status === "DELIVERED") {
            statusBadge = `<span class="status-pill delivered"><i class="fa-solid fa-circle-check"></i> ส่งสำเร็จ</span>`;
            actionButtons = `<span class="help-block" style="color:var(--status-success-text);">เสร็จสมบูรณ์ (${o.trackingNumber})</span>`;
        } else if (o.status === "REJECTED") {
            statusBadge = `<span class="status-pill rejected" title="สาเหตุ: ${o.rejectReason}"><i class="fa-solid fa-circle-xmark"></i> ปฏิเสธแล้ว</span>`;
            actionButtons = `<span class="help-block text-danger" title="${o.rejectReason}">ปฏิเสธ: ${getFriendlyRejectReason(o.rejectReason)}</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>#${o.id}</strong><br><span class="help-block">${new Date(o.createdAt).toLocaleDateString("th-TH")}</span></td>
                <td><span style="font-weight:600; color:var(--brand-primary);">${sellerObj.name}</span></td>
                <td>
                    <div style="font-weight:600;">${o.customerName}</div>
                    <span class="help-block"><i class="fa-solid fa-phone"></i> ${o.customerPhone}</span>
                </td>
                <td>
                    <div class="td-product-info">
                        <img src="${product.image}" class="table-product-img" alt="${product.name}">
                        <div>
                            <div class="table-product-title">${product.name}</div>
                            <span class="help-block">${o.qty} ชิ้น x ${o.sellingPrice} THB</span>
                        </div>
                    </div>
                </td>
                <td><strong style="font-size:1.063rem; color:var(--text-title);">${o.totalAmount.toLocaleString()} THB</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    });
}

function getFriendlyRejectReason(reason) {
    const reasons = {
        "STOCK_MISMATCH": "สต็อกคลาดเคลื่อน / สินค้าหมด",
        "PRICE_VIOLATION": "ราคาขายปลีกต่ำกว่าราคากลาง",
        "INVALID_ADDRESS": "ที่อยู่ไม่ถูกต้อง",
        "OTHER": "อื่นๆ"
    };
    return reasons[reason] || reason;
}

function confirmBrandOrder(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const product = state.products.find(p => p.id === order.productId);
    if (!product) {
        showToast("ไม่พบสินค้า", "ไม่พบสินค้าในสต็อกหลัก", "error");
        return;
    }

    // Double-check stock
    if (product.stock < order.qty) {
        showToast("สต็อกไม่พอ", `สินค้าในคลังไม่พอสำหรับคำสั่งซื้อนี้ (เหลือ ${product.stock} ชิ้น)`, "error");
        return;
    }

    // Deduct Stock
    product.stock -= order.qty;
    order.status = "CONFIRMED";
    
    saveToStorage();
    renderBrandOrders(activeBrandOrderFilter);
    updatePendingBadges();
    
    showToast("ยืนยันออเดอร์แล้ว", `ยืนยันสต็อกออเดอร์ #${orderId} และตัดสินค้าจำนวน ${order.qty} ชิ้นสำเร็จ`, "success");
}

function openRejectOrderModal(orderId) {
    document.getElementById("reject-o-id").value = orderId;
    document.getElementById("reject-reason").value = "";
    document.getElementById("reject-reason-text-group").classList.add("hide");
    document.getElementById("reject-reason-text").value = "";
    openModal("reject-order-modal");
}

function handleRejectReasonChange() {
    const reasonSelect = document.getElementById("reject-reason");
    const customTextGroup = document.getElementById("reject-reason-text-group");
    
    if (reasonSelect.value === "OTHER" || reasonSelect.value === "PRICE_VIOLATION") {
        customTextGroup.classList.remove("hide");
    } else {
        customTextGroup.classList.add("hide");
    }
}

function handleRejectOrderSubmit(e) {
    e.preventDefault();
    const orderId = document.getElementById("reject-o-id").value;
    const reasonSelect = document.getElementById("reject-reason").value;
    const customText = document.getElementById("reject-reason-text").value;

    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = "REJECTED";
    order.rejectReason = reasonSelect === "OTHER" ? customText : (reasonSelect + (customText ? ` - ${customText}` : ""));

    saveToStorage();
    closeModal("reject-order-modal");
    renderBrandOrders(activeBrandOrderFilter);
    updatePendingBadges();
    
    showToast("ปฏิเสธคำสั่งซื้อแล้ว", `อัปเดตสถานะออเดอร์ #${orderId} เป็นถูกปฏิเสธ`, "warning");
}

function shipBrandOrder(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    // Generate random tracking number
    const trackNum = "TH" + Math.floor(100000000 + Math.random() * 900000000) + "MY";
    order.status = "SHIPPING";
    order.trackingNumber = trackNum;
    order.carrier = "MyOrder Logistics (COD Service)";

    saveToStorage();
    renderBrandOrders(activeBrandOrderFilter);
    showToast("จัดส่งพัสดุแล้ว", `สร้างเลขพัสดุ ${trackNum} สำหรับออเดอร์ #${orderId} สำเร็จ`, "success");
}

function deliverBrandOrder(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = "DELIVERED";
    
    // Add sales volume to the active seller for simulator metrics
    const sellerObj = state.sellers.find(s => s.id === order.sellerId);
    if (sellerObj) {
        sellerObj.totalSales += order.totalAmount;
        sellerObj.ordersCount += 1;
        // Check Tier Upgrades
        if (sellerObj.totalSales >= 20000) {
            sellerObj.tier = "Pro Seller";
        }
    }

    saveToStorage();
    renderBrandOrders(activeBrandOrderFilter);
    showToast("ส่งมอบพัสดุสำเร็จ", `เก็บเงินปลายทางยอด ${order.totalAmount} THB และปิดออเดอร์ #${orderId} เรียบร้อย`, "success");
}

function renderBrandSellers() {
    const grid = document.getElementById("brand-sellers-grid");
    grid.innerHTML = "";

    state.sellers.forEach(s => {
        const activeOrdersCount = state.orders.filter(o => o.sellerId === s.id && o.status !== "REJECTED").length;
        const totalProfit = state.orders.filter(o => o.sellerId === s.id && o.status !== "REJECTED").reduce((sum, o) => sum + o.profit, 0);

        grid.innerHTML += `
            <div class="seller-card">
                <div class="seller-card-header">
                    <img src="${s.avatar}" alt="${s.name}" class="seller-avatar">
                    <div class="seller-details">
                        <h4>${s.name}</h4>
                        <span>ID: ${s.id.toUpperCase()}</span>
                    </div>
                </div>
                <div class="seller-stats-rows">
                    <div class="seller-stat-row">
                        <span class="text-muted">ระดับตัวแทน:</span>
                        <span class="seller-stat-val text-primary" style="color:var(--brand-secondary);">${s.tier}</span>
                    </div>
                    <div class="seller-stat-row">
                        <span class="text-muted">ยอดขายรวมส่งสำเร็จ:</span>
                        <span class="seller-stat-val">${s.totalSales.toLocaleString()} THB</span>
                    </div>
                    <div class="seller-stat-row">
                        <span class="text-muted">คอมมิชชันสะสม:</span>
                        <span class="seller-stat-val text-success">${totalProfit.toLocaleString()} THB</span>
                    </div>
                    <div class="seller-stat-row">
                        <span class="text-muted">จำนวนออเดอร์:</span>
                        <span class="seller-stat-val">${activeOrdersCount} ออเดอร์</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function onboardNewSeller() {
    const newName = prompt("ระบุชื่อร้านค้าของตัวแทนใหม่ที่ได้รับอนุมัติ:");
    if (!newName) return;

    const seed = encodeURIComponent(newName);
    const newSeller = {
        id: "s" + (state.sellers.length + 1),
        name: newName,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
        totalSales: 0,
        ordersCount: 0,
        tier: "Standard Seller",
        status: "ACTIVE"
    };

    state.sellers.push(newSeller);
    saveToStorage();
    renderBrandSellers();
    showToast("อนุมัติตัวแทนใหม่แล้ว", `ร้าน "${newName}" ได้เข้าร่วมเครือข่าย MyMarket เรียบร้อย`, "success");
}


// ========================================================
// --- SELLER PART LOGIC ---
// ========================================================

function renderSellerDashboard() {
    const sellerId = state.activeSellerId;
    const sellerObj = state.sellers.find(s => s.id === sellerId) || { name: "ตัวแทนจำหน่าย", tier: "Standard Seller", totalSales: 0 };
    
    // Calculate stats
    const myOrders = state.orders.filter(o => o.sellerId === sellerId && o.status !== "REJECTED");
    const myRevenue = myOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const myProfit = myOrders.reduce((sum, o) => sum + o.profit, 0); // Retail - Dealer margin
    const deliveredOrders = state.orders.filter(o => o.sellerId === sellerId && o.status === "DELIVERED").length;

    document.getElementById("seller-stat-revenue").textContent = `${myRevenue.toLocaleString()} THB`;
    document.getElementById("seller-stat-profit").textContent = `${myProfit.toLocaleString()} THB`;
    document.getElementById("seller-stat-orders").textContent = `${deliveredOrders} รายการ`;
    document.getElementById("seller-stat-tier").textContent = sellerObj.tier;

    // Calculate Tier progress
    // Pro seller goal is 20,000 THB profit or revenue (let's use revenue as simple metric)
    const targetRev = 20000;
    const percentage = Math.min(100, Math.round((myRevenue / targetRev) * 100));
    
    document.getElementById("seller-tier-progress-bar").style.width = `${percentage}%`;
    const label = document.querySelector(".tier-progress-container .next-tier");
    
    if (myRevenue >= targetRev) {
        label.textContent = "Pro Seller (ความสำเร็จ ปลดล็อกแล้ว!)";
        document.getElementById("seller-tier-progress-text").textContent = "ยินดีด้วย! คุณเป็น Pro Seller เรียบร้อยแล้ว รับข้อเสนอส่วนราคาสินค้าพิเศษจากแบรนด์!";
    } else {
        const remaining = targetRev - myRevenue;
        label.textContent = `Pro Seller (${targetRev.toLocaleString()} THB)`;
        document.getElementById("seller-tier-progress-text").textContent = `คุณมียอดขายขาดอีกเพียง ${remaining.toLocaleString()} THB เพื่อเลื่อนขั้นรับส่วนลดต้นทุนราคากลางเพิ่ม 5%!`;
    }
}

function renderSellerBrowse() {
    const grid = document.getElementById("seller-browse-grid");
    grid.innerHTML = "";

    // Show only ACTIVE products
    const activeProducts = state.products.filter(p => p.status === "ACTIVE");

    if (activeProducts.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">ไม่มีสินค้าแอคทีฟจากแบรนด์ในขณะนี้</div>`;
        return;
    }

    activeProducts.forEach(p => {
        const catalogItem = state.sellerCatalog.find(c => c.productId === p.id);
        const isInCatalog = !!catalogItem;
        
        let buttonHTML = "";
        let marginLabel = "";

        if (isInCatalog) {
            marginLabel = `
                <div style="font-size:0.813rem; color:var(--status-success-text); font-weight:600; margin-bottom:10px;">
                    ขายในร้านคุณ: ${catalogItem.sellingPrice.toLocaleString()} THB (กำไร/ชิ้น: ${(catalogItem.sellingPrice - p.dealerPrice).toLocaleString()} THB)
                </div>
            `;
            buttonHTML = `
                <button class="btn btn-outline btn-sm" style="width:100%; border-color:var(--brand-secondary); color:var(--brand-secondary);" onclick="openConfigurePriceModal('${p.id}')">
                    <i class="fa-solid fa-pen"></i> ปรับราคาขายปลีก
                </button>
            `;
        } else {
            marginLabel = `<div style="font-size:0.813rem; color:var(--text-caption); margin-bottom:10px;">ยังไม่ถูกเพิ่มเข้าร้านค้าของคุณ</div>`;
            buttonHTML = `
                <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="openConfigurePriceModal('${p.id}')">
                    <i class="fa-solid fa-circle-plus"></i> เพิ่มเข้าร้านค้าเพื่อขาย
                </button>
            `;
        }

        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}" class="product-card-img">
                <div class="product-card-body">
                    <h4 class="product-card-title">${p.name}</h4>
                    <p class="product-card-desc">${p.description}</p>
                    
                    <div class="product-card-pricing">
                        <span class="dealer-cost-label">ราคากลางต้นทุน:</span>
                        <span class="dealer-cost-price">${p.dealerPrice.toLocaleString()} THB</span>
                    </div>

                    <div class="product-card-stock">
                        <i class="fa-solid fa-cubes"></i> สต็อกพร้อมส่ง: <strong>${p.stock} ชิ้น</strong>
                    </div>

                    ${marginLabel}
                    ${buttonHTML}
                </div>
            </div>
        `;
    });
}

function openConfigurePriceModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById("conf-p-id").value = product.id;
    document.getElementById("conf-p-img").src = product.image;
    document.getElementById("conf-p-name").textContent = product.name;
    document.getElementById("conf-p-code").textContent = product.id.toUpperCase();
    document.getElementById("conf-p-dealer-price").textContent = product.dealerPrice.toLocaleString();
    document.getElementById("conf-p-min-allowed").textContent = product.dealerPrice;

    // Default proposed price (Dealer price + 15% markup rounded to nearest 10)
    const catalogItem = state.sellerCatalog.find(c => c.productId === product.id);
    const defaultSellingPrice = catalogItem ? catalogItem.sellingPrice : Math.ceil((product.dealerPrice * 1.15) / 10) * 10;
    
    const priceInput = document.getElementById("conf-p-selling-price");
    priceInput.value = defaultSellingPrice;
    
    // Trigger validation and calculator UI updates
    validateSellingPriceInput(defaultSellingPrice, product.dealerPrice);
    
    // Add dynamic listeners to form input
    priceInput.oninput = (e) => {
        validateSellingPriceInput(parseFloat(e.target.value) || 0, product.dealerPrice);
    };

    openModal("configure-price-modal");
}

function validateSellingPriceInput(sellingPrice, dealerPrice) {
    const errorBlock = document.getElementById("conf-p-price-error");
    const confirmBtn = document.getElementById("btn-confirm-catalog");
    
    // Profit Calculator items
    const calcRetail = document.getElementById("calc-retail-val");
    const calcDealer = document.getElementById("calc-dealer-val");
    const calcProfit = document.getElementById("calc-profit-val");

    calcRetail.textContent = `${sellingPrice.toLocaleString()} THB`;
    calcDealer.textContent = `-${dealerPrice.toLocaleString()} THB`;

    if (sellingPrice < dealerPrice) {
        // Price violation
        errorBlock.classList.remove("hide");
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = 0.5;
        confirmBtn.style.cursor = "not-allowed";
        
        calcProfit.textContent = `ติดลบ (ไม่ผ่านเกณฑ์)`;
        calcProfit.className = "total-profit text-danger";
    } else {
        errorBlock.classList.add("hide");
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = 1;
        confirmBtn.style.cursor = "pointer";
        
        const profit = sellingPrice - dealerPrice;
        calcProfit.textContent = `+${profit.toLocaleString()} THB`;
        calcProfit.className = "total-profit success";
    }
}

function handleConfigurePriceSubmit(e) {
    e.preventDefault();
    const productId = document.getElementById("conf-p-id").value;
    const sellingPrice = parseFloat(document.getElementById("conf-p-selling-price").value);

    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    if (sellingPrice < product.dealerPrice) {
        showToast("กำหนดราคาล้มเหลว", "ราคาปลีกที่คุณระบุต่ำกว่ากฎข้อกำหนดต้นทุนกลางแบรนด์", "error");
        return;
    }

    // Add or Update in catalog
    const existingIndex = state.sellerCatalog.findIndex(c => c.productId === productId);
    if (existingIndex > -1) {
        state.sellerCatalog[existingIndex].sellingPrice = sellingPrice;
    } else {
        state.sellerCatalog.push({
            productId: productId,
            sellingPrice: sellingPrice
        });
    }

    saveToStorage();
    closeModal("configure-price-modal");
    renderSellerBrowse();
    updatePendingBadges();
    
    showToast("นำเข้าสินค้าแล้ว", `เพิ่ม "${product.name}" ในราคาแนะนำปลีก ${sellingPrice} THB เรียบร้อย`, "success");
}

function renderSellerStore() {
    const listContainer = document.getElementById("seller-store-catalog");
    const emptyState = document.getElementById("seller-store-empty");
    const tbody = document.getElementById("seller-store-list");

    if (state.sellerCatalog.length === 0) {
        listContainer.classList.add("hide");
        emptyState.classList.remove("hide");
        return;
    }

    listContainer.classList.remove("hide");
    emptyState.classList.add("hide");
    tbody.innerHTML = "";

    state.sellerCatalog.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) return; // If product was deleted

        const margin = item.sellingPrice - product.dealerPrice;

        tbody.innerHTML += `
            <tr>
                <td><img src="${product.image}" class="table-product-img" alt="${product.name}"></td>
                <td>
                    <div class="table-product-title">${product.name}</div>
                    <span class="help-block">${product.description.substring(0, 50)}...</span>
                </td>
                <td><strong>${product.dealerPrice.toLocaleString()} THB</strong></td>
                <td>
                    <div style="font-weight:700; color:var(--brand-secondary); font-size:1.063rem;">
                        ${item.sellingPrice.toLocaleString()} THB
                    </div>
                </td>
                <td><strong class="success">+${margin.toLocaleString()} THB</strong></td>
                <td>${product.stock} ชิ้น</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn secondary" onclick="openConfigurePriceModal('${product.id}')" title="ปรับปรุงราคา"><i class="fa-solid fa-sliders"></i></button>
                        <button class="icon-btn danger" onclick="removeProductFromSellerCatalog('${product.id}')" title="ถอนสินค้า"><i class="fa-solid fa-circle-minus"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function removeProductFromSellerCatalog(productId) {
    const product = state.products.find(p => p.id === productId);
    const catalogItem = state.sellerCatalog.find(c => c.productId === productId);
    if (!catalogItem) return;

    if (confirm(`คุณต้องการนำสินค้า "${product.name}" ออกจากรายการเสนอขายหน้าร้านหรือไม่?`)) {
        const backupIndex = state.sellerCatalog.indexOf(catalogItem);
        state.sellerCatalog = state.sellerCatalog.filter(c => c.productId !== productId);
        
        saveToStorage();
        renderSellerStore();
        updatePendingBadges();
        
        showToast("นำสินค้าออกจากร้านค้าสำเร็จ", `ถอด "${product.name}" เรียบร้อย`, "warning", () => {
            state.sellerCatalog.splice(backupIndex, 0, catalogItem);
            saveToStorage();
            renderSellerStore();
            updatePendingBadges();
            showToast("กู้คืนสำเร็จ", "กู้คืนสินค้าเข้าร้านค้าแล้ว", "success");
        });
    }
}

function openCreateOrderModal() {
    // Populate select option with items in seller catalog only!
    const select = document.getElementById("o-product-select");
    select.innerHTML = `<option value="">-- โปรดเลือกสินค้าของคุณ --</option>`;

    if (state.sellerCatalog.length === 0) {
        showToast("ไม่สามารถสร้างออเดอร์ได้", "กรุณาเพิ่มสินค้าเข้าร้านค้าของคุณก่อนที่จะดำเนินรายการสั่งซื้อ", "warning");
        return;
    }

    state.sellerCatalog.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (product) {
            select.innerHTML += `<option value="${product.id}">${product.name} (ราคาของคุณ: ${item.sellingPrice} THB)</option>`;
        }
    });

    // Reset fields
    document.getElementById("form-create-order").reset();
    document.getElementById("o-stock-info").textContent = "สต็อกคงคลัง: 0 ชิ้น";
    document.getElementById("o-price-error").classList.add("hide");
    
    calculateOrderTotal();
    openModal("create-order-modal");
}

function handleOrderProductChange() {
    const productId = document.getElementById("o-product-select").value;
    const qtyInput = document.getElementById("o-qty");
    const priceInput = document.getElementById("o-selling-price");
    
    if (!productId) {
        document.getElementById("o-stock-info").textContent = "สต็อกคงคลัง: 0 ชิ้น";
        return;
    }

    const product = state.products.find(p => p.id === productId);
    const catalogItem = state.sellerCatalog.find(c => c.productId === productId);

    if (product && catalogItem) {
        document.getElementById("o-stock-info").textContent = `สต็อกคงคลัง: ${product.stock} ชิ้น`;
        qtyInput.max = product.stock;
        qtyInput.value = 1;
        priceInput.value = catalogItem.sellingPrice;
        
        document.getElementById("o-min-price-allowed").textContent = product.dealerPrice;
    }

    calculateOrderTotal();
}

function calculateOrderTotal() {
    const productId = document.getElementById("o-product-select").value;
    const qty = parseInt(document.getElementById("o-qty").value) || 0;
    const sellingPrice = parseFloat(document.getElementById("o-selling-price").value) || 0;

    const totalText = document.getElementById("o-total-amount");
    const dealerText = document.getElementById("o-total-dealer-cost");
    const profitText = document.getElementById("o-total-profit");
    const priceError = document.getElementById("o-price-error");
    const submitBtn = document.getElementById("btn-submit-order");

    if (!productId) {
        totalText.textContent = "0 THB";
        dealerText.textContent = "0 THB";
        profitText.textContent = "0 THB";
        return;
    }

    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Check pricing constraint rule
    if (sellingPrice < product.dealerPrice) {
        priceError.classList.remove("hide");
        submitBtn.disabled = true;
        submitBtn.style.opacity = 0.5;
        
        totalText.textContent = "ผิดกฎราคากลาง";
        dealerText.textContent = "---";
        profitText.textContent = "---";
        return;
    } else {
        priceError.classList.add("hide");
        submitBtn.disabled = false;
        submitBtn.style.opacity = 1;
    }

    const total = sellingPrice * qty;
    const cost = product.dealerPrice * qty;
    const profit = total - cost;

    totalText.textContent = `${total.toLocaleString()} THB`;
    dealerText.textContent = `${cost.toLocaleString()} THB`;
    
    profitText.textContent = `+${profit.toLocaleString()} THB`;
}

function handleCreateOrderSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById("o-product-select").value;
    const qty = parseInt(document.getElementById("o-qty").value);
    const sellingPrice = parseFloat(document.getElementById("o-selling-price").value);
    
    const customerName = document.getElementById("o-cust-name").value;
    const customerPhone = document.getElementById("o-cust-phone").value;
    const customerAddress = document.getElementById("o-cust-address").value;

    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Check stock
    if (product.stock < qty) {
        showToast("สต็อกสินค้าไม่พอ", `สินค้าคงเหลือเพียง ${product.stock} ชิ้น ไม่พอจำหน่ายสำหรับจำนวนที่ต้องการ`, "error");
        return;
    }

    // Validate pricing rule constraint
    if (sellingPrice < product.dealerPrice) {
        showToast("ไม่ถูกต้อง", "คุณไม่สามารถขายต่ำกว่าราคากลางของแบรนด์ได้", "error");
        return;
    }

    // Build order object
    const orderId = "MM-" + Math.floor(1004 + Math.random() * 8999);
    const cost = product.dealerPrice * qty;
    const totalAmount = sellingPrice * qty;
    const profit = totalAmount - cost;

    const newOrder = {
        id: orderId,
        sellerId: state.activeSellerId,
        customerName,
        customerPhone,
        customerAddress,
        productId,
        qty,
        sellingPrice,
        dealerPrice: product.dealerPrice,
        totalAmount,
        profit,
        paymentMethod: "COD",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        trackingNumber: "",
        carrier: "",
        rejectReason: ""
    };

    state.orders.push(newOrder);
    saveToStorage();
    closeModal("create-order-modal");
    
    renderSellerOrders();
    updatePendingBadges();
    
    // Success toast with 5s undo
    showToast("ส่งคำสั่งซื้อสำเร็จ", `ออเดอร์ #${orderId} ถูกส่งไปยังระบบ MyOrder เพื่อรอแบรนด์จัดส่งแล้ว`, "success", () => {
        // Undo callback
        state.orders = state.orders.filter(o => o.id !== orderId);
        saveToStorage();
        renderSellerOrders();
        updatePendingBadges();
        showToast("ยกเลิกออเดอร์สำเร็จ", `ยกเลิกรายการออเดอร์ #${orderId} เรียบร้อย`, "warning");
    });
}

function renderSellerOrders() {
    const tbody = document.getElementById("seller-orders-list");
    tbody.innerHTML = "";

    const myOrders = state.orders.filter(o => o.sellerId === state.activeSellerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (myOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color:var(--text-caption);">ไม่มีรายการออเดอร์ของร้านค้าคุณ</td></tr>`;
        return;
    }

    myOrders.forEach(o => {
        const product = state.products.find(p => p.id === o.productId) || { name: "สินค้าเดิมถูกถอนแล้ว", image: "" };
        
        let statusBadge = "";
        let trackingInfo = "";

        // Status badge and tracking display
        if (o.status === "PENDING") {
            statusBadge = `<span class="status-pill pending"><i class="fa-solid fa-hourglass-start"></i> รอตรวจสอบ</span>`;
            trackingInfo = `<span class="text-muted">แบรนด์กำลังตรวจสอบสต็อก</span>`;
        } else if (o.status === "CONFIRMED") {
            statusBadge = `<span class="status-pill confirmed"><i class="fa-solid fa-circle-check"></i> รับออเดอร์แล้ว</span>`;
            trackingInfo = `<span class="text-muted">กำลังเตรียมแพ็คสินค้า</span>`;
        } else if (o.status === "SHIPPING") {
            statusBadge = `<span class="status-pill shipping"><i class="fa-solid fa-truck-fast"></i> ระหว่างขนส่ง</span>`;
            trackingInfo = `
                <div style="font-weight:600; color:var(--brand-ai);">${o.trackingNumber}</div>
                <span class="help-block">${o.carrier}</span>
            `;
        } else if (o.status === "DELIVERED") {
            statusBadge = `<span class="status-pill delivered"><i class="fa-solid fa-check-double"></i> สำเร็จ (โอนกำไร)</span>`;
            trackingInfo = `
                <div style="font-weight:600; color:var(--status-success-text);">${o.trackingNumber}</div>
                <span class="help-block">กำไรโอนเข้ากระเป๋าเงินแล้ว</span>
            `;
        } else if (o.status === "REJECTED") {
            statusBadge = `<span class="status-pill rejected" title="เหตุผล: ${o.rejectReason}"><i class="fa-solid fa-triangle-exclamation"></i> ถูกยกเลิก</span>`;
            trackingInfo = `<span class="text-danger" title="${o.rejectReason}">${getFriendlyRejectReason(o.rejectReason)}</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>#${o.id}</strong><br><span class="help-block">${new Date(o.createdAt).toLocaleDateString("th-TH")}</span></td>
                <td>
                    <div style="font-weight:600;">${o.customerName}</div>
                    <span class="help-block"><i class="fa-solid fa-phone"></i> ${o.customerPhone}</span>
                </td>
                <td>
                    <div class="td-product-info">
                        <img src="${product.image}" class="table-product-img" alt="${product.name}">
                        <div>
                            <div class="table-product-title">${product.name}</div>
                            <span class="help-block">${o.qty} ชิ้น x ${o.sellingPrice} THB</span>
                        </div>
                    </div>
                </td>
                <td><strong>${o.totalAmount.toLocaleString()} THB</strong></td>
                <td><strong class="success">+${o.profit.toLocaleString()} THB</strong></td>
                <td>${statusBadge}</td>
                <td>${trackingInfo}</td>
            </tr>
        `;
    });
}


// ========================================================
// --- MODAL CONTROLLER & TOAST ENGINE ---
// ========================================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("active");
        
        // Focus first input field inside modal for UX best practices
        const firstInput = modal.querySelector("input, select, textarea");
        if (firstInput) {
            firstInput.focus();
        }
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("active");
    }
}

// Interactive Toast Engine with 5-seconds undo capabilities
function showToast(title, message, type = "success", undoCallback = null) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    // Clear any previous undo timeout before starting a new one
    if (state.undoTimeoutId) {
        clearTimeout(state.undoTimeoutId);
    }

    const toastId = "toast-" + Date.now();
    
    // Choose icon
    let iconClass = "fa-solid fa-circle-check";
    if (type === "warning") iconClass = "fa-solid fa-circle-exclamation";
    if (type === "error") iconClass = "fa-solid fa-circle-xmark";

    let undoBtnHTML = "";
    if (undoCallback) {
        undoBtnHTML = `<button class="toast-undo-btn" id="${toastId}-undo-btn">ยกเลิกรายการ (Undo)</button>`;
    }

    const toastHTML = `
        <div id="${toastId}" class="toast toast-${type}">
            <div class="toast-icon"><i class="${iconClass}"></i></div>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
                ${undoBtnHTML}
            </div>
            <button class="toast-close" onclick="closeToast('${toastId}')">&times;</button>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", toastHTML);

    // Setup Undo Event Listener
    if (undoCallback) {
        const undoBtn = document.getElementById(`${toastId}-undo-btn`);
        undoBtn.addEventListener("click", () => {
            undoCallback();
            closeToast(toastId);
        });
    }

    // Auto-remove toast after 5 seconds
    state.undoTimeoutId = setTimeout(() => {
        closeToast(toastId);
    }, 5000);
}

function closeToast(id) {
    const toast = document.getElementById(id);
    if (toast) {
        toast.classList.add("hide");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// Global modal overlay click close support
function setupEventListeners() {
    const overlays = document.querySelectorAll(".modal-overlay");
    overlays.forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    // Support escape key to close active modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const activeModal = document.querySelector(".modal-overlay.active");
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

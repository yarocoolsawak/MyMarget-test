export const DEFAULT_PRODUCTS = [
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

export const DEFAULT_SELLERS = [
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

export const DEFAULT_ORDERS = [
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

export const DEFAULT_SELLER_CATALOG = [
  { productId: "p1", sellingPrice: 1450 },
  { productId: "p2", sellingPrice: 490 },
  { productId: "p3", sellingPrice: 200 }
];

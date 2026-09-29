import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Clean up (deletion order respects FK constraints) ──────────────────────
  await prisma.notification.deleteMany();
  await prisma.refundImage.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.memberSetting.deleteMany();
  await prisma.whatsappSetting.deleteMany();
  await prisma.portfolio.deleteMany();

  // ── 1. USERS ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('user123', 12);

  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: adminHash,
      name: 'Admin Spill the Bill',
      phone: '628111000001',
      role: 'ADMIN',
    },
  });

  const memberSince = new Date('2026-08-15');
  const memberExpiry = new Date('2026-09-15');

  const user1 = await prisma.user.create({
    data: {
      email: 'sarah@demo.com',
      password: userHash,
      name: 'Sarah Wijaya',
      phone: '628111000002',
      role: 'USER',
      isMember: true,
      memberSince,
      memberExpiry,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'budi@demo.com',
      password: userHash,
      name: 'Budi Santoso',
      phone: '628111000003',
      role: 'USER',
      isMember: false,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'dewi@demo.com',
      password: userHash,
      name: 'Dewi Rahayu',
      phone: '628111000004',
      role: 'USER',
      isMember: true,
      memberSince: new Date('2026-09-01'),
      memberExpiry: new Date('2026-10-01'),
    },
  });

  console.log('Created 4 users');

  // ── 2. ADDRESSES ───────────────────────────────────────────────────────────
  const addr1 = await prisma.address.create({
    data: {
      userId: user1.id,
      label: 'Home',
      recipientName: 'Sarah Wijaya',
      phone: '628111000002',
      street: 'Jl. Kebon Jeruk No. 12',
      city: 'Jakarta Barat',
      province: 'DKI Jakarta',
      postalCode: '11530',
      isDefault: true,
    },
  });

  const addr2 = await prisma.address.create({
    data: {
      userId: user1.id,
      label: 'Office',
      recipientName: 'Sarah Wijaya',
      phone: '628111000002',
      street: 'Jl. Sudirman Kav. 52-53, Lantai 10',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10220',
      isDefault: false,
    },
  });

  const addr3 = await prisma.address.create({
    data: {
      userId: user2.id,
      label: 'Home',
      recipientName: 'Budi Santoso',
      phone: '628111000003',
      street: 'Jl. Raya Bogor KM 25 No. 7',
      city: 'Depok',
      province: 'Jawa Barat',
      postalCode: '16415',
      isDefault: true,
    },
  });

  const addr4 = await prisma.address.create({
    data: {
      userId: user3.id,
      label: 'Home',
      recipientName: 'Dewi Rahayu',
      phone: '628111000004',
      street: 'Jl. Teuku Umar No. 88',
      city: 'Denpasar',
      province: 'Bali',
      postalCode: '80234',
      isDefault: true,
    },
  });

  console.log('Created 4 addresses');

  // ── 3. CATEGORIES ──────────────────────────────────────────────────────────
  const catFashionCN = await prisma.category.create({
    data: {
      name: 'Fashion China',
      slug: 'fashion-china',
      description: 'Tren fashion terkini langsung dari pusat mode China',
      type: 'JASTIP',
    },
  });

  const catElectronicsCN = await prisma.category.create({
    data: {
      name: 'Elektronik & Gadget',
      slug: 'elektronik-gadget',
      description: 'Aksesoris dan gadget unik dari China dengan harga terbaik',
      type: 'JASTIP',
    },
  });

  const catBeautyCN = await prisma.category.create({
    data: {
      name: 'Beauty & Skincare',
      slug: 'beauty-skincare',
      description: 'Produk kecantikan Korea dan China viral terbaik',
      type: 'JASTIP',
    },
  });

  const catVintageBags = await prisma.category.create({
    data: {
      name: 'Luxury Bags Preloved',
      slug: 'luxury-bags-preloved',
      description: 'Tas branded preloved berkondisi mulus, harga jauh di bawah pasaran',
      type: 'PRELOVED',
    },
  });

  const catWatchesPreloved = await prisma.category.create({
    data: {
      name: 'Jam Tangan Preloved',
      slug: 'jam-tangan-preloved',
      description: 'Koleksi jam tangan preloved berkualitas dari berbagai brand',
      type: 'PRELOVED',
    },
  });

  const catClothingPreloved = await prisma.category.create({
    data: {
      name: 'Fashion Preloved',
      slug: 'fashion-preloved',
      description: 'Pakaian dan aksesori fashion preloved berkondisi baik',
      type: 'PRELOVED',
    },
  });

  console.log('Created 6 categories');

  // ── 4. PRODUCTS & VARIANTS ─────────────────────────────────────────────────
  const prod1 = await prisma.product.create({
    data: {
      name: 'Kemeja Oversize Linen China',
      slug: 'kemeja-oversize-linen-china',
      description: 'Kemeja oversize bahan linen premium dari Guangzhou. Adem, ringan, cocok untuk iklim tropis. Tersedia dalam 4 warna: putih, krem, sage green, dusty pink.',
      type: 'JASTIP',
      categoryId: catFashionCN.id,
      price: 185000,
      originalPrice: 260000,
      stock: 60,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: true,
      weight: 0.3,
      variants: {
        create: [
          { name: 'S - Putih', price: 185000, stock: 15 },
          { name: 'M - Putih', price: 185000, stock: 15 },
          { name: 'L - Putih', price: 185000, stock: 10 },
          { name: 'M - Sage Green', price: 185000, stock: 10 },
          { name: 'L - Dusty Pink', price: 185000, stock: 10 },
        ],
      },
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Cargo Pants Techwear China',
      slug: 'cargo-pants-techwear-china',
      description: 'Celana cargo techwear viral dari Taobao. Multi-pocket, bahan ripstop tahan air, fit yang stylish. Pilihan warna: hitam dan army green.',
      type: 'JASTIP',
      categoryId: catFashionCN.id,
      price: 220000,
      originalPrice: 310000,
      stock: 40,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: true,
      weight: 0.5,
      variants: {
        create: [
          { name: 'S - Hitam', price: 220000, stock: 10 },
          { name: 'M - Hitam', price: 220000, stock: 10 },
          { name: 'L - Hitam', price: 220000, stock: 10 },
          { name: 'M - Army Green', price: 220000, stock: 10 },
        ],
      },
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Wireless Earbuds TWS China',
      slug: 'wireless-earbuds-tws-china',
      description: 'Earbuds TWS dengan noise cancelling aktif, battery life 30 jam, koneksi Bluetooth 5.3. Sound quality luar biasa untuk harganya.',
      type: 'JASTIP',
      categoryId: catElectronicsCN.id,
      price: 145000,
      originalPrice: 200000,
      stock: 30,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: false,
      weight: 0.1,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Magnetic Phone Stand & Charger',
      slug: 'magnetic-phone-stand-charger',
      description: 'Stand sekaligus wireless charger 15W dengan magnet kuat. Kompatibel dengan semua HP Android dan iPhone. Desain minimalis untuk meja kerja.',
      type: 'JASTIP',
      categoryId: catElectronicsCN.id,
      price: 95000,
      originalPrice: 135000,
      stock: 50,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: false,
      weight: 0.2,
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      name: 'Skin Barrier Serum COSRX Dupe',
      slug: 'skin-barrier-serum-cosrx-dupe',
      description: 'Serum perbaikan skin barrier formula China yang viral. Kandungan ceramide, niacinamide, dan centella asiatica. Cocok untuk kulit sensitif dan bermasalah.',
      type: 'JASTIP',
      categoryId: catBeautyCN.id,
      price: 75000,
      originalPrice: 110000,
      stock: 80,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: true,
      weight: 0.15,
    },
  });

  const prod6 = await prisma.product.create({
    data: {
      name: 'Tas Louis Vuitton Neverfull MM Preloved',
      slug: 'tas-lv-neverfull-mm-preloved',
      description: 'LV Neverfull MM kondisi 85%, masih sangat layak pakai. Warna damier ebene. Lengkap dengan dust bag original. Sudah dicek keasliannya.',
      type: 'PRELOVED',
      categoryId: catVintageBags.id,
      price: 8500000,
      originalPrice: 18000000,
      stock: 1,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: true,
      weight: 0.9,
    },
  });

  const prod7 = await prisma.product.create({
    data: {
      name: 'Gucci Marmont Mini Shoulder Bag Preloved',
      slug: 'gucci-marmont-mini-preloved',
      description: 'Gucci Marmont mini quilted leather, kondisi 90% mulus. Warna hitam klasik. Strap adjustable, bisa dijadikan clutch. Sertifikat authenticity tersedia.',
      type: 'PRELOVED',
      categoryId: catVintageBags.id,
      price: 7200000,
      originalPrice: 14500000,
      stock: 1,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: true,
      weight: 0.5,
    },
  });

  const prod8 = await prisma.product.create({
    data: {
      name: 'Jam Tangan Casio G-Shock GA-2100 Preloved',
      slug: 'casio-gshock-ga2100-preloved',
      description: 'Casio G-Shock GA-2100 "CasiOak" preloved kondisi 95%. Tahan air 200m, solar powered. Warna hitam all-black. Masih sangat mulus, jarang dipakai.',
      type: 'PRELOVED',
      categoryId: catWatchesPreloved.id,
      price: 850000,
      originalPrice: 1350000,
      stock: 1,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: false,
      weight: 0.2,
    },
  });

  const prod9 = await prisma.product.create({
    data: {
      name: 'Jaket Denim Levis 501 Vintage Preloved',
      slug: 'jaket-denim-levis-501-vintage-preloved',
      description: 'Jaket denim Levis vintage tahun 90-an, kondisi 80% dengan natural wear yang charming. Size M unisex. Warna biru faded yang ikonik.',
      type: 'PRELOVED',
      categoryId: catClothingPreloved.id,
      price: 420000,
      originalPrice: 900000,
      stock: 1,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: false,
      weight: 0.6,
      variants: {
        create: [
          { name: 'M', price: 420000, stock: 1 },
        ],
      },
    },
  });

  const prod10 = await prisma.product.create({
    data: {
      name: 'Sepatu Nike Air Force 1 Preloved',
      slug: 'sepatu-nike-af1-preloved',
      description: 'Nike Air Force 1 Low all-white preloved kondisi 85%. Sudah dicuci bersih, sole masih bagus. Size 42. Cocok untuk mix & match outfit casual.',
      type: 'PRELOVED',
      categoryId: catClothingPreloved.id,
      price: 580000,
      originalPrice: 1100000,
      stock: 1,
      images: JSON.stringify([]),
      isActive: true,
      isFeatured: false,
      weight: 0.8,
      variants: {
        create: [
          { name: '42', price: 580000, stock: 1 },
        ],
      },
    },
  });

  console.log('Created 10 products with variants');

  // ── 5. CARTS & CART ITEMS ──────────────────────────────────────────────────
  const cart1 = await prisma.cart.create({ data: { userId: user1.id } });
  const cart2 = await prisma.cart.create({ data: { userId: user2.id } });

  const prod1Variants = await prisma.productVariant.findMany({ where: { productId: prod1.id } });
  const prod2Variants = await prisma.productVariant.findMany({ where: { productId: prod2.id } });

  await prisma.cartItem.create({
    data: {
      cartId: cart1.id,
      productId: prod1.id,
      variantId: prod1Variants[1].id,
      quantity: 2,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart1.id,
      productId: prod5.id,
      variantId: null,
      quantity: 3,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart2.id,
      productId: prod3.id,
      variantId: null,
      quantity: 1,
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart2.id,
      productId: prod2.id,
      variantId: prod2Variants[0].id,
      quantity: 1,
    },
  });

  console.log('Created 2 carts with 4 cart items');

  // ── 6. ORDERS ──────────────────────────────────────────────────────────────

  // Order 1 — user1, PAYMENT_APPROVED
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      addressId: addr1.id,
      status: 'PAYMENT_APPROVED',
      subtotal: 625000,
      shippingFee: 25000,
      discountAmount: 62500,
      total: 587500,
      voucherCode: 'WELCOME10',
      createdAt: new Date('2026-08-20T10:00:00Z'),
      items: {
        create: [
          {
            productId: prod1.id,
            variantId: prod1Variants[0].id,
            productName: prod1.name,
            variantName: 'S - Putih',
            price: 185000,
            quantity: 2,
          },
          {
            productId: prod5.id,
            variantId: null,
            productName: prod5.name,
            variantName: null,
            price: 75000,
            quantity: 3,
          },
        ],
      },
    },
  });

  await prisma.paymentProof.create({
    data: {
      orderId: order1.id,
      imageUrl: 'proof-order1-1.jpg',
      createdAt: new Date('2026-08-20T10:30:00Z'),
    },
  });

  await prisma.paymentProof.create({
    data: {
      orderId: order1.id,
      imageUrl: 'proof-order1-2.jpg',
      createdAt: new Date('2026-08-20T10:31:00Z'),
    },
  });

  // Order 2 — user1, DELIVERED
  const order2 = await prisma.order.create({
    data: {
      userId: user1.id,
      addressId: addr2.id,
      status: 'DELIVERED',
      subtotal: 7200000,
      shippingFee: 0,
      discountAmount: 720000,
      total: 6480000,
      voucherCode: 'MEMBER10',
      notes: 'Tolong bubble wrap ekstra ya kak',
      createdAt: new Date('2026-08-05T09:00:00Z'),
      items: {
        create: [
          {
            productId: prod7.id,
            variantId: null,
            productName: prod7.name,
            variantName: null,
            price: 7200000,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.paymentProof.create({
    data: {
      orderId: order2.id,
      imageUrl: 'proof-order2-1.jpg',
      createdAt: new Date('2026-08-05T09:45:00Z'),
    },
  });

  // Order 3 — user1, CHECKING_PAYMENT
  const order3 = await prisma.order.create({
    data: {
      userId: user1.id,
      addressId: addr1.id,
      status: 'CHECKING_PAYMENT',
      subtotal: 850000,
      shippingFee: 15000,
      discountAmount: 0,
      total: 865000,
      createdAt: new Date('2026-09-10T14:00:00Z'),
      items: {
        create: [
          {
            productId: prod8.id,
            variantId: null,
            productName: prod8.name,
            variantName: null,
            price: 850000,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.paymentProof.create({
    data: {
      orderId: order3.id,
      imageUrl: 'proof-order3-1.jpg',
      createdAt: new Date('2026-09-10T14:20:00Z'),
    },
  });

  // Order 4 — user2, PENDING_PAYMENT
  await prisma.order.create({
    data: {
      userId: user2.id,
      addressId: addr3.id,
      status: 'PENDING_PAYMENT',
      subtotal: 365000,
      shippingFee: 20000,
      discountAmount: 0,
      total: 385000,
      createdAt: new Date('2026-09-11T08:00:00Z'),
      items: {
        create: [
          {
            productId: prod3.id,
            variantId: null,
            productName: prod3.name,
            variantName: null,
            price: 145000,
            quantity: 1,
          },
          {
            productId: prod2.id,
            variantId: prod2Variants[0].id,
            productName: prod2.name,
            variantName: 'S - Hitam',
            price: 220000,
            quantity: 1,
          },
        ],
      },
    },
  });

  // Order 5 — user2, PAYMENT_REJECTED
  const order5 = await prisma.order.create({
    data: {
      userId: user2.id,
      addressId: addr3.id,
      status: 'PAYMENT_REJECTED',
      subtotal: 8500000,
      shippingFee: 0,
      discountAmount: 0,
      total: 8500000,
      notes: 'Mohon segera diproses',
      createdAt: new Date('2026-09-08T11:00:00Z'),
      items: {
        create: [
          {
            productId: prod6.id,
            variantId: null,
            productName: prod6.name,
            variantName: null,
            price: 8500000,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.paymentProof.create({
    data: {
      orderId: order5.id,
      imageUrl: 'proof-order5-blur.jpg',
      createdAt: new Date('2026-09-08T11:30:00Z'),
    },
  });

  // Order 6 — user3, REFUND_REQUESTED
  const order6 = await prisma.order.create({
    data: {
      userId: user3.id,
      addressId: addr4.id,
      status: 'REFUND_REQUESTED',
      subtotal: 420000,
      shippingFee: 25000,
      discountAmount: 42000,
      total: 403000,
      voucherCode: 'WELCOME10',
      createdAt: new Date('2026-08-28T13:00:00Z'),
      items: {
        create: [
          {
            productId: prod9.id,
            variantId: null,
            productName: prod9.name,
            variantName: 'M',
            price: 420000,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.paymentProof.create({
    data: {
      orderId: order6.id,
      imageUrl: 'proof-order6-1.jpg',
      createdAt: new Date('2026-08-28T13:15:00Z'),
    },
  });

  const refund1 = await prisma.refundRequest.create({
    data: {
      orderId: order6.id,
      reason: 'Barang tidak sesuai deskripsi, kondisi lebih buruk dari yang disebutkan. Ada sobek kecil di bagian lengan yang tidak disebutkan di listing.',
      status: 'PENDING',
      createdAt: new Date('2026-09-02T10:00:00Z'),
    },
  });

  await prisma.refundImage.createMany({
    data: [
      { refundRequestId: refund1.id, imageUrl: 'refund-order6-1.jpg' },
      { refundRequestId: refund1.id, imageUrl: 'refund-order6-2.jpg' },
    ],
  });

  // Order 7 — user3, PROCESSING
  const order7 = await prisma.order.create({
    data: {
      userId: user3.id,
      addressId: addr4.id,
      status: 'PROCESSING',
      subtotal: 580000,
      shippingFee: 30000,
      discountAmount: 0,
      total: 610000,
      createdAt: new Date('2026-09-09T07:00:00Z'),
      items: {
        create: [
          {
            productId: prod10.id,
            variantId: null,
            productName: prod10.name,
            variantName: '42',
            price: 580000,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.paymentProof.create({
    data: {
      orderId: order7.id,
      imageUrl: 'proof-order7-1.jpg',
      createdAt: new Date('2026-09-09T07:30:00Z'),
    },
  });

  console.log('Created 7 orders with order items, payment proofs, and 1 refund request');

  // ── 7. VOUCHERS ────────────────────────────────────────────────────────────
  await prisma.voucher.createMany({
    data: [
      {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 100000,
        maxUses: 200,
        usedCount: 42,
        isActive: true,
        expiresAt: new Date('2026-12-31'),
      },
      {
        code: 'MEMBER10',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 0,
        maxUses: null,
        usedCount: 15,
        isActive: true,
        expiresAt: null,
      },
      {
        code: 'SPILL50K',
        type: 'FIXED',
        value: 50000,
        minOrderAmount: 300000,
        maxUses: 100,
        usedCount: 8,
        isActive: true,
        expiresAt: new Date('2026-10-31'),
      },
      {
        code: 'FLASH20',
        type: 'PERCENTAGE',
        value: 20,
        minOrderAmount: 500000,
        maxUses: 50,
        usedCount: 50,
        isActive: false,
        expiresAt: new Date('2026-08-31'),
      },
      {
        code: 'HARBOLNAS',
        type: 'FIXED',
        value: 100000,
        minOrderAmount: 750000,
        maxUses: 500,
        usedCount: 0,
        isActive: false,
        expiresAt: new Date('2026-12-12'),
      },
    ],
  });

  console.log('Created 5 vouchers');

  // ── 8. MEMBER SETTING ──────────────────────────────────────────────────────
  await prisma.memberSetting.create({
    data: {
      id: 1,
      minMonthlyAmount: 500000,
      discountPercent: 10,
      hasFreeShipping: true,
      freeShippingMinAmount: 200000,
      renewalPeriodDays: 30,
    },
  });

  console.log('Created member settings');

  // ── 9. WHATSAPP SETTING ────────────────────────────────────────────────────
  await prisma.whatsappSetting.create({
    data: {
      id: 1,
      phoneNumber: '6281234567890',
      defaultMessage: 'Halo Spill the Bill! Saya ingin bertanya tentang produk/pesanan saya.',
      isActive: true,
    },
  });

  console.log('Created WhatsApp settings');

  // ── 10. PORTFOLIO ──────────────────────────────────────────────────────────
  await prisma.portfolio.createMany({
    data: [
      {
        title: 'Jastip China Batch Maret 2026',
        description: '150+ item fashion dari Guangzhou berhasil tiba dengan selamat. Kemeja, celana, dan aksesori trending dari Taobao dan 1688.',
        type: 'JASTIP',
        images: JSON.stringify([]),
        isActive: true,
        createdAt: new Date('2026-03-25'),
      },
      {
        title: 'Koleksi Tas Luxury Preloved — Februari',
        description: 'Batch tas luxury preloved: 8 unit LV, 3 unit Gucci, 2 unit Prada. Semua verified authentic dan sudah terjual habis dalam 48 jam.',
        type: 'PRELOVED',
        images: JSON.stringify([]),
        isActive: true,
        createdAt: new Date('2026-02-14'),
      },
      {
        title: 'Jastip Korea — Beauty Haul',
        description: '80+ produk skincare dan makeup Korea. Brand populer: Laneige, COSRX, Sulwhasoo, dan brand indie Korea terbaru.',
        type: 'JASTIP',
        images: JSON.stringify([]),
        isActive: true,
        createdAt: new Date('2026-04-10'),
      },
      {
        title: 'Vintage Denim Collection',
        description: 'Koleksi denim vintage dari berbagai era: Levis 501 tahun 80-90an, Wrangler, Lee. Kondisi premium all-grades.',
        type: 'PRELOVED',
        images: JSON.stringify([]),
        isActive: true,
        createdAt: new Date('2026-05-20'),
      },
      {
        title: 'Jastip Elektronik China — Batch Juli',
        description: 'Gadget dan aksesori dari Shenzhen: TWS earbuds, powerbank 120W, kabel data, dan item trending lainnya dengan harga grosir.',
        type: 'JASTIP',
        images: JSON.stringify([]),
        isActive: true,
        createdAt: new Date('2026-07-15'),
      },
      {
        title: 'Sneakers Preloved Premium',
        description: 'Batch sneakers Nike, Adidas, New Balance kondisi excellent. Semuanya sudah melalui proses seleksi ketat dan cleaning profesional.',
        type: 'PRELOVED',
        images: JSON.stringify([]),
        isActive: true,
        createdAt: new Date('2026-08-01'),
      },
    ],
  });

  console.log('Created 6 portfolio entries');

  // ── 11. NOTIFICATIONS ──────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Payment Confirmed!',
        message: 'Great news! Your payment for order has been confirmed. Your items will be packed and shipped soon.',
        isRead: true,
        createdAt: new Date('2026-08-20T11:00:00Z'),
      },
      {
        userId: user1.id,
        title: 'Order Delivered',
        message: 'Your Gucci Marmont bag has been delivered. We hope you love your new treasure! Don\'t forget to leave a review.',
        isRead: true,
        createdAt: new Date('2026-08-12T15:00:00Z'),
      },
      {
        userId: user1.id,
        title: 'Payment Under Review',
        message: 'We have received your payment proof for your latest order. Our team is verifying it now — usually takes 1x24 hours.',
        isRead: false,
        createdAt: new Date('2026-09-10T14:25:00Z'),
      },
      {
        userId: user2.id,
        title: 'Payment Rejected',
        message: 'Unfortunately, we could not verify your payment proof. The image was unclear. Please re-upload a clearer photo or contact us via WhatsApp.',
        isRead: false,
        createdAt: new Date('2026-09-08T16:00:00Z'),
      },
      {
        userId: user3.id,
        title: 'Refund Request Received',
        message: 'We have received your refund request. Our team will review it within 2-3 business days. Thank you for your patience.',
        isRead: false,
        createdAt: new Date('2026-09-02T10:05:00Z'),
      },
      {
        userId: user3.id,
        title: 'Payment Confirmed!',
        message: 'Your payment for the Nike Air Force 1 order has been confirmed. Your item will be shipped within 1-2 business days.',
        isRead: true,
        createdAt: new Date('2026-09-09T09:00:00Z'),
      },
    ],
  });

  console.log('Created 6 notifications');

  console.log('\nSeeding complete!');
  console.log('\n── Credentials ─────────────────────');
  console.log('Admin  : admin@demo.com / admin123');
  console.log('User 1 : sarah@demo.com  / user123  (member active)');
  console.log('User 2 : budi@demo.com   / user123');
  console.log('User 3 : dewi@demo.com   / user123  (member active)');
  console.log('────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

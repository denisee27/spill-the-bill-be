import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Clean up ───────────────────────────────────────────────────────────────
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

  // ── Admin user ─────────────────────────────────────────────────────────────
  const password = 'spillthebill123';
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email: 'spillthebillteam@gmail.com',
      password: hash,
      name: 'Spill the Bill',
      phone: '6281234567890',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user');

  // ── Member settings ────────────────────────────────────────────────────────
  await prisma.memberSetting.create({
    data: {
      id: 1,
      minMonthlyAmount: 500000,
      hasFreeShipping: true,
      renewalPeriodDays: 180,
    },
  });

  console.log('Created member settings');

  // ── WhatsApp settings ──────────────────────────────────────────────────────
  await prisma.whatsappSetting.create({
    data: {
      id: 1,
      phoneNumber: '6281234567890',
      defaultMessage: 'Halo Spill the Bill! Saya ingin bertanya tentang produk/pesanan saya.',
      isActive: true,
    },
  });

  console.log('Created WhatsApp settings');

  console.log('\nSeeding complete!');
  console.log('\n── Credentials ─────────────────────────────');
  console.log(`Admin : spillthebillteam@gmail.com / ${password}`);
  console.log('────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

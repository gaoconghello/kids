// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 检查是否已存在admin用户
  const existingAdmin = await prisma.account.findFirst({
    where: { username: 'admin' }
  });

  if (!existingAdmin) {
    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('12345678', 10); // 请修改为强密码
    
    const admin = await prisma.account.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'admin',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('管理员用户创建成功:', admin);
  } else {
    console.log('管理员用户已存在，跳过创建');
  }
}

main()
  .catch((e) => {
    console.error('种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
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
  
  // 初始化科目数据
  const subjects = ['语文', '数学', '英语'];
  
  for (const subjectName of subjects) {
    const existingSubject = await prisma.subject.findFirst({
      where: { name: subjectName }
    });
    
    if (!existingSubject) {
      const subject = await prisma.subject.create({
        data: {
          name: subjectName,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log(`科目 ${subjectName} 创建成功:`, subject);
    } else {
      console.log(`科目 ${subjectName} 已存在，跳过创建`);
    }
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
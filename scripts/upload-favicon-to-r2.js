/**
 * 上传 favicon 到 Cloudflare R2
 * 
 * 使用方法：
 * node scripts/upload-favicon-to-r2.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FAVICON_PATH = path.join(__dirname, '../public/favicon.svg');
const BUCKET_NAME = 'find-emoji-assets';

console.log('🚀 开始上传 favicon 到 Cloudflare R2...\n');

// 检查文件是否存在
if (!fs.existsSync(FAVICON_PATH)) {
  console.error('❌ 找不到 favicon.svg 文件');
  console.error(`   路径: ${FAVICON_PATH}`);
  process.exit(1);
}

// 检查 wrangler 是否安装
try {
  execSync('wrangler --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ 请先安装 wrangler: npm install -g wrangler');
  process.exit(1);
}

// 上传文件
console.log('📤 上传 favicon.svg...');
try {
  execSync(`wrangler r2 object put ${BUCKET_NAME}/favicon.svg --file ${FAVICON_PATH}`, {
    stdio: 'inherit'
  });
  console.log('\n✅ favicon 上传成功！');
  console.log('\n📝 访问地址:');
  console.log('   https://object.emojidir.com/favicon.svg');
} catch (error) {
  console.error('\n❌ 上传失败');
  console.error('请确保：');
  console.error('1. 已登录 wrangler: wrangler login');
  console.error('2. R2 存储桶已创建: wrangler r2 bucket create find-emoji-assets');
  process.exit(1);
}


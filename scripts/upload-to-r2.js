/**
 * 上传 assets 到 Cloudflare R2
 * 
 * 使用方法：
 * 1. 安装 wrangler: npm install -g wrangler
 * 2. 登录: wrangler login
 * 3. 创建 R2 存储桶: wrangler r2 bucket create find-emoji-assets
 * 4. 运行此脚本: node scripts/upload-to-r2.js
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '../assets');
const BUCKET_NAME = 'find-emoji-assets';

console.log('🚀 开始上传 assets 到 Cloudflare R2...\n');

// 检查 wrangler 是否安装
try {
  execSync('wrangler --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ 请先安装 wrangler: npm install -g wrangler');
  process.exit(1);
}

// 检查存储桶是否存在
console.log('📦 检查 R2 存储桶...');
try {
  const buckets = execSync('wrangler r2 bucket list', { encoding: 'utf-8' });
  if (!buckets.includes(BUCKET_NAME)) {
    console.log(`⚠️  存储桶 "${BUCKET_NAME}" 不存在，正在创建...`);
    execSync(`wrangler r2 bucket create ${BUCKET_NAME}`, { stdio: 'inherit' });
  }
  console.log('✅ 存储桶检查完成\n');
} catch (error) {
  console.error('❌ 检查/创建存储桶失败，请确保已登录: wrangler login');
  process.exit(1);
}

// 收集所有需要上传的文件
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

console.log('📤 开始上传文件...');
console.log('   扫描文件中...\n');

const allFiles = getAllFiles(ASSETS_DIR);
console.log(`找到 ${allFiles.length} 个文件需要上传`);
console.log('这可能需要 10-30 分钟，请耐心等待...\n');

let successCount = 0;
let failCount = 0;

allFiles.forEach((filePath, index) => {
  // 计算相对路径，用作 R2 中的 key
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  const r2Key = relativePath.replace(/\\/g, '/'); // Windows 路径兼容

  try {
    // 上传单个文件 - 使用数组参数避免 shell 注入和空格问题
    const result = spawnSync('wrangler', [
      'r2', 'object', 'put',
      `${BUCKET_NAME}/${r2Key}`,
      '--file', filePath
    ], {
      encoding: 'utf-8',
      timeout: 30000, // 30秒超时
      env: { ...process.env, NO_COLOR: '1' } // 禁用颜色输出
    });

    // 更智能的成功判断：区分警告和错误
    const stderr = (result.stderr || '').toLowerCase();
    const stdout = (result.stdout || '').toLowerCase();

    // 只检查真正的错误，忽略警告
    const hasRealError = stderr.includes('error:') ||
      stderr.includes('✘') ||
      stderr.includes('failed to') ||
      (result.status !== 0 && !stderr.includes('[warning]'));

    if (!hasRealError || result.status === 0) {
      // 如果状态码是 0，即使有警告也算成功
      successCount++;
    } else {
      throw new Error(result.stderr || result.stdout || 'Upload failed');
    }

    // 每 50 个文件显示一次进度
    if ((index + 1) % 50 === 0 || index === allFiles.length - 1) {
      const progress = ((index + 1) / allFiles.length * 100).toFixed(1);
      console.log(`进度: ${index + 1}/${allFiles.length} (${progress}%) - 成功: ${successCount}, 失败: ${failCount}`);
    }
  } catch (error) {
    failCount++;
    if (failCount <= 10) {
      console.error(`  ⚠️  上传失败: ${relativePath}`);
      console.error(`      错误: ${error.message}`);
    } else if (failCount === 11) {
      console.error(`  ... 更多错误将不再显示 ...`);
    }
  }
});

console.log('\n' + '='.repeat(60));
if (failCount === 0) {
  console.log('✅ 所有文件上传完成！');
} else {
  console.log(`⚠️  上传完成，但有 ${failCount} 个文件失败`);
}
console.log(`总计: ${allFiles.length} 个文件, 成功: ${successCount}, 失败: ${failCount}`);
console.log('='.repeat(60));

console.log('\n📝 下一步：');
console.log('1. 在 Cloudflare Dashboard 中为存储桶配置公共访问');
console.log('   https://dash.cloudflare.com/ > R2 > find-emoji-assets > Settings > Public Access');
console.log('2. 获取公共 URL（如 https://pub-xxx.r2.dev）');
console.log('3. 创建 .env.local 文件并填入 CDN URL:');
console.log('   R2_PUBLIC_CDN_URL=https://pub-xxx.r2.dev');
console.log('4. 重启开发服务器: npm run dev');


const fs = require('fs');
const path = require('path');

const ASSETS_SRC = path.join(__dirname, '../assets');
const ASSETS_DEST = path.join(__dirname, '../out/assets');

console.log('📦 复制 assets 到输出目录...');

// 检查源目录是否存在
if (!fs.existsSync(ASSETS_SRC)) {
  console.error('❌ assets 目录不存在');
  process.exit(1);
}

// 递归复制目录
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  copyRecursiveSync(ASSETS_SRC, ASSETS_DEST);
  console.log('✅ Assets 复制完成！');
} catch (error) {
  console.error('❌ 复制失败:', error.message);
  process.exit(1);
}


/**
 * 批量重命名 assets 中的文件夹和文件
 * 将空格替换为连字符，并转为小写
 * 
 * 使用前请确保已备份！
 * 
 * 使用方法：
 * node scripts/rename-assets.js [--dry-run]
 * 
 * --dry-run: 只显示将要重命名的内容，不实际执行
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');
const isDryRun = process.argv.includes('--dry-run');

// 规范化名称：替换空格为连字符，转小写
function normalizeName(name) {
  return name
    .replace(/\s+/g, '-')  // 空格替换为连字符
    .toLowerCase();         // 转小写
}

// 收集所有需要重命名的项（从深到浅，避免父目录先改名导致路径问题）
function collectRenames(dirPath, renames = []) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  items.forEach(item => {
    const oldPath = path.join(dirPath, item.name);
    const newName = normalizeName(item.name);
    const newPath = path.join(dirPath, newName);

    if (item.isDirectory()) {
      // 递归处理子目录
      collectRenames(oldPath, renames);
    }

    // 如果名称有变化，添加到重命名列表
    if (item.name !== newName) {
      renames.push({
        type: item.isDirectory() ? 'dir' : 'file',
        oldPath,
        newPath,
        oldName: item.name,
        newName
      });
    }
  });

  return renames;
}

// 执行重命名
function performRenames(renames) {
  let successCount = 0;
  let failCount = 0;

  // 从深到浅排序（路径长度降序）
  renames.sort((a, b) => b.oldPath.length - a.oldPath.length);

  renames.forEach((rename, index) => {
    try {
      if (!isDryRun) {
        // 两步重命名法：处理大小写不敏感的文件系统
        const oldLower = rename.oldName.toLowerCase();
        const newLower = rename.newName.toLowerCase();

        // 检查是否只是大小写不同
        const isCaseOnlyChange = (oldLower === newLower && rename.oldName !== rename.newName);

        if (isCaseOnlyChange) {
          // 大小写变化，使用临时名称
          const tempName = rename.newName + '_temp_' + Date.now();
          const tempPath = path.join(path.dirname(rename.oldPath), tempName);

          // 第一步：重命名为临时名称
          fs.renameSync(rename.oldPath, tempPath);
          // 第二步：重命名为目标名称
          fs.renameSync(tempPath, rename.newPath);
        } else {
          // 不是纯大小写变化
          // 检查目标是否真的存在且不同
          if (fs.existsSync(rename.newPath)) {
            // 读取实际文件名检查是否真的不同
            const dir = path.dirname(rename.newPath);
            const actualName = fs.readdirSync(dir).find(
              name => name.toLowerCase() === newLower
            );

            if (actualName && actualName !== rename.newName) {
              // 目标确实存在且不同，跳过
              console.warn(`⚠️  跳过（目标已存在）: ${rename.oldName} -> ${rename.newName}`);
              failCount++;
              return;
            }
          }

          // 直接重命名
          fs.renameSync(rename.oldPath, rename.newPath);
        }
      }

      successCount++;

      // 每 100 个显示一次进度
      if ((index + 1) % 100 === 0) {
        const progress = ((index + 1) / renames.length * 100).toFixed(1);
        console.log(`进度: ${index + 1}/${renames.length} (${progress}%)`);
      }
    } catch (error) {
      failCount++;
      if (failCount <= 10) {
        console.error(`❌ 重命名失败: ${rename.oldName}`);
        console.error(`   错误: ${error.message}`);
      }
    }
  });

  return { successCount, failCount };
}

// 主函数
function main() {
  console.log('🔄 批量重命名 Assets\n');

  if (isDryRun) {
    console.log('⚠️  DRY RUN 模式 - 只显示变更，不实际执行\n');
  } else {
    console.log('⚠️  警告：即将执行实际重命名操作！');
    console.log('   建议先运行: node scripts/rename-assets.js --dry-run');
    console.log('   按 Ctrl+C 取消，或等待 5 秒后自动继续...\n');

    // 给用户 5 秒取消的机会
    const sleep = (ms) => {
      const start = Date.now();
      while (Date.now() - start < ms) {
        // 忙等待
      }
    };

    for (let i = 5; i > 0; i--) {
      process.stdout.write(`\r倒计时: ${i} 秒...`);
      sleep(1000);
    }
    console.log('\n');
  }

  console.log('📂 扫描文件和文件夹...\n');

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ assets 目录不存在');
    process.exit(1);
  }

  const renames = collectRenames(ASSETS_DIR);

  if (renames.length === 0) {
    console.log('✅ 所有文件名已经规范，无需重命名');
    return;
  }

  console.log(`找到 ${renames.length} 个需要重命名的项\n`);

  // 显示前 20 个示例
  console.log('📋 重命名预览（前 20 个）：');
  console.log('─'.repeat(80));
  renames.slice(0, 20).forEach(r => {
    const type = r.type === 'dir' ? '📁' : '📄';
    console.log(`${type} ${r.oldName}`);
    console.log(`   → ${r.newName}\n`);
  });

  if (renames.length > 20) {
    console.log(`... 还有 ${renames.length - 20} 个项目\n`);
  }

  if (isDryRun) {
    console.log('\n✅ DRY RUN 完成');
    console.log('\n📝 如果确认无误，运行以下命令执行重命名：');
    console.log('   node scripts/rename-assets.js');
    return;
  }

  console.log('🚀 开始重命名...\n');
  const { successCount, failCount } = performRenames(renames);

  console.log('\n' + '='.repeat(80));
  if (failCount === 0) {
    console.log('✅ 重命名完成！');
  } else {
    console.log(`⚠️  重命名完成，但有 ${failCount} 个失败`);
  }
  console.log(`总计: ${renames.length} 个, 成功: ${successCount}, 失败: ${failCount}`);
  console.log('='.repeat(80));

  console.log('\n📝 下一步：');
  console.log('1. 重新生成索引: npm run generate-index');
  console.log('2. 如果已上传到 R2，需要重新上传: npm run upload-to-r2');
  console.log('3. 重启开发服务器: npm run dev');
}

// 运行
try {
  main();
} catch (error) {
  console.error('\n❌ 发生错误:', error.message);
  console.error(error.stack);
  process.exit(1);
}


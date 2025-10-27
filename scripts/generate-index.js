const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/fluent-emoji');
const OUTPUT_FILE = path.join(__dirname, '../data/emoji-index.json');

function generateIndex() {
  console.log('🔍 扫描 emoji 资源...');

  const emojis = [];
  const categories = new Set();

  // 读取 assets 目录下的所有文件夹
  const folders = fs.readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📁 找到 ${folders.length} 个 emoji 文件夹`);

  folders.forEach((folder, index) => {
    const metadataPath = path.join(ASSETS_DIR, folder, 'metadata.json');

    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

        // 检查可用的样式 - 动态扫描实际存在的子文件夹
        const styles = {};
        const stylesDir = path.join(ASSETS_DIR, folder);

        // 读取实际存在的子文件夹
        const subDirs = fs.readdirSync(stylesDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        subDirs.forEach(styleDir => {
          const stylePath = path.join(stylesDir, styleDir);
          const files = fs.readdirSync(stylePath).filter(f => !f.startsWith('.'));

          if (files.length > 0) {
            // 标准化样式名称作为 key
            const styleKey = styleDir.toLowerCase().replace(/\s+/g, '-');
            // 使用实际的文件夹名称构建路径
            styles[styleKey] = `assets/${folder}/${styleDir}/${files[0]}`;
          }
        });

        // 检查是否有 default 子文件夹（深浅色主题支持）
        const defaultDir = path.join(stylesDir, 'default');
        if (fs.existsSync(defaultDir)) {
          const defaultSubDirs = fs.readdirSync(defaultDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

          defaultSubDirs.forEach(styleDir => {
            const stylePath = path.join(defaultDir, styleDir);
            const files = fs.readdirSync(stylePath).filter(f => !f.startsWith('.'));

            if (files.length > 0) {
              // 为深浅色主题添加特殊的样式键
              const styleKey = `${styleDir.toLowerCase().replace(/\s+/g, '-')}-default`;
              styles[styleKey] = `assets/${folder}/default/${styleDir}/${files[0]}`;
            }
          });
        }

        const emoji = {
          id: folder,
          name: metadata.cldr || folder,
          glyph: metadata.glyph || '',
          group: metadata.group || 'Other',
          keywords: metadata.keywords || [],
          unicode: metadata.unicode || '',
          tts: metadata.tts || '',
          styles: styles,
        };

        emojis.push(emoji);
        categories.add(emoji.group);

        if ((index + 1) % 100 === 0) {
          console.log(`  处理进度: ${index + 1}/${folders.length}`);
        }
      } catch (error) {
        console.error(`❌ 处理 ${folder} 时出错:`, error.message);
      }
    }
  });

  // 按分类组织
  const emojisByCategory = {};
  categories.forEach(cat => {
    emojisByCategory[cat] = emojis.filter(e => e.group === cat);
  });

  const data = {
    emojis: emojis,
    categories: Array.from(categories).sort(),
    emojisByCategory: emojisByCategory,
    totalCount: emojis.length,
    generatedAt: new Date().toISOString(),
  };

  // 确保 data 目录存在
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log(`✅ 索引生成完成！`);
  console.log(`   总计: ${emojis.length} 个 emoji`);
  console.log(`   分类: ${categories.size} 个`);
  console.log(`   输出: ${OUTPUT_FILE}`);
}

// 运行索引生成
generateIndex();

// 自动处理可用的 CLDR 数据
console.log('\n🌐 检查可用的 CLDR 翻译数据...');
const cldrDir = path.join(__dirname, '../assets/cldr');

if (fs.existsSync(cldrDir)) {
  const { processCLDR, integrateTranslations } = require('./process-cldr');

  // 语言映射
  const localeMap = {
    'zh': 'zh-CN',
    'zh-Hant': 'zh-TW',
    'zh-hant': 'zh-TW',  // 支持小写文件名
    'ja': 'ja',
    'ko': 'ko',
    'en': 'en'
  };

  const cldrFiles = fs.readdirSync(cldrDir)
    .filter(file => file.startsWith('annotations-') && file.endsWith('.json'));

  console.log(`找到 ${cldrFiles.length} 个 CLDR 文件`);

  cldrFiles.forEach(file => {
    const match = file.match(/annotations-(.+)\.json/);
    if (match) {
      const cldrLang = match[1];
      const locale = localeMap[cldrLang] || cldrLang;

      console.log(`\n处理 ${locale} (${cldrLang})...`);

      const cldrFilePath = path.join(cldrDir, file);
      const indexFilePath = path.join(__dirname, '../data/emoji-index.json');
      const outputFilePath = path.join(__dirname, `../data/emoji-index-${locale}.json`);

      const translations = processCLDR(cldrFilePath, locale);
      if (Object.keys(translations).length > 0) {
        integrateTranslations(indexFilePath, translations, locale, outputFilePath);

        // 同时复制到 public 目录供前端访问
        const publicOutputPath = path.join(__dirname, `../public/data/emoji-index-${locale}.json`);
        const publicDir = path.dirname(publicOutputPath);
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.copyFileSync(outputFilePath, publicOutputPath);
        console.log(`   ✅ 已复制到 public 目录`);
      }
    }
  });

  console.log('\n🎉 所有翻译处理完成！');
} else {
  console.log('未找到 CLDR 目录，跳过翻译处理');
}


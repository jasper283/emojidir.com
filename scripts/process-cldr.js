const fs = require('fs');
const path = require('path');

/**
 * 处理 CLDR 数据，提取 emoji 的名称和关键词
 * @param {string} cldrFilePath - CLDR 数据文件路径
 * @param {string} locale - 语言代码，如 'zh-CN'
 * @returns {Object} - emoji glyph 映射到翻译数据
 */
function processCLDR(cldrFilePath, locale) {
  console.log(`🔍 处理 CLDR 数据: ${cldrFilePath} (${locale})`);

  if (!fs.existsSync(cldrFilePath)) {
    console.error(`❌ CLDR 文件不存在: ${cldrFilePath}`);
    return {};
  }

  try {
    const cldrData = JSON.parse(fs.readFileSync(cldrFilePath, 'utf-8'));
    // 支持两种数据格式：annotations 和 annotationsDerived
    const annotations = cldrData.annotations?.annotations ||
      cldrData.annotationsDerived?.annotations || {};

    const emojiTranslations = {};
    let processedCount = 0;

    // 遍历所有 emoji 字符
    for (const [glyph, data] of Object.entries(annotations)) {
      // 跳过非 emoji 字符（如纯文本）
      if (!glyph || glyph.length === 0) continue;

      const keywords = Array.isArray(data.default) ? data.default : [];
      const ttsArray = Array.isArray(data.tts) ? data.tts : [];
      const name = ttsArray.length > 0 ? ttsArray[0] : (keywords.length > 0 ? keywords[0] : '');

      emojiTranslations[glyph] = {
        name: name,
        keywords: keywords,
        tts: name
      };

      processedCount++;
    }

    console.log(`✅ 成功处理 ${processedCount} 个 emoji 翻译`);
    return emojiTranslations;

  } catch (error) {
    console.error(`❌ 处理 CLDR 数据时出错:`, error.message);
    return {};
  }
}

/**
 * 从 Unicode 代码生成 emoji 字符
 * @param {string} unicode - Unicode 代码（如 "1f947" 或 "1f468-200d-1f469-200d-1f467"）
 * @returns {string} - emoji 字符
 */
function unicodeToEmoji(unicode) {
  if (!unicode) return '';

  // 分割多个代码点（用 - 或 _ 分隔）
  const codePoints = unicode.split(/[-_]/);

  try {
    return codePoints
      .map(code => String.fromCodePoint(parseInt(code, 16)))
      .join('');
  } catch (e) {
    return '';
  }
}

/**
 * 创建 Unicode -> glyph 的映射表（用于反向查找）
 * @param {Object} translations - CLDR 翻译数据（glyph -> data）
 * @returns {Object} - Unicode -> data 的映射
 */
function createUnicodeMap(translations) {
  const unicodeMap = {};

  for (const [glyph, data] of Object.entries(translations)) {
    // 将 glyph 转换为 unicode 代码点
    const codePoints = [];
    for (let i = 0; i < glyph.length; i++) {
      const code = glyph.codePointAt(i);
      if (code) {
        codePoints.push(code.toString(16).toLowerCase().padStart(4, '0'));
        // 跳过代理对的第二部分
        if (code > 0xffff) i++;
      }
    }
    const unicodeKey = codePoints.join('-');
    unicodeMap[unicodeKey] = data;
  }

  return unicodeMap;
}

/**
 * 将 CLDR 数据整合到 emoji 索引中
 * @param {string} indexFilePath - emoji-index.json 路径
 * @param {Object} translations - CLDR 翻译数据
 * @param {string} locale - 语言代码
 * @param {string} outputFilePath - 输出文件路径
 */
function integrateTranslations(indexFilePath, translations, locale, outputFilePath) {
  console.log(`🔄 整合翻译数据到索引文件...`);

  if (!fs.existsSync(indexFilePath)) {
    console.error(`❌ 索引文件不存在: ${indexFilePath}`);
    return;
  }

  try {
    const indexData = JSON.parse(fs.readFileSync(indexFilePath, 'utf-8'));
    let matchedByGlyph = 0;
    let matchedByUnicode = 0;
    let unmatchedCount = 0;

    // 创建 Unicode 映射表以提高匹配率
    const unicodeMap = createUnicodeMap(translations);

    // 为每个 emoji 添加翻译数据（使用缩写字段）
    indexData.e.forEach(emoji => {
      const glyph = emoji.gl;  // 使用缩写字段
      let translationData = null;

      // 方法1: 直接用 glyph 匹配
      if (translations[glyph]) {
        translationData = translations[glyph];
        matchedByGlyph++;
      }
      // 方法2: 用 unicode 代码匹配
      else if (emoji.u) {  // 使用缩写字段
        // 尝试不同的 unicode 格式
        const unicodeVariants = [
          emoji.u,
          emoji.u.replace(/-/g, ''),
          emoji.u.toLowerCase(),
          emoji.u.toUpperCase()
        ];

        for (const variant of unicodeVariants) {
          if (unicodeMap[variant]) {
            translationData = unicodeMap[variant];
            matchedByUnicode++;
            break;
          }

          // 尝试生成 emoji 字符再匹配
          const generatedGlyph = unicodeToEmoji(variant);
          if (generatedGlyph && translations[generatedGlyph]) {
            translationData = translations[generatedGlyph];
            matchedByUnicode++;
            break;
          }
        }
      }

      // 初始化 i18n 对象
      if (!emoji.i18n) {
        emoji.i18n = {};
      }

      if (translationData) {
        // 添加当前语言的翻译（使用缩写字段）
        emoji.i18n[locale] = {
          n: translationData.name,      // name
          k: translationData.keywords,  // keywords
          t: translationData.tts        // tts
        };
      } else {
        unmatchedCount++;
        // 对于没有翻译的 emoji，使用原始英文数据（使用缩写字段）
        emoji.i18n[locale] = {
          n: emoji.n,  // name
          k: emoji.k,  // keywords
          t: emoji.t   // tts
        };
      }
    });

    // 更新分类数据（使用缩写字段）
    const emojisByCategory = {};
    indexData.c.forEach(cat => {
      emojisByCategory[cat] = indexData.e.filter(e => e.gr === cat);
    });
    indexData.ec = emojisByCategory;

    // 写入输出文件
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(indexData, null, 2));

    const totalMatched = matchedByGlyph + matchedByUnicode;
    console.log(`✅ 翻译整合完成！`);
    console.log(`   直接匹配: ${matchedByGlyph} 个`);
    console.log(`   Unicode匹配: ${matchedByUnicode} 个`);
    console.log(`   总匹配: ${totalMatched} 个`);
    console.log(`   未匹配: ${unmatchedCount} 个`);
    console.log(`   匹配率: ${((totalMatched / (totalMatched + unmatchedCount)) * 100).toFixed(1)}%`);
    console.log(`   输出: ${outputFilePath}`);

  } catch (error) {
    console.error(`❌ 整合翻译数据时出错:`, error.message);
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
使用方法:
  node process-cldr.js <locale>

示例:
  node process-cldr.js zh-CN
  node process-cldr.js ja
  node process-cldr.js ko

支持的语言:
  - zh-CN (简体中文)
  - zh-TW (繁体中文)
  - ja (日语)
  - ko (韩语)
  - en (英语)
    `);
    return;
  }

  const locale = args[0];

  // 语言代码映射 (locale -> CLDR 文件名)
  const localeMap = {
    'zh-CN': 'zh',
    'zh-TW': 'zh-hant',  // 使用小写，匹配实际文件名
    'ja': 'ja',
    'ko': 'ko',
    'en': 'en'
  };

  const cldrFileName = localeMap[locale] || locale;
  const cldrFilePath = path.join(__dirname, `../assets/cldr/annotations-${cldrFileName}.json`);
  const indexFilePath = path.join(__dirname, '../data/emoji-index.json');
  const outputFilePath = path.join(__dirname, `../data/emoji-index-${locale}.json`);

  // 处理 CLDR 数据
  const translations = processCLDR(cldrFilePath, locale);

  if (Object.keys(translations).length === 0) {
    console.error('❌ 没有找到翻译数据');
    return;
  }

  // 整合翻译数据
  integrateTranslations(indexFilePath, translations, locale, outputFilePath);

  console.log('\n🎉 处理完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

// 导出函数供其他脚本使用
module.exports = {
  processCLDR,
  integrateTranslations
};


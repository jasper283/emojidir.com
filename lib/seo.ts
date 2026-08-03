const MAX_META_DESCRIPTION_LENGTH = 160;
const MIN_META_DESCRIPTION_LENGTH = 150;

const descriptionSuffixes: Record<string, string> = {
  en: 'Browse styles and categories, search by keyword, copy the Unicode character instantly, or download high-quality PNG artwork for chats, social posts, documents, presentations, websites, and creative projects—free and without registration.',
  'zh-CN': '支持通过分类和关键词快速搜索不同风格，在线预览后可一键复制 Unicode 字符或免费下载高清 PNG 图片，适用于聊天、社交媒体、文档、演示、网页设计和内容创作。无需注册，电脑与手机均可使用。还可查看表情名称、来源和使用提示，比较不同平台的效果，快速选择适合当前场景的版本。',
  'zh-TW': '支援透過分類和關鍵字快速搜尋不同風格，在線預覽後可一鍵複製 Unicode 字元或免費下載高畫質 PNG 圖片，適用於聊天、社群媒體、文件、簡報、網頁設計和內容創作。無需註冊，電腦與手機皆可使用。還可查看表情名稱、來源和使用提示，比較不同平台的效果，快速選擇適合目前情境的版本。',
  ja: 'カテゴリーやキーワードでスタイルを比較し、オンラインプレビューからUnicode文字をすぐにコピーできます。高画質PNG画像も無料でダウンロードでき、チャット、SNS、文書、プレゼンテーション、Webデザイン、コンテンツ制作に利用可能。登録不要でPCとスマートフォンの両方に対応しています。',
  ko: '카테고리와 키워드로 다양한 스타일을 검색하고 온라인 미리보기에서 Unicode 문자를 바로 복사하거나 고화질 PNG 이미지를 무료로 다운로드할 수 있습니다. 채팅, 소셜 미디어, 문서, 프레젠테이션, 웹 디자인 및 콘텐츠 제작에 활용하세요. 가입 없이 PC와 모바일에서 모두 이용할 수 있습니다.',
  'pt-BR': 'Compare estilos e categorias, pesquise por palavras-chave, copie o caractere Unicode ou baixe imagens PNG em alta qualidade para mensagens, redes sociais, documentos, apresentações, sites e projetos criativos, gratuitamente e sem cadastro.',
};

const legalDescriptions = {
  privacy: {
    en: 'Read the Emoji Directory Privacy Policy to understand what technical and usage data we collect, how cookies, analytics, and third-party services are used, how information is protected and retained, and the choices and privacy rights available when you browse, copy, or download emoji content.',
    'zh-CN': '阅读 Emoji Directory 隐私政策，了解我们在你浏览、复制或下载表情内容时可能收集的技术信息和使用数据，以及 Cookie、网站分析和第三方服务的使用方式、数据保存与安全措施、你的隐私权利和可用选择，并了解如何就个人信息问题联系我们。本政策也说明未成年人隐私、跨境处理及政策变更通知，帮助你在使用网站前作出知情决定。',
    'zh-TW': '閱讀 Emoji Directory 隱私政策，瞭解我們在你瀏覽、複製或下載表情內容時可能收集的技術資訊和使用資料，以及 Cookie、網站分析和第三方服務的使用方式、資料保存與安全措施、你的隱私權利和可用選擇，並瞭解如何就個人資訊問題聯絡我們。本政策也說明未成年人隱私、跨境處理及政策變更通知，協助你在使用網站前作出知情決定。',
    ja: 'Emoji Directoryのプライバシーポリシーでは、絵文字コンテンツの閲覧、コピー、ダウンロード時に収集される可能性がある技術情報と利用データ、Cookie、アクセス解析、第三者サービスの利用方法、データの保存期間と安全対策、利用者が選択できる設定とプライバシー上の権利、お問い合わせ方法について詳しく説明しています。',
    ko: 'Emoji Directory 개인정보 처리방침에서 이모지 콘텐츠를 검색하고 복사하거나 다운로드할 때 수집될 수 있는 기술 정보와 이용 데이터, 쿠키와 분석 도구 및 제3자 서비스의 사용 방식, 정보 보관 기간과 보안 조치, 이용자가 선택할 수 있는 설정과 개인정보 권리, 관련 문의 방법을 자세히 확인하세요.',
    'pt-BR': 'Leia a Política de Privacidade do Emoji Directory para entender quais dados técnicos e de uso podem ser coletados ao navegar, copiar ou baixar emojis, como usamos cookies, análises e serviços de terceiros, como protegemos e retemos informações e quais escolhas e direitos de privacidade estão disponíveis.',
  },
  terms: {
    en: 'Read the Emoji Directory Terms of Service for the rules that apply when browsing, copying, or downloading emoji content, including permitted use, intellectual property, prohibited conduct, service availability, disclaimers, limitations, policy changes, and how to contact us with questions.',
    'zh-CN': '阅读 Emoji Directory 服务条款，了解在浏览、复制或下载表情内容时适用的规则，包括允许的使用方式、知识产权、禁止行为、服务可用性、免责声明与责任限制、条款更新方式，以及对网站内容或服务有疑问时如何联系我们，帮助你在使用前清楚了解相关权利和责任。继续访问网站即表示你接受这些条款；若不同意，请停止使用相关功能。',
    'zh-TW': '閱讀 Emoji Directory 服務條款，瞭解在瀏覽、複製或下載表情內容時適用的規則，包括允許的使用方式、智慧財產權、禁止行為、服務可用性、免責聲明與責任限制、條款更新方式，以及對網站內容或服務有疑問時如何聯絡我們，協助你在使用前清楚瞭解相關權利和責任。繼續存取網站即表示你接受這些條款；若不同意，請停止使用相關功能。',
    ja: 'Emoji Directoryの利用規約では、絵文字コンテンツを閲覧、コピー、ダウンロードする際に適用されるルール、許可される利用方法、知的財産権、禁止行為、サービスの提供と変更、免責事項と責任の制限、規約の更新方法について説明しています。サイトやコンテンツの利用前に権利と責任を確認し、ご不明な点がある場合のお問い合わせ方法もご覧ください。',
    ko: 'Emoji Directory 서비스 이용약관에서 이모지 콘텐츠를 검색하고 복사하거나 다운로드할 때 적용되는 규칙, 허용되는 사용 방식, 지식재산권, 금지 행위, 서비스 제공과 변경, 면책 조항과 책임 제한, 약관 업데이트 및 문의 방법을 확인하세요. 사이트 이용 전에 이용자의 권리와 책임을 명확하게 이해할 수 있습니다.',
    'pt-BR': 'Leia os Termos de Serviço do Emoji Directory para conhecer as regras ao navegar, copiar ou baixar emojis, incluindo usos permitidos, propriedade intelectual, condutas proibidas, disponibilidade do serviço, isenções e limites de responsabilidade, alterações dos termos e formas de contato.',
  },
} satisfies Record<'privacy' | 'terms', Record<string, string>>;

function clampMetaDescription(description: string): string {
  const characters = Array.from(description.replace(/\s+/g, ' ').trim());

  if (characters.length <= MAX_META_DESCRIPTION_LENGTH) {
    return characters.join('');
  }

  const candidate = characters.slice(0, MAX_META_DESCRIPTION_LENGTH);
  const punctuation = new Set(['.', '!', '?', '。', '！', '？']);

  for (let index = candidate.length - 1; index >= MIN_META_DESCRIPTION_LENGTH - 1; index -= 1) {
    if (punctuation.has(candidate[index])) {
      return candidate.slice(0, index + 1).join('');
    }
  }

  return `${candidate.slice(0, MAX_META_DESCRIPTION_LENGTH - 1).join('').trimEnd()}…`;
}

export function createMetaDescription(baseDescription: string, locale: string): string {
  const suffix = descriptionSuffixes[locale] || descriptionSuffixes.en;
  const separator = locale === 'zh-CN' || locale === 'zh-TW' || locale === 'ja' ? '' : ' ';
  return clampMetaDescription(`${baseDescription}${separator}${suffix}`);
}

export function createLegalMetaDescription(
  document: 'privacy' | 'terms',
  locale: string,
): string {
  const descriptions: Record<string, string> = legalDescriptions[document];
  return clampMetaDescription(descriptions[locale] || descriptions.en);
}

#!/bin/bash
# 使用 AWS CLI 上传到 Cloudflare R2（更快更可靠）
#
# 使用前准备：
# 1. 安装 AWS CLI: brew install awscli
# 2. 在 Cloudflare Dashboard 创建 R2 API Token
# 3. 配置凭证（见下方说明）
#
# 运行方式：
# chmod +x scripts/upload-to-r2-aws.sh
# ./scripts/upload-to-r2-aws.sh

set -e

echo "🚀 使用 AWS CLI 上传到 Cloudflare R2"
echo ""

# 检查 AWS CLI 是否安装
if ! command -v aws &> /dev/null; then
    echo "❌ 请先安装 AWS CLI:"
    echo "   brew install awscli"
    exit 1
fi

# 配置说明
if [ ! -f ~/.aws/credentials ] || ! grep -q "\[r2\]" ~/.aws/credentials; then
    echo "⚠️  未找到 R2 配置，请先配置："
    echo ""
    echo "1. 在 Cloudflare Dashboard 获取 R2 API Token:"
    echo "   https://dash.cloudflare.com/ > R2 > Manage R2 API Tokens"
    echo ""
    echo "2. 运行以下命令配置："
    echo ""
    echo "cat >> ~/.aws/credentials << 'EOF'"
    echo "[r2]"
    echo "aws_access_key_id = YOUR_ACCESS_KEY_ID"
    echo "aws_secret_access_key = YOUR_SECRET_ACCESS_KEY"
    echo "EOF"
    echo ""
    echo "cat >> ~/.aws/config << 'EOF'"
    echo "[profile r2]"
    echo "region = auto"
    echo "output = json"
    echo "EOF"
    echo ""
    exit 1
fi

# 获取账号 ID
if [ -f /tmp/r2-account-id.txt ]; then
    ACCOUNT_ID=$(cat /tmp/r2-account-id.txt)
    echo "使用已保存的账号 ID: ${ACCOUNT_ID:0:8}..."
else
    read -p "请输入你的 Cloudflare 账号 ID (32位字符): " ACCOUNT_ID
    if [ -z "$ACCOUNT_ID" ]; then
        echo "❌ 账号 ID 不能为空"
        exit 1
    fi
fi

# 配置
BUCKET_NAME="find-emoji-assets"
ENDPOINT_URL="https://${ACCOUNT_ID}.r2.cloudflarestorage.com"

echo ""
echo "📦 存储桶: $BUCKET_NAME"
echo "🔗 端点: $ENDPOINT_URL"
echo ""
echo "开始上传..."
echo ""

# 上传
aws s3 sync ./assets "s3://${BUCKET_NAME}/assets" \
  --endpoint-url "$ENDPOINT_URL" \
  --profile r2 \
  --delete \
  --acl public-read

echo ""
echo "✅ 上传完成！"
echo ""
echo "📝 下一步："
echo "1. 在 Cloudflare Dashboard 中配置公共访问"
echo "2. 获取公共 URL（如 https://pub-xxx.r2.dev）"
echo "3. 配置 .env.local:"
echo "   echo 'R2_PUBLIC_CDN_URL=https://pub-xxx.r2.dev' > .env.local"
echo "4. 重启开发服务器: npm run dev"


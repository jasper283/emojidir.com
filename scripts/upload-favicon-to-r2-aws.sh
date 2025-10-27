#!/bin/bash
# 使用 AWS CLI 上传 favicon 到 Cloudflare R2

set -e

echo "🚀 上传 favicon 到 Cloudflare R2"
echo ""

# 检查 AWS CLI 是否安装
if ! command -v aws &> /dev/null; then
    echo "❌ 请先安装 AWS CLI:"
    echo "   brew install awscli"
    exit 1
fi

# 检查凭证
if [ ! -f ~/.aws/credentials ] || ! grep -q "\[r2\]" ~/.aws/credentials; then
    echo "⚠️  未找到 R2 配置"
    echo ""
    echo "请先配置 AWS CLI for R2:"
    echo "  见 scripts/upload-to-r2-aws.sh"
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
FAVICON_FILE="public/favicon.svg"

echo ""
echo "📤 上传 favicon.svg..."
echo ""

# 上传
aws s3 cp "$FAVICON_FILE" "s3://${BUCKET_NAME}/favicon.svg" \
  --endpoint-url "$ENDPOINT_URL" \
  --profile r2 \
  --acl public-read \
  --content-type "image/svg+xml"

echo ""
echo "✅ favicon 上传成功！"
echo ""
echo "📝 访问地址:"
echo "   https://object.emojidir.com/favicon.svg"


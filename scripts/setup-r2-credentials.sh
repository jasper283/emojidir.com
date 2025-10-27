#!/bin/bash
# 交互式配置 Cloudflare R2 凭证

set -e

echo "🔐 配置 Cloudflare R2 凭证"
echo ""
echo "请先在 Cloudflare Dashboard 获取 API Token："
echo "1. 访问: https://dash.cloudflare.com/"
echo "2. 进入 R2 > Manage R2 API Tokens"
echo "3. Create API Token > Admin Read & Write"
echo "4. 记下 Access Key ID 和 Secret Access Key"
echo ""

# 读取凭证
read -p "请输入 Access Key ID: " ACCESS_KEY_ID
read -sp "请输入 Secret Access Key: " SECRET_ACCESS_KEY
echo ""
read -p "请输入账号 ID (32位字符，在 Dashboard URL 中): " ACCOUNT_ID

echo ""
echo "🔧 配置中..."

# 创建目录
mkdir -p ~/.aws

# 写入凭证
cat > ~/.aws/credentials << EOF
[r2]
aws_access_key_id = ${ACCESS_KEY_ID}
aws_secret_access_key = ${SECRET_ACCESS_KEY}
EOF

# 写入配置
cat > ~/.aws/config << EOF
[profile r2]
region = auto
output = json
EOF

# 保存账号 ID 到临时文件
echo "${ACCOUNT_ID}" > /tmp/r2-account-id.txt

echo "✅ 凭证配置完成！"
echo ""
echo "📝 验证配置..."

# 验证
if aws --version &> /dev/null; then
    echo "✅ AWS CLI 已安装: $(aws --version)"
else
    echo "❌ AWS CLI 未安装"
    echo "请运行: brew install awscli"
    exit 1
fi

if [ -f ~/.aws/credentials ] && grep -q "\[r2\]" ~/.aws/credentials; then
    echo "✅ 凭证文件已创建"
else
    echo "❌ 凭证文件创建失败"
    exit 1
fi

echo ""
echo "✅ 配置完成！账号 ID 已保存"
echo ""
echo "下一步："
echo "  npm run upload-to-r2:aws"


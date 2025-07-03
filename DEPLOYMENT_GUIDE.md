# Schedule Management System - Deployment Guide

## 🚀 Render.com部署指南 (推荐)

### 方法1: 自动部署 (推荐)
1. 将项目上传到GitHub仓库
2. 访问 [render.com](https://render.com)
3. 连接您的GitHub账户
4. 选择此项目仓库
5. Render会自动检测到`render.yaml`配置文件并部署

### 方法2: 手动部署
1. 访问 [render.com](https://render.com) 并创建账户
2. 点击 "New +" -> "Web Service"
3. 连接您的GitHub仓库或上传代码
4. 配置设置:
   - **Name**: schedule-management-system
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

## 🌐 其他部署选项

### Netlify部署
1. 访问 [netlify.com](https://netlify.com)
2. 拖拽整个项目文件夹到Netlify部署区域
3. 或连接GitHub仓库进行自动部署

### Vercel部署
1. 访问 [vercel.com](https://vercel.com)
2. 导入GitHub仓库
3. Vercel会自动检测React项目并部署

## 📋 部署前检查清单

- ✅ 所有依赖项已在package.json中列出
- ✅ 构建脚本配置正确
- ✅ 环境变量配置 (如需要)
- ✅ Firebase配置文件存在
- ✅ 路由配置正确

## 🔧 本地测试

在部署前，请先本地测试:

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 📝 重要说明

1. **Node.js版本**: 确保使用Node.js 18或更高版本
2. **环境变量**: 如果使用Firebase等服务，请在部署平台配置相应环境变量
3. **域名**: 部署成功后，您将获得一个.onrender.com域名
4. **SSL**: Render自动提供HTTPS证书

## 🆘 故障排除

### 常见问题:
1. **构建失败**: 检查package.json中的依赖版本
2. **页面空白**: 检查控制台错误，可能是路由配置问题
3. **静态资源404**: 确认vite.config.js配置正确

### 支持联系:
如遇到部署问题，请检查:
- Render构建日志
- 浏览器开发者工具控制台
- 网络请求状态

---

此项目已优化用于现代部署平台，包含完整的生产环境配置。
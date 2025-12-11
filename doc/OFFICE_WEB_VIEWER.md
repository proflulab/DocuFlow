# Office Web Viewer 集成文档

## 概述

本项目已将原有的 `docx-preview` 方案替换为微软官方的 **Office Web Viewer**，用于在浏览器中预览 Word、Excel 和 PowerPoint 文档。

## 主要改进

### 1. 更好的预览效果
- 使用微软官方渲染引擎，显示效果更准确
- 支持完整的 Office 文档格式和样式
- 跨平台兼容性好

### 2. 支持更多格式
- Word 文档 (.docx, .doc)
- Excel 表格 (.xlsx, .xls)
- PowerPoint 演示文稿 (.pptx, .ppt)

### 3. 性能优化
- 无需下载整个文档到本地
- 加载速度更快
- 减少客户端资源消耗

## 技术实现

### 核心组件：`OfficeWebViewer`

```typescript
const OfficeWebViewer = ({ fileUrl }: { fileUrl: string }) => {
    const [isLoading, setIsLoading] = useState(true)
    
    const getOfficeWebViewerUrl = (url: string) => {
        const encodedUrl = encodeURIComponent(url)
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
    }

    return (
        <div className="relative h-full">
            {isLoading && (
                <div className="loading-overlay">
                    <Spin size="large" />
                </div>
            )}
            <iframe
                src={getOfficeWebViewerUrl(fileUrl)}
                width="100%"
                height="100%"
                frameBorder="0"
                onLoad={() => setIsLoading(false)}
                title="Office Document Preview"
            />
        </div>
    )
}
```

### 使用要求

1. **文档必须是公开可访问的**
   - 不能需要身份验证
   - 必须能通过互联网直接访问

2. **文档大小限制**
   - 单个文档不超过 10MB
   - 超过限制可能导致加载失败

3. **URL 编码**
   - 文档 URL 需要进行 URL 编码
   - 特殊字符需要正确处理

## 测试页面

项目提供了一个测试页面来验证 Office Web Viewer 功能：

访问：`http://localhost:3001/test-office-viewer`

测试页面包含：
- 自定义 URL 输入
- 示例文档快速测试
- 使用说明和注意事项

## 常见问题

### Q: 文档无法加载怎么办？
A: 请检查以下几点：
- 文档 URL 是否公开可访问
- 文档格式是否受支持
- 文档大小是否超过限制
- 网络连接是否正常

### Q: 预览显示不完整？
A: 可能是由于：
- 文档使用了复杂的格式或宏
- 网络加载不稳定
- Office Web Viewer 服务暂时不可用

### Q: 安全性如何保障？
A: Office Web Viewer 是微软官方服务，具有以下安全保障：
- 文档仅在预览时临时加载
- 不会存储用户文档内容
- 使用 HTTPS 加密传输

## 相关链接

- [Office Web Viewer 官方文档](https://learn.microsoft.com/zh-cn/archive/blogs/office_chs/office-web-viewer-office)
- [微软 Office 在线查看器](https://view.officeapps.live.com/)

## 更新日志

**2025年12月10日**
- 替换 docx-preview 为 Office Web Viewer
- 添加测试页面
- 优化加载体验
- 支持更多文档格式
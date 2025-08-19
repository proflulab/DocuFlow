# 文档格式支持说明

## 概述

本项目支持将DOCX模板文档转换为多种格式输出，采用策略模式设计，便于扩展新的格式支持。

## 支持的格式

### 当前支持的格式

| 格式 | 状态 | 描述 |
|------|------|------|
| DOCX | ✅ 完全支持 | 原始Word文档格式 |
| PDF | ✅ 完全支持 | 便携式文档格式 |
| PNG | 🚧 架构就绪 | 图片格式（待实现） |
| JPG | 🚧 架构就绪 | 图片格式（待实现） |
| JPEG | 🚧 架构就绪 | 图片格式（待实现） |

### 使用方法

在API请求中通过 `format` 参数指定输出格式：

```javascript
const formData = new FormData();
formData.append('template', templateFile);
formData.append('data', JSON.stringify(documentData));
formData.append('format', 'pdf'); // 指定输出格式

fetch('/api/document', {
    method: 'POST',
    body: formData
});
```

## 架构设计

### 格式处理器模式

采用策略模式实现格式处理，每种格式都有对应的处理器：

```typescript
interface FormatHandler {
    contentType: string;        // MIME类型
    fileExtension: string;      // 文件扩展名
    process: (docBuffer: Buffer) => Promise<Buffer>; // 转换处理函数
}
```

### 核心组件

1. **格式处理器映射** (`formatHandlers`)
   - 定义所有支持的格式及其处理逻辑
   - 统一的接口设计，便于扩展

2. **格式处理函数** (`handleDocumentFormat`)
   - 统一的格式处理入口
   - 错误处理和响应生成
   - 格式验证

3. **转换服务**
   - `pdfConverter.ts` - PDF转换服务
   - `imageConverter.ts` - 图片转换服务（新增）

## 扩展新格式

### 1. 添加格式类型

在 `SupportedFormat` 类型中添加新格式：

```typescript
type SupportedFormat = 'docx' | 'pdf' | 'png' | 'jpg' | 'jpeg' | 'newformat';
```

### 2. 实现转换服务

创建对应的转换服务文件，例如 `newFormatConverter.ts`：

```typescript
export async function convertDocxToNewFormat(docBuffer: Buffer): Promise<Buffer> {
    // 实现转换逻辑
}
```

### 3. 注册格式处理器

在 `formatHandlers` 中添加新格式的处理器：

```typescript
newformat: {
    contentType: 'application/newformat',
    fileExtension: 'newformat',
    process: async (docBuffer: Buffer) => {
        try {
            return await convertDocxToNewFormat(docBuffer);
        } catch (error) {
            console.error('新格式转换失败:', error);
            throw new Error('新格式转换失败');
        }
    },
},
```

## 图片格式实现计划

### 技术方案

1. **方案一：LibreOffice Headless**
   - 使用LibreOffice命令行工具
   - 支持多种格式转换
   - 需要系统安装LibreOffice

2. **方案二：Puppeteer + HTML**
   - 先转换为HTML，再渲染为图片
   - 高质量输出
   - 需要Chrome/Chromium

3. **方案三：Sharp + Canvas**
   - 使用Node.js图片处理库
   - 轻量级解决方案
   - 可能需要额外的文档解析

### 实现步骤

1. ✅ 创建图片转换服务架构
2. ⏳ 选择并实现具体的转换技术
3. ⏳ 添加图片质量和尺寸配置
4. ⏳ 完善错误处理和日志
5. ⏳ 添加单元测试

## 错误处理

### 格式不支持

当请求不支持的格式时，API返回：

```json
{
    "error": "不支持的格式: xyz",
    "supportedFormats": ["docx", "pdf", "png", "jpg", "jpeg"]
}
```

### 转换失败

当格式转换失败时，API返回：

```json
{
    "error": "PDF 转换失败"
}
```

## 性能考虑

1. **缓存机制**：考虑为转换结果添加缓存
2. **异步处理**：大文件转换可考虑异步处理
3. **资源限制**：设置合理的文件大小和处理时间限制
4. **并发控制**：限制同时进行的转换任务数量

## 配置选项

未来可考虑添加以下配置选项：

- 图片质量设置
- 输出尺寸控制
- 转换超时时间
- 缓存策略配置
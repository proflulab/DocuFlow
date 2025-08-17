# CertificateGenerator 组件使用说明

## 概述

`CertificateGenerator` 组件是一个动态文档生成器，支持创建自定义字段并生成 DOCX 和 PDF 文档。现已支持本地模板和云端模板两种模式。

## 新功能：模板选择

### 模板来源选项

1. **本地模板文件**
   - 使用项目中预设的本地模板文件
   - 默认选项，无需额外配置
   - 适用于固定模板场景

2. **云端模板 (Vercel Blob)**
   - 从 Vercel Blob 存储中获取模板文件
   - 支持动态模板管理
   - 需要输入模板文件名

### 使用方法

#### 使用本地模板
1. 选择「使用本地模板文件」选项
2. 配置字段信息
3. 点击生成文档

#### 使用云端模板
1. 选择「使用云端模板 (Vercel Blob)」选项
2. 在「云端模板名称」输入框中输入模板文件名（如：`template.docx`）
3. 配置字段信息
4. 点击生成文档

### 云端模板管理

#### 上传模板到 Vercel Blob
模板文件需要预先上传到 Vercel Blob 存储中。可以通过以下方式上传：

1. 使用 Vercel Dashboard
2. 使用 Vercel CLI
3. 通过 API 程序化上传

#### 模板文件要求
- 支持 `.docx` 格式的 Word 模板文件
- 模板中使用 `{{字段名}}` 格式的占位符
- 确保模板文件已正确上传到 Vercel Blob

### API 调用变化

组件现在会根据模板来源选择在 API 请求中添加相应的查询参数：

```javascript
// 本地模板
fetch('/api/document?format=docx&source=local', { ... })

// 云端模板
fetch('/api/document?format=docx&source=cloud&template=template.docx', { ... })
```

**参数说明：**
- `source`: 明确指定模板来源（`local` 或 `cloud`）
- `template`: 仅在使用云端模板时需要，指定模板文件名

### 错误处理

- 如果云端模板文件不存在，API 会返回错误信息
- 如果模板文件格式不正确，会显示相应的错误提示
- 网络错误或服务器错误会显示通用错误信息

### 环境变量配置

使用云端模板功能需要配置以下环境变量：

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 最佳实践

1. **模板命名**：使用有意义的文件名，如 `certificate_template.docx`
2. **版本管理**：为不同版本的模板使用不同的文件名
3. **备份**：定期备份重要的模板文件
4. **测试**：在生产环境使用前，先在开发环境测试模板

### 故障排除

#### 常见问题

1. **模板文件找不到**
   - 检查文件名是否正确
   - 确认文件已上传到 Vercel Blob
   - 检查环境变量配置

2. **生成的文档格式异常**
   - 检查模板文件中的占位符格式
   - 确认字段名与模板中的占位符匹配

3. **网络错误**
   - 检查网络连接
   - 确认 Vercel Blob 服务状态

## 技术实现

### 组件状态管理

```typescript
const [templateSource, setTemplateSource] = useState<'local' | 'cloud'>('local');
const [cloudTemplateName, setCloudTemplateName] = useState<string>('');
```

### API 集成

组件通过修改 API URL 来支持模板选择：

```typescript
let apiUrl = `/api/document?format=docx&source=${templateSource}`;
if (templateSource === 'cloud' && cloudTemplateName.trim()) {
    apiUrl += `&template=${encodeURIComponent(cloudTemplateName.trim())}`;
}
```

**改进点：**
- 明确的 `source` 参数避免了基于 `template` 参数存在性的隐式判断
- 提高了 API 的可读性和可维护性
- 确保了向后兼容性，同时提供了灵活的模板管理能力
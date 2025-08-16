# Vercel Blob 模板功能使用说明

## 概述

文档生成接口现在支持从 Vercel Blob 存储获取模板文件，同时保持向后兼容性。

## 功能特性

1. **云端模板支持**: 从 Vercel Blob 存储获取 DOCX 模板文件
2. **本地回退**: 如果云端模板获取失败，自动回退到本地模板文件
3. **向后兼容**: 不传递模板参数时，使用默认的本地模板

## API 使用方法

### 请求参数

- **format**: 输出格式，可选值为 `docx` 或 `pdf`，默认为 `docx`
- **source**: 模板来源，可选值为 `local` 或 `cloud`，默认为 `local`
- **template**: 可选参数，当 source 为 `cloud` 时指定云端模板文件名

### 示例请求

```javascript
// 使用本地模板生成 DOCX
fetch('/api/document?format=docx&source=local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

// 使用云端模板生成 PDF
fetch('/api/document?format=pdf&source=cloud&template=my-template.docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

## 查询参数

- `format`: 输出格式，可选值 `docx`（默认）或 `pdf`
- `template`: 云端模板文件名，如果不提供则使用本地默认模板

## 模板文件管理

1. 将 DOCX 模板文件上传到 Vercel Blob 存储
2. 确保文件名包含可识别的关键词
3. 接口会自动查找匹配的模板文件

## 错误处理

- 如果指定的云端模板不存在，会自动回退到本地模板
- 如果本地模板也不存在，会返回错误信息
- 所有错误都会记录在服务器日志中

## 环境变量

确保设置了以下环境变量：

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob 的读写令牌
- `PDF_CONVERTER_API`: PDF 转换服务的 API 地址（如需 PDF 功能）
# Vercel Blob CRUD 操作指南

本文档介绍如何使用 `src/utils/blob.ts` 中的增删改查功能进行模板管理。

## 功能概览

### 1. 查询功能 (Read)

#### 获取模板文件

```typescript
import { getTemplateFromBlob } from '@/utils/blob';

// 获取指定模板文件的内容
const templateBuffer = await getTemplateFromBlob('invoice-template.docx');
```

#### 列出所有文件

```typescript
import { listBlobFiles } from '@/utils/blob';

// 获取所有文件列表
const { blobs } = await listBlobFiles();

// 带条件查询
const { blobs: templates } = await listBlobFiles({
    prefix: 'templates/',
    limit: 10
});
```

#### 根据前缀查找模板

```typescript
import { findTemplatesByPrefix } from '@/utils/blob';

// 查找所有发票模板
const invoiceTemplates = await findTemplatesByPrefix('invoice-');
```

#### 获取文件元数据

```typescript
import { getBlobMetadata } from '@/utils/blob';

// 获取文件详细信息
const metadata = await getBlobMetadata('templates/invoice.docx');
console.log(metadata.size, metadata.contentType);
```

#### 检查文件是否存在

```typescript
import { checkBlobExists } from '@/utils/blob';

const exists = await checkBlobExists('templates/contract.docx');
if (exists) {
    console.log('文件存在');
}
```

### 2. 创建功能 (Create)

#### 上传文件

```typescript
import { uploadToBlob } from '@/utils/blob';

// 上传文件对象
const file = new File([buffer], 'template.docx');
const result = await uploadToBlob('templates/new-template.docx', file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
});

console.log('上传成功:', result.url);
```

#### 上传 Buffer 数据

```typescript
const buffer = Buffer.from(templateData);
const result = await uploadToBlob('templates/buffer-template.docx', buffer, {
    access: 'public'
});
```

### 3. 更新功能 (Update)

#### 更新现有文件

```typescript
import { updateBlobFile } from '@/utils/blob';

// 更新模板文件
const newFile = new File([updatedBuffer], 'updated-template.docx');
const result = await updateBlobFile('templates/invoice.docx', newFile, {
    access: 'public',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
});

console.log('更新成功:', result.url);
```

### 4. 删除功能 (Delete)

#### 删除文件

```typescript
import { deleteFromBlob } from '@/utils/blob';

// 删除指定文件
const result = await deleteFromBlob('templates/old-template.docx');
console.log(result.message); // '文件删除成功'
```

## 实际应用示例

### 模板管理系统

```typescript
import {
    listBlobFiles,
    uploadToBlob,
    updateBlobFile,
    deleteFromBlob,
    findTemplatesByPrefix
} from '@/utils/blob';

class TemplateManager {
    // 获取所有模板
    async getAllTemplates() {
        const { blobs } = await listBlobFiles({
            prefix: 'templates/'
        });
        return blobs;
    }

    // 上传新模板
    async uploadTemplate(file: File, category: string) {
        const pathname = `templates/${category}/${file.name}`;
        return await uploadToBlob(pathname, file, {
            access: 'public',
            addRandomSuffix: true
        });
    }

    // 更新模板
    async updateTemplate(pathname: string, file: File) {
        return await updateBlobFile(pathname, file, {
            access: 'public'
        });
    }

    // 删除模板
    async deleteTemplate(pathname: string) {
        return await deleteFromBlob(pathname);
    }

    // 按类型查找模板
    async getTemplatesByType(type: string) {
        return await findTemplatesByPrefix(`templates/${type}/`);
    }
}
```

## 错误处理

所有函数都包含错误处理，会在控制台输出详细错误信息并重新抛出错误：

```typescript
try {
    const result = await uploadToBlob('test.txt', 'Hello World');
    console.log('上传成功:', result);
} catch (error) {
    console.error('上传失败:', error.message);
}
```

## 注意事项

1. **环境变量**: 确保设置了 `BLOB_READ_WRITE_TOKEN` 环境变量
2. **文件大小**: 大文件上传时建议使用 `multipart: true` 选项
3. **路径命名**: 建议使用有意义的路径结构，如 `templates/category/filename`
4. **权限控制**: 默认使用 `public` 访问权限
5. **缓存控制**: 可通过 `cacheControlMaxAge` 设置缓存时间

## 相关链接

- [Vercel Blob 官方文档](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [项目 Blob 使用说明](./README_BLOB_USAGE.md)

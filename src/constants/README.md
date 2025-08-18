# 国家列表常量

这个文件夹包含了项目中使用的各种常量定义。

## countries.ts

包含了世界各国的完整列表，按地区分组。

### 导出的常量

#### `COUNTRIES`

完整的世界各国列表，包含约200个国家和地区，按以下格式组织：

```typescript
{ value: 'country_code', label: '国家名称' }
```

#### `COUNTRIES_BY_REGION`

按地区分组的国家列表：

- `asia` - 亚洲国家
- `europe` - 欧洲国家
- `north_america` - 北美洲国家
- `south_america` - 南美洲国家
- `oceania` - 大洋洲国家
- `africa` - 非洲国家

#### `POPULAR_COUNTRIES`

常用的10个国家列表（原CertificateGenerator中的国家）

### 使用示例

```typescript
import { COUNTRIES, POPULAR_COUNTRIES, COUNTRIES_BY_REGION } from '../constants/countries';

// 使用完整国家列表
<Select options={COUNTRIES} />

// 使用常用国家列表
<Select options={POPULAR_COUNTRIES} />

// 使用特定地区的国家
<Select options={COUNTRIES_BY_REGION.asia} />
```

### 特性

- 支持搜索功能（通过 `showSearch` 和 `filterOption`）
- 中文显示名称
- 英文值标识符
- 按地理位置分组
- 包含常用国家的快速访问列表

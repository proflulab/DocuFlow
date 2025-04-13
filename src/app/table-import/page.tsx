'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

// 定义飞书记录字段类型
interface FeishuFieldValue {
  text?: string;
  name?: string;
}

interface FeishuFields {
  '记录 ID'?: FeishuFieldValue[];
  '姓名'?: FeishuFieldValue[];
  '学生学号'?: string;
  'Postal Code'?: string;
  'country'?: string;
  '详细地址'?: string;
  '城市'?: string;
  '省份'?: string;
  '签发日期'?: string;
  '开始日期'?: string;
  '结束日期'?: string;
  '学费'?: string;
  [key: string]: unknown;
}

interface FeishuRecord {
  fields: FeishuFields;
}

interface Template {
  path: string;
  name: string;
}

interface FormField {
  key: string;
  label: string;
  type: string;
  value: string;
}

interface FormDataType {
  name: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
  studentID: string;
  programName: string;
  issuanceDate: string;
  startDate: string;
  endDate: string;
  tuitionFeeUSD: string;
  [key: string]: string;
}

const countries = [
  "China", "United States", "United Kingdom", "Canada", "Australia", "Japan",
  "Germany", "France", "Italy", "Spain", "Russia", "Brazil", "India",
  "South Korea", "Mexico", "Indonesia", "Turkey", "Saudi Arabia",
  "South Africa", "Argentina", "New Zealand"
];

export default function TableImportPage() {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<FeishuRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    country: "China",
    state: "",
    city: "",
    postalCode: "",
    address: "",
    studentID: "",
    programName: "Practical Training Club",
    issuanceDate: "",
    startDate: "",
    endDate: "",
    tuitionFeeUSD: ""
  });
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const router = useRouter();

  // 国家映射表
  const countryMap: Record<string, string> = {
    '中国': 'China',
    '美国': 'United States',
    '英国': 'United Kingdom',
    '加拿大': 'Canada',
    '澳大利亚': 'Australia',
    '日本': 'Japan',
    '新西兰': 'New Zealand'
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearchResult(null);
    setShowForm(false);

    try {
      const response = await fetch('/api/feishu');
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      const responseData = await response.json();

      if (!responseData.data?.items) {
        throw new Error('API返回的数据结构无效');
      }

      const foundItem = responseData.data.items.find((item: FeishuRecord) => {
        const recordId = item.fields?.['记录 ID']?.[0]?.text?.trim().toLowerCase();
        return recordId === searchId.trim().toLowerCase();
      });

      if (!foundItem) {
        throw new Error(`未找到ID为 "${searchId}" 的记录`);
      }

      // 字段映射表
      const fieldMappings: Record<string, keyof FormDataType> = {
        '姓名': 'name',
        '学生学号': 'studentID',
        'country': 'country',
        'Postal Code': 'postalCode',
        '详细地址': 'address',
        '城市': 'city',
        '省份': 'state',
        '签发日期': 'issuanceDate',
        '开始日期': 'startDate',
        '结束日期': 'endDate',
        '学费': 'tuitionFeeUSD'
      };

      // 处理飞书字段值
      const processFieldValue = (value: unknown): string => {
        if (Array.isArray(value)) {
          return (value[0]?.text || value[0]?.name || '').toString();
        }
        return (value || '').toString();
      };

      // 创建新表单数据
      const newFormData = { ...formData };

      // 填充表单数据
      Object.entries(foundItem.fields).forEach(([fieldName, fieldValue]) => {
        const mappedField = fieldMappings[fieldName];
        if (mappedField) {
          newFormData[mappedField] = processFieldValue(fieldValue);
        }
      });

      // 特殊处理国家映射
      if (newFormData.country) {
        newFormData.country = countryMap[newFormData.country] || newFormData.country;
      }

      // 设置表单字段
      const requiredFields = Object.values(fieldMappings);
      const uniqueFields = [...new Set(requiredFields)];

      setFormFields(uniqueFields.map(field => ({
        key: field,
        label: field.replace(/([A-Z])/g, ' $1').trim(),
        type: field.includes('Date') ? 'date' : 'text',
        value: newFormData[field] || ''
      })));

      setFormData(newFormData);
      setSearchResult(foundItem);
      setShowForm(true);
      setError('数据填充成功');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(`搜索失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 加载模板列表
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/blob-templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('加载模板失败:', error);
      }
    };
    loadTemplates();
  }, []);

  // 处理模板选择变化
  const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templatePath = e.target.value;
    setSelectedTemplate(templatePath);
    
    if (!templatePath) {
      setFormFields([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/preview?path=${encodeURIComponent(templatePath)}`);
      const data = await response.json();
      
      const htmlWithoutStyles = data.html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      const placeholderRegex = /(?<!\w|\.|\-|:|;|\{|\}|\s)\{([^\}]+)\}(?!\w|\.|\-|:|;|\{|\}|\s)/g;
      const matches = htmlWithoutStyles.matchAll(placeholderRegex);
      const placeholders = new Set<string>();
      
      for (const match of matches) {
        const placeholder = match[1].trim();
        if (placeholder && !placeholder.includes('{') && !placeholder.includes('}')) {
          placeholders.add(placeholder);
        }
      }
      
      setFormFields(Array.from(placeholders).map(placeholder => ({
        key: placeholder,
        label: placeholder.replace(/_en$/, '').replace(/_美元$/, ''),
        type: placeholder.includes('Date') ? 'date' : 'text',
        value: formData[placeholder] || ''
      })));
    } catch (error) {
      console.error('加载模板预览失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const generateDocument = async () => {
    if (!selectedTemplate) {
      setError('请先选择一个模板');
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const response = await fetch("/api/generate_document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          issuanceDate: formatDate(formData.issuanceDate),
          startDate: formatDate(formData.startDate),
          endDate: formatDate(formData.endDate),
          templatePath: selectedTemplate
        }),
      });
      const blob = await response.blob();
      saveAs(blob, `Lulab_invoice_${formData.name}.docx`);
      setError('文档生成成功');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('生成文档失败');
      setError(error.message);
    } finally {
      setIsGeneratingDocx(false);
    }
  };
  
  const generatePdf = async () => {
    if (!selectedTemplate) {
      setError('请先选择一个模板');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const response = await fetch("/api/pdf_document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          issuanceDate: formatDate(formData.issuanceDate),
          startDate: formatDate(formData.startDate),
          endDate: formatDate(formData.endDate),
          templatePath: selectedTemplate
        }),
      });
      const blob = await response.blob();
      saveAs(blob, `Lulab_invoice_${formData.name}.pdf`);
      setError('PDF生成成功');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('生成PDF失败');
      setError(error.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      router.push('/password');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100 relative">
      <button
        onClick={() => router.push('/menu')}
        className="absolute top-8 left-8 p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">多维表格导入</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">选择模板</label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- 请选择模板 --</option>
              {templates.map((template) => (
                <option key={template.path} value={template.path}>{template.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="输入记录ID进行搜索"
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
          
          {error && (
            <div className={`p-3 rounded-md mb-4 ${
              error.includes('成功') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {error}
            </div>
          )}

          {showForm && (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field.label}
                    </label>
                    {field.key === 'country' ? (
                      <select
                        name={field.key}
                        value={formData[field.key] || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {countries.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.key}
                        value={formData[field.key] || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={generateDocument}
                  disabled={isGeneratingDocx || !selectedTemplate}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isGeneratingDocx ? '生成中...' : '生成Word文档'}
                </button>
                <button
                  type="button"
                  onClick={generatePdf}
                  disabled={isGeneratingPdf || !selectedTemplate}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isGeneratingPdf ? '生成中...' : '生成PDF文档'}
                </button>
              </div>
            </form>
          )}

          {/* 调试信息面板 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <details>
              <summary className="font-medium cursor-pointer">调试信息</summary>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold">表单数据:</h4>
                  <pre className="text-xs p-2 bg-white rounded overflow-auto max-h-40">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">表单字段:</h4>
                  <pre className="text-xs p-2 bg-white rounded overflow-auto max-h-40">
                    {JSON.stringify(formFields, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
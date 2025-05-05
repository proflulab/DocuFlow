'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

// 定义模板文件类型
interface TemplateFile {
  name: string;
  format: string;
  size: string;
  path: string;
  pathname: string;
}

// 定义表单字段类型
interface FormField {
  key: string;
  label: string;
  type: string;
  value: string;
}

// 定义 formData 的类型
interface FormDataType {
  [key: string]: string;
  name: string;
  phone: string;
  weChat: string;
  studentID: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
  programName: string;
  issuanceDate: string;
  startDate: string;
  endDate: string;
  tuitionFeeUSD: string;
}

// 定义飞书记录字段类型
interface FeishuFieldValue {
  text?: string;
  name?: string;
}

interface FeishuFields {
  real_name?: string;
  phone?: string;
  weChat?: string;
  UserID?: { text: string; type: string }[];
  order?: {
    record_ids: string[];
    text: string;
    text_arr: string[];
    type: string;
  }[];
  // 保留原有字段
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
  id?: string;
  record_id?: string;
}

const countries = [
  "China", "United States", "United Kingdom", "Canada", "Australia", "Japan",
  "Germany", "France", "Italy", "Spain", "Russia", "Brazil", "India",
  "South Korea", "Mexico", "Indonesia", "Turkey", "Saudi Arabia",
  "South Africa", "Argentina", "New Zealand"
];

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

// 字段映射配置
const feishuFieldMappings: Record<string, string> = {
  // 新API字段映射
  'lezi': 'lezi',
  '邮编': 'postalCode',
  '国家_en': 'country',
  '详细地址_en': 'address',
  '姓名_en': 'name',
  'real_name': 'name',
  'UserID': 'studentID',
  'phone': 'phone',
  'weChat': 'weChat',
  'country': 'country',
  'province': 'state',
  'city': 'city',
  'address': 'address',
  'issuance_date': 'issuanceDate',
  'start_date': 'startDate',
  'end_date': 'endDate',
  'tuition_fee': 'tuitionFeeUSD',
  'program_name': 'programName',
  
  // 旧API字段映射
  '姓名': 'name',
  '学生学号': 'studentID',
  'Postal Code': 'postalCode',
  'Country': 'country',
  '详细地址': 'address',
  '城市': 'city',
  '省份': 'state',
  '签发日期': 'issuanceDate',
  '开始日期': 'startDate',
  '结束日期': 'endDate',
  '学费': 'tuitionFeeUSD',
  '项目名称': 'programName',
  '发放时间_en': 'issuanceDate',
  '开始时间_en': 'startDate',
  '结束时间_en': 'endDate',
  '实际价格_美元': 'tuitionFeeUSD'
};

export default function TableImportPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<TemplateFile[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    phone: "",
    weChat: "",
    studentID: "",
    country: "China",
    state: "",
    city: "",
    postalCode: "",
    address: "",
    programName: "Practical Training Club",
    issuanceDate: "",
    startDate: "",
    endDate: "",
    tuitionFeeUSD: ""
  });

  // 加载模板列表
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/blob-templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('加载模板失败:', error);
        setError('加载模板列表失败');
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
      setFormData(prev => ({
        ...prev,
        programName: "Practical Training Club",
        country: "China"
      }));
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/preview?path=${encodeURIComponent(templatePath)}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || '预览文件失败');
      if (!data.html) throw new Error('预览内容为空');

      const htmlWithoutStyles = data.html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      const placeholderRegex = /\{([^{}]+)\}/g;
      const matches = htmlWithoutStyles.matchAll(placeholderRegex);
      const placeholders = new Set<string>();
      
      for (const match of matches) {
        const placeholder = match[1].trim();
        if (placeholder) placeholders.add(placeholder);
      }
      
      // 生成表单字段配置
      const fields: FormField[] = Array.from(placeholders).map(placeholder => ({
        key: placeholder,
        label: placeholder
          .replace(/_en$/, '')
          .replace(/_美元$/, '')
          .replace(/([A-Z])/g, ' $1')
          .trim(),
        type: placeholder.includes('Date') ? 'date' : 'text',
        value: formData[placeholder] || ''
      }));
      
      setFormFields(fields);
      
      // 更新formData，保留已有数据
      const newFormData = { ...formData };
      fields.forEach(field => {
        if (!(field.key in newFormData)) {
          newFormData[field.key] = '';
        }
      });
      setFormData(newFormData);
      
    } catch (error) {
      console.error('加载模板预览失败:', error);
      setError(`加载模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 搜索飞书数据并自动填充表单
  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      if (!searchId.trim()) {
        throw new Error('请输入记录ID');
      }

      const response = await fetch('/api/feishu');
      if (!response.ok) throw new Error('API请求失败');
      
      const responseData = await response.json();
      
      if (!responseData.data?.items) {
        console.log('API返回数据:', responseData);
        throw new Error('API返回的数据结构无效');
      }

      // 新的搜索逻辑，支持多种ID匹配方式
      const foundItem = responseData.data.items.find((item: FeishuRecord) => {
        // 匹配记录ID
        if (item.record_id?.toLowerCase() === searchId.trim().toLowerCase()) {
          return true;
        }
        
        // 匹配UserID字段中的ID
        if (item.fields?.UserID?.[0]?.text?.toLowerCase().includes(searchId.trim().toLowerCase())) {
          return true;
        }
        
        // 匹配order字段中的ID
        if (item.fields?.order?.[0]?.text?.toLowerCase().includes(searchId.trim().toLowerCase())) {
          return true;
        }
        
        return false;
      });

      if (!foundItem) {
        console.log('所有记录ID:', responseData.data.items.map((item: FeishuRecord) => 
          item.record_id || item.fields?.UserID?.[0]?.text
        ));
        throw new Error(`未找到ID为 "${searchId}" 的记录，请确认ID是否正确`);
      }

      console.log('找到的记录:', foundItem);

      const newFormData = { ...formData };

      // 处理新API数据结构
      if (foundItem.fields) {
        // 使用字段映射配置初始化表单数据
        Object.entries(feishuFieldMappings).forEach(([feishuField, formField]) => {
          const sourceKey = foundItem.fields[feishuField] !== undefined ? feishuField : formField;
          const sourceValue = foundItem.fields[sourceKey];
          
          if (typeof sourceValue === 'string' && sourceValue.trim()) {
            newFormData[formField] = sourceValue.trim();
          } else if (Array.isArray(sourceValue) && sourceValue[0]?.text) {
            newFormData[formField] = sourceValue[0].text;
          }
        });

        // 特殊处理国家映射
        if (newFormData.country) {
          newFormData.country = countryMap[newFormData.country] || newFormData.country;
        }
      }

      // 确保所有模板字段都有值
      formFields.forEach(field => {
        if (!newFormData[field.key] && feishuFieldMappings[field.key]) {
          newFormData[field.key] = newFormData[feishuFieldMappings[field.key]] || '';
        }
      });

      console.log('最终表单数据:', newFormData);
      setFormData(newFormData);
      setError('数据填充成功');

      // 如果没有选择模板，自动选择第一个模板
      if (!selectedTemplate && templates.length > 0) {
        await handleTemplateChange({
          target: { value: templates[0].path }
        } as React.ChangeEvent<HTMLSelectElement>);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      console.error('搜索错误:', error);
      setError(`搜索失败: ${error.message}`);
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
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const day = String(date.getDate()).padStart(2, '0');
      return `${month} ${day}, ${year}`;
    } catch (error) {
      console.error('日期格式化错误:', error);
      return dateString;
    }
  };
  
  const generateDocument = async () => {
    if (!selectedTemplate) {
      setError('请先选择一个模板');
      return;
    }

    setIsGeneratingDocx(true);
    try {
      const formattedData = {
        ...formData,
        issuanceDate: formatDate(formData.issuanceDate),
        startDate: formatDate(formData.startDate),
        endDate: formatDate(formData.endDate),
        templatePath: selectedTemplate
      };

      const response = await fetch("/api/generate_document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      
      const blob = await response.blob();
      const filename = `Lulab_invoice_${formData.name || 'document'}.docx`;
      saveAs(blob, filename);
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
      const formattedData = {
        ...formData,
        issuanceDate: formatDate(formData.issuanceDate),
        startDate: formatDate(formData.startDate),
        endDate: formatDate(formData.endDate),
        templatePath: selectedTemplate
      };

      const response = await fetch("/api/pdf_document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      
      const blob = await response.blob();
      const filename = `Lulab_invoice_${formData.name || 'document'}.pdf`;
      saveAs(blob, filename);
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
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
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
              placeholder="输入记录ID、UserID或手机号搜索"
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
          
          {error && (
            <div className={`p-3 rounded-md mb-4 ${
              error.includes('成功') ? 'bg-green-100 text-green-800' : 
              error.includes('确认') ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {error}
              {error.includes('未找到') && (
                <div className="mt-2 text-sm">
                  请检查：
                  <ul className="list-disc pl-5">
                    <li>记录ID是否正确</li>
                    <li>该记录是否存在于飞书多维表格中</li>
                    <li>您是否有权限访问该记录</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            selectedTemplate && (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.map((field) => {
                    const fieldValue = formData[field.key] || '';
                    return (
                      <div key={field.key} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        {field.key === "country" ? (
                          <select
                            name={field.key}
                            value={fieldValue}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {countries.map((country) => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        ) : field.type === 'date' ? (
                          <input
                            type="date"
                            name={field.key}
                            value={fieldValue}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        ) : (
                          <input
                            type="text"
                            name={field.key}
                            value={fieldValue}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={generateDocument}
                    disabled={isGeneratingDocx || !selectedTemplate}
                    className={`flex-1 py-2 px-4 rounded-md text-white ${
                      isGeneratingDocx || !selectedTemplate 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isGeneratingDocx ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </>
                    ) : '生成Word文档'}
                  </button>
                  <button
                    type="button"
                    onClick={generatePdf}
                    disabled={isGeneratingPdf || !selectedTemplate}
                    className={`flex-1 py-2 px-4 rounded-md text-white ${
                      isGeneratingPdf || !selectedTemplate 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </>
                    ) : '生成PDF文档'}
                  </button>
                </div>
              </form>
            )
          )}

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
              <h3 className="font-bold mb-2">调试信息:</h3>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
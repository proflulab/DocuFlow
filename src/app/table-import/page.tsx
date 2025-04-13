'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

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
  "South Africa", "Argentina"
];

export default function TableImportPage() {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isValidId, setIsValidId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [templates, setTemplates] = useState([]);
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

  // 映射表
  const countryMap: Record<string, string> = {
    '中国': 'China',
    '美国': 'United States',
    '英国': 'United Kingdom',
    '加拿大': 'Canada',
    '澳大利亚': 'Australia',
    '日本': 'Japan'
  };

  const provinceMap: Record<string, string> = {
    '广东': 'Guangdong',
    '江苏': 'Jiangsu',
    '浙江': 'Zhejiang',
    '北京': 'Beijing',
    '上海': 'Shanghai',
    'Shanghai': 'Shanghai'
  };

  const cityMap: Record<string, string> = {
    '广州': 'Guangzhou',
    '深圳': 'Shenzhen',
    '杭州': 'Hangzhou',
    '南京': 'Nanjing',
    '苏州': 'Suzhou',
    '上海': 'Shanghai',
    'Shanghai': 'Shanghai'
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setData(null);
    setShowForm(false);
    setSearchResult(null);
    setIsValidId(false);
    
    try {
      const response = await fetch('/api/feishu');
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      const responseData = await response.json();
      
      console.log('API返回的完整数据:', responseData); // 调试输出

      if (!responseData.data?.items) {
        throw new Error('API返回的数据结构无效');
      }

      const foundItem = responseData.data.items.find((item: any) => {
        const recordId = item.fields?.['记录 ID']?.[0]?.text?.trim().toLowerCase();
        return recordId === searchId.trim().toLowerCase();
      });

      if (!foundItem) {
        throw new Error(`未找到ID为 "${searchId}" 的记录`);
      }

      console.log('找到的记录数据:', foundItem.fields); // 调试输出

      // 创建字段映射表 (根据控制台输出的实际字段名调整)
      const fieldMappings: Record<string, string> = {
        '姓名': 'name',
        '学生学号': 'studentID',
        'country': 'country',
        'Postal Code': 'postalCode',
        '详细地址': 'address',
        // 添加其他字段映射...
      };

      // 创建新表单数据
      const newFormData = { ...formData };

      // 处理飞书特殊数据结构（数组字段）
      const processFieldValue = (value: any) => {
        if (Array.isArray(value)) {
          return value[0]?.text || value[0]?.name || '';
        }
        return value || '';
      };

      // 遍历飞书返回的所有字段
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

      console.log('填充后的表单数据:', newFormData);
      setFormData(newFormData);
      
      // 确保表单字段包含所有需要的字段
      const requiredFields = [
        'name', 'country', 'state', 'city', 'postalCode', 
        'address', 'studentID', 'issuanceDate', 'startDate', 'endDate'
      ];
      
      setFormFields(requiredFields.map(field => ({
        key: field,
        label: field.replace(/([A-Z])/g, ' $1').trim(),
        type: field.includes('Date') ? 'date' : 'text',
        value: newFormData[field] || ''
      })));

      // 特殊处理城市映射
      if (newFormData.city) {
        newFormData.city = cityMap[newFormData.city] || newFormData.city;
      }

      console.log('填充后的表单数据:', newFormData); // 调试输出
      
      setFormData(newFormData);
      setSearchResult(foundItem);
      setIsValidId(true);
      setShowForm(true);
      setError('数据获取并填充成功');
      
    } catch (err: any) {
      console.error('搜索错误详情:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      setError(`搜索失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 加载模板列表
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/blob-templates');
        if (!response.ok) throw new Error('加载模板失败');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('加载模板错误:', error);
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
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/preview?path=${encodeURIComponent(templatePath)}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error('预览文件失败');
      if (!data.html) throw new Error('预览内容为空');

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
      
      const fields: FormField[] = Array.from(placeholders).map(placeholder => ({
        key: placeholder,
        label: placeholder.replace(/_en$/, '').replace(/_美元$/, ''),
        type: placeholder.includes('Date') ? 'date' : 'text',
        value: ''
      }));
      
      setFormFields(fields);
    } catch (error) {
      console.error('加载模板预览错误:', error);
      setError('加载模板预览失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'searchId') {
      setSearchId(value);
      setIsValidId(false);
      setSearchResult(null);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    return `${month} ${day}, ${year}`;
  };
  
  const generateDocument = async () => {
    if (!selectedTemplate) {
      setError('请先选择一个模板');
      return;
    }
    
    setIsGeneratingDocx(true);
    const formattedData = {
      ...formData,
      issuanceDate: formatDate(formData.issuanceDate),
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      templatePath: selectedTemplate
    };

    try {
      const response = await fetch("/api/generate_document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      const blob = await response.blob();
      saveAs(blob, `Lulab_invoice_${formattedData.name}.docx`);
      setError('文档生成成功');
    } catch (error) {
      console.error("生成文档错误:", error);
      setError('生成文档失败');
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
    const formattedData = {
      ...formData,
      issuanceDate: formatDate(formData.issuanceDate),
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      templatePath: selectedTemplate
    };

    try {
      const response = await fetch("/api/pdf_document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) throw new Error('生成PDF失败');

      const blob = await response.blob();
      saveAs(blob, `Lulab_invoice_${formattedData.name}.pdf`);
      setError('PDF生成成功');
    } catch (error) {
      console.error("生成PDF错误:", error);
      setError('生成PDF失败');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') router.push('/password');
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
              {templates.map((template: any, index: number) => (
                <option key={index} value={template.path}>{template.name}</option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="输入ID进行搜索"
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? '搜索中...' : '搜索'}
                </button>
              </div>
              
              {loading && <div className="text-center py-4">加载中...</div>}
              {error && (
                <div className={`text-center py-2 ${error.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
                  {error}
                </div>
              )}
              
              {searchResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">找到的记录数据:</h3>
                  <pre className="text-sm bg-white p-3 rounded overflow-auto max-h-60">
                    {JSON.stringify(searchResult.fields, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {showForm && (
            <div className="mt-6 space-y-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.map((field) => (
                    <div key={field.key} className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field.label.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {field.key === "country" ? (
                        <select
                          name={field.key}
                          value={formData[field.key] || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                          className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex flex-col space-y-4">
                  <button
                    type="button"
                    onClick={generateDocument}
                    disabled={isGeneratingDocx || !selectedTemplate}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isGeneratingDocx || !selectedTemplate 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                  >
                    {isGeneratingDocx ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </>
                    ) : "生成Word文档"}
                  </button>
                  <button
                    type="button"
                    onClick={generatePdf}
                    disabled={isGeneratingPdf || !selectedTemplate}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isGeneratingPdf || !selectedTemplate 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </>
                    ) : "生成PDF文档"}
                  </button>
                </div>
              </form>

              {/* 调试信息面板 */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">调试信息:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">当前表单数据:</h4>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">表单字段:</h4>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(formFields, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
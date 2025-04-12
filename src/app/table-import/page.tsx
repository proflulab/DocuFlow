'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

// 定义表单字段类型
interface FormField {
    key: string;
    label: string;
    type: string;
    value: string;
}

// 定义表单数据类型
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

// 所有国家名称列表
const countries = [
    "China", "United States", "United Kingdom", "Canada", "Australia", "Japan", "Germany", "France", "Italy", "Spain",
    "Russia", "Brazil", "India", "South Korea", "Mexico", "Indonesia", "Turkey", "Saudi Arabia", "South Africa", "Argentina"
    // 这里简化了国家列表，实际应用中可以扩展
];

export default function TableImportPage() {
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [formData, setFormData] = useState<FormDataType>(() => ({
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
    }));
    const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setData(null);
        setShowForm(false);
        try {       
            const response = await fetch('/api/feishu', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API请求失败: ${errorData.error?.message || '未知错误'}`);
            }
            const responseData = await response.json();
            if (responseData.error) {
                throw new Error(responseData.error);
            }
            
            let found = false;
            if (searchId.trim()) {
                // 检查API返回的数据结构
                if (!responseData.data || !responseData.data.items || !Array.isArray(responseData.data.items)) {
                    throw new Error('API返回的数据结构无效');
                }
                
                // 调试输出
                console.log('搜索ID:', searchId);
                console.log('所有记录ID:', 
                    responseData.data.items.map((item: { fields?: { '记录 ID'?: Array<{ text?: string }> } }) => item.fields?.['记录 ID']?.[0]?.text)
                );
            
                // 标准化比较
                found = responseData.data.items.some((item: { fields?: { '记录 ID'?: Array<{ text?: string }> } }) => {
                    const recordId = item.fields?.['记录 ID']?.[0]?.text?.trim().toLowerCase();
                    const isMatch = recordId === searchId.trim().toLowerCase();
                    console.log(`比较: ${recordId} === ${searchId.trim().toLowerCase()} -> ${isMatch}`);
                    return isMatch;
                });
            
                if (!found) {
                    throw new Error(`未找到ID为 "${searchId}" 的记录。可用ID: ${
                        responseData.data.items.map((item: { fields?: { '记录 ID'?: Array<{ text?: string }> } }) => item.fields?.['记录 ID']?.[0]?.text).filter(Boolean).join(', ')
                    }`);
                }
            } else {
                found = true; // 允许空搜索
            }
            
            setData(responseData);
            setError('数据获取成功');
            setShowForm(true); // 显示表单
            
            // 如果找到记录，可以预填充表单数据
            if (found && searchId.trim()) {
                const foundItem = responseData.data.items.find((item: { fields?: { '记录 ID'?: Array<{ text?: string }> } }) => {
                    const recordId = item.fields?.['记录 ID']?.[0]?.text?.trim().toLowerCase();
                    return recordId === searchId.trim().toLowerCase();
                });
                
                if (foundItem && foundItem.fields) {
                    // 这里可以根据实际数据结构预填充表单
                    const newFormData = {...formData};
                    // 示例：如果字段存在则填充
                    if (foundItem.fields['姓名']?.[0]?.text) {
                        newFormData.name = foundItem.fields['姓名'][0].text;
                    }
                    if (foundItem.fields['学号']?.[0]?.text) {
                        newFormData.studentID = foundItem.fields['学号'][0].text;
                    }
                    // 更新表单数据
                    setFormData(newFormData);
                }
            }

        } catch (err: any) {
            setError(`搜索失败: ${err.message}`);
            setData(null);
        } finally {
            setLoading(false);
        }
    };
    
    // 加载模板列表
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const response = await fetch('/api/blob-templates');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTemplates(data);
            } catch (error) {
                console.error('Error loading templates:', error);
                setError('加载模板列表失败：' + (error instanceof Error ? error.message : '未知错误'));
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
            // 获取模板预览内容
            const response = await fetch(`/api/preview?path=${encodeURIComponent(templatePath)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '预览文件失败');
            }
            
            if (!data.html) {
                throw new Error('预览内容为空');
            }

            // 解析模板中的占位符 {变量名}
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
            
            // 创建表单字段
            const fields: FormField[] = Array.from(placeholders).map(placeholder => {
                return {
                    key: placeholder,
                    label: placeholder.replace(/_en$/, '').replace(/_美元$/, ''),
                    type: placeholder.includes('Date') ? 'date' : 'text',
                    value: ''
                };
            });
            
            setFormFields(fields);
        } catch (error) {
            console.error('Error loading template preview:', error);
            setError('加载模板预览失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
            setLoading(false);
        }
    };
    
    // 处理表单字段变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    // 格式化日期
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const day = String(date.getDate()).padStart(2, '0');
        return `${month} ${day}, ${year}`;
    };
    
    // 生成文档
    const generateDocument = async () => {
        if (!selectedTemplate) {
            setError('请先选择一个模板');
            return;
        }
        
        setIsGeneratingDocx(true);
        const formattedData: FormDataType & { templatePath: string } = {
            ...formData,
            issuanceDate: formatDate(formData.issuanceDate),
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
            templatePath: selectedTemplate
        };

        try {
            const response = await fetch("/api/generate_document", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            });
            const blob = await response.blob();
            saveAs(blob, "Lulab_invioce_" + formattedData.name + ".docx");
            setError('文档生成成功');
        } catch (error) {
            console.error("Error generating document:", error);
            setError('生成文档失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
            setIsGeneratingDocx(false);
        }
    };
    
    // 生成PDF
    const generatePdf = async () => {
        if (!selectedTemplate) {
            setError('请先选择一个模板');
            return;
        }
        
        setIsGeneratingPdf(true);
        const formattedData: FormDataType & { templatePath: string } = {
            ...formData,
            issuanceDate: formatDate(formData.issuanceDate),
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
            templatePath: selectedTemplate
        };

        try {
            const response = await fetch("/api/pdf_document", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            saveAs(blob, "Lulab_invioce_" + formattedData.name + ".pdf");
            setError('PDF生成成功');
        } catch (error) {
            console.error("Error generating PDF:", error);
            setError('生成PDF失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    const router = useRouter();

    useEffect(() => {
        // 检查用户是否已通过密码验证
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (isAuthenticated !== 'true') {
            router.push('/password');
        }
    }, [router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100 relative">
            <button
                onClick={() => router.push('/menu')}
                className="absolute top-8 left-8 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
            </button>
            <div className="w-full max-w-3xl space-y-6">
                <h1 className="text-3xl font-bold text-center mb-8">多维表格导入</h1>
                
                {/* 模板选择 */}
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
                                <option key={index} value={template.path}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ID搜索框 */}
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
                                >
                                    搜索
                                </button>
                            </div>
                            
                            {loading && <div className="text-center py-4">加载中...</div>}
                            {error && <div className={error.includes('成功') ? 'text-green-500 text-center py-2' : 'text-red-500 text-center py-2'}>{error}</div>}
                        </div>
                    )}
                    
                    {/* 表单部分 */}
                    {showForm && (
                        <div className="mt-6 space-y-6">
                            {/* 模板选择 */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">选择模板</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={handleTemplateChange}
                                    className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">-- 请选择模板 --</option>
                                    {templates.map((template: any, index: number) => (
                                        <option key={index} value={template.path}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* 表单字段 */}
                            {selectedTemplate && (
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
                                                            <option key={country} value={country}>
                                                                {country}
                                                            </option>
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
                                    
                                    {/* 生成文档按钮 */}
                                    <div className="mt-8 flex flex-col space-y-4">
                                        <button
                                            type="button"
                                            onClick={generateDocument}
                                            disabled={isGeneratingDocx || !selectedTemplate}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isGeneratingDocx || !selectedTemplate ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                                        >
                                            {isGeneratingDocx ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    生成中...
                                                </>
                                            ) : (
                                                "生成Word文档"
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generatePdf}
                                            disabled={isGeneratingPdf || !selectedTemplate}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isGeneratingPdf || !selectedTemplate ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                                        >
                                            {isGeneratingPdf ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    生成中...
                                                </>
                                            ) : (
                                                "生成PDF文档"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                    
                    {/* 原始数据显示 */}
                    {data && !showForm && (
                        <div className="p-4 bg-white rounded-lg shadow mt-4">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
'use client';

import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
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
    issuanceDate: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    name: string;
    studentID: string;
    programName: string;
    startDate: string;
    endDate: string;
    tuitionFeeUSD: string;
}

// 所有国家名称列表
const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
    "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia",
    "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
    "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
    "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
    "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
    "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
    "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
    "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
    "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe"
];

export default function HomeContent() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TemplateFile[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (isAuthenticated !== 'true') {
            router.push('/password');
        }
        loadTemplates();
    }, [router]);
    
    // 加载模板列表
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
            alert('加载模板列表失败：' + (error instanceof Error ? error.message : '未知错误'));
        }
    };
    
    // 处理模板选择变化
    const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templatePath = e.target.value;
        setSelectedTemplate(templatePath);
        
        if (!templatePath) {
            setFormFields([]);
            setFormData({
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
            return;
        }
        
        setIsLoading(true);
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

            // 解析模板中的占位符 {变量名}，排除CSS样式代码中的花括号
            // 移除HTML中的style标签内容，避免CSS样式代码干扰占位符识别
            const htmlWithoutStyles = data.html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            
            // 使用更精确的正则表达式，只匹配文本内容中的占位符
            // 避免匹配HTML标签属性和CSS样式中的花括号
            const placeholderRegex = /(?<!\w|\.|\-|:|;|\{|\}|\s)\{([^\}]+)\}(?!\w|\.|\-|:|;|\{|\}|\s)/g;
            const matches = htmlWithoutStyles.matchAll(placeholderRegex);
            const placeholders = new Set<string>();
            
            for (const match of matches) {
                // 验证占位符是否为有效的变量名
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
            
            // 初始化表单数据
            const initialData: FormDataType = {
                issuanceDate: "",
                address: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                name: "",
                studentID: "",
                programName: "Practical Training Club",
                startDate: "",
                endDate: "",
                tuitionFeeUSD: ""
            };
            fields.forEach(field => {
                initialData[field.key as keyof FormDataType] = '';
            });
            
            // 设置国家默认值为中国（如果存在）
            if (initialData.hasOwnProperty('country')) {
                initialData.country = 'China';
            }
            
            setFormData(initialData as FormDataType);
        } catch (error) {
            console.error('Error loading template preview:', error);
            alert('加载模板预览失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
            setIsLoading(false);
        }
    };
    const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [formData, setFormData] = useState<FormDataType>(() => ({
        name: "",                     // 姓名
        country: "China",             // 国家，默认值
        state: "",                    // 省份
        city: "",                     // 城市
        postalCode: "",               // 邮编
        address: "",                  // 详细地址
        studentID: "",                // 学生学号
        programName: "Practical Training Club",  // 项目名称
        issuanceDate: "",             // 发放时间
        startDate: "",                // 开始时间
        endDate: "",                  // 结束时间
        tuitionFeeUSD: "",            // 实际价格（美元）
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
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
            alert('请先选择一个模板');
            return;
        }
        
        setIsGeneratingDocx(true); // 禁用按钮
        const formattedData: FormDataType & { templatePath: string } = {
            ...formData,
            issuanceDate: formatDate(formData.issuanceDate),
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
            templatePath: selectedTemplate // 添加选中的模板路径
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
        } catch (error) {
            console.error("Error generating document:", error);
        } finally {
            setIsGeneratingDocx(false); // 重新启用按钮
        }
    };
    const generatePdf = async () => {
        if (!selectedTemplate) {
            alert('请先选择一个模板');
            return;
        }
        
        setIsGeneratingPdf(true); // 禁用按钮
        const formattedData: FormDataType & { templatePath: string } = {
            ...formData,
            issuanceDate: formatDate(formData.issuanceDate),
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
            templatePath: selectedTemplate // 添加选中的模板路径
        };

        try {
            console.log("Sending request to /api/pdf_document with data:", formattedData);
            const response = await fetch("/api/pdf_document", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`Failed to generate PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            saveAs(blob, "Lulab_invioce_" + formattedData.name + ".pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false); // 重新启用按钮
        }
    };
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
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
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Generate Admission Offer Letter</h1>
                
                {/* 模板选择 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">选择模板</label>
                    <select
                        value={selectedTemplate}
                        onChange={handleTemplateChange}
                        className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">-- 请选择模板 --</option>
                        {templates.map((template, index) => (
                            <option key={index} value={template.path}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <form className="space-y-6 bg-white rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedTemplate ? (
                    formFields.map((field) => (
                        <div key={field.key} className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {field.label.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            {field.key === "country" ? (
                                <select
                                    name={field.key}
                                    value={formData[field.key as keyof FormDataType] || ''}
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
                                    value={(formData as unknown as Record<string, string>)[field.key] || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-4 text-gray-500">
                        请先选择一个模板
                    </div>
                )}
                        </div>
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
                                        Generating...
                                    </>
                                ) : (
                                    "docx Document"
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
                                        Generating...
                                    </>
                                ) : (
                                    "PDF Document"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

import { saveAs } from "file-saver";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

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

export default function SecondPageContent() {
    const router = useRouter();
    // 添加新的状态
    const [isValidId, setIsValidId] = useState(false);
    const [searchResult, setSearchResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [searchId, setSearchId] = useState("");
    const [idExists, setIdExists] = useState<boolean | null>(null);
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
        tuitionFeeUSD: "",
    });

    // 从 homeContent.tsx 复制所有函数的实现
    const handleIdSearch = async (id: string) => {
        if (!id.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`/api/cache?id=${encodeURIComponent(id)}`);
            const data = await response.json();
            setIdExists(data.data.items.length > 0);
        } catch (error) {
            console.error('Error searching ID:', error);
            setIdExists(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'searchId') {
            setSearchId(value);
            setIsValidId(false); // 输入新ID时重置验证状态
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const generateDocument = async () => {
        setIsGeneratingDocx(true);
        const formattedData = {
            ...formData,
            issuanceDate: formatDate(formData.issuanceDate),
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
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
            setIsGeneratingDocx(false);
        }
    };

    const generatePdf = async () => {
        setIsGeneratingPdf(true);
        const formattedData = {
            ...formData,
            issuanceDate: formatDate(formData.issuanceDate),
            startDate: formatDate(formData.startDate),
            endDate: formatDate(formData.endDate),
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
                throw new Error("Failed to generate PDF");
            }
    
            const blob = await response.blob();
            saveAs(blob, "Lulab_invioce_" + formattedData.name + ".pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleSearch = async () => {
        if (!searchId.trim()) {
            alert("请输入要搜索的ID");
            return;
        }
    
        setIsSearching(true);
        try {
            const response = await fetch(`/api/cache?id=${searchId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            const data = await response.json();
            console.log('缓存数据:', data);
            
            if (data && data.data && data.data.items && data.data.items[0]) {
                const fields = data.data.items[0].fields;
                const name = fields.Name && fields.Name[0] ? fields.Name[0].en_name : "";
                
                setFormData({
                    ...formData,
                    name: name,
                    country: fields.country === "新西兰" ? "New Zealand" : (fields.Country || "China"),
                    state: fields.State || "",
                    city: fields.City || "",
                    postalCode: fields["Postal Code"] || "",
                    address: fields.Address || "",
                    studentID: fields.ID || "",
                    programName: fields.ProgramName || "Practical Training Club",
                    issuanceDate: fields.IssuanceDate || "",
                    startDate: fields.StartDate || "",
                    endDate: fields.EndDate || "",
                    tuitionFeeUSD: fields.TuitionFeeUSD || "",
                });
                setSearchResult({ success: true, message: 'ID正确' });
                setIsValidId(true); // 搜索成功时设置验证状态
            } else {
                setSearchResult({ success: false, message: 'ID错误' });
                setIsValidId(false);
            }
        } catch (error) {
            console.error("搜索错误:", error);
            setSearchResult({ success: false, message: '搜索失败，请稍后重试' });
        } finally {
            setIsSearching(false);
            setTimeout(() => {
                setSearchResult(null);
            }, 3000);
        }
    };

    return (
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Arial, sans-serif", marginTop: "2rem" }}>
            <h1 style={{ fontSize: "2rem", color: "#333", marginBottom: "1rem" }}>Generate Admission Offer Letter - Page 2</h1>
            
            {/* 删除返回按钮部分 */}
            
            {/* 搜索部分保持原大小 */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", width: "500px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="text"
                        name="searchId"
                        value={searchId}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        placeholder="Enter ID to search"
                        style={{
                            padding: "0.5rem",
                            borderRadius: "4px",
                            border: `1px solid ${searchResult ? (searchResult.success ? '#4CAF50' : '#f44336') : '#ccc'}`,
                            fontSize: "1rem",
                            width: "100%"
                        }}
                    />
                    {searchResult && (
                        <div style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            marginTop: "4px",
                            fontSize: "0.875rem",
                            color: searchResult.success ? '#4CAF50' : '#f44336'
                        }}>
                            {searchResult.message}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: isSearching ? "#ccc" : "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isSearching ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        minWidth: "80px",
                    }}
                >
                    {isSearching ? (
                        <span style={{
                            display: "inline-block",
                            animation: "dotAnimation 1.4s infinite"
                        }}>
                            搜索中...
                        </span>
                    ) : "搜索"}
                </button>
            </div>

            {/* 修改表单容器样式，使其最小化 */}
            <form style={{ 
                maxWidth: "500px", 
                width: "100%", 
                display: "flex", 
                flexDirection: "column", 
                gap: "1rem",
                transform: "scale(0.1)",  // 缩小到原来的 10%
                transformOrigin: "top center",
                height: "10px",  // 设置一个很小的高度
                overflow: "hidden"  // 隐藏超出部分
            }}>
                {/* 表单字段部分保持不变，但会被缩小 */}
                {Object.keys(formData).map((key) => (
                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "bold", color: "#555" }}>{key}</label>
                        <input
                            type="text"
                            name={key}
                            value={(formData as any)[key]}
                            onChange={handleChange}
                            style={{
                                padding: "0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "1rem",
                                width: "100%",
                            }}
                        />
                    </div>
                ))}
            </form>

            {/* 生成文档按钮，添加禁用条件 */}
            <button
                type="button"
                onClick={generateDocument}
                disabled={isGeneratingDocx || !isValidId}
                style={{
                    padding: "0.75rem",
                    backgroundColor: (isGeneratingDocx || !isValidId) ? "#ccc" : "#0070f3",
                    color: "white",
                    fontSize: "1rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: (isGeneratingDocx || !searchResult?.success) ? "not-allowed" : "pointer",
                    marginTop: "1rem",
                    width: "200px"
                }}
            >
                {isGeneratingDocx ? "Generating..." : "Generate Document"}
            </button>
            <button
                type="button"
                onClick={generatePdf}
                disabled={isGeneratingPdf || !isValidId}
                style={{
                    padding: "0.75rem",
                    backgroundColor: isGeneratingPdf 
                        ? "#ccc" 
                        : !isValidId
                            ? "#ccc" 
                            : "#FFA500", // 当搜索成功时使用橙色
                    color: "white",
                    fontSize: "1rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: (isGeneratingPdf || !searchResult?.success) ? "not-allowed" : "pointer",
                    marginTop: "1rem",
                    width: "200px"
                }}
            >
                {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
            </button>
        </main>
    );
}

const styles = `
@keyframes dotAnimation {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
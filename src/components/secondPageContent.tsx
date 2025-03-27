'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAs } from 'file-saver';

export default function SecondPageContent() {
    const router = useRouter();
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isValidId, setIsValidId] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        state: '',
        city: '',
        postalCode: '',
        address: '',
        studentID: '',
        programName: '',
        issuanceDate: '',
        startDate: '',
        endDate: '',
        tuitionFeeUSD: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'searchId') {
            setSearchId(value);
            setIsValidId(false);
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
                setIsValidId(true);
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

            <form style={{ 
                maxWidth: "500px", 
                width: "100%", 
                display: "flex", 
                flexDirection: "column", 
                gap: "1rem",
                transform: "scale(0.1)",
                transformOrigin: "top center",
                height: "10px",
                overflow: "hidden"
            }}>
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
                            : "#FFA500",
                    color: "white",
                    fontSize: "1rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: (isGeneratingPdf || !searchResult?.success) ? "not-allowed" : "pointer",
                    marginTop: "1rem",
                    width: "200px"
                }}
            >
                {isGeneratingPdf ? "Generating..." : "PDF Document"}
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
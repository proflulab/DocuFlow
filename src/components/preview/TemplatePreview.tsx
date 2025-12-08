import React, { useEffect, useRef, useState } from 'react'
import * as docx from 'docx-preview'
import { Modal, Spin } from 'antd'

// PDF 预览组件
 interface PdfViewProps {
     fileInfo: string
 }
 
 const PdfView = (props: PdfViewProps) => {
     const { fileInfo } = props
     return (
         <div style={{ height: '100%', width: '100%' }}>
             <embed
                 src={fileInfo}
                 type="application/pdf"
                 width="100%"
                 height="100%"
             />
         </div>
     )
 }

// DocxView 组件用于渲染 docx 文档
interface DocxViewProps {
    fileInfo: string
}

const DocxView = (props: DocxViewProps) => {
    const { fileInfo } = props
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const docxContainerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(fileInfo)
                const data = await response.blob()
                const containerElement = docxContainerRef.current
                if (containerElement) {
                    docx.renderAsync(data, containerElement).then(() => {
                        console.info('docx: finished')
                        setIsLoading(false)
                    })
                }
            } catch (error) {
                setIsLoading(false)
                console.error('Error fetching or rendering document:', error)
            }
        }

        fetchData()
    }, [fileInfo])

    return (
        <div className="relative h-full">
            <div ref={docxContainerRef} className="h-full" />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <Spin size="large" />
                </div>
            )}
        </div>
    )
}

// TemplatePreview 组件用于模板预览弹窗
interface TemplatePreviewProps {
    visible: boolean
    onClose: () => void
    templateUrl: string
    templateName: string
}

const TemplatePreview = (props: TemplatePreviewProps) => {
    const { visible, onClose, templateUrl, templateName } = props

    // 判断文件类型 - 由于我们暂时使用原始DOCX文件，使用DOCX预览
    const isPdf = false; // 暂时使用DOCX预览，等PDF服务配置好后再切换

    return (
        <Modal
            title={`模板预览 - ${templateName}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            style={{ top: 65 }}
        >
            {templateUrl && (
                <div style={{ height: '800px', overflow: 'auto' }}>
                    {isPdf ? (
                        <PdfView fileInfo={templateUrl} />
                    ) : (
                        <DocxView fileInfo={templateUrl} />
                    )}
                </div>
            )}
        </Modal>
    )
}

export default TemplatePreview



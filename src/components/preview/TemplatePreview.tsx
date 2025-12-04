import React, { useEffect, useRef, useState } from 'react'
import * as docx from 'docx-preview'
import { Modal, Spin } from 'antd'

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
                const data = await response.arrayBuffer() // 更稳妥
                const containerElement = docxContainerRef.current
                if (containerElement) {
                    containerElement.innerHTML = ''

                    const options = {
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: false,
                        breakPages: true,
                        ignoreFonts: false,
                        renderHeaders: true,
                        renderFooters: true,
                        renderFootnotes: true,
                        renderEndnotes: true,
                        renderAltChunks: true,
                        className: 'docx-preview'
                    }

                    await docx.renderAsync(data, containerElement, undefined, options)
                    console.info('docx: finished')
                }
            } 
            catch (error) {
                console.error('Error fetching or rendering document:', error)
            } 
            
            finally {
                setIsLoading(false)
            }
        }
<<<<<<< HEAD:src/components/preview/TemplatePreview.tsx

=======
>>>>>>> 403ccb4 (feat: improve docx preview rendering):DocuFlow-main/src/components/preview/TemplatePreview.tsx
        fetchData()
    }, [fileInfo])


    return (
        <div className="relative h-full">
            <div ref={docxContainerRef} className="h-full docx-container" />
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
                    <DocxView fileInfo={templateUrl} />
                </div>
            )}
        </Modal>
    )
}

export default TemplatePreview



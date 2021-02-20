import React from 'react'
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'
import { heitiString } from './heiti.js'
import './pdf.less'

type DownloadStatus = 'begin' | 'finish'

interface PageSize {
    width: number
    height: number
}
const A4Size: PageSize = {
    width: 595,
    height: 841
}
const A5Size: PageSize = {
    width: 559,
    height: 794
}

type PDFSizeType = 'a4' | 'a5'

const getSize = (sizeType?: PDFSizeType) => {
    switch (sizeType) {
        case 'a4':
            return A4Size
        case 'a5':
            return A5Size
        default:
            return A4Size
    }
}

const useGeneratePDF = (props: {
    elementIds: string[]
    sizeType?: PDFSizeType
    titles?: string[]
    needHeader?: boolean
    needFooter?: boolean
    downloadCallback?: (status: DownloadStatus) => void
    padding?: {
        x: number
        y: {
            top: number
            bottom: number
            headerBottom: number
        }
    }
    renderPageHeader?: (pdf: jspdf, size: PageSize) => void
    renderPageFooter?: (pdf: jspdf, size: PageSize) => void
}) => {
    const {
        padding = {
            x: 20,
            y: {
                top: 15,
                bottom: 10,
                headerBottom: 5
            }
        }
    } = props
    const pageSize = getSize(props.sizeType)

    const acturalLength = (length: number, eleWidth: number) => {
        const pageSize = getSize(props.sizeType)
        return (pageSize.width - 2 * padding.x) / eleWidth * length
    }

    let remainOffsetTop = 0

    const pdfAddEle = async (pdf: jspdf, ele: HTMLElement, isHeader?: boolean, isFooter?: boolean): Promise<any> => {
        const headerEle = ele.parentElement.children[0] as HTMLElement
        const footerEle = ele.parentElement.children[ele.parentElement.children.length - 1] as HTMLElement

        const acturalOffsetTop = acturalLength(ele.offsetTop - ele.parentElement.offsetTop, ele.clientWidth)
        const actualEleHeight = acturalLength(ele.clientHeight, ele.clientWidth)

        let positionTop = 0

        if (isHeader) {
            positionTop = acturalOffsetTop
        } else if (isFooter) {
            positionTop = pageSize.height - (padding.y.top + padding.y.bottom) - ele.clientHeight
        } else {
            const headerBottom = acturalLength(headerEle.offsetTop - ele.parentElement.offsetTop, ele.clientWidth) + acturalLength(headerEle.clientHeight, headerEle.clientWidth)
            positionTop = acturalOffsetTop - (pdf.getNumberOfPages() - 1) * pageSize.height + headerBottom * ((props.needHeader ? pdf.getNumberOfPages() : 1) - 1) + remainOffsetTop
        }

        let totalHeight = positionTop + actualEleHeight + padding.y.top + padding.y.bottom
        if (totalHeight + (props.needFooter ? footerEle.clientHeight : 0) > pageSize.height && !isHeader && !isFooter) {
            if (props.needFooter) {
                await pdfAddEle(pdf, footerEle, false, true)
            }
            props.renderPageFooter && props.renderPageFooter(pdf, pageSize)
            props.renderPageHeader && props.renderPageHeader(pdf, pageSize)

            pdf.addPage()
            remainOffsetTop += pageSize.height - positionTop
            if (props.needHeader) {
                remainOffsetTop += padding.y.headerBottom
                await pdfAddEle(pdf, headerEle as HTMLElement, true)
            }
            await pdfAddEle(pdf, ele)
            
        } else {
            const canvas = await html2canvas(ele, {
                useCORS: true,
                scale: 2
            })
            const imgData = canvas.toDataURL('image/jpeg', 1.0)
            pdf.addImage(imgData, 'JPEG', padding.x, positionTop + padding.y.top, pageSize.width - 2 * padding.x, actualEleHeight)
        }
    }
    const makePDF = async (ele: HTMLElement) => {
        const pdf = new jspdf('p', 'pt', props.sizeType)
        pdf.addFileToVFS('heiti.ttf', heitiString)
        pdf.addFont('heiti.ttf', 'heiti', 'normal')
        pdf.setFont('heiti')
        remainOffsetTop = 0
        pdfAddEle(pdf, ele.children[0] as HTMLElement, true)
        props.renderPageFooter && props.renderPageFooter(pdf, pageSize)
        props.renderPageHeader && props.renderPageHeader(pdf, pageSize)

        for (let i = 0; i < ele.children.length; i++) {
            const childEle = ele.children[i] as HTMLElement
            if (i === 0) {
                continue
            }
            if (i === ele.children.length - 1) {
                break
            }
            await pdfAddEle(pdf, childEle)
        }
        await pdfAddEle(pdf, ele.children[ele.children.length - 1] as HTMLElement, false, true)
        props.renderPageHeader && props.renderPageHeader(pdf, pageSize)
        props.renderPageFooter && props.renderPageFooter(pdf, pageSize)

        return pdf
    }
    
    const makePDFs = async () => {
        const pdfs: jspdf[] = []
        for (let i = 0; i < props.elementIds.length; i++) {
            const ele = document.getElementById(props.elementIds[i])
            const pdf = await makePDF(ele)
            pdfs.push(pdf)
        }
        return pdfs
    }
    
    const _download = async () => {
        props.downloadCallback && props.downloadCallback('begin')
        try {
            const pdfs = await makePDFs()
            for (let i = 0; i < pdfs.length; i++) {
                const pdf = pdfs[i]
                const title = props.titles?.length > i ? props.titles[i] : '检验报告'
                pdf.save(title)
            }
        } catch (e) {
            console.log(e)
        } finally {
            props.downloadCallback && props.downloadCallback('finish')
        }
    }
    const _print = async () => {
        props.downloadCallback && props.downloadCallback('begin')
        try {
            const pdfs = await makePDFs()
            for (let i = 0; i < pdfs.length; i++) {
                const pdf = pdfs[i]
                const iframe = document.createElement('iframe')
                const url = URL.createObjectURL(pdf.output('blob'))
                iframe.src = url
                iframe.contentWindow.print()
            }
            
        } catch (e) {
            console.log(e)
        } finally {
            props.downloadCallback && props.downloadCallback('finish')

        }
    }
    return {
        download: _download,
        print: _print
    }
}

export default useGeneratePDF
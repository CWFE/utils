import React from 'react'
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'
import './pdf.less'
import axios from 'axios'

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
    width: 419.527,
    height: 595.275
}

export type PDFSizeType = 'a4' | 'a5'

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
    elementIds?: string[]
    sizeType?: PDFSizeType
    titles?: string[]
    needHeader?: boolean
    needFooter?: boolean
    separate?: boolean // 多pdf是否单独生成
    downloadCallback?: (status: DownloadStatus, pdfs?: jspdf[]) => void
    padding?: {
        x: number
        y: {
            top: number
            bottom: number
            headerBottom: number
        }
    }
    renderPageHeader?: (pdf: jspdf, currentPage: number) => void
    renderPageFooter?: (pdf: jspdf, currentPage: number) => void
}) => {
    const {
        padding = {
            x: 30,
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
    let currentPage = 1

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
            positionTop = acturalOffsetTop - (currentPage - 1) * pageSize.height + headerBottom * ((props.needHeader ? currentPage : 1) - 1) + remainOffsetTop
        }

        const totalHeight = positionTop + actualEleHeight + padding.y.top + padding.y.bottom
        if (totalHeight + (props.needFooter ? footerEle.clientHeight : 0) > pageSize.height && !isHeader && !isFooter) {
            if (props.needFooter) {
                await pdfAddEle(pdf, footerEle, false, true)
            }
            props.renderPageFooter && props.renderPageFooter(pdf, currentPage)
            props.renderPageHeader && props.renderPageHeader(pdf, currentPage)

            pdf.addPage()
            currentPage += 1
            remainOffsetTop += pageSize.height - positionTop
            if (props.needHeader) {
                remainOffsetTop += padding.y.headerBottom
                await pdfAddEle(pdf, headerEle as HTMLElement, true)
            }
            await pdfAddEle(pdf, ele)

        } else {
            const canvas = await html2canvas(ele, {
                useCORS: true,
                scale: 2,
            })
            const imgData = canvas.toDataURL('image/png', 1.0)
            pdf.addImage(imgData, 'PNG', padding.x, positionTop + padding.y.top, pageSize.width - 2 * padding.x, actualEleHeight)
        }
    }
    const makePDF = async (pdf: jspdf, ele: HTMLElement) => {
        currentPage = 1
        const { heitiString } = await import('./heiti')
        pdf.addFileToVFS('heiti.ttf', heitiString)
        pdf.addFont('heiti.ttf', 'heiti', 'normal')
        pdf.setFont('heiti')
        remainOffsetTop = 0
        await pdfAddEle(pdf, ele.children[0] as HTMLElement, true)
        props.renderPageFooter && props.renderPageFooter(pdf, currentPage)
        props.renderPageHeader && props.renderPageHeader(pdf, currentPage)

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
        props.renderPageHeader && props.renderPageHeader(pdf, currentPage)
        props.renderPageFooter && props.renderPageFooter(pdf, currentPage)

        return pdf
    }

    const makePDFs = async (ids?: string[]) => {
        const pdfs: jspdf[] = []
        let pdf: jspdf = new jspdf('p', 'pt', props.sizeType)
        const trueIds = ids || props.elementIds

        for (let i = 0; i < trueIds.length; i++) {
            if (props.separate) {
                pdf = new jspdf('p', 'pt', props.sizeType)
            }
            const ele = document.getElementById(trueIds[i])
            await makePDF(pdf, ele)
            if (i !== trueIds.length - 1 && !props.separate) {
                pdf.addPage()
            }
            if (props.separate) {
                pdfs.push(pdf)
            }
        }
        if (!props.separate) {
            pdfs.push(pdf)
        }
        return pdfs
    }

    const downloadUrl = async (url: string, title: string) => {
        const res = await axios.get(url, {
            responseType: 'blob'
        })
        let downloadElement: HTMLAnchorElement | null = document.createElement('a')
        downloadElement.href = URL.createObjectURL(res.data)
        downloadElement.download = title
        downloadElement.click()
        URL.revokeObjectURL(downloadElement.href)
        downloadElement = null
    }

    const _download = async (urls?: string[], ids?: string[]) => {
        if (urls?.length) {
            for (let i = 0; i < urls.length; i++) {
                const res = downloadUrl(urls[i], props.titles?.length > i ? props.titles[i] : '检验报告.pdf')
                
            }
            props.downloadCallback && props.downloadCallback('finish')
        } else {
            props.downloadCallback && props.downloadCallback('begin')
            let pdfs: jspdf[] = []
            try {
                pdfs = await makePDFs(ids)
                for (let i = 0; i < pdfs.length; i++) {
                    const pdf = pdfs[i]
                    const title = props.titles?.length > i ? props.titles[i] : '检验报告'
                    pdf.save(title)
                }
            } catch (e) {
                console.log(e)
            } finally {
                props.downloadCallback && props.downloadCallback('finish', pdfs)
            }
        }
    }
    const _print = async (urls?: string[], ids?: string[]) => {
        if (urls?.length) {
            for (const url of urls) {
                const w = window.open()
                const res = await axios.get(url, {
                    responseType: 'blob'
                })
                const iframe = document.createElement('iframe')
                iframe.hidden = true
                iframe.src = URL.createObjectURL(res.data)
                w.document.body.appendChild(iframe)
                iframe.contentWindow.print()
            }
        } else {
            props.downloadCallback && props.downloadCallback('begin')
            let pdfs: jspdf[] = []
            try {
                pdfs = await makePDFs(ids)

                for (let i = 0; i < pdfs.length; i++) {
                    const w = window.open()

                    const pdf = pdfs[i]
                    const iframe = document.createElement('iframe')
                    iframe.hidden = true
                    const url = URL.createObjectURL(pdf.output('blob'))
                    iframe.src = url
                    w.document.body.appendChild(iframe)
                    iframe.contentWindow.print()
                }

            } catch (e) {
                console.log(e)
            } finally {
                props.downloadCallback && props.downloadCallback('finish', pdfs)
            }
        }
    }
    const _getPDFs = async (ids?: string[]): Promise<jspdf[]> => {
        props.downloadCallback && props.downloadCallback('begin')
        try {
            const pdfs = await makePDFs(ids)
            return Promise.resolve(pdfs)
        } catch (e) {
            return Promise.resolve([])
        } finally {
            props.downloadCallback && props.downloadCallback('finish')
        }
    }
    return {
        download: _download,
        print: _print,
        getPDFs: _getPDFs
    }
}

export default useGeneratePDF
import jspdf from 'jspdf'
import '../static/pdf.less'
import axios from 'axios'
import * as htmlToImage from 'html-to-image'
import domToImage from 'dom-to-image'

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

type PDFAddEleProps = {
    pdf: jspdf,
    ele: HTMLElement,
    isHeader?: boolean,
    isFooter?: boolean
    isLast?: boolean // 是否为末位元素（除页尾，即是否为倒数第二个元素）
    inTable?: boolean
}
let currentTable: HTMLElement
let pageEle: HTMLElement
let headerEleBottom: number
let currentRepeat: number

export type PDFSizeType = 'a4' | 'a5'
export type PDFTransformPlugin = (pdfs: jspdf) => Promise<void>

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
    separate?: boolean // 多pdf是否单独生成
    downloadCallback?: (status: DownloadStatus, pdfs?: jspdf[]) => void
    padding?: {
        x: number
        y: {
            top: number
            bottom: number
        }
    }
    renderPageHeader?: (pdf: jspdf, currentPage: number) => void
    renderPageFooter?: (pdf: jspdf, currentPage: number) => void
    renderPageFooterHeight?: number,
    footerDisabled?: boolean // 禁止将页面末位元素当做footer渲染在每页底部
    tableClass?: string
    noStickyTableHeader?: boolean
}) => {
    const {
        padding = {
            x: 30,
            y: {
                top: 15,
                bottom: 10,
                headerBottom: 15
            }
        },
        renderPageFooterHeight = 15,
        tableClass = 'pdf-table'
    } = props
    const pageSize = getSize(props.sizeType)

    const acturalLength = (length: number) => {
        const pageSize = getSize(props.sizeType)
        return (pageSize.width - 2 * padding.x) / pageEle.clientWidth * length
    }

    let remainOffsetTop = 0
    let currentPage = 1

    const pdfAddEle = async (params: PDFAddEleProps): Promise<any> => {
        const {
            pdf,
            ele,
            isHeader = false,
            isFooter = false
        } = params
        const headerEle = pageEle.children[0] as HTMLElement
        const footerEle = pageEle.children[pageEle.children.length - 1] as HTMLElement
        const cPage = pdf.getCurrentPageInfo().pageNumber

        let acturalOffsetTop
        if (params.inTable) {
            const tableOffsetTop = currentTable.offsetTop - currentTable.parentElement.offsetTop + ele.offsetTop

            acturalOffsetTop = acturalLength(tableOffsetTop)
        } else {
            acturalOffsetTop = acturalLength(ele.offsetTop - ele.parentElement.offsetTop)
        }
        const actualEleHeight = acturalLength(ele?.clientHeight)

        let positionTop = 0

        if (isHeader) {
            positionTop = acturalOffsetTop
        } else if (isFooter) {
            positionTop = pageSize.height - (padding.y.top + padding.y.bottom) - actualEleHeight
            if (props.renderPageFooter) {
                positionTop -= renderPageFooterHeight
            }
        } else {
            const headerBottom = acturalLength(headerEle.offsetTop - pageEle.offsetTop) + acturalLength(headerEle?.clientHeight)
            positionTop = acturalOffsetTop - (currentPage - 1) * pageSize.height + headerBottom * (currentPage - 1) + remainOffsetTop
        }
        if (params.inTable && ele.nodeName === 'THEAD' && positionTop < 0) {
            positionTop = acturalLength(headerEle?.clientHeight) + headerEleBottom
        }

        if (actualEleHeight <= 0) {
            return
        }
        const tableHeader = currentTable?.querySelector('thead')

        if (params.inTable && ele.classList.contains(tableClass)) {
            const tableBody = currentTable.querySelector('tbody')
            if (tableHeader) {
                await pdfAddEle({
                    pdf: pdf,
                    ele: tableHeader,
                    inTable: true,
                    isLast: params.isLast
                })
            }
            for (let i = 0; i < tableBody.children.length; i ++) {
                const trEle = tableBody.children[i] as HTMLElement
                await pdfAddEle({
                    pdf: pdf,
                    ele: trEle,
                    inTable: true,
                    isLast: params.isLast
                })
            }
            return
        }
        let totalHeight = positionTop + actualEleHeight + padding.y.top + padding.y.bottom + headerEleBottom + padding.y.bottom
        if (!props.footerDisabled || params.isLast) {
            totalHeight += footerEle?.clientHeight
        }
        if (params.inTable && ele.nodeName === 'THEAD') {
            const firstBodyTr = currentTable.querySelector('tbody').querySelector('tr')
            totalHeight += acturalLength(firstBodyTr?.clientHeight)

            if (totalHeight > pageSize.height) {
                return
            }
        }
        
        const needSeperate = ele.classList.contains('pdf-seperator')
        if (needSeperate) {
            totalHeight = pageSize.height + 1
            ele.classList.remove('pdf-seperator')
        }

        if (
            !isHeader && !isFooter && totalHeight > pageSize.height
        ) {
            if (!props.footerDisabled) {
                await pdfAddEle({
                    pdf: pdf,
                    ele: footerEle,
                    isFooter: true
                })
            }
            props.renderPageFooter && props.renderPageFooter(pdf, currentPage)
            props.renderPageHeader && props.renderPageHeader(pdf, currentPage)
            currentPage += 1

            for (let i = 0; i < currentRepeat; i ++) {
                pdf.insertPage(cPage + currentPage * i + 1)
            }
            pdf.setPage(cPage + 1)

            remainOffsetTop += pageSize.height - positionTop
            remainOffsetTop += headerEleBottom
            await pdfAddEle({
                pdf: pdf,
                ele: headerEle,
                isHeader: true
            })
            if (params.inTable && tableHeader && !props.noStickyTableHeader) {
                pdfAddEle({
                    pdf,
                    ele: tableHeader,
                    inTable: true,
                    isLast: params.isLast
                })
                remainOffsetTop += acturalLength(tableHeader?.clientHeight)
            }
            await pdfAddEle({
                pdf: pdf,
                ele: ele,
                inTable: params.inTable
            })
            if (needSeperate) {
                ele.classList.add('pdf-seperator')
            }
        } else {
            // const canvas = await html2canvas(ele, {
            //     scale: 2
            // })
            // pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', padding.x, positionTop + padding.y.top, pageSize.width - 2 * padding.x, actualEleHeight)
            const chromeInfo = navigator.userAgent.match(/Chrome\/[\d]+/)?.[0]
            const version = chromeInfo ? parseInt(chromeInfo.split('/')?.[1]) : Number.MIN_SAFE_INTEGER
            let imgData: string
            if (version <= 49) {
                imgData = await domToImage.toSvg(ele, {
                    quality: 1
                })
            } else {
                imgData = await htmlToImage.toSvg(ele, {
                    quality: 1
                })
            }
            return new Promise(resolve => {
                const img = new Image()
                img.src = imgData
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width * 2
                    canvas.height = img.height * 2
                    canvas.style.transformOrigin = 'top left'
                    canvas.getContext('2d').fillStyle = '#fff'
                    canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height)
                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
                    // const a = document.createElement('a')
                    // a.download = canvas.toDataURL('png', 1)
                    // a.href = canvas.toDataURL('png', 1)

                    // a.click()
                    for (let i = 0; i < currentRepeat; i ++) {
                        pdf.setPage(cPage + (currentPage * i))
                        pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', padding.x, positionTop + padding.y.top, pageSize.width - 2 * padding.x, actualEleHeight)
                    }
                    pdf.setPage(cPage)

                    resolve(0)
                }
            })
        }
    }

    const makePDF = async (pdf: jspdf, ele: HTMLElement, plugins?: PDFTransformPlugin[]) => {
        currentPage = 1
        pageEle = ele

        const usePlugins = async () => {
            if (plugins?.length) {
                for (const plugin of plugins) {
                    await plugin(pdf)
                }
            }
        }

        const firstEle = ele.children?.[0] as HTMLElement
        const secondEle = ele.children?.[1] as HTMLElement
        if (!secondEle || !firstEle?.clientHeight) {
            headerEleBottom = 0
        } else {
            headerEleBottom = acturalLength(secondEle.offsetTop - firstEle.offsetTop - firstEle.offsetHeight)
        }
        remainOffsetTop = headerEleBottom
        const tasksParams: PDFAddEleProps[] = [{
            pdf: pdf,
            ele: ele.children[0] as HTMLElement,
            isHeader: true
        }]
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
            const params: PDFAddEleProps = {
                pdf: pdf,
                ele: childEle,
                isLast: i === ele.children.length - 2
            }
            if (childEle.classList.contains(tableClass)) {
                params.inTable = true
                currentTable = childEle
            }
            tasksParams.push(params)
        }
        tasksParams.push({
            pdf: pdf,
            ele: ele.children[ele.children.length - 1] as HTMLElement,
            isFooter: true
        })
        for (const t of tasksParams) {
            await pdfAddEle(t)
        }
        // await Promise.all(tasksParams.map(p => pdfAddEle(p)))

        props.renderPageHeader && props.renderPageHeader(pdf, currentPage)
        props.renderPageFooter && props.renderPageFooter(pdf, currentPage)

        await usePlugins()

        return pdf
    }

    const makePDFs = async (ids?: string[], plugins?: PDFTransformPlugin[][]) => {
        const pdfs: jspdf[] = []
        let pdf: jspdf = new jspdf('p', 'pt', props.sizeType)
        const { heitiString } = await import('../static/heiti')
        pdf.addFileToVFS('heiti.ttf', heitiString)
        pdf.addFont('heiti.ttf', 'heiti', 'normal')
        pdf.setFont('heiti')
        const trueIds = ids || props.elementIds


        for (let i = 0; i < trueIds.length; i++) {
            if (props.separate) {
                pdf = new jspdf('p', 'pt', props.sizeType)
                const { heitiString } = await import('../static/heiti')
                pdf.addFileToVFS('heiti.ttf', heitiString)
                pdf.addFont('heiti.ttf', 'heiti', 'normal')
                pdf.setFont('heiti')
            }
            const ele = document.getElementById(trueIds[i])
            currentRepeat = parseInt(ele.getAttribute('data-repeat') || '1')
            for (let i = 0; i < currentRepeat - 1; i ++) {
                pdf.addPage()
            }
            pdf.setPage(pdf.getNumberOfPages() - currentRepeat + 1)

            await makePDF(pdf, ele, plugins?.[i])

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

    const _download = async (urls?: string[], ids?: string[], plugins?: PDFTransformPlugin[][]) => {
        if (urls?.length) {
            for (let i = 0; i < urls.length; i++) {
                const res = downloadUrl(urls[i], props.titles?.length > i ? props.titles[i] : '检验报告.pdf')
            }
            props.downloadCallback && props.downloadCallback('finish')
        } else {
            props.downloadCallback && props.downloadCallback('begin')
            let pdfs: jspdf[] = []
            try {
                pdfs = await makePDFs(ids, plugins)
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
    const _print = async (urls?: string[], ids?: string[], plugins?: PDFTransformPlugin[][]) => {
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
                pdfs = await makePDFs(ids, plugins)

                for (let i = 0; i < pdfs.length; i++) {
                    const w = window.open()

                    const pdf = pdfs[i]
                    const iframe = document.createElement('iframe')
                    iframe.hidden = true
                    iframe.src = URL.createObjectURL(pdf.output('blob'))
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
    const _getPDFs = async (ids?: string[], plugins?: PDFTransformPlugin[][]): Promise<jspdf[]> => {
        props.downloadCallback && props.downloadCallback('begin')
        try {
            const pdfs = await makePDFs(ids, plugins)
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

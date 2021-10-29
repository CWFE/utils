/*
 * @Date: 2021-10-09 09:49:46
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-29 11:46:14
 * @Description: file content
 */

import jsPDF from "jspdf"
import { PDFTransformPlugin } from "../generatePDF"

type PDFWatermarkSettings = {
    density?: {
        x?: number
        y?: number
        xTransform?: ((idx: number) => number) | number
        yTransform?: ((idx: number) => number) | number
    }
    angle?: number
    color?: string
    fontSize?: number
    text: string
    opacity?: number
}

const PDFWatermarkPlugin = (settings: PDFWatermarkSettings) => async (pdf: jsPDF) => {
    const {
        density,
        angle = 45,
        color = '#ccc',
        fontSize = 15,
        opacity = 1
    } = settings
    const {
        x = 3,
        y = 6,
        xTransform = (idx) => idx % 2 ? -80 : 0,
        yTransform = 0
    } = density
    try {
        for (let p = 0; p < pdf.getNumberOfPages(); p ++) {
            pdf.setPage(p)
            pdf.saveGraphicsState()
            pdf.setGState(pdf.GState({
                opacity: 0.7
            }))
            console.log('123')
            for (let i = 0; i < x; i++) {
                
                for (let j = 0; j < y; j++) {
                    const xTrans = typeof xTransform === 'number' ? xTransform : xTransform(j)
                    const tx = (pdf.internal.pageSize.width / (x + 1)) * (i + 1) + xTrans
                    const yTrans = typeof yTransform === 'number' ? yTransform : yTransform(i)
                    const ty = (pdf.internal.pageSize.height / (y + 1)) * (j + 1) + yTrans
                    pdf
                        .setTextColor(color)
                        .setFontSize(fontSize)
                        .text(settings.text, tx, ty, {
                            angle: angle
                        })
                }
            }
            pdf.restoreGraphicsState()
        }

    } catch (e) {

    }
}

export default PDFWatermarkPlugin
/*
 * @Date: 2021-10-09 09:49:46
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-09 12:10:30
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
    color?: [number, number, number, number]
    fontSize?: number
    text: string
}

const PDFWatermarkPlugin = (settings: PDFWatermarkSettings) => async (pdf: jsPDF) => {
    const {
        density,
        angle = 45,
        color = [0, 0, 0, 0.7],
        fontSize = 15
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
            for (let i = 0; i < x; i++) {
                
                for (let j = 0; j < y; j++) {
                    const xTrans = typeof xTransform === 'number' ? xTransform : xTransform(j)
                    const tx = (pdf.internal.pageSize.width / (x + 1)) * (i + 1) + xTrans
                    const yTrans = typeof yTransform === 'number' ? yTransform : yTransform(i)
                    const ty = (pdf.internal.pageSize.height / (y + 1)) * (j + 1) + yTrans
                    pdf
                        .setTextColor(...color)
                        .setFontSize(fontSize)
                        .text(settings.text, tx, ty, {
                            angle: angle
                        })
                }
            }
        }

    } catch (e) {

    }
}

export default PDFWatermarkPlugin
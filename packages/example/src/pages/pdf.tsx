/*
 * @Date: 2021-10-08 16:58:19
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-11 09:51:27
 * @Description: file content
 */
import React from 'react'
import { PDFPreview } from '@cwfe/component'
import { range } from 'lodash-es'

const PdfExample = () => {
    return (
        <PDFPreview
            onCancel={ () => {
            } }
        >
            <div id="pdf">
                <div/>
                <div/>
                <div className='pdf-table py-4'>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className='children:(border-6px border-red-500 px-4 py-3)'>
                                <th>标题1</th>
                                <th>标题2</th>
                                <th>标题3</th>
                                <th>标题4</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                range(80).map((num) => {
                                    return <tr className='children:(border-6px border-red-500 px-4 py-3)' key={num}>
                                        <td>{ num + '-1' }</td>
                                        <td>{ num + '-2' }</td>
                                        <td>{ num + '-3' }</td>
                                        <td>{ num + '-4' }</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <footer>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur culpa, dignissimos dolorem doloremque dolores dolorum eaque esse impedit laborum minima minus neque qui quisquam quod rem repudiandae similique unde voluptatibus!
                </footer>
                <div />
            </div>
        </PDFPreview>
    )
}

export default PdfExample

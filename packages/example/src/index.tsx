/*
 * @Date: 2020-06-09 17:06:22
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-08 17:48:57
 * @Description: file content
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Link, Routes } from 'react-router-dom'
import 'antd/dist/antd.less'
import Home from './home'
import PdfExample from './pages/pdf'
import 'virtual:windi.css'

const App = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Home /> } />
                <Route path="/pdf" element={ <PdfExample /> } />
            </Routes>
        </BrowserRouter>
    )
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
)

/*
 * @Date: 2020-06-09 17:06:22
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-08 17:48:57
 * @Description: file content
 */

import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import Home from './home'
import PdfExample from './pages/pdf'

const App = () => {

    return (
        <BrowserRouter>
            <Switch>
                <Route path='/' exact>
                    <Home />
                </Route>


                <Route path='/pdf'>
                    <PdfExample />
                </Route>
            </Switch>
        </BrowserRouter>
    )
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
)

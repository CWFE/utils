/*
 * @Date: 2021-10-08 17:11:25
 * @Author: wang0122xl@163.com
 * @LastEditors: wang0122xl@163.com
 * @LastEditTime: 2021-10-08 18:22:10
 * @Description: file content
 */

import React from 'react'
import { Link, Route } from 'react-router-dom'

const Home = () => {
    return <>
        <nav>
            <ul>
                <li>
                    <Link to="/pdf">pdf</Link>
                </li>
                <li>ceshi</li>
            </ul>
        </nav>
    </>
}

export default Home

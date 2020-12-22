import { useState, useEffect } from 'react'
import Axios, { AxiosRequestConfig } from 'axios'
import { RequestInstance } from './request'
import { usePersistFn } from 'ahooks'

type UseRequestProps = {
    params: AxiosRequestConfig
    manual?: boolean,
    retry?: number,
    cancelCallback?: (e: Error) => void
}

export type RequestLoadData = (options?: AxiosRequestConfig, retryCount?: number) => Promise<unknown>

interface returnValue<T> {
    result?: T
    loadData: RequestLoadData
    msg: string
    loading: boolean
    err?: Error
    isCancel?: boolean
}

export function useRequest<T> ({
    params = { url: '', method: 'GET' },
    manual = false,
    retry = 0
}: UseRequestProps, depths?: unknown[], cancelCallback?: (e: Error) => void): returnValue<T> {
    const [result, setResult] = useState<T>()
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<Error>()
    const [msg, setMsg] = useState<string>('')

    const loadData = usePersistFn(async (options?: Partial<AxiosRequestConfig>, retryCount?: number) => {
        setLoading(true)
        const realParams: AxiosRequestConfig = Object.assign(options || {}, params)
        try {
            const { data, msg: resMsg } = await RequestInstance.request(realParams, retryCount)
            setLoading(false)
            setResult(data)
            setMsg(resMsg)
            setErr(undefined)
        } catch (e) {
            if (Axios.isCancel(e)) {
                cancelCallback && cancelCallback(e)
            } else {
                setLoading(false)
                setResult(undefined)
                setErr(new Error(e.message))
            }
        }
    })

    useEffect(() => {
        if (!manual) {
            loadData(undefined, retry)
        }
    }, depths || [])

    useEffect(() => {
        return () => {
            const key = RequestInstance.getCancelTokenKey(params)
            if (RequestInstance.cancelTokenSources[key]) {
                RequestInstance.cancelTokenSources[key]()
            }
        }
    }, [params])

    return {
        result: result,
        loadData: loadData,
        loading: loading,
        err: err,
        msg: msg
    }
}

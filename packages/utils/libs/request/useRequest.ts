import { useState, useEffect } from 'react'
import Axios from 'axios'
import { RequestInstance, UtilAxiosRequestConfig } from './request'
import { usePersistFn } from 'ahooks'

type UseRequestProps = {
    params: UtilAxiosRequestConfig
    manual?: boolean,
    retry?: number,
    cancelCallback?: (e: Error) => void
    // 设置是否继续抛出错误
    needError?: boolean
}

export type RequestLoadData<T> = (options?: Partial<UtilAxiosRequestConfig>, retryCount?: number) => Promise<T>

interface returnValue<T> {
    result?: T
    setResult: React.Dispatch<any>
    loadData: RequestLoadData<T>
    loading: boolean
    err?: Error
    isCancel?: boolean
}

export function useRequest<T> ({
    params = { url: '', method: 'GET' },
    manual = false,
    retry = 0,
    needError = false
}: UseRequestProps, depths?: unknown[], cancelCallback?: (e: Error) => void): returnValue<T> {
    const [result, setResult] = useState<T>()
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<Error>()

    const loadData = usePersistFn(async (options?: Partial<UtilAxiosRequestConfig>, retryCount?: number) => {
        setLoading(true)
        const realParams: UtilAxiosRequestConfig = Object.assign(options || {}, params || {})
        if (!realParams.url?.length) {
            return
        }
        try {
            const response = await RequestInstance.request<T>(realParams, retryCount)
            const {data} = response
            setLoading(false)
            setResult(data)
            setErr(undefined)
            if (Object.prototype.toString.call(data) === '[object Blob]') {
                return response
            }
            return data
        } catch (e) {
            setLoading(false)
            setResult(undefined)

            if (Axios.isCancel(e)) {
                cancelCallback && cancelCallback(e)
            } else {
                setErr(new Error(e.message))
                if (needError) {
                    throw e
                }
            }
        }
    }) as RequestLoadData<any>

    useEffect(() => {
        if (!manual) {
            loadData(undefined, retry)
        }
    }, depths || [])

    useEffect(() => {
        return () => {
            const key = RequestInstance.getCancelTokenKey(params)
            RequestInstance.cancelTokenSources[key]?.()
        }
    }, [RequestInstance.getCancelTokenKey(params)])

    return {
        result: result,
        setResult,
        loadData,
        loading: loading,
        err: err
    }
}

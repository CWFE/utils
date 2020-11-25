import Axios, { AxiosRequestConfig, Canceler } from 'axios'
import * as R from 'ramda'

class Request {
    public cancelTokenSources: {
        [url: string]: Canceler
    } = {}
    public getCancelTokenKey = (config: Readonly<AxiosRequestConfig>) => {
        return (config.method || 'GET')?.toUpperCase() + '?' + config.url as string + JSON.stringify(config.data) + JSON.stringify(config.params)
    }
    public request = async function AxiosRequest<T>(config: AxiosRequestConfig, retryCount?: number): Promise<any> {
        try {
            // 执行
            const response = await Axios(config)    
            return Promise.resolve(response)
        } catch (error) {
            if ((!retryCount || retryCount <= 0) || Axios.isCancel(error)) {
                return Promise.reject(error)
            } else {
                return await AxiosRequest(config, retryCount - 1)
            }
        } finally {
            this.cancelTokenSources = R.omit([this.getCancelTokenKey(config)], this.cancelTokenSources)
        }
    }

    constructor () {
        Axios.interceptors.request.use(config => {
            // 判断缓存中是否有相同请求
            const cancelTokenKey = this.getCancelTokenKey(config)
            if (this.cancelTokenSources[cancelTokenKey]) {
                this.cancelTokenSources[cancelTokenKey]()
            }
            config.cancelToken = config.cancelToken || new Axios.CancelToken(c => {
                this.cancelTokenSources[cancelTokenKey] = c
            })
            return Promise.resolve(config)
        }, error => {
            return Promise.reject(error)
        })
    }
}

export const RequestInstance = new Request()
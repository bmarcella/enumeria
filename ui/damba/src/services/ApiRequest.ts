import ApiService from './ApiService'

export const ApiPost = <T>(url: string, data: T) => {
    return ApiService.fetchDataWithAxios({
        url: url,
        method: 'post',
        data: data,
    })
}

export const ApiGet = (url: string) => {
    return ApiService.fetchDataWithAxios({
        url: url,
        method: 'get',
    })
}

export const ApiDelete = (url: string) => {
    return ApiService.fetchDataWithAxios({
        url: url,
        method: 'delete',
    })
}

export const ApiPatch = <T>(url: string, data: T) => {
    return ApiService.fetchDataWithAxios({
        url: url,
        method: 'patch',
        data: data,
    })
}

export const ApiPut = <T>(url: string, data: T) => {
    return ApiService.fetchDataWithAxios({
        url: url,
        method: 'put',
        data: data,
    })
}

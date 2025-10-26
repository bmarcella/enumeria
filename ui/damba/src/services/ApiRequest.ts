import ApiService from "./ApiService"

export const ApiPost = <T> (url: string, data: T ) => {
     return ApiService.fetchDataWithAxios({
      url: url,
      method: 'post',
      data: data
   })
}

export const ApiGet = (url: string ) => {
     return ApiService.fetchDataWithAxios({
      url: url,
      method: 'get'
   })
}
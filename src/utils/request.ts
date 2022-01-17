/* eslint-disable @typescript-eslint/ban-types */
import { HEADER, HEADERPARAMS, TOKENNAME, HTTP_REQUEST_URL } from '@/config/app'
import { store } from '@/store'
import Cache from '@/utils/cache'
import { urlEncode } from '@/utils/util'
type RequestOptionsMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'
type RequestOptionsMethodAll = RequestOptionsMethod | Lowercase<RequestOptionsMethod>

/**
 * 发送请求
 */
function baseRequest(
  url: string,
  method: RequestOptionsMethod,
  data = {},
  { noAuth = false, noVerify = false }: any,
  params: unknown
) {
  const token = store.state.app.token
  const Url = HTTP_REQUEST_URL
  let header = JSON.parse(JSON.stringify(HEADER))
  if (params != undefined) {
    header = HEADERPARAMS
  }

  if (!noAuth) {
    if (!token) {
      return Promise.reject({
        msg: '未登录',
      })
    }
    if (token && token !== 'null') header[TOKENNAME] = 'Bearer ' + token
  }
  console.log('method', method)
  //   if (method === 'POST') {
  data['comefrom'] = 'wxapp'
  data['openid'] = 'sns_wa_' + Cache.get('openid')
  data['mid'] = ''
  data['merchid'] = ''
  data['authkey'] = Cache.get('authkey')
  //   }
  if (params != undefined) {
    data = urlEncode(data)
  }
  return new Promise((reslove, reject) => {
    uni.showLoading({
      title: '加载中',
      mask: true,
    })
    uni.request({
      url: Url + url + `&timestamp=${+(+new Date())}`,
      method: method || 'GET',
      header: header,
      data: data || {},
      success: (res: any) => {
        console.log('res', res)
        uni.hideLoading()
        res.data.token &&
          res.data.token !== 'null' &&
          store.commit('LOGIN', {
            token: res.data.token,
          })
        if (noVerify) {
          reslove(res)
        } else if (res.statusCode === 200) {
          Cache.set('authkey', res.data.authkey || '')
          reslove(res.data)
        } else {
          reject(res.data.message || '系统错误')
        }
      },
      fail: (msg) => {
        uni.hideLoading()
        reject('请求失败')
      },
    })
  })
}

// const request: Request = {}
const requestOptions: RequestOptionsMethodAll[] = [
  'options',
  'get',
  'post',
  'put',
  'head',
  'delete',
  'trace',
  'connect',
]
type Methods = typeof requestOptions[number]
const request: { [key in Methods]?: Function } = {}

requestOptions.forEach((method) => {
  const m = method.toUpperCase() as unknown as RequestOptionsMethod
  request[method] = (api, data, opt, params) => baseRequest(api, m, data, opt || {}, params)
})

export default request

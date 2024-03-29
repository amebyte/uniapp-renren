import request from '@/utils/request'

/**
 * 用户登录 - 微信/H5/
 * @param data object
 *
 *	loginType: xcx 小程序 h5 phone
 *	smsCode
 */
export function fetchLogin(data) {
  return request.post!('&r=wxapp.login', data, { noAuth: true }, true)
}

export function fetchAuth(data) {
  return request.get!('&r=wxapp.auth', data, { noAuth: true })
}

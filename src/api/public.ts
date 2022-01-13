import request from '@/utils/request'

/**
 * 用户登录 - 微信/H5/
 * @param data object
 *
 *	loginType: xcx 小程序 h5 phone
 *	smsCode
 */
export function fetchLogin(data) {
  return request?.post?.('/login', data, { noAuth: true })
}

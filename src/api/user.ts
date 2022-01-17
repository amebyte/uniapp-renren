import request from '@/utils/request.js'

/**
 * 获取用户信息
 *
 */
export function fetchUserInfo() {
  return request.get!('&r=member', {}, { noAuth: true })
}

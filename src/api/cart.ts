import request from '@/utils/request'

/**
 * 购物车列表
 *
 */
export function fetchCartList() {
  return request.get!('&r=member.cart.get_cart', {}, { noAuth: true })
}

/**
 * 添加购物车
 *
 */
export function fetchAddCart(data) {
  return request.post!('&r=member.cart.add', data, { noAuth: true }, true)
}

/**
 * 更新购物车
 *
 */
export function fetchUpdateCart(data) {
  return request.get!(
    '&r=goods.get_list&page=1&comefrom=wxapp&openid=sns_wa_&mid=&merchid=&authkey=&timestamp=1642046054349',
    data,
    { noAuth: true }
  )
}

/**
 * 删除购物车
 *
 */
export function fetchDeleteCart(data) {
  return request.get!(
    '&r=goods.get_list&page=1&comefrom=wxapp&openid=sns_wa_&mid=&merchid=&authkey=&timestamp=1642046054349',
    data,
    { noAuth: true }
  )
}

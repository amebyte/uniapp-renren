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
  return request.post!('&r=member.cart.update', data, { noAuth: true }, true)
}

/**
 * 删除购物车
 *
 */
export function fetchDeleteCart(data) {
  return request.post!('&r=member.cart.remove', data, { noAuth: true }, true)
}

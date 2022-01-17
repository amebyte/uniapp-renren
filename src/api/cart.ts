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
  const params = {
    id: data.id,
    total: data.cartNum,
    optionid: data.skuId,
  }
  return request.post!('&r=member.cart.add', params, { noAuth: true }, true)
}

/**
 * 更新购物车
 *
 */
export function fetchUpdateCart(data) {
  const params = {
    id: data.id,
    total: data.cartNum,
    skuId: data.skuId,
  }
  return request.post!('&r=member.cart.update', params, { noAuth: true }, true)
}

/**
 * 删除购物车
 *
 */
export function fetchDeleteCart(data) {
  const params = { ids: data }
  console.log('params', params)
  return request.post!('&r=member.cart.remove', params, { noAuth: true }, true)
}

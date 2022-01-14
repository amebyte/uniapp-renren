import request from '@/utils/request'

/**
 * 精选课程
 *
 */
export function fetchRecommendGoodsList(data) {
  return request.get!(
    '&r=goods.get_list&page=1&comefrom=wxapp&openid=sns_wa_&mid=&merchid=&authkey=&timestamp=1642046054349',
    data,
    { noAuth: true }
  )
}

/**
 * 商品列表
 *
 */
export function fetchGoodsList(data) {
  return request.get!('/product/recommend', data, { noAuth: true })
}

/**
 * 商品详情
 *
 */
export function fetchGoodsDetail(data) {
  return request.get!('&r=goods.get_detail', data, { noAuth: true })
}

/**
 * 商品属性
 *
 */
export function fetchGoodsPicker(data) {
  return request.get!('&r=goods.get_picker', data, { noAuth: true })
}

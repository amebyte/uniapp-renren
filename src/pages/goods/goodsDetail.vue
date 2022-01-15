<template>
  <view class="container">
    <!--轮播图 start-->
    <ProductDetailSwiper :img-urls="sliderImage" :videoline="goodsInfo.videoLink" />
    <!--轮播图 end-->
    <!--商品信息 start-->
    <goodsInfo :goods-info="goodsInfo" @openShare="openShare" />
    <!--商品信息 end-->
    <!--课程信息 start-->
    <GoodsCurriculum />
    <!--课程信息 end-->
    <!--老师信息 start-->
    <GoodsTeacher />
    <!--老师信息 end-->
    <!--商品详情 start-->
    <GoodsContent :goods-info="goodsInfo" />
    <!--商品详情 end-->
    <!--底部导航栏 start-->
    <DetailFooterBar ref="detailFooterBarRef" @setIsOpenAttrWindow="setIsOpenAttrWindow" />
    <!--底部导航栏 end-->
    <!--规格属性 start-->
    <AttrWindow
      id="attr-window"
      :attr="attr"
      :attr-txt="attrTxt"
      :i-splus="1"
      :i-scart="1"
      @closeWindow="closeWindow"
      @changeCartNum="changeCartNum"
      @selectAttrVal="selectAttrVal"
      @iptCartNum="iptCartNum"
      @confirm="confirm"
    />
    <!--规格属性 end-->
  </view>
</template>
<script lang="ts">
import { onPageScroll, onLoad, onShow, onHide, onReachBottom } from '@dcloudio/uni-app'
import { ref, getCurrentInstance, reactive, toRef, computed, defineComponent, toRefs } from 'vue'
import ProductDetailSwiper from '@/components/product-detail-swiper/index.vue'
import AttrWindow from '@/components/attr-window/index.vue'
import GoodsInfo from './components/GoodsInfo.vue'
import GoodsContent from './components/GoodsContent.vue'
import DetailFooterBar from './components/DetailFooterBar.vue'
import GoodsCurriculum from './components/GoodsCurriculum.vue'
import GoodsTeacher from './components/GoodsTeacher.vue'
import { fetchGoodsDetail, fetchGoodsPicker } from '@/api/goods'
import { minHeap } from '@/utils/util'
export default defineComponent({
  name: 'GoodsDetail',
  components: {
    ProductDetailSwiper,
    AttrWindow,
    GoodsInfo,
    GoodsContent,
    DetailFooterBar,
    GoodsCurriculum,
    GoodsTeacher,
  },
  setup() {
    let state = reactive({
      productId: '33',
      goodsInfo: {} as any,
      sliderImage: [],
      attr: {
        isOpenAttrWindow: false, // 是否打开属性面板
        productAttr: [],
        productSelect: {},
      } as any,
      isBuyNow: false,
      cart_num: 0,
      attrValue: '',
      attrTxt: '请选择',
    })
    const detailFooterBarRef = ref(null)
    const getGoodsDetail = () => {
      fetchGoodsDetail({ id: state.productId })
        .then((r) => {
          console.log('r', r)
          state.goodsInfo = normalizeGoodsInfo(r.goods)
          state.sliderImage = state.goodsInfo.sliderImage
          state.goodsInfo.content = state.goodsInfo.content.replace(
            /<img/gi,
            "<img class='richImg' style='width:auto!important;height:auto!important;max-height:100%;width:100%;'"
          )
          state.goodsInfo.content = state.goodsInfo.content.replace(/&nbsp;/g, '&ensp;')
        })
        .catch((err) => console.log('err', err))
    }

    const getGoodsPicker = () => {
      fetchGoodsPicker({ id: state.productId })
        .then((r) => {
          console.log('r', r)
          state.goodsInfo['goodsSkus'] = normalizeGoodsSkus(r.options)
          state.attr.productAttr = normalizeAttrs(r.specs)
          const minPrice = minHeap(r.options, 'marketprice')
          console.log('minPrice', minPrice)
          setDefaultAttrSelect(minPrice)
        })
        .catch((err) => console.log(err))
    }

    const normalizeGoodsInfo = (data) => {
      data['productName'] = data.title
      data['sliderImage'] = data.thumbs
      return data
    }

    const normalizeGoodsSkus = (data) => {
      return data.map((o) => {
        // 预售价
        o['presellPrice'] = o.presellprice
        // 现价/市场价
        o['marketPrice'] = o.marketprice
        // 原价
        o['productPrice'] = o.productprice
        // 成本价
        o['costPrice'] = o.costprice
        // 库存
        o['stock'] = o.stock
        o['skuUniqueIds'] = o.specs
        return o
      })
    }

    const normalizeAttrs = (skus) => {
      return skus.map((o) => {
        o['attrId'] = o.id
        o['attrName'] = o.title
        o['attrValues'] = o.items
        o.attrValues.map((val) => {
          val['isSelect'] = false
          val['val'] = val.title
          val['valId'] = val.id
          return val
        })
        return o
      })
    }

    /**
     * 设置默认选中属性
     * @param {Object} data
     */
    const setDefaultAttrSelect = (data) => {
      state.attr.productSelect.productName = state.goodsInfo.productName
      state.attr.productSelect.image = data.thumb || state.goodsInfo.thumb
      state.attr.productSelect.price = data.marketprice
      state.attr.productSelect.stock = data.stock
      state.attr.productSelect.limits = data.limits
      state.attr.productSelect.cart_num = 1
      state.attrValue = ''
      state.attrTxt = '请选择'

      if (data.properties) {
        const properties = JSON.parse(data.properties)
        Object.keys(properties).forEach((v) => {
          setAttrVal(properties[v], v)
        })
      }
    }

    /**
     * 设置是否打开属性面板
     */
    const setIsOpenAttrWindow = (flag) => {
      flag && getGoodsPicker()
      state.attr.isOpenAttrWindow = flag
    }

    /**
     * 设置是否立即购买
     */
    const setIsBuyNow = (flag) => {
      state.isBuyNow = flag
    }

    /**
     * 关闭属性面板回调事件
     *
     */
    const closeWindow = () => {
      setIsBuyNow(false)
      setIsOpenAttrWindow(false)
    }

    /**
     * 属性选中确认回调
     */
    const confirm = () => {
      //   const instance = getCurrentInstance() as any
      console.log('instance', detailFooterBarRef.value)
      const { buyNow, addCart, groupBuyingNow } = detailFooterBarRef.value as any
      setIsOpenAttrWindow(false)
      state.isBuyNow ? buyNow() : addCart()
      setIsBuyNow(false)
    }

    /**
     * 购物车数量加和数量减
     *
     */
    const changeCartNum = (changeValue) => {
      // changeValue:是否 加|减
      let stock = state.attr.productSelect.stock || 0
      let num = state.attr.productSelect
      if (changeValue) {
        num.cart_num++
        if (num.cart_num > stock) {
          state.attr.productSelect.cart_num = stock
          state.cart_num = stock
        }
      } else {
        num.cart_num--
        if (num.cart_num < 1) {
          state.attr.productSelect.cart_num = 1
          state.cart_num = 1
        }
      }
    }

    /**
     * 选中的SKU属性之后的操作
     *
     */
    const selectAttrVal = (attrval, attrid) => {
      setAttrVal(attrval, attrid)
      const skus = getSelectedAttrVal()
      state.attrTxt = createSelectedAttrTxt(skus)
      const goodsItem: any = createCartParam(skus)
      if (goodsItem) {
        if (goodsItem.selectedSku.thumb) state.attr.productSelect.image = goodsItem.selectedSku.thumb
        if (goodsItem.selectedSku.price) state.attr.productSelect.price = goodsItem.selectedSku.price
        if (goodsItem.selectedSku.stock) state.attr.productSelect.stock = goodsItem.selectedSku.stock
      }
    }

    /**
     * 创建购物车参数
     */
    const createCartParam = (skus) => {
      let goodsItem = {
        selectedSku: {},
      }

      const skuUniqueIds = createSkuUniqueIds(skus)
      state.goodsInfo.goodsSkus.forEach((o) => {
        if (o.skuUniqueIds === skuUniqueIds) {
          goodsItem['selectedSku'] = {
            thumb: createThumb(skus),
            stock: o.stock,
            price: o.marketPrice,
          }
        }
      })

      return goodsItem
    }

    const createSkuUniqueIds = (skus) => {
      const skuUniqueIds = skus.reduce((prev, curr) => `${prev}_${curr.valId}`, '')
      return skuUniqueIds.slice(1)
    }

    const createSelectedAttrTxt = (skus) => {
      const attrTxt = skus.reduce((prev, curr) => `${prev};${curr.val}`, '')
      return `已选择：${attrTxt.slice(1)}`
    }

    const createThumb = (skus) => {
      return skus.reduce((prev, curr) => {
        if (curr.thumb !== '') prev = curr.thumb
        return prev
      }, '')
    }

    /**
     * 设置选中的SKU属性
     *
     */
    const setAttrVal = (attrval, attrid) => {
      state.attr.productAttr = state.attr.productAttr.map((o) => {
        o.attrValues.map((v) => {
          if (attrval.val === v.val || attrval === v.val) {
            if (v.isSelect) {
              v.isSelect = false
            } else {
              v.isSelect = true
            }
          } else if (o.attrId === attrid) {
            v.isSelect = false
          }
          return v
        })
        return o
      })
    }

    /**
     * 获取已经选择的规格属性
     */
    const getSelectedAttrVal = () => {
      let skus: any[] = []
      state.attr.productAttr.forEach((o) => {
        o.attrValues.forEach((v) => {
          if (v.isSelect) {
            skus.push(v)
          }
        })
      })
      return skus
    }

    /**
     * 购物车手动填写
     *
     */
    const iptCartNum = (e) => {
      state.attr.productSelect.cart_num = e || 1
    }

    const openShare = () => {
      console.log('openShare')
    }
    onShow(() => {
      getGoodsDetail()
    })
    onLoad((options) => {
      //   state.productId = options.productId!
      console.log('options', options)
    })
    return {
      ...toRefs(state),
      detailFooterBarRef,
      setIsOpenAttrWindow,
      iptCartNum,
      changeCartNum,
      selectAttrVal,
      closeWindow,
      confirm,
      openShare,
    }
  },
})
</script>
<style lang="scss" scoped>
@import '@/static/css/variable.scss';
.container {
  background-color: $background-color;
}
</style>
<style lang="scss">
@import '@/static/css/variable.scss';
page {
  background-color: $background-color;
}
</style>

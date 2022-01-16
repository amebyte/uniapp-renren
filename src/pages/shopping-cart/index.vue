<template>
  <view class="shopping-car-wrap">
    <view class="toggle-edit" @click="toggleEdit">
      <text v-if="isEdit">完成</text>
      <text v-else>编辑</text>
    </view>
    <view v-if="isInit" class="list-wrap">
      <scroll-view scroll-y="true" scroll-with-animation="true" :style="'height:' + height + 'px;'">
        <view v-if="cartList.length === 0" class="empty">购物车为空</view>

        <view v-for="(parentItem, index) in cartList" :key="parentItem.shopId" class="cart-wrap">
          <!--店铺名称 start-->
          <view class="shop-bar">
            <block v-if="isEdit">
              <view
                class="check"
                :class="parentItem.deleteSelected ? 'selected' : ''"
                @click="selectGroupDelete(index)"
              >
                <image
                  v-if="parentItem.deleteSelected"
                  class="image"
                  mode="widthFix"
                  src="../../static/images/meviky/checked.svg"
                />
                <image v-else class="image" mode="widthFix" src="../../static/images/meviky/uncheck.svg" />
              </view>
            </block>
            <block v-else>
              <view class="check" :class="parentItem.selected ? 'selected' : ''" @click="selectGroup(index)">
                <image
                  v-if="parentItem.selected"
                  class="image"
                  mode="widthFix"
                  src="../../static/images/meviky/checked.svg"
                />
                <image v-else class="image" mode="widthFix" src="../../static/images/meviky/uncheck.svg" />
              </view>
            </block>
            <view class="shop-name">
              <text>{{ parentItem.shopName }} </text>
            </view>
          </view>
          <!--店铺名称 end-->
          <!--商品 start-->
          <view class="goods-wrap">
            <block v-for="childItem in parentItem.children" :key="childItem.id">
              <view class="item-wrapper">
                <moveBox
                  :index="childItem.id"
                  :move-name="moveName"
                  @changeMoveName="changeMoveName"
                  @action="deleteByMove"
                >
                  <view class="goods-item">
                    <!--check-box start-->
                    <block v-if="isEdit">
                      <view class="check" @click="selectGoodsDelete(childItem.id, index)">
                        <image
                          v-if="childItem.deleteSelected"
                          mode="widthFix"
                          src="../../static/images/meviky/checked.svg"
                          class="image"
                        />
                        <image v-else mode="widthFix" src="../../static/images/meviky/uncheck.svg" class="image" />
                      </view>
                    </block>
                    <block v-else>
                      <view class="check" @click="selectGoods(childItem.id, index)">
                        <image
                          v-if="childItem.selected"
                          mode="widthFix"
                          src="../../static/images/meviky/checked.svg"
                          class="image"
                        />
                        <image v-else mode="widthFix" src="../../static/images/meviky/uncheck.svg" class="image" />
                      </view>
                    </block>
                    <!--check-box end-->
                    <!--商品 start-->
                    <view class="goods-wrap">
                      <view class="pic-wrap">
                        <image class="image" mode="widthFix" lazy-load :src="childItem.productSkuVO.pic" />
                      </view>
                      <view class="goods-info-wrap">
                        <view class="goods-name">{{ childItem.productSkuVO.prodName }}</view>
                        <view class="sku-name">
                          <text class="txt">{{ childItem.productSkuVO.skuName }}</text>
                        </view>
                        <view class="actual-stocks">库存：{{ childItem.productSkuVO.actualStocks }} </view>
                        <view class="goods-price-wrap">
                          <block v-if="parentItem.internal">
                            <!--内购店价格-->
                            <view class="goods-price"> ￥{{ childItem.productSkuVO.internalPrice }}</view>
                          </block>
                          <block v-else>
                            <view class="goods-price"> ￥{{ childItem.productSkuVO.sellingPrice }}</view>
                          </block>
                          <view class="editor-number">
                            <view
                              class="action reduce"
                              :class="childItem.num === 1 ? 'disable-reduce-button' : ''"
                              @click="reduce(childItem)"
                            >
                              <text class="iconfont icon-minus-bold"></text>
                            </view>
                            <input
                              v-model="childItem.num"
                              class="number-input"
                              type="number"
                              @input="setCount(childItem)"
                            />
                            <view class="action add" @click="add(childItem)">
                              <text class="iconfont icon-add-bold"></text>
                            </view>
                          </view>
                        </view>
                      </view>
                    </view>
                    <!--商品 end-->
                  </view>
                </moveBox>
              </view>
            </block>
          </view>
          <!--商品 end-->
        </view>
      </scroll-view>
    </view>
    <view class="totalBar">
      <view class="sum"
        >合计：
        <text v-if="!isEdit" class="price">￥{{ selectedPriceTotal }}</text>
        <text v-else class="remove" :class="selectDeleteLength > 0 ? 'valid' : ''">{{ selectDeleteLength || 0 }}</text>
      </view>
      <view v-if="!isEdit" class="pay" :class="selectedPriceTotal === 0 ? 'remove' : ''" @click="toCreateOrder">
        去结算
      </view>
      <view v-else class="pay remove" :class="selectDeleteLength > 0 ? 'valid' : ''" @click="deleteAll">删除所选 </view>
    </view>
  </view>
</template>

<script lang="ts">
import { onPageScroll, onLoad, onShow, onHide, onReachBottom } from '@dcloudio/uni-app'
import { ref, getCurrentInstance, reactive, toRef, computed, defineComponent, toRefs } from 'vue'
import { useStore } from 'vuex'
import { fetchCartList, fetchUpdateCart, fetchDeleteCart } from '@/api/cart'
import moveBox from '@/components/move-box/index.vue'
import { Tips, Debounce } from '@/utils/util'

export default defineComponent({
  name: 'ShoppingCartPage',
  components: {
    moveBox,
  },
  setup() {
    const state = reactive({
      isEdit: false,
      height: 0,
      isInit: true,
      cartList: [] as any,
      moveName: null,
      selectedPriceTotal: 0, // 选中的商品总价
      selectedGoodsTotal: 0, // 选中的商品总数
      selectedGoodsItems: [] as any, // 选中的商品
      selectDeleteLength: 0,
      isDeleteSelectAll: false,
      isSelectAll: false,
    })
    /**
     * 滑动回调
     */
    const changeMoveName = (name) => {
      state.moveName = name
    }

    /**
     * 是否编辑购物车
     */
    const toggleEdit = () => {
      state.isEdit = !state.isEdit
      setCheckState()
    }

    /**
     * 切换编辑删除的时候清除所有checkbox的选中状态
     */
    const setCheckState = () => {
      let _this = this
      state.isSelectAll = false
      state.cartList.map((item, i) => {
        if (item.children) {
          item.selectedGoodsCount = 0
          item.deleteGoodsCount = 0
          item.selected = false
          item.deleteSelected = false
          item.children.map((litem) => {
            litem.selected = false
            litem.deleteSelected = false
          })
        }
      })
      setSelectNumber(state.cartList)
    }

    /**
     * 设置选中状态
     */
    const setSelectNumber = (cartList) => {
      if (!cartList) return
      let number = 0
      let deleteNumber = 0
      let cartItemLength = 0
      let total = 0
      let selectedGoods: any[] = []
      cartList.map((item) => {
        let isSelectedNum = 0
        if (item.children) {
          item.children.map((litem) => {
            cartItemLength++
            if (litem.selected) {
              number++
              total = total + litem.productSkuVO.sellingPrice * litem.num
              isSelectedNum++
              selectedGoods.push(litem)
            }
            if (litem.deleteSelected) {
              deleteNumber++
            }
          })
        }
        item.selected = isSelectedNum === item.children.length //设置分部是否全部选中
      })
      state.selectedGoodsTotal = number
      state.selectedGoodsItems = selectedGoods
      state.selectDeleteLength = deleteNumber
      state.selectedPriceTotal = total
      if (deleteNumber === cartItemLength && deleteNumber !== 0) {
        state.isDeleteSelectAll = true
      } else {
        state.isDeleteSelectAll = false
      }
      if (number === cartItemLength) {
        state.isSelectAll = true
      } else {
        state.isSelectAll = false
      }
    }

    /**
     * 选择和删除的时候公用的方法 更新group 的checkbox 状态
     */
    const updateGroupSelected = (index, method) => {
      if (method == 'add') {
        if (state.cartList[index].selectedGoodsCount === state.cartList[index].children.length) {
          state.cartList[index].selected = true
        } else {
          state.cartList[index].selected = false
        }
      } else {
        if (state.cartList[index].deleteGoodsCount === state.cartList[index].children.length) {
          state.cartList[index].deleteSelected = true
        } else {
          state.cartList[index].deleteSelected = false
        }
      }
    }

    /**
     * 选中店铺状态删除
     */
    const selectGroupDelete = (key) => {
      let parentDeleteSelected = true
      if (state.cartList[key].deleteSelected) {
        parentDeleteSelected = false
        state.cartList[key].deleteSelected = false
        state.cartList[key].deleteGoodsCount = 0
      } else {
        parentDeleteSelected = true
        state.cartList[key].deleteSelected = true
        state.cartList[key].deleteGoodsCount = state.cartList[key].children.length
      }
      state.cartList[key].children = state.cartList[key].children.map(function (i) {
        if (parentDeleteSelected) {
          i.deleteSelected = true
        } else {
          i.deleteSelected = false
        }
        return i
      }, parentDeleteSelected)
      setSelectNumber(state.cartList)
    }

    /**
     * 选中店铺状态添加
     */
    const selectGroup = (key) => {
      let currentParentSelected = false
      if (state.cartList[key].selected) {
        state.cartList[key].selected = false
        currentParentSelected = false
        state.cartList[key].selectedGoodsCount = 0
      } else {
        state.cartList[key].selected = true
        currentParentSelected = true
        state.cartList[key].selectedGoodsCount = state.cartList[key].children.length
      }
      //不同分部时全选修改
      state.cartList = state.cartList.map((v, index) => {
        v.children = v.children.map((i) => {
          if (index === key) {
            i.selected = currentParentSelected
          }
          return i
        })
        return v
      })
      setSelectNumber(state.cartList)
    }

    /**
     * 选中商品状态添加
     */
    const selectGoods = (cartid, parentIndex) => {
      //不同分部单选
      state.cartList = state.cartList.map((v, index) => {
        v.children = v.children.map((i) => {
          if (i.id === cartid) {
            if (i.selected) {
              i.selected = false
              if (state.cartList[parentIndex].selectedGoodsCount > 0) {
                state.cartList[parentIndex].selectedGoodsCount--
              }
            } else {
              i.selected = true
              state.cartList[parentIndex].selectedGoodsCount++
            }
          }
          return i
        })
        return v
      })

      updateGroupSelected(parentIndex, 'add')
      setSelectNumber(state.cartList)
    }

    /**
     * 选中商品状态删除
     */
    const selectGoodsDelete = (cartid, parentIndex) => {
      state.cartList[parentIndex].children = state.cartList[parentIndex].children.map((i) => {
        if (i.id === cartid) {
          if (i.deleteSelected) {
            i.deleteSelected = false
            if (state.cartList[parentIndex].deleteGoodsCount) {
              state.cartList[parentIndex].deleteGoodsCount--
            }
          } else {
            i.deleteSelected = true
            state.cartList[parentIndex].deleteGoodsCount++
          }
        }
        return i
      }, cartid)

      updateGroupSelected(parentIndex, 'delete')
      setSelectNumber(state.cartList)
    }

    /**
     * 底部删除全部
     */
    const deleteAll = () => {
      let params: any[] = []
      state.cartList.map((item) => {
        if (item.children) {
          item.deleteSelected = state.isDeleteSelectAll
          item.children.map((o) => {
            if (o.deleteSelected) {
              params.push(o.id)
            }
          })
        }
      })
      if (params.length == 0) {
        Tips({
          title: '请选择删除的商品',
        })
        return
      }
      deleteCart(params)
    }

    /**
     * 底部创建订单
     */
    const toCreateOrder = () => {
      if (state.selectedGoodsTotal === 0) {
        Tips({
          title: '请选择商品~',
        })
        return
      }

      let first = true
      let t: any[] = []
      state.selectedGoodsItems.forEach((o) => {
        if (first) {
          first = false
          t.push(o.productPageVO.deliveryMode)
        } else {
          if (t.includes(o.productPageVO.deliveryMode)) {
            t.push(o.productPageVO.deliveryMode)
          }
        }
      })

      if (t.length !== state.selectedGoodsTotal) {
        Tips({
          title: '不能同时选择自提和邮寄的商品~',
        })
        return
      }

      let internalFirst = true
      let t2: any[] = []
      state.selectedGoodsItems.forEach((o) => {
        if (internalFirst) {
          internalFirst = false
          t2.push(o.internal)
        } else {
          if (t2.includes(o.internal)) {
            t2.push(o.internal)
          }
        }
      })

      if (t2.length !== state.selectedGoodsTotal) {
        Tips({
          title: '不能同时选择普通商品和内购商品~',
        })
        return
      }
      const store = useStore()
      store.dispatch('saveSelectedGoods', state.selectedGoodsItems)
      console.log('toCreateOrder', state.selectedGoodsTotal)

      Tips('/pages/users/order/create?orderType=')
    }

    /**
     * 点击增加商品数量
     */
    const add = (item) => {
      item.num = parseInt(item.num) + 1
      const params = {
        id: item.id,
        num: item.num,
        skuId: item.productSkuVO.id,
      }
      updateCart(params)
    }

    /**
     * 点击减少商品数量
     */
    const reduce = (item) => {
      // 先判断当前的商品数量 是否已经是1
      if (Number(item.num) === 1) {
        return
      }
      item.num = parseInt(item.num) - 1
      const params = {
        id: item.id,
        num: item.num,
        skuId: item.productSkuVO.id,
      }
      updateCart(params)
    }

    /**
     * 购物车商品手动设置数量
     */
    const setCount = (item) => {
      console.log('setCount', item)
      const debounceFn = Debounce(() => {
        if (!item.num) {
          return
        }
        const count = Number(item.num)
        if (count <= 0) {
          return
        }
        const params = {
          id: item.id,
          num: count,
          skuId: item.productSkuVO.id,
        }
        updateCart(params)
      }, 100)

      debounceFn()
    }

    /**
     * 滑动删除商品
     */
    const deleteByMove = (cartid) => {
      const params = [cartid]
      deleteCart(params)
    }

    /**
     * 更新购物车
     */
    const updateCart = (params) => {
      fetchUpdateCart(params)
        .then((r) => {
          setSelectNumber(state.cartList)
        })
        .catch((err) => console.log(err))
    }

    /**
     * 删除购物车
     */
    const deleteCart = (params) => {
      uni.showModal({
        title: '温馨提示',
        content: '亲，您确定要删除吗',
        success(res) {
          if (res.confirm) {
            fetchDeleteCart(params)
              .then(() => {
                getCartList()
              })
              .catch((err) => console.log(err))
          }
        },
      })
    }

    /**
     * 获取购物车数据
     */
    const getCartList = () => {
      fetchCartList()
        .then((r) => {
          initCart(r.data)
        })
        .catch((err) => console.log(err))
    }

    const normalizeCart = (data) => {
      return data
    }

    /**
     * 购物车数据初始化
     */
    const initCart = (cartList) => {
      const cartsItemGroupData = normalizeCart(cartList)
      state.cartList = cartsItemGroupData
    }
    return {
      ...toRefs(state),
      toggleEdit,
      selectGroupDelete,
      deleteByMove,
      selectGoodsDelete,
      selectGroup,
      changeMoveName,
      selectGoods,
      reduce,
      setCount,
      add,
      toCreateOrder,
      deleteAll,
    }
  },
  onShow() {
    if (this.isLogin) {
      this.getCartList()
    }
  },
  onLoad() {
    const _this = this
    uni.getSystemInfo({
      success: function (res) {
        _this.height = res.windowHeight - 44 - 49 - 10
        console.log('res', res)
        //res.windowHeight:获取整个窗口高度为px，*2为rpx；98为头部占据的高度；
      },
    })
  },
})
</script>

<style lang="scss">
.shopping-car-wrap {
  .toggle-edit {
    padding: 0 26rpx;
    height: 88rpx;
    line-height: 88rpx;
    font-family: PingFangSC-Light;
    font-size: 13px;
    color: #e60012;
    text-align: right;
    background: #fff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  }

  .list-wrap {
    background-color: #f4f4f4;
    padding-top: 20rpx;

    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .cart-wrap {
      position: relative;
      margin-left: 20rpx;
      margin-right: 20rpx;
      border-radius: 10rpx;
      margin-bottom: 20rpx;
      background-color: #fff;

      .shop-bar {
        display: flex;
        padding: 26rpx 26rpx 26rpx 30rpx;
        align-items: center;

        // border-bottom: 1rpx solid #e8e8e8;

        .check {
          display: flex;
          justify-content: center;
          align-items: center;

          .image {
            width: 36rpx;
            height: 36rpx;
          }
        }

        .shop-name {
          padding-left: 20rpx;
          font-family: PingFangSC-Light;
          font-size: 26rpx;
          color: #000000;
          line-height: 26rpx;
        }
      }

      .goods-wrap {
        .item-wrapper {
          position: relative;
          overflow: hidden;
          padding: 8rpx 0;

          .goods-item {
            display: flex;
            flex-direction: row;
            padding: 20rpx 26rpx 20rpx 30rpx;

            .check {
              display: flex;
              justify-content: center;
              align-items: center;

              .image {
                width: 36rpx;
                height: 36rpx;
              }
            }

            .goods-wrap {
              flex: 1;
              display: flex;
              align-items: center;
              margin-left: 16rpx;

              .pic-wrap {
                flex: 0 0 160rpx;
                width: 160rpx;
                height: 160rpx;
                position: relative;
                background: #fff;
                overflow: hidden;

                .image {
                  width: 100%;
                  height: 100%;
                }
              }

              .goods-info-wrap {
                flex: 1;
                margin-left: 20rpx;

                .goods-name {
                  font-family: PingFangSC-Regular;
                  font-size: 28rpx;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                  overflow: hidden;
                  word-break: break-all;
                }

                .sku-name {
                  .txt {
                    background-color: #ccc;
                    border-radius: 10rpx;
                    font-size: 24rpx;
                    padding-left: 8rpx;
                    padding-right: 8rpx;
                  }
                }

                .actual-stocks {
                  font-size: 24rpx;
                  color: #666;
                }

                .goods-price-wrap {
                  display: flex;
                  flex-direction: row;
                  align-items: center;

                  .goods-price {
                    font-family: HelveticaNeue;
                    font-size: 32rpx;
                    color: #e60012;
                    flex: 1;
                    justify-content: flex-start;
                    text-align: left;
                  }

                  .editor-number {
                    margin-right: auto;
                    flex: 1;
                    justify-content: flex-end;
                    text-align: right;
                    display: flex;
                    flex-direction: row;
                    width: 190rpx;
                    height: 56rpx;
                    flex: 0 0 190rpx !important;

                    .action {
                      flex: 0 0 56rpx;
                      text-align: center;
                      font-size: 24rpx;
                      height: 56rpx;
                      line-height: 56rpx;
                      color: #999;
                    }

                    .number-input {
                      display: inline-block;
                      flex: 1;
                      height: 56rpx;
                      line-height: 56rpx;
                      text-align: center;
                      font-family: PingFangSC-Regular;
                      font-size: 28rpx;
                      color: #333;
                      background-color: #f7f7f7;
                      border-radius: 10rpx;
                    }
                  }
                }
              }
            }

            .delivery-mode {
              position: absolute;
              top: 0;
              right: 0;
              color: #fff;
              background-color: #ef505d;
              border-radius: 10rpx;
              padding-left: 10rpx;
              padding-right: 10rpx;
              font-size: 24rpx;
            }
          }
        }
      }
    }
  }

  .totalBar {
    z-index: 990;
    position: fixed;
    right: 0;
    width: 100%;
    height: 98rpx;
    background: #fff;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    padding: 0 20rpx;
    border-bottom: 1px solid rgba(218, 218, 218, 0.3);
    /* #ifdef H5 */
    bottom: 50px;
    /* #endif */
    /* #ifndef H5 */
    bottom: 0;
    bottom: calc(0rpx+ constant(safe-area-inset-bottom)); ///兼容 IOS<11.2/
    bottom: calc(0rpx + env(safe-area-inset-bottom)); ///兼容 IOS>11.2/
    /* #endif */

    .sum {
      flex: 1;
      font-family: PingFangSC-Regular;
      font-size: 28rpx;
      color: #666;
      padding: 0 20rpx 0 30rpx;

      .price {
        font-family: HelveticaNeue;
        font-size: 32rpx;
        color: #e60012;
      }
    }

    .pay {
      color: #fff;
      width: 114px;
      height: 41px;
      line-height: 41px;
      text-align: center;
      border-radius: 22px;
      font-size: 15px;

      background-image: linear-gradient(135deg, #59b3ff 0%, #1c87f0 100%);

      &.remove {
        background-color: #d1d1d1;
      }
    }
  }
}
</style>

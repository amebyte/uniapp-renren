<template>
  <view class="create-order-wrapper">
    <view class="top-bg"></view>
    <scroll-view scroll-y="true" scroll-with-animation="true" :style="'height:' + height + 'px;'" @scroll="scroll">
      <view class="container">
        <!--地址 start-->
        <view class="address-wrap">
          <view class="striped"></view>
          <!--邮寄到家 start-->
          <template v-if="currDeliveryType === transportMode.plain">
            <view v-if="userAddress" class="address-info">
              <image class="coordinates" src="../../../static/images/meviky/coordinates.svg" />
              <view class="content">
                <view class="top">
                  <view class="name">{{ userAddress.name }}</view>
                  <view class="phone">{{ userAddress.phoneNumber }}</view>
                </view>
                <view class="detail-address">
                  {{ userAddress.province }}{{ userAddress.city }}{{ userAddress.region }}{{ userAddress.street }}
                  {{ userAddress.detailAddress }}
                </view>
                <navigator url="/pages/users/address/addr-manage">
                  <view class="more"><i class="iconfont icon-edit"></i></view>
                </navigator>
              </view>
            </view>
            <view v-else class="empty-address" @click="toAddress">
              <view class="top">添加地址</view>
              <text class="txt-tips">（请用户尽量填写详细的收货地址）</text>
              <view class="edit-more"><i class="iconfont icon-edit"></i></view>
            </view>
          </template>
          <!--邮寄到家 end-->
        </view>
        <!--地址 end-->
        <!--购物车商品 start-->
        <view class="cart-goods-wrap">
          <block v-for="(item, index) in cartTree" :key="index">
            <view class="shop-name">{{ item.shopName || '' }}</view>
            <block v-for="childItem in item.children" :key="childItem.id">
              <view class="goods-item">
                <view class="photo">
                  <image class="image" :src="childItem.productSkuVO.pic" />
                </view>
                <view class="info">
                  <view class="name">
                    {{ childItem.productSkuVO.prodName }}
                  </view>
                  <view class="attr">
                    {{ childItem.productSkuVO.skuName }}
                  </view>
                  <view class="price">
                    <view class="l">
                      <block v-if="isPointsMode">
                        {{ childItem.productSkuVO.integral }} 积分
                        <block v-if="pointsMode === pointsExchangeMode.POINTS_AND_CASH">
                          + ￥{{ childItem.productSkuVO[priceKey] }}
                        </block>
                      </block>
                      <block v-else> ￥{{ childItem.productSkuVO[priceKey] }} </block>
                    </view>
                    <view class="r"> x {{ childItem.num }} </view>
                  </view>
                </view>
              </view>
              <!--满减信息 start-->
              <PriceOffLabel v-if="childItem.activity" :activity="childItem.activity" />
              <!--满减信息 end-->
            </block>
          </block>
        </view>
        <!--购物车商品 end-->

        <block v-if="isPointsMode">
          <view v-if="pointsMode === pointsExchangeMode.POINTS_AND_CASH" class="label">
            <view class="title">
              <text class="txt">商品金额</text>
            </view>
            <view class="value">
              <text class="txt">¥：{{ totalPrice }}</text>
            </view>
          </view>
          <view class="label">
            <view class="title">
              <text class="txt">商品积分</text>
            </view>
            <view class="value">
              <text class="txt">{{ totalIntegral }}</text>
            </view>
          </view>
        </block>
        <block v-else>
          <view class="label">
            <view class="title">
              <text class="txt">商品金额</text>
            </view>
            <view class="value">
              <text class="txt">¥：{{ totalPrice }}</text>
            </view>
          </view>
        </block>
        <view class="label">
          <view class="title">
            <text class="txt">运费</text>
          </view>
          <view class="value">
            <text class="txt highlight">¥：0.00</text>
          </view>
        </view>
        <view v-if="discount" class="label">
          <view class="title">
            <text class="txt">满减优惠</text>
          </view>
          <view class="value">
            <text class="txt highlight">¥：{{ discount }}</text>
          </view>
        </view>
        <view v-if="orderType !== goodsTypes.FLASH_SALE && orderType !== goodsTypes.LIVE_SALE" class="label">
          <view class="title">
            <text class="txt">优惠劵</text>
            <view class="coupon-use-num">{{ ableUseCoupons.length }}张可用</view>
          </view>
          <view class="value" @click="openCouponsWindow">
            <text class="txt highlight">{{ choiceCoupon ? '-￥' + choiceCoupon.faceValue : '请选择优惠劵' }}</text>
            <text class="iconfont icon-arrow-right-bold"></text>
          </view>
        </view>
        <view class="label border-bottom">
          <view class="title">
            <text class="txt">可用积分</text>
          </view>
          <view class="value">
            <text class="txt">{{ accumulatePoints ? accumulatePoints : '暂无积分可用' }}</text>
          </view>
        </view>
        <view class="label orderLabelMargin">
          <view class="remarks-title"> </view>
          <view class="value">
            共计{{ goodsTotalNumber }}件 合计：<text class="txt" style="color: #e60012">
              <block v-if="isPointsMode">
                {{ totalIntegral }} 积分
                <block v-if="pointsMode === pointsExchangeMode.POINTS_AND_CASH"> + ￥{{ payTotalPrice }} </block>
              </block>
              <block v-else> ￥{{ payTotalPrice }} </block>
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
    <view class="footer-bar">
      <view class="total-info"
        >实付款：<text class="txt">
          <block v-if="isPointsMode">
            {{ totalIntegral }} 积分
            <block v-if="pointsMode === pointsExchangeMode.POINTS_AND_CASH"> + ￥{{ payTotalPrice }} </block>
          </block>
          <block v-else> ￥{{ payTotalPrice }} </block>
        </text></view
      >
      <block v-if="!payBtnVisible">
        <view class="pay-btn disabled">提交订单</view>
      </block>
      <block v-else>
        <view class="pay-btn" @click="createOrder">提交订单</view>
      </block>
    </view>
    <drawerBottomSheet ref="drawerBottomSheet">
      <view slot="body">
        <view class="coupons-sheet-wrap">
          <view class="title">
            <view>可使用优惠券</view>
          </view>
          <scroll-view scroll-y style="height: 400rpx">
            <view class="content">
              <template v-if="couponsList.length">
                <couponListItem :coupons-list="couponsList" @useCoupon="useCoupon" />
              </template>
              <view v-else class="pictrue">
                <image src="../../../static/images/noCoupon.png"></image>
              </view>
            </view>
          </scroll-view>
          <view class="close" @tap="confirmCoupon">确定</view>
        </view>
      </view>
    </drawerBottomSheet>
  </view>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserAddress } from '@/api/address'
import { getMyCouponByGoods, orderCreate } from '@/api/order'
import { fetchMyAccumulatePoints } from '@/api/user'
import { goodsTypes, priceFields, transportModeEnum, orderStatusEnum, pointsExchangeMode } from '@/utils/constant'
import util from '@/utils/util'
import drawerBottomSheet from '@/components/drawerBottomSheet'
import couponListItem from '@/components/couponListItem'
import PriceOffLabel from '@/components/priceOffLabel'
import orderPayMixin from '@/mixins/orderPayMixin'

export default {
  name: 'CreateOrder',
  components: {
    drawerBottomSheet,
    couponListItem,
    PriceOffLabel,
  },
  mixins: [orderPayMixin],
  data() {
    return {
      height: 0,
      userAddress: null, // 用户地址
      isBuyNow: null,
      orderType: null, // 订单类型
      priceKey: null, // 价格字段
      payTotalPrice: 0, // 总付款
      totalPrice: 0, // 商品原始总价
      totalIntegral: 0, // 商品积分
      payTotalPrice: 0, // 实际付款总价
      goodsTotalNumber: 0, // 商品总数
      ableUseCoupons: [], // 可用的优惠劵
      couponsList: [], // 优惠劵,
      choiceCoupon: null, // 选择的优惠劵
      submiting: false,
      discount: '', // 优惠，满减优惠
      accumulatePoints: 0, // 我的积分
    }
  },
  computed: {
    ...mapGetters(['isLogin', 'payBtnVisible']),
    transportMode() {
      return transportModeEnum
    },
    goodsItems() {
      return this.$store.state.cart.selectedGoods
    },
    cartTree() {
      return util.normalizeCart(this.goodsItems)
    },
    currentGroupBuyingId() {
      let id = ''
      this.goodsItems.some((o) => {
        if (o.groupMemberId) {
          id = o.groupMemberId
        }
      })
      return id
    },
    paramGoodsItems() {
      let items = []
      this.goodsItems.forEach((o) => {
        items.push({
          cartId: o.id,
          sekillId: o.sekillId,
          pic: o.productSkuVO.pic,
          prodCount: o.num,
          prodId: o.productPageVO.id,
          prodName: o.productSkuVO.prodName,
          shopId: o.shopId,
          skuId: o.productSkuVO.id,
          skuName: o.productSkuVO.skuName,
          liveProductId: o.productPageVO.liveProductId,
          fullMinusId: o.fullMinusId,
          pointsMallId: o.pointsGoodsDetail ? o.pointsGoodsDetail.id : '',
        })
      })
      return items
    },
    // 配送类型：0-普通，1-自提
    currDeliveryType() {
      let flag = false
      // 判断是否到店自提
      this.cartTree.forEach((v) => {
        if (v.children.every((o) => Number(o.productPageVO.deliveryMode) === 1)) {
          flag = true
        }
      })
      return flag ? this.transportMode.pickUpAtTheStore : this.transportMode.plain
    },
    goodsTypes() {
      return goodsTypes
    },
    // 满减优惠
    priceOff() {
      let activityDiscount = null
      this.goodsItems.some((o) => {
        if (o.activity && o.activity.terms) {
          let terms = o.activity.terms.slice(0)
          activityDiscount = terms.sort((a, b) => b.threshold - a.threshold)
        }
      })
      return activityDiscount
    },
    // 积分兑换模式
    pointsMode() {
      let mode = ''
      this.goodsItems.some((o) => {
        if (o.pointsGoodsDetail) {
          mode = o.pointsGoodsDetail.mode
        }
      })
      console.log('mode', mode)
      return mode
    },
    pointsExchangeMode() {
      return pointsExchangeMode
    },
    isPointsMode() {
      return this.orderType === goodsTypes.POINTS_MALLS
    },
  },
  methods: {
    scroll() {},
    /**
     * 打开优惠劵窗口
     */
    openCouponsWindow() {
      this.$refs.drawerBottomSheet.show()
    },

    /**
     * 确定关闭优惠劵窗口
     */
    confirmCoupon() {
      this.$refs.drawerBottomSheet.hide()
    },

    /**
     * 使用优惠劵回调
     * @param {Object} item
     */
    useCoupon(item) {
      this.formatCoupons(item)
    },

    /**
     * 跳转到用户地址
     */
    toAddress() {
      this.$util.Tips('/pages/users/address/addr-manage')
    },

    /**
     * 用户地址初始化
     */
    initUserAddress() {
      getUserAddress()
        .then((r) => {
          const items = r.data.filter((item) => item.default)
          if (items.length > 0) {
            this.userAddress = items[0]
          }
        })
        .catch((err) => console.log(err))
    },

    /**
     * 优惠劵格式处理
     */
    formatCoupons(item) {
      if (!item.isAvailable) return
      this.couponsList = this.couponsList.map((o) => {
        if (item.couponId === o.couponId) {
          o.isChoice = !o.isChoice
        } else {
          o.isChoice = false
        }
        return o
      })

      this.choiceCoupon = null

      this.couponsList.some((o) => {
        if (o.isChoice) {
          this.choiceCoupon = o
        }
      })
      this.updatePayTotalPrice()
    },

    /**
     * 获取优惠劵
     */
    getCoupon() {
      setTimeout(() => {
        getMyCouponByGoods({
          items: this.paramGoodsItems,
        })
          .then((r) => {
            if (r.status === 'OK') {
              this.couponsList = util.normalizeCoupon(r.data.items)
              this.ableUseCoupons = this.couponsList.filter((o) => o.isAvailable)
              this.formatCoupons({
                ...r.data.bestSuggest,
              })
            }
          })
          .catch((e) => console.log(e))
      }, 0)
    },

    /**
     * 根据选择的优惠劵更新总付款
     */
    updatePayTotalPrice() {
      if (this.choiceCoupon) {
        if (this.choiceCoupon.minConsume <= this.totalPrice) {
          const tempPrice = this.totalPrice - this.choiceCoupon.faceValue
          this.payTotalPrice = tempPrice > 0 ? tempPrice.toFixed(2) : 0
        }
      }
    },

    /**
     * 提交订单
     */
    createOrder() {
      if (this.currDeliveryType === this.transportMode.plain && util.isEmptyObject(this.userAddress)) {
        util.Tips({
          title: '邮递地址不能为空！',
        })
        return
      }

      let params = {
        items: this.paramGoodsItems,
        deliveryType: this.currDeliveryType,
        type: this.orderType,
        couponId: this.choiceCoupon ? this.choiceCoupon.couponId : '',
        groupMemberId: this.currentGroupBuyingId,
      }

      let addressParam = this.userAddress
        ? {
            receiptAddress:
              this.userAddress.province +
              this.userAddress.city +
              this.userAddress.region +
              this.userAddress.street +
              this.userAddress.detailAddress,
            receiptMobile: this.userAddress.phoneNumber,
            receiptName: this.userAddress.name,
          }
        : {}
      params = {
        ...params,
        ...addressParam,
      }
      orderCreate(params)
        .then((r) => {
          const { id, code, status } = r.data
          const currPayOrder = {
            orderId: id,
            orderNo: code,
            totalPrice: this.payTotalPrice,
            totalIntegral: this.totalIntegral,
            status: 'success',
            createTime: this.$util.formatDate(2),
          }
          if (Number(status) === orderStatusEnum.PENDING_PAYMENT) {
            this.generateWechatOrder({
              ...currPayOrder,
            })
          } else if (
            Number(status) === orderStatusEnum.WAIT_SEND ||
            Number(status) === orderStatusEnum.PICK_UP_PENDING
          ) {
            // 订单金额为0的时候，提交订单之后，订单状态为待发货，
            this.$store.dispatch('saveCurrPayOrder', currPayOrder)
            this.$util.Tips('/pages/users/order/orderPayStatus?a=' + Math.random())
          }
        })
        .catch((err) => this.$util.Tips({ title: err }))
    },

    /**
     * 购物车数据初始化
     */
    initCart() {
      let totalPrice = 0
      let totalNums = 0
      let totalIntegral = 0
      console.log('goodsItems', this.goodsItems)
      this.goodsItems.forEach((v) => {
        totalPrice += Number(v.productSkuVO[this.priceKey]) * Number(v.num)
        totalIntegral += Number(v.productSkuVO.integral) * Number(v.num)
        totalNums += Number(v.num)
      })

      this.totalPrice = totalPrice.toFixed(2)
      this.payTotalPrice = this.setActivityDiscount(totalPrice.toFixed(2))
      this.totalIntegral = totalIntegral
      this.goodsTotalNumber = totalNums
    },

    /**
     * 满减优惠
     */
    setActivityDiscount(payTotalPrice) {
      if (this.priceOff) {
        this.priceOff.some((o) => {
          if (payTotalPrice >= o.threshold) {
            payTotalPrice = payTotalPrice - o.discount
            this.discount = o.discount
          }
        })
      }
      return payTotalPrice
    },

    /**
     * 获取积分
     */
    getMyAccumulatePoints() {
      fetchMyAccumulatePoints()
        .then((r) => {
          this.accumulatePoints = r.data
        })
        .catch((err) => console.log(err))
    },
  },
  onShow() {
    if (this.isLogin) {
      this.initCart()
      this.initUserAddress()
      this.getMyAccumulatePoints()
      // 普通订单和满减订单的时候去获取优惠劵 || this.orderType === goodsTypes.PRICE_OFF 满减逻辑后端还没实现，暂时不开放
      if (this.orderType === goodsTypes.PLAIN) {
        this.getCoupon()
      }

      // 获取字典配置是否能操作支付
      this.$store.dispatch('GET_PAYBTN_VISIBLE')
    }
  },
  onLoad(options) {
    const _this = this
    console.log('options.orderType', options.orderType)
    this.isBuyNow = options.isBuyNow
    this.orderType = options.orderType ? Number(options.orderType) : goodsTypes.PLAIN // 订单类型 0：普通 1：秒杀 2: 内购

    this.priceKey = util.normalizePriceField(this.orderType)

    uni.getSystemInfo({
      success: function (res) {
        _this.height = res.windowHeight
        //res.windowHeight:获取整个窗口高度为px，*2为rpx；98为头部占据的高度；
      },
    })
  },
}
</script>

<style lang="scss" scoped>
.create-order-wrapper {
  height: 100%;
  overflow-y: hidden;

  .top-bg {
    position: fixed;
    /* #ifndef H5 */
    top: 0;
    /* #endif */

    width: 100%;
    height: 600rpx;
    background: linear-gradient(180deg, #3ba5f8 0%, rgba(230, 1, 19, 0) 100%);
  }

  .container {
    padding: 0 20rpx;

    .address-wrap {
      border-top: 1rpx solid #d1d1d1;
      background: #fff;
      border-radius: 10px;
      overflow: hidden;

      .striped {
        margin-bottom: 20rpx;
        background-color: #fff;
        border-radius: 5px;
      }

      .address-info {
        display: flex;
        padding: 32rpx 0;
        position: relative;

        .coordinates {
          width: 50rpx;
          height: 66rpx;
          margin-right: 23rpx;
          margin-left: 30rpx;
        }

        .content {
          padding-right: 20rpx;

          .top {
            display: flex;

            .name {
              width: 352rpx;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              overflow: hidden;
              word-break: break-all;
              font-size: 28rpx;
              color: #010101;
              line-height: 28rpx;
            }

            .phone {
              width: 172rpx;
              text-align: right;
              font-size: 28rpx;
              color: #010101;
              line-height: 28rpx;
            }
          }

          .detail-address {
            width: 524rpx;
            margin-top: 22rpx;
            font-size: 28rpx;
            color: #999999;
            line-height: 28rpx;
          }

          .more {
            position: absolute;
            right: 22rpx;
            top: 45%;
            margin-top: -37rpx;
            height: 75rpx;
            line-height: 75rpx;
            width: 37rpx;
            text-align: right;
          }
        }
      }

      .empty-address {
        padding: 42rpx 30rpx;
        position: relative;

        .top {
          margin-bottom: 15rpx;
        }

        .txt-tips {
          color: #ea3401;
        }

        .edit-more {
          position: absolute;
          right: 22rpx;
          top: 50%;
          margin-top: -37rpx;
          height: 75rpx;
          line-height: 75rpx;
          width: 37rpx;
          text-align: right;
        }
      }
    }

    .cart-goods-wrap {
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 10px;

      .shop-name {
        padding-left: 20rpx;
        padding-top: 25rpx;
        padding-bottom: 25rpx;
        margin-top: 20rpx;
      }

      .goods-item {
        background-color: #fff;
        display: flex;
        flex-direction: row;
        height: 220rpx;

        .photo {
          width: 180rpx;
          height: 180rpx;
          margin: 20rpx 20rpx 20rpx 30rpx;

          .image {
            width: 180rpx;
            height: 180rpx;
            border-radius: 10rpx;
          }
        }

        .info {
          display: flex;
          flex-direction: column;
          flex: 1;

          .name {
            font-size: 28rpx;
            line-height: 30rpx;
            color: #010101;
            margin-bottom: 20rpx;
            width: 100%;
            margin-top: 34rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-all;
            height: 60rpx;
          }

          .attr {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 12rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }

          .price {
            display: flex;
            flex-direction: row;

            .l {
              font-family: HelveticaNeue;
              font-size: 32rpx;
              color: #ea3401;
              font-weight: 600;
              flex: 1;
              display: flex;
              align-items: flex-end;
            }

            .r {
              display: flex;
              flex-direction: row;
              flex: 1;
              justify-content: flex-end;
              align-items: flex-end;
              margin-right: 28rpx;
              color: #666;
            }
          }
        }
      }
    }

    .label {
      display: flex;
      flex-direction: row;
      height: 100rpx;
      align-items: center;
      padding: 0 30rpx 0 30rpx;
      background: #fff;

      .title {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .txt {
          font-size: 28rpx;
          color: #010101;
        }

        .coupon-use-num {
          border: 2rpx solid #2e94f5;
          border-radius: 500rpx;
          // background-color: #FFECEC;
          color: #2e94f5;
          padding-left: 20rpx;
          padding-right: 20rpx;
          margin-left: 20rpx;
        }
      }

      .value {
        display: flex;
        flex: 1;
        justify-content: flex-end;
        align-items: center;

        .txt {
          font-size: 28rpx;
          color: #666;
          margin-right: 10rpx;
          &.highlight {
            color: #ea1717;
          }
        }
      }

      &.border-bottom {
        border-bottom: 2rpx solid #eee;
      }
    }
  }

  .footer-bar {
    z-index: 1;
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 98rpx;
    background: #fff;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    border-top: 1rpx solid #e4e4e4;
    padding: 0 20rpx;

    .total-info {
      padding-left: 30rpx;
      flex: 1;
      color: #666;
      font-size: 30rpx;
      line-height: 100rpx;
      text-align: left;

      .txt {
        font-size: 32rpx;
        color: #ea3401;
        font-weight: 600;
      }
    }

    .pay-btn {
      // height: 100rpx;
      // line-height: 100rpx;
      // background: #ea3401;
      // color: #fff;
      // width: 220rpx;
      // font-size: 32rpx;
      // text-align: center;
      color: #fff;
      width: 114px;
      height: 41px;
      line-height: 41px;
      text-align: center;
      border-radius: 22px;
      font-size: 15px;

      background-image: linear-gradient(135deg, #59b3ff 0%, #1c87f0 100%);

      &.disabled {
        background-image: none;
        background-color: #f1f1f1;
        color: #989898;
      }
    }
  }

  .coupons-sheet-wrap {
    background-color: #f7f7f7;

    .title {
      height: 91rpx;
      font-size: 32rpx;
      color: #373737;
      width: 100%;
      line-height: 91rpx;
      text-align: center;
      position: relative;
      background: #fff;
    }

    .content {
      .pictrue {
        width: 414rpx;
        height: 336rpx;
        margin: 0 auto;
      }
    }

    .close {
      height: 98rpx;
      font-size: 32rpx;
      color: #fff;
      line-height: 98rpx;
      text-align: center;
      background-image: linear-gradient(135deg, #59b3ff 0%, #1c87f0 100%);
    }
  }
}
</style>

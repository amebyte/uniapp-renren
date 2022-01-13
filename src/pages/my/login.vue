<template>
  <view class="login-wrap">
    <view class="login-submit-wrap">
      <view class="login-button" @click="login()">
        <button hover-class="hover-button">微信账号一键登录</button>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { onPageScroll, onLoad, onShow, onHide, onReachBottom } from '@dcloudio/uni-app'
import { PropType, ref, toRefs, defineComponent, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fetchUserInfo } from '@/api/user'
import { fetchLogin } from '@/api/public'
import Routine from '@/libs/routine'
import { Tips } from '@/utils/util'
export default defineComponent({
  name: 'LoginPage',
  setup() {
    const store = useStore()
    const login = () => {
      // #ifdef MP-WEIXIN
      getUserProfile()
      // #endif
      // #ifdef H5
      wechatLogin()
      // #endif
    }
    // #ifdef H5
    /**
     * 公众号登录
     */
    const wechatLogin = () => {
      // this.$wechat.oAuth('snsapi_userinfo', '/pages/auth/index')
    }
    // #endif

    // #ifdef MP
    /**
     * 获取个人用户信息
     */
    const getUserInfo = () => {
      fetchUserInfo().then((res) => {
        uni.hideLoading()
        store.commit('UPDATE_USERINFO', res.data)
        Tips(
          {
            title: '登录成功',
            icon: 'success',
          },
          {
            tab: 3,
          }
        )
      })
    }
    /**
     * 微信小程序登录
     */
    const getUserProfile = () => {
      uni.showLoading({
        title: '正在登录中',
      })
      Routine.getUserProfile()
        .then((res) => {
          Routine.getCode()
            .then((code) => {
              getWxUser(code, res)
            })
            .catch((res) => {
              uni.hideLoading()
            })
        })
        .catch((res) => {
          uni.hideLoading()
        })
    }

    const goLogin = (code) => {
      fetchLogin({ code, comefrom: 'wxapp', openid: 'sns_wa_' })
        .then((r) => {
          console.log('r', r)
        })
        .catch((err) => console.log(err))
    }

    const getWxUser = (code, res) => {
      let userInfo = res.userInfo
      const data = {
        principal: code,
        avatarUrl: userInfo.userInfo.avatarUrl,
        sex: userInfo.userInfo.gender,
        nickName: userInfo.userInfo.nickName,
      }
      Routine.authUserInfo(data)
        .then((res: any) => {
          if (res.status === 'OK') {
            uni.hideLoading()
            getUserInfo()
          }
        })
        .catch((res) => {
          uni.hideLoading()
          uni.showToast({
            title: res,
            icon: 'none',
            duration: 2000,
          })
        })
    }
    // #endif
    return {
      login,
    }
  },
})
</script>

<style lang="scss">
.login-wrap {
}
</style>

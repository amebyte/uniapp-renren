<template>
  <view class="login-wrap">
    <view class="login-submit-wrap">
      <view class="login-button" @click="loginHandler">
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
import { fetchLogin, fetchAuth } from '@/api/public'
import { RoutineInstance } from '@/libs/routine'
import { Tips } from '@/utils/util'
import Cache from '@/utils/cache'
export default defineComponent({
  name: 'LoginPage',
  setup() {
    const store = useStore()
    const loginHandler = () => {
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
      RoutineInstance.getUserProfile()
        .then((res) => {
          RoutineInstance.getCode()
            .then((code) => {
              console.log('ress', res)
              goLogin(code, res)
            })
            .catch((res) => {
              uni.hideLoading()
            })
        })
        .catch((res) => {
          uni.hideLoading()
        })
    }

    const goLogin = (code, res) => {
      fetchLogin({ code })
        .then((r) => {
          console.log('r', r)
          Cache.set('openid', r.openid)
          Cache.set('session_key', r.session_key)
          if (r.error === 0) {
            fetchAuth({
              data: res.userInfo.encryptedData,
              iv: res.userInfo.iv,
              sessionKey: r.session_key,
            })
              .then((re) => {
                console.log('res', re)
                store.commit('SET_USER_INFO', res.userInfo)
                Cache.set('login_session_key', re.session_key)
              })
              .catch((err) => console.log(err))
          } else {
            uni.showToast({
              title: `获取用户登录态失败:` + r.message,
              icon: 'none',
              duration: 2000,
            })
          }
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
      RoutineInstance.authUserInfo(data)
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
      loginHandler,
    }
  },
})
</script>

<style lang="scss">
.login-wrap {
}
</style>

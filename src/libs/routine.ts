import { useStore } from 'vuex'
import { checkLogin } from './login'
import { fetchLogin } from '../api/public'
import Cache from '../utils/cache'
import { STATE_R_KEY, USER_INFO, EXPIRES_TIME, LOGIN_STATUS } from '../config/cache'
const store = useStore()
class Routine {
  scopeUserInfo: string
  constructor() {
    this.scopeUserInfo = 'scope.userInfo'
  }

  async getUserCode() {
    const isAuth = await this.isAuth()
    let code = ''
    if (isAuth) code = (await this.getCode()) as string
    return code
  }

  /**
   * 获取用户信息
   */
  getUserProfile() {
    const code = this.getUserCode()
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.getUserProfile({
        lang: 'zh_CN',
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success(user: any) {
          if (code) user.code = code
          resolve({ userInfo: user, islogin: false })
        },
        fail(res) {
          reject(res)
        },
      })
      // #endif

      // #ifdef H5
      console.log('JS-SDK 吧')
      // #endif
    })
  }

  /**
   * 获取用户信息
   */
  authorize() {
    const that = this
    return new Promise((resolve, reject) => {
      if (checkLogin())
        return resolve({
          userInfo: Cache.get(USER_INFO, true),
          islogin: true,
        })
      uni.authorize({
        scope: that.scopeUserInfo,
        success() {
          resolve({ islogin: false })
        },
        fail(res) {
          reject(res)
        },
      })
    })
  }

  async getCode() {
    const provider = (await this.getProvider()) as any
    return new Promise((resolve, reject) => {
      uni.login({
        provider: provider,
        success(res) {
          if (res.code) Cache.set(STATE_R_KEY, res.code, 10800)
          return resolve(res.code)
        },
        fail() {
          return reject(null)
        },
      })
    })
  }

  /**
   * 获取服务供应商
   */
  getProvider() {
    return new Promise((resolve, reject) => {
      uni.getProvider({
        service: 'oauth',
        success(res) {
          resolve(res.provider)
        },
        fail() {
          resolve(false)
        },
      })
    })
  }

  /**
   * 是否授权
   */
  isAuth() {
    const that = this
    return new Promise((resolve, reject) => {
      uni.getSetting({
        success(res) {
          if (!res.authSetting[that.scopeUserInfo]) {
            resolve(true)
          } else {
            resolve(true)
          }
        },
        fail() {
          resolve(false)
        },
      })
    })
  }
  /**
   * 小程序登录
   */
  authUserInfo(data) {
    return new Promise((resolve, reject) => {
      fetchLogin(data)
        .then((res) => {
          // 更新用户资料
          res.data && store.dispatch('USERINFO')
          return resolve(res)
        })
        .catch((res) => {
          return reject(res)
        })
    })
  }
}

export default new Routine()

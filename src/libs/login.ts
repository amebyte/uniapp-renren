import { useStore } from 'vuex'
import { AppMutationTypes } from '@/store/modules/app/mutation-types'
import Cache from '../utils/cache'
import { Debounce } from '@/utils/util'
// #ifdef H5
import { isWeixin } from '@/utils'
// #endif
const store = useStore()
import { LOGIN_STATUS, USER_INFO, EXPIRES_TIME, STATE_R_KEY, BACK_URL } from '../config/cache'

function prePage() {
  const pages = getCurrentPages()
  const prePage = pages[pages.length - 1]
  return prePage.route
}

export const toLogin = Debounce(_toLogin, 800)

export function _toLogin() {
  store.commit('LOGOUT')
  let path = prePage()
  // #ifdef H5
  path = location.pathname + location.search
  // #endif
  console.log('path', path)
  Cache.set(BACK_URL, path)
  uni.navigateTo({
    url: '/pages/my/login',
  })
}

export function checkLogin() {
  const token = Cache.get(LOGIN_STATUS)
  const expiresTime = Cache.get(EXPIRES_TIME)
  const newTime = Math.round((new Date() as any) / 1000)
  if (expiresTime < newTime || !token) {
    Cache.clear(LOGIN_STATUS)
    Cache.clear(EXPIRES_TIME)
    Cache.clear(USER_INFO)
    Cache.clear(STATE_R_KEY)
    return false
  } else {
    store.commit(AppMutationTypes.SET_TOKEN, token)
    const userInfo = Cache.get(USER_INFO, true)
    if (userInfo) {
      store.commit(AppMutationTypes.SET_USER_INFO, userInfo)
    }
    return true
  }
}

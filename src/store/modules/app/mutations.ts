import { MutationTree } from 'vuex'
import { AppState } from './state'
import { AppMutationTypes } from './mutation-types'
import { LOGIN_STATUS, USER_INFO } from '@/config/cache'
import Cache from '@/utils/cache'

export type Mutations<S = AppState> = {
  [AppMutationTypes.SET_TOKEN](state: S, token: string): void
  [AppMutationTypes.LOGOUT](state: S): void
  [AppMutationTypes.SET_USER_INFO](state: S, userInfo: any): void
}
export const mutations: MutationTree<AppState> & Mutations = {
  [AppMutationTypes.SET_TOKEN](state: AppState, token: string) {
    state.token = token
    Cache.set(LOGIN_STATUS, token)
  },
  [AppMutationTypes.LOGOUT](state: AppState) {
    state.token = ''
    Cache.clear(LOGIN_STATUS)
  },
  [AppMutationTypes.SET_USER_INFO](state: AppState, userInfo: any) {
    state.userInfo = userInfo
    Cache.set(USER_INFO, userInfo)
  },
}

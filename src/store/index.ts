import { createStore } from 'vuex'
import { store as app, AppState, AppStore } from '@/store/modules/app'
import { store as banner, BannerState, BannerStore, imgUrlsType } from '@/store/modules/banner'
import getters from './getters'
export interface RootState {
  app: AppState
  banner: BannerState<imgUrlsType>
}
export type Store = AppStore<Pick<RootState, 'app'>> & BannerStore<Pick<RootState, 'banner'>>

export const store = createStore<RootState>({
  modules: {
    app,
    banner,
  },
  getters,
})

export const useStore = (): Store => {
  return store as Store
}

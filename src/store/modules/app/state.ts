import { LOGIN_STATUS, USER_INFO } from '@/config/cache'
import Cache from '@/utils/cache'
export interface AppState {
  token: string
  userInfo: any
}

export const state: AppState = {
  token: Cache.get(LOGIN_STATUS) || '',
  userInfo: Cache.get(USER_INFO) ? JSON.parse(Cache.get(USER_INFO)) : null,
}

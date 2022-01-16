<template>
  <view
    class="cu-item"
    :class="moveName == 'move-box-' + index ? 'move-cur' : ''"
    :data-target="'move-box-' + index"
    @touchstart="listTouchStart"
    @touchmove="listTouchMove"
    @touchend="listTouchEnd"
  >
    <view>
      <slot></slot>
    </view>
    <view class="move" @click="action">
      <view class="text">删除</view>
    </view>
  </view>
</template>

<script lang="ts">
import { onPageScroll, onLoad, onShow, onHide, onReachBottom } from '@dcloudio/uni-app'
import { ref, getCurrentInstance, reactive, toRef, computed, defineComponent, toRefs } from 'vue'
export default defineComponent({
  name: 'MoveBox',
  props: {
    index: {
      type: Number,
      default: 0,
    },
    moveName: {
      type: String as any,
      default: '',
    },
  },
  emits: ['changeMoveName', 'action'],
  setup(props, { emit }) {
    const state = reactive({
      listTouchStart: 0,
      listTouchDirection: null as any,
    })
    // ListTouch触摸开始
    /**
     * 触摸开始
     * @param e
     */
    const listTouchStart = (e) => {
      state.listTouchStart = e.touches[0].pageX
    }

    /**
     * 计算方向
     * @param e
     */
    const listTouchMove = (e) => {
      state.listTouchDirection = e.touches[0].pageX - state.listTouchStart > 0 ? 'right' : 'left'
    }

    /**
     * 计算滚动
     * @param e
     */
    const listTouchEnd = (e) => {
      if (state.listTouchDirection == 'left') {
        const moveName = e.currentTarget.dataset.target
        emit('changeMoveName', moveName)
      } else {
        emit('changeMoveName', null)
      }
      state.listTouchDirection = null
    }

    const action = () => {
      emit('action', props.index)
    }
    return {
      ...toRefs(state),
      action,
      listTouchEnd,
      listTouchMove,
      listTouchStart,
    }
  },
})
</script>

<style lang="scss">
.cu-item {
  position: relative;
  transition: all 0.6s ease-in-out 0s;
  transform: translateX(0rpx);

  &.move-cur {
    -webkit-transform: translateX(-146rpx);
    transform: translateX(-146rpx);
  }

  .move {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    width: 146rpx;
    height: 100%;
    transform: translateX(100%);
    background-image: linear-gradient(135deg, #59b3ff 0%, #1c87f0 100%);
    border-radius: 0 8px 8px 0;
    color: #fff;
    align-items: center;
    justify-content: center;

    &::before {
      position: absolute;
      content: '';
      left: -2px;
      width: 32rpx;
      height: 100%;
      background-color: #fff;
      border-radius: 0 8px 8px 0;
      z-index: 1001;
    }

    .text {
      padding-left: 16rpx;
    }
  }
}
</style>

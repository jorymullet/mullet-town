<script>
export default {
  name: 'ProToast',
  data () {
    return {
      testIf: false,
      toasts: [],
    }
  },
  methods: {
    readyListener () {
      this.$proOn('toast', (options) => {
        let toast = options
        if ((typeof options === 'string') || !options) {
          toast = {
            copy: options,
            time: 2000,
          }
        }
        toast.id = String(Math.random())
        this.onToastAdd(toast)
      }) 
    },
    onToastAdd (toast) {
      this.toasts.push(toast)
      setTimeout(() => {
        const toastIdx = this.toasts.findIndex(aToast => aToast.id === toast.id)
        this.toasts.splice(toastIdx, 1)
      }, toast.time || 2500)
    },
  },
  mounted () {
    this.readyListener()
  },
}
</script>

<template lang="pug">
  .pro-toast-main
    .pro-toast-container
      transition-group(
        name='from-bottom'
        mode='out-in'
      )
        .toast(
          v-for='toast in toasts'
          :key='toast.id'
          :class='toast.class'
        ) {{toast.copy}}
</template>

<style lang="sass" scoped>
  @import '$styles/transitions.sass'
  .pro-toast-main
    position: fixed
    bottom: 20px
    max-width: 100%
    width: fit-content
    min-width: 110px
    left: 50%
    transform: translateX(-50%)
    transition: .25s all
    z-index: 951
    .pro-toast-container
      position: relative
      display: grid
      align-items: end
      .toast
        @extend .font-2
        background-color: black
        color: white
        margin-top: 15px
        padding: 5px 15px
        transition: all .25s
        border-radius: 8px
        font-size: 18px
        max-width: 400px
        text-align: center
        &.error
          background-color: red
          color: white
</style>


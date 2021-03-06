<script>
import DatePicker from 'vuejs-datepicker'
export default {
  name: 'ProInput',
  components: {
    'date-picker': DatePicker,
  },
  props: {
    value: {
      required: true,
    },
    options: {
      default: {},
    },
  },
  watch: {
    input (input) {
      if ((this.options.type === 'address') && input) {
        this.chosen = false
        this.googleClient.geocode({
          address: input,
        }).asPromise()
        .then(res => {
          this.searchResults = res.json.results
        })
      } 
      else if (this.options.type === 'phone' && input) {
        const onlyNumbers = input.replace(/\D/g,'')
        this.input = onlyNumbers
        this.$emit('input', onlyNumbers)
      }
      else {
        this.$emit('input', input)
      }
    },
    value (newValue) {
      this.input = newValue
    },
  },
  data () {
    return {
      input: null,
      focused: false,
      entered: false,
      googleClient: null,
      searchResults: [],
      chosen: false,
      seeDatePicker: false,
    }
  },
  computed: {
    isActive () {
      return this.focused || this.input
    },
    isDate () {
      return this.options.type === 'date'
    },
    placeholderCopy () {
      return (this.entered && this.error) ? this.error : this.options.title
    },
    error () {
      return this.options.errorIf && this.options.errorIf(this.input)
    },
  },
  methods: {
    handleKey (e) {
      if (e.code === 'Enter') {
        this.options.onEnter && this.options.onEnter()
      }
    },
    startListeners () {
      if (this.options.type === 'address') {
        this.googleClient = require('@google/maps').createClient({
          key: JSON.parse(process.env.VUE_APP_FIREBASE_CONFIG).apiKey,
          Promise: Promise,
        })
      }
    },
    onResultClick (result) {
      this.options.onAddressSelect && this.options.onAddressSelect(result)
      const address = result.formatted_address
      this.input = address
      this.$nextTick(() => {
        this.chosen = true
        this.$emit('input', address)
        this.searchResults = []
      })
    },
    onOptionClick (option) {
      if (this.options.multiple) {
        if (!this.input) {
          this.input = []
        }
        const alreadyInList = this.input.includes(option.value)
        this.input[alreadyInList ? 'remove' : 'push'](option.value)
      } else {
        this.input = option.value === this.input ? '' : option.value
      }
    },
    isOptionChosen (option) {
      return this.options.multiple ? this.input && this.input.includes(option.value) : this.input === option.value
    },
    getStyle () {
      if (this.options.type !== 'textarea') return {}

      if (!this.$refs.textarea) return {}

      const heightOfTextarea = this.$refs.textarea.offsetHeight
      const titleHeight = heightOfTextarea + 8

      return {bottom: `${titleHeight}px`}
    },
    onDatePickerFocus () {
      setTimeout((ev)=>{
        this.$refs.dp.isOpen || this.$refs.dp.showCalendar(ev);
      }, 50)
    },
  },
  mounted () {
    this.input = this.value // mostly just for textarea
    this.startListeners()
  },
}
</script>

<template lang="pug">
  .pro-input-main
    .pro-input-container(
      :class='options.containerClass'
    )
      .input-holder(
        :class='error && entered ? "error" : ""'
      )
        .placeholder(
          :class='(isActive ? "active " : "") + options.type'
          :style='getStyle()'
        ) {{placeholderCopy}}
        .radio-holder(
          v-if='options.type === "checkbox"'
        )
          .placeholder.prompt {{options.prompt}}
          .options-holder
            .option(
              v-for='option in options.options'
              :class='isOptionChosen(option) ? "chosen" : ""'
              @click='onOptionClick(option)'
            ) 
              .box
                i.material-icons {{isOptionChosen(option) ? "check_box" : "check_box_outline_blank"}}
              .name {{option.name}}
        textarea(
          ref='textarea'
          v-else-if='options.type === "textarea"'
          v-model='input'
          @keydown='handleKey'
          @focus='focused = true'
          @blur='focused = false;entered = true'
          :style='{height: options.height || "100px"}'
        )
        input(
          v-else-if='options.type === "number"'
          type='number'
          v-model='input'
          @keydown='handleKey'
          @focus='focused = true'
          @blur='focused = false;entered = true'
        )
        input(
          v-else-if='options.type === "password"'
          type='password'
          v-model='input'
          @keydown='handleKey'
          @focus='focused = true'
          @blur='focused = false;entered = true'
        )
        input(
          v-else-if='options.type === "phone"'
          v-model='input'
          @keydown='handleKey'
          @focus='focused = true'
          @blur='focused = false;entered = true'
        )
        input(
          v-else-if='options.type === "address"'
          type='text'
          autocomplete="off"
          v-model='input'
          @keydown='handleKey'
          @focus='focused = true'
          @blur='focused = false;entered = true'
        )
        date-picker(
          v-else-if='isDate'
          initial-view='year'
          v-model='input'
          @keydown='handleKey'
          @blur='focused = false;entered = true'
          :open-date='new Date(new Date().getFullYear() - 12.5, 1, 1)'
          ref='dp'
          @focusin.native='onDatePickerFocus'
        )
        input(
          v-else
          v-model='input'
          @keydown='handleKey'
          @focus='focused = true'
          @blur='focused = false;entered = true'
        )
      .search-results-holder(
        v-if='(options.type === "address") && input && !chosen'
      )
        .search-result.no-results(
          v-if='!searchResults.length && !chosen'
        ) No results
        .search-result(
          v-for='result in searchResults'
          @click='onResultClick(result)'
        ) {{result.formatted_address}}
</template>

<style lang="sass">
  @import '$vars'
  .pro-input-main
    .pro-input-container
      position: relative
      .search-results-holder
        border-radius: 6px
        border: thin black solid
        width: 100%
        overflow: scroll
        position: absolute
        background-color: white
        z-index: 2
        box-sizing: border-box
        .search-result
          padding: 8px 24px
          cursor: pointer
          font-size: 14px
          &.no-results
            &:hover
              background-color: white
              cursor: default
          &:hover
            background-color: $lightgrey
      .input-holder
        position: relative
        margin-top: 5px
        &.error
          .placeholder
            color: red !important
          > input
            border-color: red
            &:focus
              border-color: red !important
        .radio-holder
          .prompt
            color: black
          .options-holder
            padding: 8px 0
            .option
              font-size: 16px
              padding: 4px 0
              display: grid
              grid-template-columns: min-content auto
              align-items: center
              cursor: pointer
              user-select: none
              width: fit-content
              &.chosen
                @extend .font-1-bold
                color: $purple
              .box
                height: 24px
              .name
                padding-left: 8px
        .placeholder
          @extend .font-1-bold
          user-select: none
          position: absolute
          bottom: .25rem
          color: grey
          transition: all .25s
          font-family: $font-2
          font-size: 20px
          &.textarea
            color: black
          &.prompt
            top: 0px
            position: relative
          &.active
            bottom: 2rem
            font-size: 14px
            color: black
            &.textarea
              font-size: 20px
        > textarea
          width: 100%
          box-sizing: border-box
          resize: none
          padding: 8px
          border: 2px black solid
        input,
          padding: 0em 0px .25rem
          border: none
          border-bottom: 2px black solid
          background-color: transparent
          &:focus
            transition: .25s all
            //box-shadow: 0 0 5px 0px $green
            border-color: $orange
            color: #000
        input, > textarea,
          margin-bottom: 0
          z-index: 1
          position: relative
          color: #000
          box-sizing: border-box
          //border-radius: 6px
          width: 100%
          font-family: $font-1
          font-size: 14px
          &:focus
            outline: none

</style>

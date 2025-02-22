import {commonConstants} from '../constants'

export default {
  props: {
    type: String,
    /**
     * Dialog background layer
     */
    backdrop: {
      type: Boolean,
      default: true
    },
    /**
     * Click backdrop to close dialog
     */
    backdropClose: {
      type: Boolean,
      default: false
    },
    /**
     * The message show in dialog (work on alert, mask, toast mode)
     */
    message: String,
    /**
     * Dialog title bar text or title bar show control
     *
     * @example
     * titleBar: false// close title bar
     */
    titleBar: {
      type: [String, Boolean],
      default: 'Dialog'
    },
    contentClass: String,
    /**
     * Dialog width
     */
    width: {
      type: [Number, String],
      default: 700
    },
    /**
     * Dialog height
     */
    height: {
      type: [Number, String],
      default: 400
    },
    i18n: Object,
    /**
     * Dialog inner key
     * @private
     */
    dialogKey: String,
    /**
     * auto close dialog seconds
     */
    closeTime: {
      type: [Boolean, Number],
      default: false
    },
    /**
     * Close dialog callback, trigger by some case:
     *
     * click the close button in top right corner(Modal,Toast mode)
     * click 'cancel' button in Alert mode ('confirm' message type)
     */
    cancelCallback: Function,
    targetWindow: {
      validator(value) {
        return true;
      }
    },
    /**
     * dialog outside click with shaking animation
     */
    shaking: {
      type: Boolean,
      default: true
    },
    dialogIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      bodyHeight: 50,
      dialogTop: 0,
      dialogWidth: 0,
      dialogHeight: 0,
      dialogZIndex: 0,
      backdropZIndex: 0,
      resizeTimeout: null,
      shake: false,
      show: false
    }
  },
  methods: {
    /**
     * backdrop click animate
     */
    outsideClick() {
      if (!this.backdrop) return
      if (this.backdropClose) {
        this.closeDialog(true)
      } else {
        if (!this.shaking) return
        this.shake = true
        setTimeout(() => {
          this.shake = false
        }, 750)
      }
    },
    /**
     * adjust position and size
     */
    adjust() {
      const browserHeight = this.targetWindow.innerHeight || this.targetWindow.document.documentElement.clientHeight
      let tmp = (browserHeight - this.dialogHeight) / 2
      this.dialogTop = tmp > 30 ? tmp : 30;

    },
    /**
     * Close current dialog
     *
     * @param trigger [boolean] whether close dialog and trigger callback function
     * @param data [object] return data when dialog close(only for modal)
     */
    closeDialog(trigger, data, closeButtonClick) {
      this.show = false
      setTimeout(() => {
        this.$emit('close', this.dialogKey, trigger, data, closeButtonClick)
      }, 200)
    },
    calcLayerLevel() {
      // z-index step number
      const step = 50
      this.dialogZIndex = commonConstants.baseZIndex + (step * this.dialogIndex)
      this.backdropZIndex = this.dialogZIndex - 10
    },
    autoClose() {
      // auto close dialog
      if (this.closeTime) {
        setTimeout(() => {
          this.closeDialog(false)
        }, this.closeTime * 1000)
      }
    },
    resizeThrottler() {
      // ignore resize events as long as an actualResizeHandler execution is in the queue
      if (!this.resizeTimeout) {
        this.resizeTimeout = setTimeout(() => {
          this.resizeTimeout = null
          this.adjust()
          // The actualResizeHandler will execute at a rate of 15fps
        }, 100)
      }
    }
  },
  mounted() {
    this.show = true
    if (typeof this.width === 'string') {
      let windowWidth = this.targetWindow.innerWidth || this.targetWindow.document.documentElement.clientWidth || this.targetWindow.document.body.clientWidth;
      this.dialogWidth = Math.round(windowWidth * parseFloat(this.width) / 100);
    } else {
      this.dialogWidth = this.width;
    }
    if (typeof this.height === 'string') {
      let windowHeight = this.targetWindow.innerHeight || this.targetWindow.document.documentElement.clientHeight || this.targetWindow.document.body.clientHeight;
      this.dialogHeight = Math.round(windowHeight * parseFloat(this.height) / 100);
    } else {
      this.dialogHeight = this.height;
    }
    this.calcLayerLevel()
    this.autoClose()

    if (this.type !== 'toast') {
      window.addEventListener('resize', this.resizeThrottler, false)
    }
  },
  destroyed() {
    if (this.type !== 'toast') {
      window.removeEventListener('resize', this.resizeThrottler, false)
    }
  }
}

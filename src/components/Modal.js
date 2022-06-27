import mixins from '../mixins'
import render from '../mixins/render'

export default {
  name: 'DialogModal',
  mixins: [mixins, render],
  props: {
    url: String,
    /**
     * Send parameters to Component
     * you need use props to receive this params in component
     */
    params: Object,
    /**
     * Full screen dialog
     */
    fullWidth: {
      type: Boolean,
      default: false
    },
    maxButton: {
      type: Boolean,
      default: true
    },
    closeButton: {
      type: Boolean,
      default: true
    },
    beforeClose: {
      type: Function,
      default: null
    },
    targetWindow: {}
  },
  data() {
    return {
      maximize: false,
      animate: false,
      lastScreenX: null,
      lastScreenY: null
    };
  },
  computed: {
    classes() {
      return {
        'v-dialog': true,
        'v-dialog-modal': true,
        'v-dialog--maximize': this.maximize,
        'v-dialog--buzz-out': this.shake
      }
    },
    maxClass() {
      return this.maximize ? 'dlg-icon-restore' : 'dlg-icon-max'
    }
  },
  render(h) {
    const child = []
    // dialog header
    if (this.titleBar !== false) {
      const buttons = []
      if (this.closeButton) {
        buttons.push(h('button', {
          class: 'v-dialog-btn__close',
          attrs: {
            type: 'button'
          },
          on: {
            click: () => {
              let that = this;
              if (this.beforeClose) {
                this.beforeClose(function (){
                  that.closeDialog(true, {}, true);
                });
              } else {
                this.closeDialog(true, {}, true);
              }
            }
          }
        }, [
          h('i', {class: 'dlg-icon-font dlg-icon-close'})
        ]))
      }
      if (this.fullWidth) {
        this.dialogTop = 0;
        this.maximize = true;
      } else {
        if (this.maxButton) {
          buttons.push(h('button', {
            class: 'v-dialog-btn__maximize',
            attrs: {
              type: 'button'
            },
            on: {
              click: this.max
            }
          }, [
            h('i', {
              class: ['dlg-icon-font', this.maxClass]
            })
          ]))
        }
      }
      child.push(h('div', {
        class: 'v-dialog-header',
        ref: 'header'
      }, [
        ...buttons,
        h('h3', this.titleBar)
      ]));
    }
    // dialog body
    child.push(h('div', {
      class: 'v-dialog-body',
      style: {
        height: 'calc(100% - 30px)',
        overflow: 'hidden',
        transform: 'rotate(0)'
      }
    }, [
      h('div', {
        attrs: {
          id: 'v-dialog-loading-div',
          class: 'v-dialog-loading-mask',
        },
      }, [
        h('div', {
          attrs: {
            class: 'v-dialog-loading-mask-spinner',
          },
        }, [
          h('p', {}, '加载中……'),
        ]),
      ]),
      // Dynamic component
      h('iframe', {
        attrs: {
          style: 'width:100%;height:100%;',
          frameborder: '0',
          onload: 'let masks=document.getElementsByClassName("v-dialog-loading-mask");let len=masks.length;for(let i=0;i<len;i++){masks[i].style.display="none";}if(window.iframeRequestOnload)window.iframeRequestOnload(this.contentWindow)',
          onerror: 'let masks=document.getElementsByClassName("v-dialog-loading-mask");let len=masks.length;for(let i=0;i<len;i++){masks[i].style.display="none";}if(window.iframeRequestOnload)window.iframeRequestOnload(this.contentWindow)',
          src: this.url
        },
        on: {
          close: this.modalClose
        }
      }),
    ]))

    const dialog = h('div', {
      class: {
        'v-dialog-dialog': true,
        'v-dialog-default-animated': this.animate
      },
      style: {
        width: this.dialogWidth + 'px',
        height: this.dialogHeight + 'px',
        top: this.dialogTop + 'px',
      }
    }, [
      this.buildDlgContent(h, {
        className: 'v-dialog-content',
        transitionName: 'v-dialog--smooth',
        child: child
      })
    ])

    return h('div', [
      this.buildDlgScreen(h, dialog),
      this.buildBackdrop(h)
    ])
  },
  methods: {
    /**
     * dialog max size
     */
    max() {
      if (!this.animate) this.animate = true
      this.maximize = !this.maximize
      this.modalAdjust()
    },
    modalAdjust() {
      if (this.maximize) this.dialogTop = 0
      else this.adjust()
    },
    modalClose(data) {
      this.closeDialog(false, data)
    }
  },
  mounted() {
    window.modalVue = this;
    this.$nextTick(() => {
      this.modalAdjust()
    })
  },
  destroyed() {
    window.modalVue = undefined;
  }
}

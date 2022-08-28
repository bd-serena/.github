import Vue from 'vue'
import Element from 'element-ui'
import '../assets/css/element-variables.scss'

//全局修改默认配置
Element.Dialog.props.closeOnClickModal.default=false;
// Element.Dialog.props.closeOnPressEscape.default=false;
Vue.use(Element)

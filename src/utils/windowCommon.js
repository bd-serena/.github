import eventBus from '../plugins/transData.js';
// 全局权限控制开关
window._permission_control = true;
window._system_id_request_url = '/render-engine/v1/common/getVueConfig';
// 系统管理加载中遮罩
window.systemLoading = (param) => {
  eventBus.$emit('systemLoading', param);
};

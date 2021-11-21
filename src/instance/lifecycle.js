
import { patch } from "../vdom/patch";
import Watcher from "../observer/watcher";

export function lifecycleMixin(Vue) {
  // 用虚拟dom 生成真实dom
  Vue.prototype._update = function (vnode) {
    // 既有初始化 又有更新
    const vm = this;
    vm.$el = patch(vm.$el, vnode); // 将返回的真实dom挂载到vm.$el上
  };

}

export function mountComponent(vm, el) {
  // 将el挂载到vm上
  vm.$el = el;

  // 更新函数 数据变化后 会再次调用此函数
  const updateComponent = () => {
    // 调用render函数，生成虚拟dom
    vm._update(vm._render()); // 后续更新可以调用updateComponent方法

  };

  // updateComponent();

  new Watcher(vm, updateComponent, () => {
    console.log('updateComponent');
  }, true);// true 表示为渲染watcher
}

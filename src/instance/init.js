import { initState } from "./state";
import { callHook, mountComponent } from "./lifecycle";
import { compileToFunction } from "../compiler/index";
import { mergeOptions } from "../util/options";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // $options
    vm.$options = mergeOptions(vm.constructor.options, options);

    callHook(vm, "beforeCreate");

    // 初始化状态
    initState(vm);

    callHook(vm, "created");

    if (vm.$options.el) {
      // 将数据挂载到这个模板上
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    // 如果没有render方法
    if (!options.render) {
      let template = options.template;
      // 如果没有模板但是有el
      if (!template && el) {
        template = el.outerHTML;
      }
      const render = compileToFunction(template); //将template编译成render函数

      options.render = render;
    }

    mountComponent(vm, el); // 组件的挂载流程
  };
}

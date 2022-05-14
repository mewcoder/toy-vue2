import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { stateMixin } from "./state";
import { initGlobalApi } from "../global-api/index";

function Vue(options) {
  // options 为用户传入的参数
  this._init(options); //初始化
}

// 扩展原型方法

initMixin(Vue); //给原型加 init方法

stateMixin(Vue); // 给原型加 $watch 方法

lifecycleMixin(Vue); //_update方法 转为 真实dom

renderMixin(Vue); //_render方法 生成vdom

// 在类上扩展的 Vue.mixin
initGlobalApi(Vue);

export default Vue;

/**
 * init 主要做了状态的初始化（数据的初始化）
 * $mount 找render方法(tempelete => render   ast->codegen->字符串)
 * render = with + new Function(code) 产生虚拟dom的方法
 * 虚拟dom => 真实dom
 * vm._update(vm_render())   虚拟dom->真实dom
 */
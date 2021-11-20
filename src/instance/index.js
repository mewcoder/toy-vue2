import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";

function Vue(options) {
  this._init(options); //初始化
}

initMixin(Vue); //给原型加 init方法

renderMixin(Vue); //_render方法 生成vdom

lifecycleMixin(Vue); //_update方法 转为 真实dom

// stateMixin(Vue);

export default Vue;

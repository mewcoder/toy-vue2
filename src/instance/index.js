import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { stateMixin } from './state'


function Vue(options) {
  this._init(options); //初始化
}

initMixin(Vue); //给原型加 init方法

stateMixin(Vue); // 给原型加 $watch 方法

lifecycleMixin(Vue); //_update方法 转为 真实dom

renderMixin(Vue); //_render方法 生成vdom

export default Vue;

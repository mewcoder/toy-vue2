import {
  observe,
} from '../observer/index'

import Watcher from '../observer/watcher'


export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    options.user = true; // 是一个用户自己写的watcher

    // vm,name,用户回调，options.user
    new Watcher(this, key, handler, options);
  }
}


export function initState(vm) {
  const opts = vm.$options
  if (opts.data) initData(vm)
  if (opts.watch) initWatch(vm)
  if (opts.props) initProps(vm)
  if (opts.methods) initMethods(vm)
  if (opts.computed) initComputed(vm)
}


// 初始化数据
function initData(vm) {
  let data = vm.$options.data;
  // 可能是函数
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}


  // 把 data里的数据 代理到vm上
  const keys = Object.keys(data)
  let i = keys.length;
  while (i--) {
    proxy(vm, "_data", keys[i]);
  }

  observe(data); // 观察数据
}

export function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return target[sourceKey][key];
    },
    set(newVal) {
      target[sourceKey][key] = newVal;
    },
  });
}



function initWatch(vm) { // Object.keys
  const watch = vm.$options.watch;
  for (let key in watch) {
    let handler = watch[key];

    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }

  }
}

function createWatcher(vm, key, handler) {
  return vm.$watch(key, handler)
}

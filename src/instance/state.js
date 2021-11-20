import {
  observe,
} from '../observe/index'



export function initState(vm) {
  const opts = vm.$options
  if (opts.data) initData(vm)
  if (opts.props) initProps(vm)
  if (opts.methods) initMethods(vm)
  if (opts.computed) initComputed(vm)
  if (opts.watch) initWatch(vm)
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
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

function initComputed(vm) {
  const computed = vm.$options.computed;

  const watchers = vm._computedWatchers = {}
  for (let key in computed) {
    // 校验 
    const userDef = computed[key];
    // 依赖的属性变化就重新取值 get
    const getter = typeof userDef == 'function' ? userDef : userDef.get;

    // 每个计算属性本质就是watcher   
    // 将watcher和 属性 做一个映射
    watchers[key] = new Watcher(vm, getter, () => { }, { lazy: true }); // 默认不执行

    // 将key 定义在vm上
    defineComputed(vm, key, userDef);
  }
}


function defineComputed(vm, key, userDef) {
  let sharedProperty = {};
  if (typeof userDef == 'function') {
    sharedProperty.get = userDef;
  } else {
    sharedProperty.get = createComputedGetter(key);
    sharedProperty.set = userDef.set;
  }
  Object.defineProperty(vm, key, sharedProperty); // computed就是一个defineProperty
}


function createComputedGetter(key) {

  return function  () { // 取计算属性的值 走的是这个函数
    // this._computedWatchers 包含着所有的计算属性

    // 通过key 可以拿到对应watcher，这个watcher中包含了getter
    let watcher = this._computedWatchers[key]
    // 脏就是 要调用用户的getter  不脏就是不要调用getter

    if (watcher.dirty) { // 根据dirty属性 来判断是否需要重新求职
      watcher.evaluate();// this.get()
    }

    // 如果当前取完值后 Dep.target还有值  需要继续向上收集
    if (Dep.target) {
      // 计算属性watcher 内部 有两个dep  firstName,lastName
      watcher.depend(); // watcher 里 对应了 多个dep
    }
    return watcher.value
  }
}
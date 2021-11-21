import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0

class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.deps = [];
    this.depIds = new Set();
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.dirty = options.lazy; // 如果是计算属性，那么默认值lazy:true, dirty:true
    if (typeof expOrFn === 'string') {
      // 需要将表达式转化成函数
      this.getter = function () {
        const path = expOrFn.split('.');
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]];
        }
        return obj;
      }
    } else {
      this.getter = expOrFn;
    }
    this.cb = cb;
    this.options = options;
    this.id = ++id;
    // 第一次的value
    this.value = this.lazy ? undefined : this.get(); // 默认初始化 要取值
  }
  // 更新时可重新调用该方法
  get() {
    // 一个属性可以对应多个watcher
    // 一个watcher可以对应多个属性 
    pushTarget(this);
    const value = this.getter.call(this.vm);
    popTarget();
    return value;
  }

  evaluate() {
    this.dirty = false; // 为false表示取过值了
    this.value = this.get(); // 用户的getter执行
  }

  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); //lastName,firstName 收集渲染watcher
    }
  }

  addDep(dep) {
    let id = dep.id;
    if (!this.depIds.has(id)) {
      this.depIds.add(id);  //去重，一个组件中可用到多个相同的属性,让watcher记住dep
      this.deps.push(dep);
      dep.addSub(this); // 让dep存入watcher
    }
  }

  update() {
    if (this.lazy) {
      this.dirty = true;
    } else {
      queueWatcher(this); // 多次调用update 我希望先将watcher缓存下来，等一会一起更新
    }
  }

  run() {
    const newVal = this.get();
    const oldVal = this.value;
    this.value = newVal;

    if (this.user) {
      this.cb.call(this.vm, newVal, oldVal);
    }
  }

}


export default Watcher;
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
    this.value = this.get(); // 默认先执行一次,取值
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


  addDep(dep) {
    let id = dep.id;
    if (!this.depIds.has(id)) {
      this.depIds.add(id);  //去重，一个组件中可用到多个相同的属性,让watcher记住dep
      this.deps.push(dep);
      dep.addSub(this); // 让dep存入watcher
    }
  }

  update() {
    queueWatcher(this);
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
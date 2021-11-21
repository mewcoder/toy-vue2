import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0

class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.deps = [];
    this.depIds = new Set();
    this.vm = vm;
    this.expOrFn = expOrFn;
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    }
    this.cb = cb;
    this.options = options;
    this.id = ++id;
    this.get(); // 默认先执行一次,取值
  }
  // 更新时可重新调用该方法
  get() {
    // 一个属性可以对应多个watcher
    // 一个watcher可以对应多个属性 
    pushTarget(this);
    this.getter.call(this.vm);
    popTarget();
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
    console.log('run');
    this.get();
  }

}


export default Watcher;
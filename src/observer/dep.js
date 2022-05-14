let id = 0;
// 每个属性对应一个dep
class Dep {
  constructor() {
    this.id = id++;
    this.subs = [];
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this); // 让watch收集的dep
    }
  }

  notify() {
    this.subs.forEach((sub) => sub.update());
  }

  addSub(sub) {
    this.subs.push(sub);
  }
}

const stack = [];

export function pushTarget(watcher) {
  Dep.target = watcher;
  stack.push(watcher);
}

export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
export default Dep;

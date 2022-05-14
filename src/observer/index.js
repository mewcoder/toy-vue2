import { arrayMethods } from "./array";
import { isObject } from "../util/index";
import Dep from "./dep";
/**
 * Observer class that is attached to each observed object(__ob__).
 * Once attached, the observer converts the target object's property keys
 * into getter/setters(defineProperty) that collect dependencies and dispatch updates.
 *
 *  1.如果数据是对象 会将对象不停的递归 进行劫持
 *  2.如果是数组，会劫持数组的方法，并对数组中不是基本数据类型的进行检测
 */

class Observer {
  constructor(value) {
    this.value = value;

    this.dep = new Dep(); // 数据如果是数组，需要在Observer实例上加dep

    // 被劫持过的属性都有__ob__（Observer实例）
    Object.defineProperty(value, "__ob__", {
      value: this,
      enumerable: false, // 不可枚举
    });
    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods; // 劫持数组原型方法
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  // 遍历所有属性并将它们转换为 getter/setter
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }

  observeArray(data) {
    for (let i = 0; i < data.length; i++) {
      observe(data[i]);
    }
  }
}

function defineReactive(obj, key, val) {
  const childOb = observe(val); //递归
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      if (Dep.target) {
        dep.depend(); // 让 dep 记住 watcher
        if (childOb) {
          // 可能是数组可能是对象，对象也要收集依赖，后续写 $set方法时需要触发他自己的更新操作
          childOb.dep.depend(); // 就是让数组和对象也记录 watcher
          if (Array.isArray(val)) {
            //取外层数组要将数组里面的也进行依赖收集
            dependArray(val);
          }
        }
      }
      return val;
    },
    set: function reactiveSetter(newVal) {
      observe(newVal);
      if (newVal === val) return;
      val = newVal;
      dep.notify();
    },
  });
}

function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    const current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

export function observe(value) {
  if (!isObject(value)) return;
  if (value.__ob__) {
    return value.__ob__;
  }
  return new Observer(value); // 返回Observer实例
}

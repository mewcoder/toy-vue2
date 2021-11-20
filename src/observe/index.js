
import { arrayMethods } from './array'
import { isObject } from '../util/index'

class Observer {
  constructor(value) {
    this.value = value
    Object.defineProperty(value, "__ob__", {
      value: this,
      enumerable: false
    });
    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods;   // 劫持数组原型方法
      this.observeArray(value);
    } else {

    }
    this.walk(value)
  }


  // 遍历所有属性并将它们转换为 getter/setter
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  observeArray(data) {
    for (let i = 0; i < data.length; i++) {
      observe(data[i]);
    }
  }
}


function defineReactive(obj, key, val) {
  observe(val) //递归

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      return val
    },
    set: function reactiveSetter(newVal) {
      observe(newVal)
      if (newVal === val) return
      val = newVal
    }
  })
}


export function observe(value) {
  if (!isObject(value)) return

  if (value.__ob__) return

  return new Observer(value)

}

import { isObject } from './index'

const lifeCycleHooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
]

let strats = {}; // 存放各种策略

function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal); // 后续
    } else {
      return [childVal]; // 第一次
    }
  } else {
    return parentVal
  }
}

lifeCycleHooks.forEach(hook => {
  strats[hook] = mergeHook
});

export function mergeOptions(parent, child) {
  const options = {}; // 合并后的结果
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (parent.hasOwnProperty(key)) {
      continue;
    }
    mergeField(key);
  }

  function mergeField(key) {
    let parentVal = parent[key];
    let childVal = child[key];
    // 策略模式
    if (strats[key]) { // 如果有对应的策略就调用对应的策略即可
      options[key] = strats[key](parentVal, childVal)
    } else {
      if (isObject(parentVal) && isObject(childVal)) {
        options[key] = { ...parentVal, ...childVal }
      } else {
        // 父亲中有，儿子中没有
        options[key] = child[key] || parent[key];
      }
    }
  }
  return options
}

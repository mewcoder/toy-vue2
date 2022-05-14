const arrayProto = Array.prototype;

export const arrayMethods = Object.create(Array.prototype);

const methodsToPatch = [
  "push",
  "shift",
  "unshift",
  "pop",
  "reverse",
  "sort",
  "splice",
];

methodsToPatch.forEach((method) => {
  arrayMethods[method] = function (...args) {
    const result = arrayProto[method].apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测

    // 数组的dep 属性
    ob.dep.notify();

    return result;
  };
});

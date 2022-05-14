(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(Array.prototype);
  var methodsToPatch = ["push", "shift", "unshift", "pop", "reverse", "sort", "splice"];
  methodsToPatch.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = arrayProto[method].apply(this, args);
      var ob = this.__ob__;
      var inserted;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
          break;
      }

      if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测
      // 数组的dep 属性

      ob.dep.notify();
      return result;
    };
  });

  function isObject(val) {
    return val !== null && _typeof(val) === "object";
  }

  var id$1 = 0; // 每个属性对应一个dep

  var Dep$1 = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        if (Dep.target) {
          Dep.target.addDep(this); // 让watch收集的dep
        }
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (sub) {
          return sub.update();
        });
      }
    }, {
      key: "addSub",
      value: function addSub(sub) {
        this.subs.push(sub);
      }
    }]);

    return Dep;
  }();

  var stack$1 = [];
  function pushTarget(watcher) {
    Dep$1.target = watcher;
    stack$1.push(watcher);
  }
  function popTarget() {
    stack$1.pop();
    Dep$1.target = stack$1[stack$1.length - 1];
  }

  /**
   * Observer class that is attached to each observed object(__ob__).
   * Once attached, the observer converts the target object's property keys
   * into getter/setters(defineProperty) that collect dependencies and dispatch updates.
   *
   *  1.如果数据是对象 会将对象不停的递归 进行劫持
   *  2.如果是数组，会劫持数组的方法，并对数组中不是基本数据类型的进行检测
   */

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      this.value = value;
      this.dep = new Dep$1(); // 数据如果是数组，需要在Observer实例上加dep
      // 被劫持过的属性都有__ob__（Observer实例）

      Object.defineProperty(value, "__ob__", {
        value: this,
        enumerable: false // 不可枚举

      });

      if (Array.isArray(value)) {
        value.__proto__ = arrayMethods; // 劫持数组原型方法

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    } // 遍历所有属性并将它们转换为 getter/setter


    _createClass(Observer, [{
      key: "walk",
      value: function walk(obj) {
        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++) {
          defineReactive(obj, keys[i], obj[keys[i]]);
        }
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]);
        }
      }
    }]);

    return Observer;
  }();

  function defineReactive(obj, key, val) {
    var childOb = observe(val); //递归

    var dep = new Dep$1();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        if (Dep$1.target) {
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
      }
    });
  }

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function observe(value) {
    if (!isObject(value)) return;

    if (value.__ob__) {
      return value.__ob__;
    }

    return new Observer(value); // 返回Observer实例
  }

  var callbacks = [];

  function flushCallbacks() {
    callbacks.forEach(function (cb) {
      return cb();
    });
    waiting = false;
  }

  var waiting = false;

  function timer(flushCallbacks) {
    var timerFn = function timerFn() {};

    if (Promise) {
      timerFn = function timerFn() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      var textNode = document.createTextNode(1);
      var observe = new MutationObserver(flushCallbacks);
      observe.observe(textNode, {
        characterData: true
      });

      timerFn = function timerFn() {
        textNode.textContent = 3;
      }; // 微任务

    } else if (setImmediate) {
      timerFn = function timerFn() {
        setImmediate(flushCallbacks);
      };
    } else {
      timerFn = function timerFn() {
        setTimeout(flushCallbacks);
      };
    }

    timerFn();
  } // 微任务是在页面渲染前执行 我取的是内存中的dom，不关心你渲染完毕没有


  function nextTick(cb) {
    callbacks.push(cb); // flushSchedulerQueue / userCallback

    if (!waiting) {
      timer(flushCallbacks); // vue2 中考虑了兼容性问题 vue3 里面不在考虑兼容性问题

      waiting = true;
    }
  }

  var queue = [];
  var has = {}; // 做列表的 列表维护存放了哪些watcher
  // 动画  滚动的频率高，节流 requestFrameAnimation

  function flushSchedulerQueue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run(); // vm.name = 123?
    }

    queue = [];
    has = {};
    pending = false;
  }

  var pending = false; // 要等待同步代码执行完毕后 才执行异步逻辑

  function queueWatcher(watcher) {
    // 当前执行栈中代码执行完毕后，会先清空微任务，在清空宏任务， 我希望尽早更新页面
    var id = watcher.id; // name 和 age的id 是同一个

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true; // 开启一次更新操作  批处理 （防抖）

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, expOrFn, cb, options) {
      _classCallCheck(this, Watcher);

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
          var path = expOrFn.split('.');
          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
          }

          return obj;
        };
      } else {
        this.getter = expOrFn;
      }

      this.cb = cb;
      this.options = options;
      this.id = ++id; // 第一次的value

      this.value = this.lazy ? undefined : this.get(); // 默认初始化 要取值
    } // 更新时可重新调用该方法


    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 一个属性可以对应多个watcher
        // 一个watcher可以对应多个属性 
        pushTarget(this);
        var value = this.getter.call(this.vm);
        popTarget();
        return value;
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.dirty = false; // 为false表示取过值了

        this.value = this.get(); // 用户的getter执行
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend(); //lastName,firstName 收集渲染watcher
        }
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depIds.has(id)) {
          this.depIds.add(id); //去重，一个组件中可用到多个相同的属性,让watcher记住dep

          this.deps.push(dep);
          dep.addSub(this); // 让dep存入watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          this.dirty = true;
        } else {
          queueWatcher(this); // 多次调用update 我希望先将watcher缓存下来，等一会一起更新
        }
      }
    }, {
      key: "run",
      value: function run() {
        var newVal = this.get();
        var oldVal = this.value;
        this.value = newVal;

        if (this.user) {
          this.cb.call(this.vm, newVal, oldVal);
        }
      }
    }]);

    return Watcher;
  }();

  function stateMixin(Vue) {
    Vue.prototype.$watch = function (key, handler) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options.user = true; // 是一个用户自己写的watcher
      // vm,name,用户回调，options.user

      new Watcher(this, key, handler, options);
    };
  }
  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) initData(vm);
    if (opts.watch) initWatch(vm);
    if (opts.props) initProps(vm);
    if (opts.methods) initMethods(vm);
    if (opts.computed) initComputed(vm);
  } // 初始化数据

  function initData(vm) {
    var data = vm.$options.data; // 可能是函数

    data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {}; // 把 data里的数据 代理到vm上

    var keys = Object.keys(data);
    var i = keys.length;

    while (i--) {
      proxy(vm, "_data", keys[i]);
    }

    observe(data); // 观察数据
  }

  function proxy(target, sourceKey, key) {
    Object.defineProperty(target, key, {
      get: function get() {
        return target[sourceKey][key];
      },
      set: function set(newVal) {
        target[sourceKey][key] = newVal;
      }
    });
  }

  function initWatch(vm) {
    // Object.keys
    var watch = vm.$options.watch;

    for (var key in watch) {
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    return vm.$watch(key, handler);
  }

  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {};

    for (var key in computed) {
      // 校验 
      var userDef = computed[key]; // 依赖的属性变化就重新取值 get

      var getter = typeof userDef == 'function' ? userDef : userDef.get; // 每个计算属性本质就是watcher   
      // 将watcher和 属性 做一个映射

      watchers[key] = new Watcher(vm, getter, function () {}, {
        lazy: true
      }); // 默认不执行
      // 将key 定义在vm上

      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(vm, key, userDef) {
    var sharedProperty = {};

    if (typeof userDef == 'function') {
      sharedProperty.get = userDef;
    } else {
      sharedProperty.get = createComputedGetter(key);
      sharedProperty.set = userDef.set;
    }

    Object.defineProperty(vm, key, sharedProperty); // computed就是一个defineProperty
  }

  function createComputedGetter(key) {
    return function () {
      // 取计算属性的值 走的是这个函数
      // this._computedWatchers 包含着所有的计算属性
      // 通过key 可以拿到对应watcher，这个watcher中包含了getter
      var watcher = this._computedWatchers[key]; // 脏就是 要调用用户的getter  不脏就是不要调用getter

      if (watcher.dirty) {
        // 根据dirty属性 来判断是否需要重新求职
        watcher.evaluate(); // this.get()
      } // 如果当前取完值后 Dep.target还有值  需要继续向上收集


      if (Dep.target) {
        // 计算属性watcher 内部 有两个dep  firstName,lastName
        watcher.depend(); // watcher 里 对应了 多个dep
      }

      return watcher.value;
    };
  }

  function patch(oldVnode, vnode) {
    if (oldVnode.nodeType == 1) {
      // 用vnode  来生成真实dom 替换原本的dom元素
      var parentElm = oldVnode.parentNode; // 找到他的父亲

      var elm = createElm(vnode); //根据虚拟节点 创建元素

      parentElm.insertBefore(elm, oldVnode.nextSibling);
      parentElm.removeChild(oldVnode);
      return elm;
    }
  }

  function createElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;
        vnode.vm;

    if (typeof tag === "string") {
      // 元素
      vnode.el = document.createElement(tag); // 虚拟节点会有一个el属性 对应真实节点

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function lifecycleMixin(Vue) {
    // 用虚拟dom 生成真实dom
    Vue.prototype._update = function (vnode) {
      // 既有初始化 又有更新
      var vm = this;
      vm.$el = patch(vm.$el, vnode); // 将返回的真实dom挂载到vm.$el上
    };
  }
  function mountComponent(vm, el) {
    // 将el挂载到vm上
    vm.$el = el; // 更新函数 数据变化后 会再次调用此函数

    var updateComponent = function updateComponent() {
      // 调用render函数，生成虚拟dom
      vm._update(vm._render()); // 后续更新可以调用updateComponent方法

    }; // updateComponent();


    callHook(vm, 'beforeMount');
    new Watcher(vm, updateComponent, function () {
      console.log('更新');
    }, true); // true 表示为渲染watcher

    callHook(vm, 'mounted');
  }
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm);
      }
    }
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{aaaaa}}
  // html字符串 =》 字符串  _c('div',{id:'app',a:1},'hello')

  function genProps(attrs) {
    // [{name:'xxx',value:'xxx'},{name:'xxx',value:'xxx'}]
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === "style") {
        (function () {
          // color:red;background:blue
          var styleObj = {};
          attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
            styleObj[arguments[1]] = arguments[2];
          });
          attr.value = styleObj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(el) {
    if (el.type == 1) {
      // element = 1 text = 3
      return generate(el);
    } else {
      var text = el.text;

      if (!defaultTagRE.test(text)) {
        return "_v('".concat(text, "')");
      } else {
        // 'hello' + arr + 'world'    hello {{arr}} {{aa}} world
        var tokens = [];
        var match;
        var lastIndex = defaultTagRE.lastIndex = 0; // CSS-LOADER 原理一样

        while (match = defaultTagRE.exec(text)) {
          // 看有没有匹配到
          var index = match.index; // 开始索引

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")")); // JSON.stringify()

          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children; // 获取儿子

    if (children) {
      return children.map(function (c) {
        return gen(c);
      }).join(",");
    }

    return false;
  }

  function generate(el) {
    //  _c('div',{id:'app',a:1},_c('span',{},'world'),_v())
    // 遍历树 将树拼接成字符串
    var children = genChildren(el);
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? genProps(el.attrs) : "undefined").concat(children ? ",".concat(children) : "", ")");
    return code;
  }

  /*!
   * HTML Parser By John Resig (ejohn.org)
   * Modified by Juriy "kangax" Zaytsev
   * Original code by Erik Arvidsson (MPL-1.1 OR Apache-2.0 OR GPL-2.0-or-later)
   * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
   */
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名 

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //  用来获取的标签名的 match后的索引为1的

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配开始标签的 

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配闭合标签的
  //           aa  =   "  xxx "  | '  xxxx '  | xxx

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // a=b  a="b"  a='b'

  var startTagClose = /^\s*(\/?)>/; //     />   <div/>
  // ast (语法层面的描述 js css html) vdom （dom节点）
  // html字符串解析成 对应的脚本来触发 tokens  <div id="app"> {{name}}</div>
  // 将解析后的结果 组装成一个树结构  栈

  function createAstElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      parent: null,
      attrs: attrs
    };
  }

  var root = null;
  var stack = [];

  function start(tagName, attributes) {
    var parent = stack[stack.length - 1];
    var element = createAstElement(tagName, attributes);

    if (!root) {
      root = element;
    }

    if (parent) {
      element.parent = parent; // 当放入栈中时 继续父亲是谁

      parent.children.push(element);
    }

    stack.push(element);
  }

  function end(tagName) {
    var last = stack.pop();

    if (last.tag !== tagName) {
      throw new Error('标签有误');
    }
  }

  function chars(text) {
    text = text.replace(/\s/g, "");
    var parent = stack[stack.length - 1];

    if (text) {
      parent.children.push({
        type: 3,
        text: text
      });
    }
  }

  function parserHTML(html) {
    function advance(len) {
      html = html.substring(len);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);

        var _end; // 如果没有遇到标签结尾就不停的解析


        var attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; // 不是开始标签
    }

    while (html) {
      // 看要解析的内容是否存在，如果存在就不停的解析
      var textEnd = html.indexOf('<'); // 当前解析的开头  

      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); // 解析开始标签

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      }

      var text = void 0; // //  </div>

      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        chars(text);
        advance(text.length);
      }
    }

    return root;
  } // 看一下用户是否传入了 , 没传入可能传入的是 template, template如果也没有传递
  // 将我们的html =》 词法解析  （开始标签 ， 结束标签，属性，文本）
  // => ast语法树 用来描述html语法的 stack=[]
  // codegen  <div>hello</div>  =>   _c('div',{},'hello')  => 让字符串执行
  // 字符串如果转成代码 eval 好性能 会有作用域问题
  // 模板引擎 new Function + with 来实现

  function compileToFunction(template) {
    var root = parserHTML(template); // 生成代码

    generate(root); // code 中会用到数据 数据在vm上

    var render = new Function("w$ith(this){return {code}}");
    return render;
  }

  var lifeCycleHooks = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed"];
  var strats = {}; // 存放各种策略

  function mergeHook(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal); // 后续
      } else {
        return [childVal]; // 第一次
      }
    } else {
      return parentVal;
    }
  }

  lifeCycleHooks.forEach(function (hook) {
    strats[hook] = mergeHook;
  });
  function mergeOptions(parent, child) {
    var options = {}; // 合并后的结果

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (parent.hasOwnProperty(_key)) {
        continue;
      }

      mergeField(_key);
    }

    function mergeField(key) {
      var parentVal = parent[key];
      var childVal = child[key]; // 策略模式

      if (strats[key]) {
        // 如果有对应的策略就调用对应的策略即可
        options[key] = strats[key](parentVal, childVal);
      } else {
        if (isObject(parentVal) && isObject(childVal)) {
          options[key] = _objectSpread2(_objectSpread2({}, parentVal), childVal);
        } else {
          // 父亲中有，儿子中没有
          options[key] = child[key] || parent[key];
        }
      }
    }

    return options;
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; // $options

      vm.$options = mergeOptions(vm.constructor.options, options);
      callHook(vm, "beforeCreate"); // 初始化状态

      initState(vm);
      callHook(vm, "created");

      if (vm.$options.el) {
        // 将数据挂载到这个模板上
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // 如果没有render方法

      if (!options.render) {
        var template = options.template; // 如果没有模板但是有el

        if (!template && el) {
          template = el.outerHTML;
        }

        var render = compileToFunction(template); //将template编译成render函数

        options.render = render;
      }

      mountComponent(vm, el); // 组件的挂载流程
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, data, data.key, children, undefined);
  }
  function createTextElement(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text // .....

    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      // createElement
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function (text) {
      // createTextElement
      return createTextElement(this, text);
    };

    Vue.prototype._s = function (val) {
      // stringify
      if (_typeof(val) == "object") return JSON.stringify(val);
      return val;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render; // 就是我们解析出来的render方法，同时也有可能是用户写的

      var vnode = render.call(vm);
      return vnode;
    };
  }

  function initGlobalApi(Vue) {
    Vue.options = {}; // 用来存放全局的配置 , 每个组件初始化的时候都会和options选项进行合并
    // Vue.component
    // Vue.filter
    // Vue.directive

    Vue.mixin = function (options) {
      this.options = mergeOptions(this.options, options);
      return this;
    };
  }

  function Vue(options) {
    // options 为用户传入的参数
    this._init(options); //初始化

  } // 扩展原型方法


  initMixin(Vue); //给原型加 init方法

  stateMixin(Vue); // 给原型加 $watch 方法

  lifecycleMixin(Vue); //_update方法 转为 真实dom

  renderMixin(Vue); //_render方法 生成vdom
  // 在类上扩展的 Vue.mixin

  initGlobalApi(Vue);
  /**
   * init 主要做了状态的初始化（数据的初始化）
   * $mount 找render方法(tempelete => render   ast->codegen->字符串)
   * render = with + new Function(code) 产生虚拟dom的方法
   * 虚拟dom => 真实dom
   * vm._update(vm_render())   虚拟dom->真实dom
   */

  return Vue;

}));
//# sourceMappingURL=vue.js.map

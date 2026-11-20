// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
// node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	};
	var assign = Object.assign;
	var emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	};
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result, thenable = ctor();
			thenable.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject, void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error, void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			});
			-1 === payload._status && (payload._status = 0, payload._result = thenable);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	function startTransition(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		currentTransition.types = null !== prevTransition ? prevTransition.types : null;
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function addTransitionType(type) {
		var transition = ReactSharedInternals.T;
		if (null !== transition) {
			var transitionTypes = transition.types;
			null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
		} else startTransition(addTransitionType.bind(null, type));
	}
	var Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.addTransitionType = addTransitionType;
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = startTransition;
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.3.1";
}));
// node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
// node_modules/scheduler/cjs/scheduler.production.js
/**
* @license React
* scheduler.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_scheduler_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	function push(heap, node) {
		var index = heap.length;
		heap.push(node);
		a: for (; 0 < index;) {
			var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
			if (0 < compare(parent, node)) heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
			else break a;
		}
	}
	function peek(heap) {
		return 0 === heap.length ? null : heap[0];
	}
	function pop(heap) {
		if (0 === heap.length) return null;
		var first = heap[0], last = heap.pop();
		if (last !== first) {
			heap[0] = last;
			a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength;) {
				var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
				if (0 > compare(left, last)) rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
				else if (rightIndex < length && 0 > compare(right, last)) heap[index] = right, heap[rightIndex] = last, index = rightIndex;
				else break a;
			}
		}
		return first;
	}
	function compare(a, b) {
		var diff = a.sortIndex - b.sortIndex;
		return 0 !== diff ? diff : a.id - b.id;
	}
	exports.unstable_now = void 0;
	if ("object" === typeof performance && "function" === typeof performance.now) {
		var localPerformance = performance;
		exports.unstable_now = function() {
			return localPerformance.now();
		};
	} else {
		var localDate = Date, initialTime = localDate.now();
		exports.unstable_now = function() {
			return localDate.now() - initialTime;
		};
	}
	var taskQueue = [];
	var timerQueue = [];
	var taskIdCounter = 1;
	var currentTask = null;
	var currentPriorityLevel = 3;
	var isPerformingWork = !1;
	var isHostCallbackScheduled = !1;
	var isHostTimeoutScheduled = !1;
	var needsPaint = !1;
	var localSetTimeout = "function" === typeof setTimeout ? setTimeout : null;
	var localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null;
	var localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
	function advanceTimers(currentTime) {
		for (var timer = peek(timerQueue); null !== timer;) {
			if (null === timer.callback) pop(timerQueue);
			else if (timer.startTime <= currentTime) pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
			else break;
			timer = peek(timerQueue);
		}
	}
	function handleTimeout(currentTime) {
		isHostTimeoutScheduled = !1;
		advanceTimers(currentTime);
		if (!isHostCallbackScheduled) if (null !== peek(taskQueue)) isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline());
		else {
			var firstTimer = peek(timerQueue);
			null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
		}
	}
	var isMessageLoopRunning = !1;
	var taskTimeoutID = -1;
	var frameInterval = 5;
	var startTime = -1;
	function shouldYieldToHost() {
		return needsPaint ? !0 : exports.unstable_now() - startTime < frameInterval ? !1 : !0;
	}
	function performWorkUntilDeadline() {
		needsPaint = !1;
		if (isMessageLoopRunning) {
			var currentTime = exports.unstable_now();
			startTime = currentTime;
			var hasMoreWork = !0;
			try {
				a: {
					isHostCallbackScheduled = !1;
					isHostTimeoutScheduled && (isHostTimeoutScheduled = !1, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
					isPerformingWork = !0;
					var previousPriorityLevel = currentPriorityLevel;
					try {
						b: {
							advanceTimers(currentTime);
							for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost());) {
								var callback = currentTask.callback;
								if ("function" === typeof callback) {
									currentTask.callback = null;
									currentPriorityLevel = currentTask.priorityLevel;
									var continuationCallback = callback(currentTask.expirationTime <= currentTime);
									currentTime = exports.unstable_now();
									if ("function" === typeof continuationCallback) {
										currentTask.callback = continuationCallback;
										advanceTimers(currentTime);
										hasMoreWork = !0;
										break b;
									}
									currentTask === peek(taskQueue) && pop(taskQueue);
									advanceTimers(currentTime);
								} else pop(taskQueue);
								currentTask = peek(taskQueue);
							}
							if (null !== currentTask) hasMoreWork = !0;
							else {
								var firstTimer = peek(timerQueue);
								null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
								hasMoreWork = !1;
							}
						}
						break a;
					} finally {
						currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = !1;
					}
					hasMoreWork = void 0;
				}
			} finally {
				hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = !1;
			}
		}
	}
	var schedulePerformWorkUntilDeadline;
	if ("function" === typeof localSetImmediate) schedulePerformWorkUntilDeadline = function() {
		localSetImmediate(performWorkUntilDeadline);
	};
	else if ("undefined" !== typeof MessageChannel) {
		var channel = new MessageChannel(), port = channel.port2;
		channel.port1.onmessage = performWorkUntilDeadline;
		schedulePerformWorkUntilDeadline = function() {
			port.postMessage(null);
		};
	} else schedulePerformWorkUntilDeadline = function() {
		localSetTimeout(performWorkUntilDeadline, 0);
	};
	function requestHostTimeout(callback, ms) {
		taskTimeoutID = localSetTimeout(function() {
			callback(exports.unstable_now());
		}, ms);
	}
	exports.unstable_IdlePriority = 5;
	exports.unstable_ImmediatePriority = 1;
	exports.unstable_LowPriority = 4;
	exports.unstable_NormalPriority = 3;
	exports.unstable_Profiling = null;
	exports.unstable_UserBlockingPriority = 2;
	exports.unstable_cancelCallback = function(task) {
		task.callback = null;
	};
	exports.unstable_forceFrameRate = function(fps) {
		0 > fps || 125 < fps ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
	};
	exports.unstable_getCurrentPriorityLevel = function() {
		return currentPriorityLevel;
	};
	exports.unstable_next = function(eventHandler) {
		switch (currentPriorityLevel) {
			case 1:
			case 2:
			case 3:
				var priorityLevel = 3;
				break;
			default: priorityLevel = currentPriorityLevel;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_requestPaint = function() {
		needsPaint = !0;
	};
	exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
		switch (priorityLevel) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: priorityLevel = 3;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
		var currentTime = exports.unstable_now();
		"object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
		switch (priorityLevel) {
			case 1:
				var timeout = -1;
				break;
			case 2:
				timeout = 250;
				break;
			case 5:
				timeout = 1073741823;
				break;
			case 4:
				timeout = 1e4;
				break;
			default: timeout = 5e3;
		}
		timeout = options + timeout;
		priorityLevel = {
			id: taskIdCounter++,
			callback,
			priorityLevel,
			startTime: options,
			expirationTime: timeout,
			sortIndex: -1
		};
		options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = !0, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline())));
		return priorityLevel;
	};
	exports.unstable_shouldYield = shouldYieldToHost;
	exports.unstable_wrapCallback = function(callback) {
		var parentPriorityLevel = currentPriorityLevel;
		return function() {
			var previousPriorityLevel = currentPriorityLevel;
			currentPriorityLevel = parentPriorityLevel;
			try {
				return callback.apply(this, arguments);
			} finally {
				currentPriorityLevel = previousPriorityLevel;
			}
		};
	};
}));
// node_modules/scheduler/index.js
var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_scheduler_production();
}));
// node_modules/react-dom/cjs/react-dom.production.js
/**
* @license React
* react-dom.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error(formatProdErrorMessage(522));
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	};
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
	var REACT_OPTIMISTIC_KEY = Symbol.for("react.optimistic_key");
	function createPortal$1(children, containerInfo, implementation) {
		var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		return {
			$$typeof: REACT_PORTAL_TYPE,
			key: null == key ? null : key === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : "" + key,
			children,
			containerInfo,
			implementation
		};
	}
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.browser = function(reason) {
		return {
			$$typeof: REACT_RECOVERABLE_TYPE,
			_reason: reason
		};
	};
	exports.createPortal = function(children, container) {
		var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
		if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
		return createPortal$1(children, container, null, key);
	};
	exports.flushSync = function(fn) {
		var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
		try {
			if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
		} finally {
			ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
		}
	};
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0,
					fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
			});
		} else Internals.d.m(href);
	};
	exports.requestFormReset = function(form) {
		Internals.d.r(form);
	};
	exports.unstable_batchedUpdates = function(fn, a) {
		return fn(a);
	};
	exports.useFormState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useFormState(action, initialState, permalink);
	};
	exports.useFormStatus = function() {
		return ReactSharedInternals.H.useHostTransitionStatus();
	};
	exports.version = "19.3.1";
}));
// node_modules/react-dom/index.js
var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_production();
}));
// node_modules/react-dom/cjs/react-dom-client.production.js
/**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_client_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scheduler = require_scheduler();
	var React = require_react();
	var ReactDOM = require_react_dom();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function isValidContainer(node) {
		return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
	}
	function getNearestMountedFiber(fiber) {
		for (var node = fiber, nextNode = node; nextNode && !nextNode.alternate;) node = nextNode, 0 !== (node.flags & 4098) && (fiber = node.return), nextNode = node.return;
		for (; node.return;) node = node.return;
		return 3 === node.tag ? fiber : null;
	}
	function getSuspenseInstanceFromFiber(fiber) {
		if (13 === fiber.tag) {
			var suspenseState = fiber.memoizedState;
			null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
			if (null !== suspenseState) return suspenseState.dehydrated;
		}
		return null;
	}
	function getActivityInstanceFromFiber(fiber) {
		if (31 === fiber.tag) {
			var activityState = fiber.memoizedState;
			null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
			if (null !== activityState) return activityState.dehydrated;
		}
		return null;
	}
	function assertIsMounted(fiber) {
		if (getNearestMountedFiber(fiber) !== fiber) throw Error(formatProdErrorMessage(188));
	}
	function findCurrentFiberUsingSlowPath(fiber) {
		var alternate = fiber.alternate;
		if (!alternate) {
			alternate = getNearestMountedFiber(fiber);
			if (null === alternate) throw Error(formatProdErrorMessage(188));
			return alternate !== fiber ? null : fiber;
		}
		for (var a = fiber, b = alternate;;) {
			var parentA = a.return;
			if (null === parentA) break;
			var parentB = parentA.alternate;
			if (null === parentB) {
				b = parentA.return;
				if (null !== b) {
					a = b;
					continue;
				}
				break;
			}
			if (parentA.child === parentB.child) {
				for (parentB = parentA.child; parentB;) {
					if (parentB === a) return assertIsMounted(parentA), fiber;
					if (parentB === b) return assertIsMounted(parentA), alternate;
					parentB = parentB.sibling;
				}
				throw Error(formatProdErrorMessage(188));
			}
			if (a.return !== b.return) a = parentA, b = parentB;
			else {
				for (var didFindChild = !1, child$0 = parentA.child; child$0;) {
					if (child$0 === a) {
						didFindChild = !0;
						a = parentA;
						b = parentB;
						break;
					}
					if (child$0 === b) {
						didFindChild = !0;
						b = parentA;
						a = parentB;
						break;
					}
					child$0 = child$0.sibling;
				}
				if (!didFindChild) {
					for (child$0 = parentB.child; child$0;) {
						if (child$0 === a) {
							didFindChild = !0;
							a = parentB;
							b = parentA;
							break;
						}
						if (child$0 === b) {
							didFindChild = !0;
							b = parentB;
							a = parentA;
							break;
						}
						child$0 = child$0.sibling;
					}
					if (!didFindChild) throw Error(formatProdErrorMessage(189));
				}
			}
			if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
		}
		if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
		return a.stateNode.current === a ? fiber : alternate;
	}
	function findCurrentHostFiberImpl(node) {
		var tag = node.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
		for (node = node.child; null !== node;) {
			tag = findCurrentHostFiberImpl(node);
			if (null !== tag) return tag;
			node = node.sibling;
		}
		return null;
	}
	function traverseVisibleInstancesAndTextInstances(child, searchWithinHosts, fn, a, b, c) {
		for (; null !== child;) {
			if ((5 === child.tag || 27 === child.tag || 6 === child.tag) && fn(child, a, b, c) || (22 !== child.tag || null === child.memoizedState) && (searchWithinHosts || 5 !== child.tag && 27 !== child.tag) && traverseVisibleInstancesAndTextInstances(child.child, searchWithinHosts, fn, a, b, c)) return !0;
			child = child.sibling;
		}
		return !1;
	}
	function getFragmentParentInstanceOrContainerFiber(fiber) {
		for (fiber = fiber.return; null !== fiber;) {
			if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) return fiber;
			fiber = fiber.return;
		}
		return null;
	}
	function fiberIsPortaledIntoHost(fiber) {
		var foundPortalParent = !1;
		for (fiber = fiber.return; null !== fiber;) {
			4 === fiber.tag && (foundPortalParent = !0);
			if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) break;
			fiber = fiber.return;
		}
		return foundPortalParent;
	}
	function getFragmentInstanceOrTextInstanceSiblings(fiber) {
		var result = [null, null], parentHostFiber = getFragmentParentInstanceOrContainerFiber(fiber);
		if (null === parentHostFiber) return result;
		findFragmentInstanceOrTextInstanceSiblings(result, fiber, parentHostFiber.child, { foundSelf: !1 });
		return result;
	}
	function findFragmentInstanceOrTextInstanceSiblings(result, self, child, state) {
		for (; null !== child;) {
			if (child === self) state.foundSelf = !0;
			else if (5 === child.tag || 27 === child.tag || 6 === child.tag) {
				if (state.foundSelf) return result[1] = child, !0;
				result[0] = child;
			} else if ((22 !== child.tag || null === child.memoizedState) && findFragmentInstanceOrTextInstanceSiblings(result, self, child.child, state)) return !0;
			child = child.sibling;
		}
		return !1;
	}
	function getInstanceFromHostFiber(fiber) {
		switch (fiber.tag) {
			case 5:
			case 27:
			case 6: return fiber.stateNode;
			case 3: return fiber.stateNode.containerInfo;
			default: throw Error(formatProdErrorMessage(559));
		}
	}
	var searchTarget = null;
	var searchBoundary = null;
	function isFiberPrecedingCheck(child, target, boundary) {
		return child === boundary ? !0 : child === target ? (searchTarget = child, !0) : !1;
	}
	function isFiberFollowingCheck(child, target, boundary) {
		return child === boundary ? (searchBoundary = child, !1) : child === target ? (null !== searchBoundary && (searchTarget = child), !0) : !1;
	}
	function getParentForFragmentAncestors(inst) {
		if (null === inst) return null;
		do
			inst = null === inst ? null : inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag && 3 !== inst.tag);
		return inst ? inst : null;
	}
	function getLowestCommonAncestor(instA, instB, getParent) {
		for (var depthA = 0, tempA = instA; tempA; tempA = getParent(tempA)) depthA++;
		tempA = 0;
		for (var tempB = instB; tempB; tempB = getParent(tempB)) tempA++;
		for (; 0 < depthA - tempA;) instA = getParent(instA), depthA--;
		for (; 0 < tempA - depthA;) instB = getParent(instB), tempA--;
		for (; depthA--;) {
			if (instA === instB || null !== instB && instA === instB.alternate) return instA;
			instA = getParent(instA);
			instB = getParent(instB);
		}
		return null;
	}
	var assign = Object.assign;
	var REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element");
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
	var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
	var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
	var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
	function getComponentNameFromType(type) {
		if (null == type) return null;
		if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
		if ("string" === typeof type) return type;
		switch (type) {
			case REACT_FRAGMENT_TYPE: return "Fragment";
			case REACT_PROFILER_TYPE: return "Profiler";
			case REACT_STRICT_MODE_TYPE: return "StrictMode";
			case REACT_SUSPENSE_TYPE: return "Suspense";
			case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
			case REACT_ACTIVITY_TYPE: return "Activity";
			case REACT_VIEW_TRANSITION_TYPE: return "ViewTransition";
		}
		if ("object" === typeof type) switch (type.$$typeof) {
			case REACT_PORTAL_TYPE: return "Portal";
			case REACT_CONTEXT_TYPE: return type.displayName || "Context";
			case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
			case REACT_FORWARD_REF_TYPE:
				var innerType = type.render;
				type = type.displayName;
				type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
				return type;
			case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
			case REACT_LAZY_TYPE:
				innerType = type._payload;
				type = type._init;
				try {
					return getComponentNameFromType(type(innerType));
				} catch (x) {}
		}
		return null;
	}
	var isArrayImpl = Array.isArray;
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	var sharedNotPendingObject = {
		pending: !1,
		data: null,
		method: null,
		action: null
	};
	var valueStack = [];
	var index = -1;
	function createCursor(defaultValue) {
		return { current: defaultValue };
	}
	function pop(cursor) {
		0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
	}
	function push(cursor, value) {
		index++;
		valueStack[index] = cursor.current;
		cursor.current = value;
	}
	var contextStackCursor = createCursor(null);
	var contextFiberStackCursor = createCursor(null);
	var rootInstanceStackCursor = createCursor(null);
	var hostTransitionProviderCursor = createCursor(null);
	function pushHostContainer(fiber, nextRootInstance) {
		push(rootInstanceStackCursor, nextRootInstance);
		push(contextFiberStackCursor, fiber);
		push(contextStackCursor, null);
		switch (nextRootInstance.nodeType) {
			case 9:
			case 11:
				fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
				break;
			default: if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI) nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
			else switch (fiber) {
				case "svg":
					fiber = 1;
					break;
				case "math":
					fiber = 2;
					break;
				default: fiber = 0;
			}
		}
		pop(contextStackCursor);
		push(contextStackCursor, fiber);
	}
	function popHostContainer() {
		pop(contextStackCursor);
		pop(contextFiberStackCursor);
		pop(rootInstanceStackCursor);
	}
	function pushHostContext(fiber) {
		var stateHook = fiber.memoizedState;
		null !== stateHook && (HostTransitionContext._currentValue = stateHook.memoizedState, push(hostTransitionProviderCursor, fiber));
		stateHook = contextStackCursor.current;
		var JSCompiler_inline_result = getChildHostContextProd(stateHook, fiber.type);
		stateHook !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
	}
	function popHostContext(fiber) {
		contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
		hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
	}
	var prefix;
	var suffix;
	function describeBuiltInComponentFrame(name) {
		if (void 0 === prefix) try {
			throw Error();
		} catch (x) {
			var match = x.stack.trim().match(/\n( *(at )?)/);
			prefix = match && match[1] || "";
			suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + prefix + name + suffix;
	}
	var reentry = !1;
	function describeNativeComponentFrame(fn, construct) {
		if (!fn || reentry) return "";
		reentry = !0;
		var previousPrepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var RunInRootFrame = { DetermineComponentFrameRoot: function() {
				try {
					if (construct) {
						var Fake = function() {
							throw Error();
						};
						Object.defineProperty(Fake.prototype, "props", { set: function() {
							throw Error();
						} });
						if ("object" === typeof Reflect && Reflect.construct) {
							try {
								Reflect.construct(Fake, []);
							} catch (x) {
								var control = x;
							}
							Reflect.construct(fn, [], Fake);
						} else {
							try {
								Fake.call();
							} catch (x$1) {
								control = x$1;
							}
							Fake = !1;
							try {
								var prevProps = Object.getOwnPropertyDescriptor(fn.prototype, "props");
								Object.defineProperty(fn.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								});
								Fake = !0;
								new fn();
							} finally {
								Fake && (void 0 !== prevProps ? Object.defineProperty(fn.prototype, "props", prevProps) : delete fn.prototype.props);
							}
						}
					} else {
						try {
							throw Error();
						} catch (x$2) {
							control = x$2;
						}
						(Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
					}
				} catch (sample) {
					if (sample && control && "string" === typeof sample.stack) return [sample.stack, control.stack];
				}
				return [null, null];
			} };
			RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
			namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
			if (sampleStack && controlStack) {
				var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
				for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");) RunInRootFrame++;
				for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");) namePropDescriptor++;
				if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length) for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];) namePropDescriptor--;
				for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--) if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
					if (1 !== RunInRootFrame || 1 !== namePropDescriptor) do
						if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
							var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
							fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
							return frame;
						}
					while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
					break;
				}
			}
		} finally {
			reentry = !1, Error.prepareStackTrace = previousPrepareStackTrace;
		}
		return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
	}
	function describeFiber(fiber, childFiber) {
		switch (fiber.tag) {
			case 26:
			case 27:
			case 5: return describeBuiltInComponentFrame(fiber.type);
			case 16: return describeBuiltInComponentFrame("Lazy");
			case 13: return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
			case 19: return describeBuiltInComponentFrame("SuspenseList");
			case 0:
			case 15: return describeNativeComponentFrame(fiber.type, !1);
			case 11: return describeNativeComponentFrame(fiber.type.render, !1);
			case 1: return describeNativeComponentFrame(fiber.type, !0);
			case 31: return describeBuiltInComponentFrame("Activity");
			case 30: return describeBuiltInComponentFrame("ViewTransition");
			default: return "";
		}
	}
	function getStackByFiberInDevAndProd(workInProgress) {
		try {
			var info = "", previous = null;
			do
				info += describeFiber(workInProgress, previous), previous = workInProgress, workInProgress = workInProgress.return;
			while (workInProgress);
			return info;
		} catch (x) {
			return "\nError generating stack: " + x.message + "\n" + x.stack;
		}
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
	var cancelCallback$1 = Scheduler.unstable_cancelCallback;
	var shouldYield = Scheduler.unstable_shouldYield;
	var requestPaint = Scheduler.unstable_requestPaint;
	var now = Scheduler.unstable_now;
	var getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
	var ImmediatePriority = Scheduler.unstable_ImmediatePriority;
	var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
	var NormalPriority$1 = Scheduler.unstable_NormalPriority;
	var LowPriority = Scheduler.unstable_LowPriority;
	var IdlePriority = Scheduler.unstable_IdlePriority;
	var log$1 = Scheduler.log;
	var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
	var rendererID = null;
	var injectedHook = null;
	function setIsStrictModeForDevtools(newIsStrictMode) {
		"function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
		if (injectedHook && "function" === typeof injectedHook.setStrictMode) try {
			injectedHook.setStrictMode(rendererID, newIsStrictMode);
		} catch (err) {}
	}
	var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
	var log = Math.log;
	var LN2 = Math.LN2;
	function clz32Fallback(x) {
		x >>>= 0;
		return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
	}
	var nextTransitionUpdateLane = 256;
	var nextTransitionDeferredLane = 262144;
	var nextRetryLane = 4194304;
	function getHighestPriorityLanes(lanes) {
		var pendingSyncLanes = lanes & 42;
		if (0 !== pendingSyncLanes) return pendingSyncLanes;
		switch (lanes & -lanes) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return lanes & -lanes;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return lanes & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return lanes & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return lanes;
		}
	}
	function getNextLanes(root, wipLanes, rootHasPendingCommit) {
		var pendingLanes = root.pendingLanes;
		if (0 === pendingLanes) return 0;
		var nextLanes = 0, suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
		root = root.warmLanes;
		var nonIdlePendingLanes = pendingLanes & 134217727;
		0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
		return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
	}
	function checkIfRootIsPrerendering(root, renderLanes) {
		return 0 === (root.pendingLanes & ~(root.suspendedLanes & ~root.pingedLanes) & renderLanes);
	}
	function getEntangledLanes(root, renderLanes) {
		0 !== (renderLanes & 8) && (renderLanes |= renderLanes & 32);
		var allEntangledLanes = root.entangledLanes;
		if (0 !== allEntangledLanes) for (root = root.entanglements, allEntangledLanes &= renderLanes; 0 < allEntangledLanes;) {
			var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
			renderLanes |= root[index$4];
			allEntangledLanes &= ~lane;
		}
		return renderLanes;
	}
	function computeExpirationTime(lane, currentTime) {
		switch (lane) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return currentTime + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return currentTime + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function claimNextRetryLane() {
		var lane = nextRetryLane;
		nextRetryLane <<= 1;
		0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
		return lane;
	}
	function createLaneMap(initial) {
		for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
		return laneMap;
	}
	function markRootUpdated$1(root, updateLane) {
		root.pendingLanes |= updateLane;
		268435456 !== updateLane && (root.suspendedLanes = 0, root.pingedLanes = 0, root.warmLanes = 0);
	}
	function markRootFinished(root, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
		var previouslyPendingLanes = root.pendingLanes;
		root.pendingLanes = remainingLanes;
		root.suspendedLanes = 0;
		root.pingedLanes = 0;
		root.warmLanes = 0;
		root.expiredLanes &= remainingLanes;
		root.entangledLanes &= remainingLanes;
		root.errorRecoveryDisabledLanes &= remainingLanes;
		root.shellSuspendCounter = 0;
		var entanglements = root.entanglements, expirationTimes = root.expirationTimes, hiddenUpdates = root.hiddenUpdates;
		for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes;) {
			var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
			entanglements[index$7] = 0;
			expirationTimes[index$7] = -1;
			var hiddenUpdatesForLane = hiddenUpdates[index$7];
			if (null !== hiddenUpdatesForLane) for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
				var update = hiddenUpdatesForLane[index$7];
				null !== update && (update.lane &= -536870913);
			}
			remainingLanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, 0);
		0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root.tag && (root.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
	}
	function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
		root.pendingLanes |= spawnedLane;
		root.suspendedLanes &= ~spawnedLane;
		var spawnedLaneIndex = 31 - clz32(spawnedLane);
		root.entangledLanes |= spawnedLane;
		root.entanglements[spawnedLaneIndex] = root.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
	}
	function markRootEntangled(root, entangledLanes) {
		var rootEntangledLanes = root.entangledLanes |= entangledLanes;
		for (root = root.entanglements; rootEntangledLanes;) {
			var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
			lane & entangledLanes | root[index$8] & entangledLanes && (root[index$8] |= entangledLanes);
			rootEntangledLanes &= ~lane;
		}
	}
	function getBumpedLaneForHydration(root, renderLanes) {
		var renderLane = renderLanes & -renderLanes;
		renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
		return 0 !== (renderLane & (root.suspendedLanes | renderLanes)) ? 0 : renderLane;
	}
	function getBumpedLaneForHydrationByLane(lane) {
		switch (lane) {
			case 2:
				lane = 1;
				break;
			case 8:
				lane = 4;
				break;
			case 32:
				lane = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				lane = 128;
				break;
			case 268435456:
				lane = 134217728;
				break;
			default: lane = 0;
		}
		return lane;
	}
	function lanesToEventPriority(lanes) {
		lanes &= -lanes;
		return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
	}
	function resolveUpdatePriority() {
		var updatePriority = ReactDOMSharedInternals.p;
		if (0 !== updatePriority) return updatePriority;
		updatePriority = window.event;
		return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
	}
	function runWithPriority(priority, fn) {
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			return ReactDOMSharedInternals.p = priority, fn();
		} finally {
			ReactDOMSharedInternals.p = previousPriority;
		}
	}
	var randomKey = Math.random().toString(36).slice(2);
	var internalInstanceKey = "__reactFiber$" + randomKey;
	var internalPropsKey = "__reactProps$" + randomKey;
	var internalContainerInstanceKey = "__reactContainer$" + randomKey;
	var internalEventHandlersKey = "__reactEvents$" + randomKey;
	var internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
	var internalEventHandlesSetKey = "__reactHandles$" + randomKey;
	var internalRootNodeResourcesKey = "__reactResources$" + randomKey;
	var internalHoistableMarker = "__reactMarker$" + randomKey;
	var internalLoadPendingKey = "__reactLoad$" + randomKey;
	function detachDeletedInstance(node) {
		delete node[internalInstanceKey];
		delete node[internalPropsKey];
		delete node[internalEventHandlerListenersKey];
		delete node[internalEventHandlesSetKey];
	}
	function getClosestInstanceFromNode(targetNode) {
		var targetInst;
		if (targetInst = targetNode[internalInstanceKey]) return targetInst;
		for (var parentNode = targetNode.parentNode; parentNode;) {
			if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
				parentNode = targetInst.alternate;
				if (null !== targetInst.child || null !== parentNode && null !== parentNode.child) for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode;) {
					if (parentNode = targetNode[internalInstanceKey]) return parentNode;
					targetNode = getParentHydrationBoundary(targetNode);
				}
				return targetInst;
			}
			targetNode = parentNode;
			parentNode = targetNode.parentNode;
		}
		return null;
	}
	function getInstanceFromNode(node) {
		if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
			var tag = node.tag;
			if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag) return node;
		}
		return null;
	}
	function getNodeFromInstance(inst) {
		var tag = inst.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
		throw Error(formatProdErrorMessage(33));
	}
	function getResourcesFromRoot(root) {
		var resources = root[internalRootNodeResourcesKey];
		resources || (resources = root[internalRootNodeResourcesKey] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		});
		return resources;
	}
	function markNodeAsHoistable(node) {
		node[internalHoistableMarker] = !0;
	}
	function clearPendingLoadOnNode(node) {
		node[internalLoadPendingKey] = void 0;
	}
	var allNativeEvents = /* @__PURE__ */ new Set();
	var registrationNameDependencies = {};
	function registerTwoPhaseEvent(registrationName, dependencies) {
		registerDirectEvent(registrationName, dependencies);
		registerDirectEvent(registrationName + "Capture", dependencies);
	}
	function registerDirectEvent(registrationName, dependencies) {
		registrationNameDependencies[registrationName] = dependencies;
		for (registrationName = 0; registrationName < dependencies.length; registrationName++) allNativeEvents.add(dependencies[registrationName]);
	}
	var VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$");
	var illegalAttributeNameCache = {};
	var validatedAttributeNameCache = {};
	function isAttributeNameSafe(attributeName) {
		if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
		if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
		if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) return validatedAttributeNameCache[attributeName] = !0;
		illegalAttributeNameCache[attributeName] = !0;
		return !1;
	}
	var viewTransitionMutationContext = !1;
	function pushMutationContext() {
		var prev = viewTransitionMutationContext;
		viewTransitionMutationContext = !1;
		return prev;
	}
	function setValueForAttribute(node, name, value) {
		if (isAttributeNameSafe(name)) if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
					node.removeAttribute(name);
					return;
				case "boolean":
					var prefix$10 = name.toLowerCase().slice(0, 5);
					if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
						node.removeAttribute(name);
						return;
					}
			}
			node.setAttribute(name, value);
		}
	}
	function setValueForKnownAttribute(node, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttribute(name, value);
		}
	}
	function setValueForNamespacedAttribute(node, namespace, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttributeNS(namespace, name, value);
		}
	}
	function getToStringValue(value) {
		switch (typeof value) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return value;
			case "object": return value;
			default: return "";
		}
	}
	function isCheckable(elem) {
		var type = elem.type;
		return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
	}
	function trackValueOnNode(node, valueField, currentValue) {
		var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
		if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
			var get = descriptor.get, set = descriptor.set;
			Object.defineProperty(node, valueField, {
				configurable: !0,
				get: function() {
					return get.call(this);
				},
				set: function(value) {
					currentValue = "" + value;
					set.call(this, value);
				}
			});
			Object.defineProperty(node, valueField, { enumerable: descriptor.enumerable });
			return {
				getValue: function() {
					return currentValue;
				},
				setValue: function(value) {
					currentValue = "" + value;
				},
				stopTracking: function() {
					node._valueTracker = null;
					delete node[valueField];
				}
			};
		}
	}
	function track(node) {
		if (!node._valueTracker) {
			var valueField = isCheckable(node) ? "checked" : "value";
			node._valueTracker = trackValueOnNode(node, valueField, "" + node[valueField]);
		}
	}
	function updateValueIfChanged(node) {
		if (!node) return !1;
		var tracker = node._valueTracker;
		if (!tracker) return !0;
		var lastValue = tracker.getValue();
		var value = "";
		node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
		node = value;
		return node !== lastValue ? (tracker.setValue(node), !0) : !1;
	}
	var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
	function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
		return value.replace(escapeSelectorAttributeValueInsideDoubleQuotesRegex, function(ch) {
			return "\\" + ch.charCodeAt(0).toString(16) + " ";
		});
	}
	function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
		element.name = "";
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
		if (null != value) if ("number" === type) {
			if (0 === value && "" === element.value || element.value != value) element.value = "" + getToStringValue(value);
		} else element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
		else "submit" !== type && "reset" !== type || element.removeAttribute("value");
		null != value ? "number" === type && element.value == value ? setDefaultValue(element, getToStringValue(element.value)) : setDefaultValue(element, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
		null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
		null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
	}
	function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating) {
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
		if (null != value || null != defaultValue) {
			if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
				track(element);
				return;
			}
			defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
			value = null != value ? "" + getToStringValue(value) : defaultValue;
			isHydrating || value === element.value || (element.value = value);
			element.defaultValue = value;
		}
		checked = null != checked ? checked : defaultChecked;
		checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
		element.checked = isHydrating ? element.checked : !!checked;
		element.defaultChecked = !!checked;
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
		track(element);
	}
	function setDefaultValue(node, value) {
		node.defaultValue !== "" + value && (node.defaultValue = "" + value);
	}
	function updateOptions(node, multiple, propValue, setDefaultSelected) {
		node = node.options;
		if (multiple) {
			multiple = {};
			for (var i = 0; i < propValue.length; i++) multiple["$" + propValue[i]] = !0;
			for (propValue = 0; propValue < node.length; propValue++) i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = !0);
		} else {
			propValue = "" + getToStringValue(propValue);
			multiple = null;
			for (i = 0; i < node.length; i++) {
				if (node[i].value === propValue) {
					node[i].selected = !0;
					setDefaultSelected && (node[i].defaultSelected = !0);
					return;
				}
				null !== multiple || node[i].disabled || (multiple = node[i]);
			}
			null !== multiple && (multiple.selected = !0);
		}
	}
	function updateTextarea(element, value, defaultValue) {
		if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
			element.defaultValue !== value && (element.defaultValue = value);
			return;
		}
		element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
	}
	function initTextarea(element, value, defaultValue, children) {
		if (null == value) {
			if (null != children) {
				if (null != defaultValue) throw Error(formatProdErrorMessage(92));
				if (isArrayImpl(children)) {
					if (1 < children.length) throw Error(formatProdErrorMessage(93));
					children = children[0];
				}
				defaultValue = children;
			}
			defaultValue ??= "";
			value = defaultValue;
		}
		defaultValue = getToStringValue(value);
		element.defaultValue = defaultValue;
		children = element.textContent;
		children === defaultValue && "" !== children && null !== children && (element.value = children);
		track(element);
	}
	function setTextContent(node, text) {
		if (text) {
			var firstChild = node.firstChild;
			if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
				firstChild.nodeValue = text;
				return;
			}
		}
		node.textContent = text;
	}
	var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function setValueForStyle(style, styleName, value) {
		var isCustomProperty = 0 === styleName.indexOf("--");
		null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style.setProperty(styleName, "") : "float" === styleName ? style.cssFloat = "" : style[styleName] = "" : isCustomProperty ? style.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style.cssFloat = value : style[styleName] = ("" + value).trim() : style[styleName] = value + "px";
	}
	function setValueForStyles(node, styles, prevStyles) {
		if (null != styles && "object" !== typeof styles) throw Error(formatProdErrorMessage(62));
		node = node.style;
		if (null != prevStyles) {
			for (var styleName in prevStyles) !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "", viewTransitionMutationContext = !0);
			for (var styleName$16 in styles) styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && (setValueForStyle(node, styleName$16, styleName), viewTransitionMutationContext = !0);
		} else for (var styleName$17 in styles) styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
	}
	function isCustomElement(tagName) {
		if (-1 === tagName.indexOf("-")) return !1;
		switch (tagName) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var aliases = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]);
	var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function sanitizeURL(url) {
		return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
	}
	function noop$1() {}
	var currentReplayingEvent = null;
	function getEventTarget(nativeEvent) {
		nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
		nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
		return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
	}
	var restoreTarget = null;
	var restoreQueue = null;
	function restoreStateOfTarget(target) {
		var internalInstance = getInstanceFromNode(target);
		if (internalInstance && (target = internalInstance.stateNode)) {
			var props = target[internalPropsKey] || null;
			a: switch (target = internalInstance.stateNode, internalInstance.type) {
				case "input":
					updateInput(target, props.value, props.defaultValue, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name);
					internalInstance = props.name;
					if ("radio" === props.type && null != internalInstance) {
						for (props = target; props.parentNode;) props = props.parentNode;
						props = props.querySelectorAll("input[name=\"" + escapeSelectorAttributeValueInsideDoubleQuotes("" + internalInstance) + "\"][type=\"radio\"]");
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
							var otherNode = props[internalInstance];
							if (otherNode !== target && otherNode.form === target.form) {
								var otherProps = otherNode[internalPropsKey] || null;
								if (!otherProps) throw Error(formatProdErrorMessage(90));
								updateInput(otherNode, otherProps.value, otherProps.defaultValue, otherProps.defaultValue, otherProps.checked, otherProps.defaultChecked, otherProps.type, otherProps.name);
							}
						}
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
					}
					break a;
				case "textarea":
					updateTextarea(target, props.value, props.defaultValue);
					break a;
				case "select": internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, !1);
			}
		}
	}
	var isInsideEventHandler = !1;
	function batchedUpdates$1(fn, a, b) {
		if (isInsideEventHandler) return fn(a, b);
		isInsideEventHandler = !0;
		try {
			return fn(a);
		} finally {
			if (isInsideEventHandler = !1, null !== restoreTarget || null !== restoreQueue) {
				if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn)) for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
			}
		}
	}
	function getListener(inst, registrationName) {
		var stateNode = inst.stateNode;
		if (null === stateNode) return null;
		var props = stateNode[internalPropsKey] || null;
		if (null === props) return null;
		stateNode = props[registrationName];
		a: switch (registrationName) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
				inst = !props;
				break a;
			default: inst = !1;
		}
		if (inst) return null;
		if (stateNode && "function" !== typeof stateNode) throw Error(formatProdErrorMessage(231, registrationName, typeof stateNode));
		return stateNode;
	}
	var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
	var passiveBrowserEventsSupported = !1;
	if (canUseDOM) try {
		var options = {};
		Object.defineProperty(options, "passive", { get: function() {
			passiveBrowserEventsSupported = !0;
		} });
		window.addEventListener("test", options, options);
		window.removeEventListener("test", options, options);
	} catch (e) {
		passiveBrowserEventsSupported = !1;
	}
	var root = null;
	var startText = null;
	var fallbackText = null;
	function getData() {
		if (fallbackText) return fallbackText;
		var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
		for (start = 0; start < startLength && startValue[start] === endValue[start]; start++);
		var minEnd = startLength - start;
		for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++);
		return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
	}
	function getEventCharCode(nativeEvent) {
		var keyCode = nativeEvent.keyCode;
		"charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
		10 === nativeEvent && (nativeEvent = 13);
		return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
	}
	function functionThatReturnsTrue() {
		return !0;
	}
	function functionThatReturnsFalse() {
		return !1;
	}
	function createSyntheticEvent(Interface) {
		function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
			this._reactName = reactName;
			this._targetInst = targetInst;
			this.type = reactEventType;
			this.nativeEvent = nativeEvent;
			this.target = nativeEventTarget;
			this.currentTarget = null;
			for (var propName in Interface) Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
			this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : !1 === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
			this.isPropagationStopped = functionThatReturnsFalse;
			return this;
		}
		assign(SyntheticBaseEvent.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var event = this.nativeEvent;
				event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = !1), this.isDefaultPrevented = functionThatReturnsTrue);
			},
			stopPropagation: function() {
				var event = this.nativeEvent;
				event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = !0), this.isPropagationStopped = functionThatReturnsTrue);
			},
			persist: function() {},
			isPersistent: functionThatReturnsTrue
		});
		return SyntheticBaseEvent;
	}
	var EventInterface = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(event) {
			return event.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	};
	var SyntheticEvent = createSyntheticEvent(EventInterface);
	var UIEventInterface = assign({}, EventInterface, {
		view: 0,
		detail: 0
	});
	var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
	var lastMovementX;
	var lastMovementY;
	var lastMouseEvent;
	var MouseEventInterface = assign({}, UIEventInterface, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: getEventModifierState,
		button: 0,
		buttons: 0,
		relatedTarget: function(event) {
			return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
		},
		movementX: function(event) {
			if ("movementX" in event) return event.movementX;
			event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
			return lastMovementX;
		},
		movementY: function(event) {
			return "movementY" in event ? event.movementY : lastMovementY;
		}
	});
	var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
	var SyntheticDragEvent = createSyntheticEvent(assign({}, MouseEventInterface, { dataTransfer: 0 }));
	var SyntheticFocusEvent = createSyntheticEvent(assign({}, UIEventInterface, { relatedTarget: 0 }));
	var SyntheticAnimationEvent = createSyntheticEvent(assign({}, EventInterface, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	}));
	var SyntheticClipboardEvent = createSyntheticEvent(assign({}, EventInterface, { clipboardData: function(event) {
		return "clipboardData" in event ? event.clipboardData : window.clipboardData;
	} }));
	var SyntheticCompositionEvent = createSyntheticEvent(assign({}, EventInterface, { data: 0 }));
	var normalizeKey = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	};
	var translateToKey = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	};
	var modifierKeyToProp = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function modifierStateGetter(keyArg) {
		var nativeEvent = this.nativeEvent;
		return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : !1;
	}
	function getEventModifierState() {
		return modifierStateGetter;
	}
	var SyntheticKeyboardEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		key: function(nativeEvent) {
			if (nativeEvent.key) {
				var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
				if ("Unidentified" !== key) return key;
			}
			return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: getEventModifierState,
		charCode: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : 0;
		},
		keyCode: function(event) {
			return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		},
		which: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		}
	}));
	var SyntheticPointerEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	}));
	var SyntheticSubmitEvent = createSyntheticEvent(assign({}, EventInterface, { submitter: 0 }));
	var SyntheticTouchEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: getEventModifierState
	}));
	var SyntheticTransitionEvent = createSyntheticEvent(assign({}, EventInterface, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	}));
	var SyntheticWheelEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		deltaX: function(event) {
			return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
		},
		deltaY: function(event) {
			return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	}));
	var SyntheticToggleEvent = createSyntheticEvent(assign({}, EventInterface, {
		newState: 0,
		oldState: 0,
		source: 0
	}));
	var END_KEYCODES = [
		9,
		13,
		27,
		32
	];
	var canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
	var documentMode = null;
	canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
	var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
	var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
	var SPACEBAR_CHAR = String.fromCharCode(32);
	var hasSpaceKeypress = !1;
	function isFallbackCompositionEnd(domEventName, nativeEvent) {
		switch (domEventName) {
			case "keyup": return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
			case "keydown": return 229 !== nativeEvent.keyCode;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function getDataFromCustomEvent(nativeEvent) {
		nativeEvent = nativeEvent.detail;
		return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
	}
	var isComposing = !1;
	function getNativeBeforeInputChars(domEventName, nativeEvent) {
		switch (domEventName) {
			case "compositionend": return getDataFromCustomEvent(nativeEvent);
			case "keypress":
				if (32 !== nativeEvent.which) return null;
				hasSpaceKeypress = !0;
				return SPACEBAR_CHAR;
			case "textInput": return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
			default: return null;
		}
	}
	function getFallbackBeforeInputChars(domEventName, nativeEvent) {
		if (isComposing) return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = !1, domEventName) : null;
		switch (domEventName) {
			case "paste": return null;
			case "keypress":
				if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
					if (nativeEvent.char && 1 < nativeEvent.char.length) return nativeEvent.char;
					if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
				}
				return null;
			case "compositionend": return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
			default: return null;
		}
	}
	var supportedInputTypes = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function isTextInputElement(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? !0 : !1;
	}
	function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
		restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
		inst = accumulateTwoPhaseListeners(inst, "onChange");
		0 < inst.length && (nativeEvent = new SyntheticEvent("onChange", "change", null, nativeEvent, target), dispatchQueue.push({
			event: nativeEvent,
			listeners: inst
		}));
	}
	var activeElement$1 = null;
	var activeElementInst$1 = null;
	function runEventInBatch(dispatchQueue) {
		processDispatchQueue(dispatchQueue, 0);
	}
	function getInstIfValueChanged(targetInst) {
		if (updateValueIfChanged(getNodeFromInstance(targetInst))) return targetInst;
	}
	function getTargetInstForChangeEvent(domEventName, targetInst) {
		if ("change" === domEventName) return targetInst;
	}
	var isInputEventSupported = !1;
	if (canUseDOM) {
		var JSCompiler_inline_result$jscomp$318;
		if (canUseDOM) {
			var isSupported$jscomp$inline_474 = "oninput" in document;
			if (!isSupported$jscomp$inline_474) {
				var element$jscomp$inline_475 = document.createElement("div");
				element$jscomp$inline_475.setAttribute("oninput", "return;");
				isSupported$jscomp$inline_474 = "function" === typeof element$jscomp$inline_475.oninput;
			}
			JSCompiler_inline_result$jscomp$318 = isSupported$jscomp$inline_474;
		} else JSCompiler_inline_result$jscomp$318 = !1;
		isInputEventSupported = JSCompiler_inline_result$jscomp$318 && (!document.documentMode || 9 < document.documentMode);
	}
	function stopWatchingForValueChange() {
		activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
	}
	function handlePropertyChange(nativeEvent) {
		if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
			var dispatchQueue = [];
			createAndAccumulateChangeEvent(dispatchQueue, activeElementInst$1, nativeEvent, getEventTarget(nativeEvent));
			batchedUpdates$1(runEventInBatch, dispatchQueue);
		}
	}
	function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
		"focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
	}
	function getTargetInstForInputEventPolyfill(domEventName) {
		if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName) return getInstIfValueChanged(activeElementInst$1);
	}
	function getTargetInstForClickEvent(domEventName, targetInst) {
		if ("click" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
		if ("input" === domEventName || "change" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	function shallowEqual(objA, objB) {
		if (objectIs(objA, objB)) return !0;
		if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB) return !1;
		var keysA = Object.keys(objA), keysB = Object.keys(objB);
		if (keysA.length !== keysB.length) return !1;
		for (keysB = 0; keysB < keysA.length; keysB++) {
			var currentKey = keysA[keysB];
			if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey])) return !1;
		}
		return !0;
	}
	function getActiveElement(doc) {
		doc = doc || ("undefined" !== typeof document ? document : void 0);
		if ("undefined" === typeof doc) return null;
		try {
			return doc.activeElement || doc.body;
		} catch (e$20) {
			return doc.body;
		}
	}
	function getLeafNode(node) {
		for (; node && node.firstChild;) node = node.firstChild;
		return node;
	}
	function getNodeForCharacterOffset(root, offset) {
		var node = getLeafNode(root);
		root = 0;
		for (var nodeEnd; node;) {
			if (3 === node.nodeType) {
				nodeEnd = root + node.textContent.length;
				if (root <= offset && nodeEnd >= offset) return {
					node,
					offset: offset - root
				};
				root = nodeEnd;
			}
			a: {
				for (; node;) {
					if (node.nextSibling) {
						node = node.nextSibling;
						break a;
					}
					node = node.parentNode;
				}
				node = void 0;
			}
			node = getLeafNode(node);
		}
	}
	function containsNode(outerNode, innerNode) {
		return outerNode && innerNode ? outerNode === innerNode ? !0 : outerNode && 3 === outerNode.nodeType ? !1 : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : !1 : !1;
	}
	function getActiveElementDeep(containerInfo) {
		containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
		for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement;) {
			try {
				var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
			} catch (err) {
				JSCompiler_inline_result = !1;
			}
			if (JSCompiler_inline_result) containerInfo = element.contentWindow;
			else break;
			element = getActiveElement(containerInfo.document);
		}
		return element;
	}
	function hasSelectionCapabilities(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
	}
	var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
	var activeElement = null;
	var activeElementInst = null;
	var lastSelection = null;
	var mouseDown = !1;
	function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
		var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
		mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = {
			start: doc.selectionStart,
			end: doc.selectionEnd
		} : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
			anchorNode: doc.anchorNode,
			anchorOffset: doc.anchorOffset,
			focusNode: doc.focusNode,
			focusOffset: doc.focusOffset
		}), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
			event: nativeEvent,
			listeners: doc
		}), nativeEvent.target = activeElement)));
	}
	function makePrefixMap(styleProp, eventName) {
		var prefixes = {};
		prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
		prefixes["Webkit" + styleProp] = "webkit" + eventName;
		prefixes["Moz" + styleProp] = "moz" + eventName;
		return prefixes;
	}
	var vendorPrefixes = {
		animationend: makePrefixMap("Animation", "AnimationEnd"),
		animationiteration: makePrefixMap("Animation", "AnimationIteration"),
		animationstart: makePrefixMap("Animation", "AnimationStart"),
		transitionrun: makePrefixMap("Transition", "TransitionRun"),
		transitionstart: makePrefixMap("Transition", "TransitionStart"),
		transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
		transitionend: makePrefixMap("Transition", "TransitionEnd")
	};
	var prefixedEventNames = {};
	var style = {};
	canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
	function getVendorPrefixedEventName(eventName) {
		if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
		if (!vendorPrefixes[eventName]) return eventName;
		var prefixMap = vendorPrefixes[eventName], styleProp;
		for (styleProp in prefixMap) if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) return prefixedEventNames[eventName] = prefixMap[styleProp];
		return eventName;
	}
	var ANIMATION_END = getVendorPrefixedEventName("animationend");
	var ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
	var ANIMATION_START = getVendorPrefixedEventName("animationstart");
	var TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
	var TRANSITION_START = getVendorPrefixedEventName("transitionstart");
	var TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
	var TRANSITION_END = getVendorPrefixedEventName("transitionend");
	var topLevelEventsToReactNames = /* @__PURE__ */ new Map();
	var simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	simpleEventPluginEvents.push("scrollEnd");
	function registerSimpleEvent(domEventName, reactName) {
		topLevelEventsToReactNames.set(domEventName, reactName);
		registerTwoPhaseEvent(reactName, [domEventName]);
	}
	var globalClientIdCounter$1 = 0;
	function getViewTransitionName(props, instance) {
		if (null != props.name && "auto" !== props.name) return props.name;
		if (null !== instance.autoName) return instance.autoName;
		props = pendingEffectsRoot.identifierPrefix;
		var globalClientId = globalClientIdCounter$1++;
		props = "_" + props + "t_" + globalClientId.toString(32) + "_";
		return instance.autoName = props;
	}
	function getClassNameByType(classByType) {
		if (null == classByType || "string" === typeof classByType) return classByType;
		var className = null, activeTypes = pendingTransitionTypes;
		if (null !== activeTypes) for (var i = 0; i < activeTypes.length; i++) {
			var match = classByType[activeTypes[i]];
			if (null != match) {
				if ("none" === match) return "none";
				className = null == className ? match : className + (" " + match);
			}
		}
		return null == className ? classByType.default : className;
	}
	function getViewTransitionClassName(defaultClass, eventClass) {
		defaultClass = getClassNameByType(defaultClass);
		eventClass = getClassNameByType(eventClass);
		return null == eventClass ? "auto" === defaultClass ? null : defaultClass : "auto" === eventClass ? null : eventClass;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	var concurrentQueues = [];
	var concurrentQueuesIndex = 0;
	var concurrentlyUpdatedLanes = 0;
	function finishQueueingConcurrentUpdates() {
		for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex;) {
			var fiber = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var queue = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var update = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var lane = concurrentQueues[i];
			concurrentQueues[i++] = null;
			if (null !== queue && null !== update) {
				var pending = queue.pending;
				null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
				queue.pending = update;
			}
			0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
		}
	}
	function enqueueUpdate$1(fiber, queue, update, lane) {
		concurrentQueues[concurrentQueuesIndex++] = fiber;
		concurrentQueues[concurrentQueuesIndex++] = queue;
		concurrentQueues[concurrentQueuesIndex++] = update;
		concurrentQueues[concurrentQueuesIndex++] = lane;
		concurrentlyUpdatedLanes |= lane;
		fiber.lanes |= lane;
		fiber = fiber.alternate;
		null !== fiber && (fiber.lanes |= lane);
	}
	function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
		enqueueUpdate$1(fiber, queue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function enqueueConcurrentRenderForLane(fiber, lane) {
		enqueueUpdate$1(fiber, null, null, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
		sourceFiber.lanes |= lane;
		var alternate = sourceFiber.alternate;
		null !== alternate && (alternate.lanes |= lane);
		for (var isHidden = !1, parent = sourceFiber.return; null !== parent;) parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = !0)), sourceFiber = parent, parent = parent.return;
		return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
	}
	function getRootForUpdatedFiber(sourceFiber) {
		if (50 < nestedUpdateCount) throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
		for (var parent = sourceFiber.return; null !== parent;) sourceFiber = parent, parent = sourceFiber.return;
		return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
	}
	var emptyContextObject = {};
	function FiberNode(tag, pendingProps, key, mode) {
		this.tag = tag;
		this.key = key;
		this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
		this.index = 0;
		this.refCleanup = this.ref = null;
		this.pendingProps = pendingProps;
		this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
		this.mode = mode;
		this.subtreeFlags = this.flags = 0;
		this.deletions = null;
		this.childLanes = this.lanes = 0;
		this.alternate = null;
	}
	function createFiberImplClass(tag, pendingProps, key, mode) {
		return new FiberNode(tag, pendingProps, key, mode);
	}
	function shouldConstruct(Component) {
		Component = Component.prototype;
		return !(!Component || !Component.isReactComponent);
	}
	function createWorkInProgress(current, pendingProps) {
		var workInProgress = current.alternate;
		null === workInProgress ? (workInProgress = createFiberImplClass(current.tag, pendingProps, current.key, current.mode), workInProgress.elementType = current.elementType, workInProgress.type = current.type, workInProgress.stateNode = current.stateNode, workInProgress.alternate = current, current.alternate = workInProgress) : (workInProgress.pendingProps = pendingProps, workInProgress.type = current.type, workInProgress.flags = 0, workInProgress.subtreeFlags = 0, workInProgress.deletions = null);
		workInProgress.flags = current.flags & 1206910976;
		workInProgress.childLanes = current.childLanes;
		workInProgress.lanes = current.lanes;
		workInProgress.child = current.child;
		workInProgress.memoizedProps = current.memoizedProps;
		workInProgress.memoizedState = current.memoizedState;
		workInProgress.updateQueue = current.updateQueue;
		pendingProps = current.dependencies;
		workInProgress.dependencies = null === pendingProps ? null : {
			lanes: pendingProps.lanes,
			firstContext: pendingProps.firstContext
		};
		workInProgress.sibling = current.sibling;
		workInProgress.index = current.index;
		workInProgress.ref = current.ref;
		workInProgress.refCleanup = current.refCleanup;
		return workInProgress;
	}
	function resetWorkInProgress(workInProgress, renderLanes) {
		workInProgress.flags &= 1206910978;
		var current = workInProgress.alternate;
		null === current ? (workInProgress.childLanes = 0, workInProgress.lanes = renderLanes, workInProgress.child = null, workInProgress.subtreeFlags = 0, workInProgress.memoizedProps = null, workInProgress.memoizedState = null, workInProgress.updateQueue = null, workInProgress.dependencies = null, workInProgress.stateNode = null) : (workInProgress.childLanes = current.childLanes, workInProgress.lanes = current.lanes, workInProgress.child = current.child, workInProgress.subtreeFlags = 0, workInProgress.deletions = null, workInProgress.memoizedProps = current.memoizedProps, workInProgress.memoizedState = current.memoizedState, workInProgress.updateQueue = current.updateQueue, workInProgress.type = current.type, renderLanes = current.dependencies, workInProgress.dependencies = null === renderLanes ? null : {
			lanes: renderLanes.lanes,
			firstContext: renderLanes.firstContext
		});
		return workInProgress;
	}
	function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
		var fiberTag = 0;
		owner = type;
		if ("function" === typeof owner) shouldConstruct(owner) && (fiberTag = 1);
		else if ("string" === typeof owner) fiberTag = isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
		else a: switch (owner) {
			case REACT_ACTIVITY_TYPE: return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
			case REACT_FRAGMENT_TYPE: return createFiberFromFragment(pendingProps.children, mode, lanes, key);
			case REACT_STRICT_MODE_TYPE:
				fiberTag = 8;
				mode |= 24;
				break;
			case REACT_PROFILER_TYPE: return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_TYPE: return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_LIST_TYPE: return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
			case REACT_LEGACY_HIDDEN_TYPE:
			case REACT_VIEW_TRANSITION_TYPE: return type = mode | 32, type = createFiberImplClass(30, pendingProps, key, type), type.elementType = REACT_VIEW_TRANSITION_TYPE, type.lanes = lanes, type.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, type;
			default:
				if ("object" === typeof owner && null !== owner) switch (owner.$$typeof) {
					case REACT_CONTEXT_TYPE:
						fiberTag = 10;
						break a;
					case REACT_CONSUMER_TYPE:
						fiberTag = 9;
						break a;
					case REACT_FORWARD_REF_TYPE:
						fiberTag = 11;
						break a;
					case REACT_MEMO_TYPE:
						fiberTag = 14;
						break a;
					case REACT_LAZY_TYPE:
						fiberTag = 16;
						owner = null;
						break a;
				}
				fiberTag = 29;
				pendingProps = Error(formatProdErrorMessage(130, null === type ? "null" : typeof type, ""));
				owner = null;
		}
		key = createFiberImplClass(fiberTag, pendingProps, key, mode);
		key.elementType = type;
		key.type = owner;
		key.lanes = lanes;
		return key;
	}
	function createFiberFromFragment(elements, mode, lanes, key) {
		elements = createFiberImplClass(7, elements, key, mode);
		elements.lanes = lanes;
		return elements;
	}
	function createFiberFromText(content, mode, lanes) {
		content = createFiberImplClass(6, content, null, mode);
		content.lanes = lanes;
		return content;
	}
	function createFiberFromDehydratedFragment(dehydratedNode) {
		var fiber = createFiberImplClass(18, null, null, 0);
		fiber.stateNode = dehydratedNode;
		return fiber;
	}
	function createFiberFromPortal(portal, mode, lanes) {
		mode = createFiberImplClass(4, null !== portal.children ? portal.children : [], portal.key, mode);
		mode.lanes = lanes;
		mode.stateNode = {
			containerInfo: portal.containerInfo,
			pendingChildren: null,
			implementation: portal.implementation
		};
		return mode;
	}
	var CapturedStacks = /* @__PURE__ */ new WeakMap();
	function createCapturedValueAtFiber(value, source) {
		if ("object" === typeof value && null !== value) {
			var existing = CapturedStacks.get(value);
			if (void 0 !== existing) return existing;
			source = {
				value,
				source,
				stack: getStackByFiberInDevAndProd(source)
			};
			CapturedStacks.set(value, source);
			return source;
		}
		return {
			value,
			source,
			stack: getStackByFiberInDevAndProd(source)
		};
	}
	var forkStack = [];
	var forkStackIndex = 0;
	var treeForkProvider = null;
	var treeForkCount = 0;
	var idStack = [];
	var idStackIndex = 0;
	var treeContextProvider = null;
	var treeContextId = 1;
	var treeContextOverflow = "";
	function pushTreeFork(workInProgress, totalChildren) {
		forkStack[forkStackIndex++] = treeForkCount;
		forkStack[forkStackIndex++] = treeForkProvider;
		treeForkProvider = workInProgress;
		treeForkCount = totalChildren;
	}
	function pushTreeId(workInProgress, totalChildren, index) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextProvider = workInProgress;
		var baseIdWithLeadingBit = treeContextId;
		workInProgress = treeContextOverflow;
		var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
		baseIdWithLeadingBit &= ~(1 << baseLength);
		index += 1;
		var length = 32 - clz32(totalChildren) + baseLength;
		if (30 < length) {
			var numberOfOverflowBits = baseLength - baseLength % 5;
			length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
			baseIdWithLeadingBit >>= numberOfOverflowBits;
			baseLength -= numberOfOverflowBits;
			treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit;
			treeContextOverflow = length + workInProgress;
		} else treeContextId = 1 << length | index << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress;
	}
	function pushMaterializedTreeId(workInProgress) {
		null !== workInProgress.return && (pushTreeFork(workInProgress, 1), pushTreeId(workInProgress, 1, 0));
	}
	function popTreeContext(workInProgress) {
		for (; workInProgress === treeForkProvider;) treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
		for (; workInProgress === treeContextProvider;) treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
	}
	function restoreSuspendedTreeContext(workInProgress, suspendedContext) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextId = suspendedContext.id;
		treeContextOverflow = suspendedContext.overflow;
		treeContextProvider = workInProgress;
	}
	var hydrationParentFiber = null;
	var nextHydratableInstance = null;
	var isHydrating = !1;
	var hydrationErrors = null;
	var rootOrSingletonContext = !1;
	var HydrationMismatchException = Error(formatProdErrorMessage(519));
	function throwOnHydrationMismatch(fiber) {
		queueHydrationError(createCapturedValueAtFiber(Error(formatProdErrorMessage(418, 1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML", "")), fiber));
		throw HydrationMismatchException;
	}
	function prepareToHydrateHostInstance(fiber) {
		var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
		instance[internalInstanceKey] = fiber;
		instance[internalPropsKey] = props;
		switch (type) {
			case "dialog":
				listenToNonDelegatedEvent("cancel", instance);
				listenToNonDelegatedEvent("close", instance);
				break;
			case "iframe":
			case "object":
			case "embed":
				listenToNonDelegatedEvent("load", instance);
				break;
			case "video":
			case "audio":
				for (type = 0; type < mediaEventTypes.length; type++) listenToNonDelegatedEvent(mediaEventTypes[type], instance);
				break;
			case "source":
				listenToNonDelegatedEvent("error", instance);
				break;
			case "img":
			case "image":
			case "link":
				listenToNonDelegatedEvent("error", instance);
				listenToNonDelegatedEvent("load", instance);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", instance);
				break;
			case "input":
				listenToNonDelegatedEvent("invalid", instance);
				initInput(instance, props.value, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name, !0);
				break;
			case "select":
				listenToNonDelegatedEvent("invalid", instance);
				break;
			case "textarea": listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
		}
		type = props.children;
		"string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || !0 === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = !0) : instance = !1;
		instance || throwOnHydrationMismatch(fiber, !0);
	}
	function popToNextHostParent(fiber) {
		for (hydrationParentFiber = fiber.return; hydrationParentFiber;) switch (hydrationParentFiber.tag) {
			case 5:
			case 31:
			case 13:
				rootOrSingletonContext = !1;
				return;
			case 27:
			case 3:
				rootOrSingletonContext = !0;
				return;
			default: hydrationParentFiber = hydrationParentFiber.return;
		}
	}
	function popHydrationState(fiber) {
		if (fiber !== hydrationParentFiber) return !1;
		if (!isHydrating) return popToNextHostParent(fiber), isHydrating = !0, !1;
		var tag = fiber.tag, JSCompiler_temp;
		if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
			if (JSCompiler_temp = 5 === tag) JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
			JSCompiler_temp = !JSCompiler_temp;
		}
		JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
		popToNextHostParent(fiber);
		if (13 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else if (31 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else 27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
		return !0;
	}
	function resetHydrationState() {
		nextHydratableInstance = hydrationParentFiber = null;
		isHydrating = !1;
	}
	function upgradeHydrationErrorsToRecoverable() {
		var queuedErrors = hydrationErrors;
		null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, queuedErrors), hydrationErrors = null);
		return queuedErrors;
	}
	function queueHydrationError(error) {
		null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
	}
	var valueCursor = createCursor(null);
	var currentlyRenderingFiber$1 = null;
	var lastContextDependency = null;
	function pushProvider(providerFiber, context, nextValue) {
		push(valueCursor, context._currentValue);
		context._currentValue = nextValue;
	}
	function popProvider(context) {
		context._currentValue = valueCursor.current;
		pop(valueCursor);
	}
	function scheduleContextWorkOnParentPath(parent, renderLanes, propagationRoot) {
		for (; null !== parent;) {
			var alternate = parent.alternate;
			(parent.childLanes & renderLanes) !== renderLanes ? (parent.childLanes |= renderLanes, null !== alternate && (alternate.childLanes |= renderLanes)) : null !== alternate && (alternate.childLanes & renderLanes) !== renderLanes && (alternate.childLanes |= renderLanes);
			if (parent === propagationRoot) break;
			parent = parent.return;
		}
	}
	function propagateContextChanges(workInProgress, contexts, renderLanes, forcePropagateEntireTree) {
		var fiber = workInProgress.child;
		null !== fiber && (fiber.return = workInProgress);
		for (; null !== fiber;) {
			var list = fiber.dependencies;
			if (null !== list) {
				var nextFiber = fiber.child;
				list = list.firstContext;
				a: for (; null !== list;) {
					var dependency = list;
					list = fiber;
					for (var i = 0; i < contexts.length; i++) if (dependency.context === contexts[i]) {
						list.lanes |= renderLanes;
						dependency = list.alternate;
						null !== dependency && (dependency.lanes |= renderLanes);
						scheduleContextWorkOnParentPath(list.return, renderLanes, workInProgress);
						forcePropagateEntireTree || (nextFiber = null);
						break a;
					}
					list = dependency.next;
				}
			} else if (18 === fiber.tag) {
				nextFiber = fiber.return;
				if (null === nextFiber) throw Error(formatProdErrorMessage(341));
				nextFiber.lanes |= renderLanes;
				list = nextFiber.alternate;
				null !== list && (list.lanes |= renderLanes);
				scheduleContextWorkOnParentPath(nextFiber, renderLanes, workInProgress);
				nextFiber = null;
			} else 13 === fiber.tag && null !== fiber.memoizedState && null === fiber.memoizedState.dehydrated ? (fiber.lanes |= renderLanes, nextFiber = fiber.alternate, null !== nextFiber && (nextFiber.lanes |= renderLanes), scheduleContextWorkOnParentPath(fiber.return, renderLanes, workInProgress), nextFiber = fiber.child, nextFiber = null !== nextFiber ? nextFiber.sibling : null) : nextFiber = fiber.child;
			if (null !== nextFiber) nextFiber.return = fiber;
			else for (nextFiber = fiber; null !== nextFiber;) {
				if (nextFiber === workInProgress) {
					nextFiber = null;
					break;
				}
				fiber = nextFiber.sibling;
				if (null !== fiber) {
					fiber.return = nextFiber.return;
					nextFiber = fiber;
					break;
				}
				nextFiber = nextFiber.return;
			}
			fiber = nextFiber;
		}
	}
	function propagateParentContextChanges(current, workInProgress, renderLanes, forcePropagateEntireTree) {
		current = null;
		for (var parent = workInProgress, isInsidePropagationBailout = !1; null !== parent;) {
			if (!isInsidePropagationBailout) {
				if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = !0;
				else if (0 !== (parent.flags & 262144)) break;
			}
			if (10 === parent.tag) {
				var currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent = currentParent.memoizedProps;
				if (null !== currentParent) {
					var context = parent.type;
					objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
				}
			} else if (parent === hostTransitionProviderCursor.current) {
				currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
			}
			parent = parent.return;
		}
		null !== current && propagateContextChanges(workInProgress, current, renderLanes, forcePropagateEntireTree);
		workInProgress.flags |= 262144;
		return null !== current;
	}
	function checkIfContextChanged(currentDependencies) {
		for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies;) {
			if (!objectIs(currentDependencies.context._currentValue, currentDependencies.memoizedValue)) return !0;
			currentDependencies = currentDependencies.next;
		}
		return !1;
	}
	function prepareToReadContext(workInProgress) {
		currentlyRenderingFiber$1 = workInProgress;
		lastContextDependency = null;
		workInProgress = workInProgress.dependencies;
		null !== workInProgress && (workInProgress.firstContext = null);
	}
	function readContext(context) {
		return readContextForConsumer(currentlyRenderingFiber$1, context);
	}
	function readContextDuringReconciliation(consumer, context) {
		null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
		return readContextForConsumer(consumer, context);
	}
	function readContextForConsumer(consumer, context) {
		var value = context._currentValue;
		context = {
			context,
			memoizedValue: value,
			next: null
		};
		if (null === lastContextDependency) {
			if (null === consumer) throw Error(formatProdErrorMessage(308));
			lastContextDependency = context;
			consumer.dependencies = {
				lanes: 0,
				firstContext: context
			};
			consumer.flags |= 524288;
		} else lastContextDependency = lastContextDependency.next = context;
		return value;
	}
	var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
		var listeners = [], signal = this.signal = {
			aborted: !1,
			addEventListener: function(type, listener) {
				listeners.push(listener);
			}
		};
		this.abort = function() {
			signal.aborted = !0;
			listeners.forEach(function(listener) {
				return listener();
			});
		};
	};
	var scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
	var NormalPriority = Scheduler.unstable_NormalPriority;
	var CacheContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function createCache() {
		return {
			controller: new AbortControllerLocal(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function releaseCache(cache) {
		cache.refCount--;
		0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
			cache.controller.abort();
		});
	}
	function queueTransitionTypes(root, transitionTypes) {
		if (0 !== (root.pendingLanes & 4194048)) {
			var queued = root.transitionTypes;
			null === queued && (queued = root.transitionTypes = []);
			for (root = 0; root < transitionTypes.length; root++) {
				var transitionType = transitionTypes[root];
				-1 === queued.indexOf(transitionType) && queued.push(transitionType);
			}
		}
	}
	var entangledTransitionTypes = null;
	function claimQueuedTransitionTypes(root) {
		var claimed = root.transitionTypes;
		root.transitionTypes = null;
		return claimed;
	}
	var currentEntangledListeners = null;
	var currentEntangledPendingCount = 0;
	var currentEntangledLane = 0;
	var currentEntangledActionThenable = null;
	function entangleAsyncAction(transition, thenable) {
		if (null === currentEntangledListeners) {
			var entangledListeners = currentEntangledListeners = [];
			currentEntangledPendingCount = 0;
			currentEntangledLane = requestTransitionLane();
			currentEntangledActionThenable = {
				status: "pending",
				value: void 0,
				then: function(resolve) {
					entangledListeners.push(resolve);
				}
			};
		}
		currentEntangledPendingCount++;
		thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
		return thenable;
	}
	function pingEngtangledActionScope() {
		if (0 === --currentEntangledPendingCount && (entangledTransitionTypes = null, null !== currentEntangledListeners)) {
			null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
			var listeners = currentEntangledListeners;
			currentEntangledListeners = null;
			currentEntangledLane = 0;
			currentEntangledActionThenable = null;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
		}
	}
	function chainThenableValue(thenable, result) {
		var listeners = [], thenableWithOverride = {
			status: "pending",
			value: null,
			reason: null,
			then: function(resolve) {
				listeners.push(resolve);
			}
		};
		thenable.then(function() {
			thenableWithOverride.status = "fulfilled";
			thenableWithOverride.value = result;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
		}, function(error) {
			thenableWithOverride.status = "rejected";
			thenableWithOverride.reason = error;
			for (error = 0; error < listeners.length; error++) (0, listeners[error])(void 0);
		});
		return thenableWithOverride;
	}
	var prevOnStartTransitionFinish = ReactSharedInternals.S;
	ReactSharedInternals.S = function(transition, returnValue) {
		globalMostRecentTransitionTime = now();
		"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
		if (null !== entangledTransitionTypes) for (var root$28 = firstScheduledRoot; null !== root$28;) queueTransitionTypes(root$28, entangledTransitionTypes), root$28 = root$28.next;
		root$28 = transition.types;
		if (null !== root$28) {
			for (var root$29 = firstScheduledRoot; null !== root$29;) queueTransitionTypes(root$29, root$28), root$29 = root$29.next;
			if (0 !== currentEntangledLane) {
				root$29 = entangledTransitionTypes;
				null === root$29 && (root$29 = entangledTransitionTypes = []);
				for (var i = 0; i < root$28.length; i++) {
					var transitionType = root$28[i];
					-1 === root$29.indexOf(transitionType) && root$29.push(transitionType);
				}
			}
		}
		null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
	};
	var resumedCache = createCursor(null);
	function peekCacheFromPool() {
		var cacheResumedFromPreviousRender = resumedCache.current;
		return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
	}
	function pushTransition(offscreenWorkInProgress, prevCachePool) {
		null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
	}
	function getSuspendedCache() {
		var cacheFromPool = peekCacheFromPool();
		return null === cacheFromPool ? null : {
			parent: CacheContext._currentValue,
			pool: cacheFromPool
		};
	}
	var SuspenseException = Error(formatProdErrorMessage(460));
	var SuspenseyCommitException = Error(formatProdErrorMessage(474));
	var SuspenseActionException = Error(formatProdErrorMessage(542));
	var noopSuspenseyCommitThenable = { then: function() {} };
	function isThenableResolved(thenable) {
		thenable = thenable.status;
		return "fulfilled" === thenable || "rejected" === thenable;
	}
	function trackUsedThenable(thenableState, thenable, index) {
		index = thenableState[index];
		void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected":
				thenableState = thenable.reason;
				checkIfUseWrappedInAsyncCatch(thenableState);
				if (void 0 === thenableState && !("reason" in thenable)) throw Error(formatProdErrorMessage(600));
				throw thenableState;
			default:
				if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
				else {
					thenableState = workInProgressRoot;
					if (null !== thenableState && 100 < thenableState.shellSuspendCounter) throw Error(formatProdErrorMessage(482));
					thenableState = thenable;
					thenableState.status = "pending";
					thenableState.then(function(fulfilledValue) {
						if ("pending" === thenable.status) {
							var fulfilledThenable = thenable;
							fulfilledThenable.status = "fulfilled";
							fulfilledThenable.value = fulfilledValue;
						}
					}, function(error) {
						if ("pending" === thenable.status) {
							var rejectedThenable = thenable;
							rejectedThenable.status = "rejected";
							rejectedThenable.reason = error;
						}
					});
				}
				switch (thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
				}
				suspendedThenable = thenable;
				throw SuspenseException;
		}
	}
	function resolveLazy(lazyType) {
		try {
			var init = lazyType._init;
			return init(lazyType._payload);
		} catch (x) {
			if (null !== x && "object" === typeof x && "function" === typeof x.then) throw suspendedThenable = x, SuspenseException;
			throw x;
		}
	}
	var suspendedThenable = null;
	function getSuspendedThenable() {
		if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
		var thenable = suspendedThenable;
		suspendedThenable = null;
		return thenable;
	}
	function checkIfUseWrappedInAsyncCatch(rejectedReason) {
		if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException) throw Error(formatProdErrorMessage(483));
	}
	var thenableState$1 = null;
	var thenableIndexCounter$1 = 0;
	function unwrapThenable(thenable) {
		var index = thenableIndexCounter$1;
		thenableIndexCounter$1 += 1;
		null === thenableState$1 && (thenableState$1 = []);
		return trackUsedThenable(thenableState$1, thenable, index);
	}
	function coerceRef(workInProgress, element) {
		element = element.props.ref;
		workInProgress.ref = void 0 !== element ? element : null;
	}
	function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
		if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE) throw Error(formatProdErrorMessage(525));
		returnFiber = Object.prototype.toString.call(newChild);
		throw Error(formatProdErrorMessage(31, "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber));
	}
	function createChildReconciler(shouldTrackSideEffects) {
		function deleteChild(returnFiber, childToDelete) {
			if (shouldTrackSideEffects) {
				var deletions = returnFiber.deletions;
				null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
			}
		}
		function deleteRemainingChildren(returnFiber, currentFirstChild) {
			if (!shouldTrackSideEffects) return null;
			for (; null !== currentFirstChild;) deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return null;
		}
		function mapRemainingChildren(currentFirstChild) {
			for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild;) null === currentFirstChild.key ? existingChildren.set(currentFirstChild.index, currentFirstChild) : existingChildren.set(currentFirstChild.key, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return existingChildren;
		}
		function useFiber(fiber, pendingProps) {
			fiber = createWorkInProgress(fiber, pendingProps);
			fiber.index = 0;
			fiber.sibling = null;
			return fiber;
		}
		function placeChild(newFiber, lastPlacedIndex, newIndex) {
			newFiber.index = newIndex;
			if (!shouldTrackSideEffects) return newFiber.flags |= 1048576, lastPlacedIndex;
			newIndex = newFiber.alternate;
			if (null !== newIndex) return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 2, lastPlacedIndex) : newIndex;
			newFiber.flags |= 134217730;
			return lastPlacedIndex;
		}
		function placeSingleChild(newFiber) {
			shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 134217730);
			return newFiber;
		}
		function updateTextNode(returnFiber, current, textContent, lanes) {
			if (null === current || 6 !== current.tag) return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, textContent);
			current.return = returnFiber;
			return current;
		}
		function updateElement(returnFiber, current, element, lanes) {
			var elementType = element.type;
			if (elementType === REACT_FRAGMENT_TYPE) return returnFiber = updateFragment(returnFiber, current, element.props.children, lanes, element.key), coerceRef(returnFiber, element), returnFiber;
			if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type)) return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
			current = createFiberFromTypeAndProps(element.type, element.key, element.props, null, returnFiber.mode, lanes);
			coerceRef(current, element);
			current.return = returnFiber;
			return current;
		}
		function updatePortal(returnFiber, current, portal, lanes) {
			if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, portal.children || []);
			current.return = returnFiber;
			return current;
		}
		function updateFragment(returnFiber, current, fragment, lanes, key) {
			if (null === current || 7 !== current.tag) return current = createFiberFromFragment(fragment, returnFiber.mode, lanes, key), current.return = returnFiber, current;
			current = useFiber(current, fragment);
			current.return = returnFiber;
			return current;
		}
		function createChild(returnFiber, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return newChild = createFiberFromText("" + newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
					case REACT_PORTAL_TYPE: return newChild = createFiberFromPortal(newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return newChild = createFiberFromFragment(newChild, returnFiber.mode, lanes, null), newChild.return = returnFiber, newChild;
				if ("function" === typeof newChild.then) return createChild(returnFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return createChild(returnFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateSlot(returnFiber, oldFiber, newChild, lanes) {
			var key = null !== oldFiber ? oldFiber.key : null;
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_PORTAL_TYPE: return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateSlot(returnFiber, oldFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateSlot(returnFiber, oldFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
					case REACT_PORTAL_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateFromMap(existingChildren, returnFiber, newIdx, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateFromMap(existingChildren, returnFiber, newIdx, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (newIdx === newChildren.length) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; newIdx < newChildren.length; newIdx++) oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(oldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++) nextOldFiber = updateFromMap(oldFiber, returnFiber, newIdx, newChildren[newIdx], lanes), null !== nextOldFiber && (shouldTrackSideEffects && (newFiber = nextOldFiber.alternate, null !== newFiber && oldFiber.delete(null === newFiber.key ? newIdx : newFiber.key)), currentFirstChild = placeChild(nextOldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
			if (null == newChildren) throw Error(formatProdErrorMessage(151));
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (step.done) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; !step.done; newIdx++, step = newChildren.next()) step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next()) step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && (nextOldFiber = step.alternate, null !== nextOldFiber && oldFiber.delete(null === nextOldFiber.key ? newIdx : nextOldFiber.key)), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
			"object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && void 0 === newChild.props.ref && (newChild = newChild.props.children);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE:
						a: {
							for (var key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) {
									key = newChild.type;
									if (key === REACT_FRAGMENT_TYPE) {
										if (7 === currentFirstChild.tag) {
											deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
											lanes = useFiber(currentFirstChild, newChild.props.children);
											coerceRef(lanes, newChild);
											lanes.return = returnFiber;
											returnFiber = lanes;
											break a;
										}
									} else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
										deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
										lanes = useFiber(currentFirstChild, newChild.props);
										coerceRef(lanes, newChild);
										lanes.return = returnFiber;
										returnFiber = lanes;
										break a;
									}
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								} else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(newChild.props.children, returnFiber.mode, lanes, newChild.key), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
						}
						return placeSingleChild(returnFiber);
					case REACT_PORTAL_TYPE:
						a: {
							for (key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
									deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
									lanes = useFiber(currentFirstChild, newChild.children || []);
									lanes.return = returnFiber;
									returnFiber = lanes;
									break a;
								} else {
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								}
								else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
							lanes.return = returnFiber;
							returnFiber = lanes;
						}
						return placeSingleChild(returnFiber);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				}
				if (isArrayImpl(newChild)) return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
				if (getIteratorFn(newChild)) {
					key = getIteratorFn(newChild);
					if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
					newChild = key.call(newChild);
					return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
				}
				if ("function" === typeof newChild.then) return reconcileChildFibersImpl(returnFiber, currentFirstChild, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return reconcileChildFibersImpl(returnFiber, currentFirstChild, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
		}
		return function(returnFiber, currentFirstChild, newChild, lanes) {
			try {
				thenableIndexCounter$1 = 0;
				var firstChildFiber = reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				thenableState$1 = null;
				return firstChildFiber;
			} catch (x) {
				if (x === SuspenseException || x === SuspenseActionException) throw x;
				var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
				fiber.lanes = lanes;
				fiber.return = returnFiber;
				return fiber;
			}
		};
	}
	var reconcileChildFibers = createChildReconciler(!0);
	var mountChildFibers = createChildReconciler(!1);
	var hasForceUpdate = !1;
	function initializeUpdateQueue(fiber) {
		fiber.updateQueue = {
			baseState: fiber.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function cloneUpdateQueue(current, workInProgress) {
		current = current.updateQueue;
		workInProgress.updateQueue === current && (workInProgress.updateQueue = {
			baseState: current.baseState,
			firstBaseUpdate: current.firstBaseUpdate,
			lastBaseUpdate: current.lastBaseUpdate,
			shared: current.shared,
			callbacks: null
		});
	}
	function createUpdate(lane) {
		return {
			lane,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function enqueueUpdate(fiber, update, lane) {
		var updateQueue = fiber.updateQueue;
		if (null === updateQueue) return null;
		updateQueue = updateQueue.shared;
		if (0 !== (executionContext & 2)) {
			var pending = updateQueue.pending;
			null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
			updateQueue.pending = update;
			update = getRootForUpdatedFiber(fiber);
			markUpdateLaneFromFiberToRoot(fiber, null, lane);
			return update;
		}
		enqueueUpdate$1(fiber, updateQueue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function entangleTransitions(root, fiber, lane) {
		fiber = fiber.updateQueue;
		if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
			var queueLanes = fiber.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			fiber.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	function enqueueCapturedUpdate(workInProgress, capturedUpdate) {
		var queue = workInProgress.updateQueue, current = workInProgress.alternate;
		if (null !== current && (current = current.updateQueue, queue === current)) {
			var newFirst = null, newLast = null;
			queue = queue.firstBaseUpdate;
			if (null !== queue) {
				do {
					var clone = {
						lane: queue.lane,
						tag: queue.tag,
						payload: queue.payload,
						callback: null,
						next: null
					};
					null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
					queue = queue.next;
				} while (null !== queue);
				null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
			} else newFirst = newLast = capturedUpdate;
			queue = {
				baseState: current.baseState,
				firstBaseUpdate: newFirst,
				lastBaseUpdate: newLast,
				shared: current.shared,
				callbacks: current.callbacks
			};
			workInProgress.updateQueue = queue;
			return;
		}
		workInProgress = queue.lastBaseUpdate;
		null === workInProgress ? queue.firstBaseUpdate = capturedUpdate : workInProgress.next = capturedUpdate;
		queue.lastBaseUpdate = capturedUpdate;
	}
	var didReadFromEntangledAsyncAction = !1;
	function suspendIfUpdateReadFromEntangledAsyncAction() {
		if (didReadFromEntangledAsyncAction) {
			var entangledActionThenable = currentEntangledActionThenable;
			if (null !== entangledActionThenable) throw entangledActionThenable;
		}
	}
	function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes) {
		didReadFromEntangledAsyncAction = !1;
		var queue = workInProgress$jscomp$0.updateQueue;
		hasForceUpdate = !1;
		var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
		if (null !== pendingQueue) {
			queue.shared.pending = null;
			var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
			lastPendingUpdate.next = null;
			null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
			lastBaseUpdate = lastPendingUpdate;
			var current = workInProgress$jscomp$0.alternate;
			null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
		}
		if (null !== firstBaseUpdate) {
			var newState = queue.baseState;
			lastBaseUpdate = 0;
			current = firstPendingUpdate = lastPendingUpdate = null;
			pendingQueue = firstBaseUpdate;
			do {
				var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
				if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = !0);
					null !== current && (current = current.next = {
						lane: 0,
						tag: pendingQueue.tag,
						payload: pendingQueue.payload,
						callback: null,
						next: null
					});
					a: {
						var workInProgress = workInProgress$jscomp$0, update = pendingQueue;
						updateLane = props;
						var instance = instance$jscomp$0;
						switch (update.tag) {
							case 1:
								workInProgress = update.payload;
								if ("function" === typeof workInProgress) {
									newState = workInProgress.call(instance, newState, updateLane);
									break a;
								}
								newState = workInProgress;
								break a;
							case 3: workInProgress.flags = workInProgress.flags & -65537 | 128;
							case 0:
								workInProgress = update.payload;
								updateLane = "function" === typeof workInProgress ? workInProgress.call(instance, newState, updateLane) : workInProgress;
								if (null === updateLane || void 0 === updateLane) break a;
								newState = assign({}, newState, updateLane);
								break a;
							case 2: hasForceUpdate = !0;
						}
					}
					updateLane = pendingQueue.callback;
					null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
				} else isHiddenUpdate = {
					lane: updateLane,
					tag: pendingQueue.tag,
					payload: pendingQueue.payload,
					callback: pendingQueue.callback,
					next: null
				}, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
				pendingQueue = pendingQueue.next;
				if (null === pendingQueue) if (pendingQueue = queue.shared.pending, null === pendingQueue) break;
				else isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
			} while (1);
			null === current && (lastPendingUpdate = newState);
			queue.baseState = lastPendingUpdate;
			queue.firstBaseUpdate = firstPendingUpdate;
			queue.lastBaseUpdate = current;
			null === firstBaseUpdate && (queue.shared.lanes = 0);
			workInProgressRootSkippedLanes |= lastBaseUpdate;
			workInProgress$jscomp$0.lanes = lastBaseUpdate;
			workInProgress$jscomp$0.memoizedState = newState;
		}
	}
	function callCallback(callback, context) {
		if ("function" !== typeof callback) throw Error(formatProdErrorMessage(191, callback));
		callback.call(context);
	}
	function commitCallbacks(updateQueue, context) {
		var callbacks = updateQueue.callbacks;
		if (null !== callbacks) for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++) callCallback(callbacks[updateQueue], context);
	}
	var currentTreeHiddenStackCursor = createCursor(null);
	var prevEntangledRenderLanesCursor = createCursor(0);
	function pushHiddenContext(fiber, context) {
		fiber = entangledRenderLanes;
		push(prevEntangledRenderLanesCursor, fiber);
		push(currentTreeHiddenStackCursor, context);
		entangledRenderLanes = fiber | context.baseLanes;
	}
	function reuseHiddenContextOnStack() {
		push(prevEntangledRenderLanesCursor, entangledRenderLanes);
		push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
	}
	function popHiddenContext() {
		entangledRenderLanes = prevEntangledRenderLanesCursor.current;
		pop(currentTreeHiddenStackCursor);
		pop(prevEntangledRenderLanesCursor);
	}
	var suspenseHandlerStackCursor = createCursor(null);
	var shellBoundary = null;
	function pushPrimaryTreeSuspenseHandler(handler) {
		var current = handler.alternate;
		push(suspenseStackCursor, suspenseStackCursor.current & 1);
		push(suspenseHandlerStackCursor, handler);
		null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
	}
	function pushDehydratedActivitySuspenseHandler(fiber) {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, fiber);
		null === shellBoundary && (shellBoundary = fiber);
	}
	function pushOffscreenSuspenseHandler(fiber) {
		22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
	}
	function reuseSuspenseHandlerOnStack() {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
	}
	function popSuspenseHandler(fiber) {
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
		pop(suspenseStackCursor);
	}
	var suspenseStackCursor = createCursor(0);
	function pushSuspenseListContext(fiber, newContext) {
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
		push(suspenseStackCursor, newContext);
	}
	function popSuspenseListContext(fiber) {
		pop(suspenseStackCursor);
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
	}
	function findFirstSuspended(row) {
		for (var node = row; null !== node;) {
			if (13 === node.tag) {
				var state = node.memoizedState;
				if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state))) return node;
			} else if (19 === node.tag && "independent" !== node.memoizedProps.revealOrder) {
				if (0 !== (node.flags & 128)) return node;
			} else if (null !== node.child) {
				node.child.return = node;
				node = node.child;
				continue;
			}
			if (node === row) break;
			for (; null === node.sibling;) {
				if (null === node.return || node.return === row) return null;
				node = node.return;
			}
			node.sibling.return = node.return;
			node = node.sibling;
		}
		return null;
	}
	var renderLanes = 0;
	var currentlyRenderingFiber = null;
	var currentHook = null;
	var workInProgressHook = null;
	var didScheduleRenderPhaseUpdate = !1;
	var didScheduleRenderPhaseUpdateDuringThisPass = !1;
	var shouldDoubleInvokeUserFnsInHooksDEV = !1;
	var localIdCounter = 0;
	var thenableIndexCounter = 0;
	var thenableState = null;
	var globalClientIdCounter = 0;
	function throwInvalidHookError() {
		throw Error(formatProdErrorMessage(321));
	}
	function areHookInputsEqual(nextDeps, prevDeps) {
		if (null === prevDeps) return !1;
		for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) if (!objectIs(nextDeps[i], prevDeps[i])) return !1;
		return !0;
	}
	function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
		renderLanes = nextRenderLanes;
		currentlyRenderingFiber = workInProgress;
		workInProgress.memoizedState = null;
		workInProgress.updateQueue = null;
		workInProgress.lanes = 0;
		ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		nextRenderLanes = Component(props, secondArg);
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(workInProgress, Component, props, secondArg));
		finishRenderingHooks(current);
		return nextRenderLanes;
	}
	function finishRenderingHooks(current) {
		ReactSharedInternals.H = ContextOnlyDispatcher;
		var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdate = !1;
		thenableIndexCounter = 0;
		thenableState = null;
		if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
		null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = !0));
	}
	function renderWithHooksAgain(workInProgress, Component, props, secondArg) {
		currentlyRenderingFiber = workInProgress;
		var numberOfReRenders = 0;
		do {
			didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
			thenableIndexCounter = 0;
			didScheduleRenderPhaseUpdateDuringThisPass = !1;
			if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
			numberOfReRenders += 1;
			workInProgressHook = currentHook = null;
			if (null != workInProgress.updateQueue) {
				var children = workInProgress.updateQueue;
				children.lastEffect = null;
				children.events = null;
				children.stores = null;
				null != children.memoCache && (children.memoCache.index = 0);
			}
			ReactSharedInternals.H = HooksDispatcherOnRerender;
			children = Component(props, secondArg);
		} while (didScheduleRenderPhaseUpdateDuringThisPass);
		return children;
	}
	function TransitionAwareHostComponent() {
		var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
		maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
		dispatcher = dispatcher.useState()[0];
		(null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
		return maybeThenable;
	}
	function checkDidRenderIdHook() {
		var didRenderIdHook = 0 !== localIdCounter;
		localIdCounter = 0;
		return didRenderIdHook;
	}
	function bailoutHooks(current, workInProgress, lanes) {
		workInProgress.updateQueue = current.updateQueue;
		workInProgress.flags &= -2053;
		current.lanes &= ~lanes;
	}
	function resetHooksOnUnwind(workInProgress) {
		if (didScheduleRenderPhaseUpdate) {
			for (workInProgress = workInProgress.memoizedState; null !== workInProgress;) {
				var queue = workInProgress.queue;
				null !== queue && (queue.pending = null);
				workInProgress = workInProgress.next;
			}
			didScheduleRenderPhaseUpdate = !1;
		}
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdateDuringThisPass = !1;
		thenableIndexCounter = localIdCounter = 0;
		thenableState = null;
	}
	function mountWorkInProgressHook() {
		var hook = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
		return workInProgressHook;
	}
	function updateWorkInProgressHook() {
		if (null === currentHook) {
			var nextCurrentHook = currentlyRenderingFiber.alternate;
			nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
		} else nextCurrentHook = currentHook.next;
		var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
		if (null !== nextWorkInProgressHook) workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
		else {
			if (null === nextCurrentHook) {
				if (null === currentlyRenderingFiber.alternate) throw Error(formatProdErrorMessage(467));
				throw Error(formatProdErrorMessage(310));
			}
			currentHook = nextCurrentHook;
			nextCurrentHook = {
				memoizedState: currentHook.memoizedState,
				baseState: currentHook.baseState,
				baseQueue: currentHook.baseQueue,
				queue: currentHook.queue,
				next: null
			};
			null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
		}
		return workInProgressHook;
	}
	function createFunctionComponentUpdateQueue() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function useThenable(thenable) {
		var index = thenableIndexCounter;
		thenableIndexCounter += 1;
		null === thenableState && (thenableState = []);
		thenable = trackUsedThenable(thenableState, thenable, index);
		index = currentlyRenderingFiber;
		null === (null === workInProgressHook ? index.memoizedState : workInProgressHook.next) && (index = index.alternate, ReactSharedInternals.H = null === index || null === index.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
		return thenable;
	}
	function use(usable) {
		if (null !== usable && "object" === typeof usable) {
			if ("function" === typeof usable.then) return useThenable(usable);
			if (usable.$$typeof === REACT_RECOVERABLE_TYPE) return;
			if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
		}
		throw Error(formatProdErrorMessage(438, String(usable)));
	}
	function useMemoCache(size) {
		var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
		null !== updateQueue && (memoCache = updateQueue.memoCache);
		if (null == memoCache) {
			var current = currentlyRenderingFiber.alternate;
			null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
				data: current.data.map(function(array) {
					return array.slice();
				}),
				index: 0
			})));
		}
		memoCache ??= {
			data: [],
			index: 0
		};
		null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
		updateQueue.memoCache = memoCache;
		updateQueue = memoCache.data[memoCache.index];
		if (void 0 === updateQueue) for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++) updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
		memoCache.index++;
		return updateQueue;
	}
	function basicStateReducer(state, action) {
		return "function" === typeof action ? action(state) : action;
	}
	function updateReducer(reducer) {
		return updateReducerImpl(updateWorkInProgressHook(), currentHook, reducer);
	}
	function updateReducerImpl(hook, current, reducer) {
		var queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
		if (null !== pendingQueue) {
			if (null !== baseQueue) {
				var baseFirst = baseQueue.next;
				baseQueue.next = pendingQueue.next;
				pendingQueue.next = baseFirst;
			}
			current.baseQueue = baseQueue = pendingQueue;
			queue.pending = null;
		}
		pendingQueue = hook.baseState;
		if (null === baseQueue) hook.memoizedState = pendingQueue;
		else {
			current = baseQueue.next;
			var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$64 = !1;
			do {
				var updateLane = update.lane & -536870913;
				if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					var revertLane = update.revertLane;
					if (0 === revertLane) null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = !0);
					else if ((renderLanes & revertLane) === revertLane) {
						update = update.next;
						revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = !0);
						continue;
					} else updateLane = {
						lane: 0,
						revertLane: update.revertLane,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
					updateLane = update.action;
					shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
					pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
				} else revertLane = {
					lane: updateLane,
					revertLane: update.revertLane,
					gesture: update.gesture,
					action: update.action,
					hasEagerState: update.hasEagerState,
					eagerState: update.eagerState,
					next: null
				}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
				update = update.next;
			} while (null !== update && update !== current);
			null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
			if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = !0, didReadFromEntangledAsyncAction$64 && (reducer = currentEntangledActionThenable, null !== reducer))) throw reducer;
			hook.memoizedState = pendingQueue;
			hook.baseState = baseFirst;
			hook.baseQueue = newBaseQueueLast;
			queue.lastRenderedState = pendingQueue;
		}
		null === baseQueue && (queue.lanes = 0);
		return [hook.memoizedState, queue.dispatch];
	}
	function rerenderReducer(reducer) {
		var hook = updateWorkInProgressHook(), queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
		if (null !== lastRenderPhaseUpdate) {
			queue.pending = null;
			var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
			do
				newState = reducer(newState, update.action), update = update.next;
			while (update !== lastRenderPhaseUpdate);
			objectIs(newState, hook.memoizedState) || (didReceiveUpdate = !0);
			hook.memoizedState = newState;
			null === hook.baseQueue && (hook.baseState = newState);
			queue.lastRenderedState = newState;
		}
		return [newState, dispatch];
	}
	function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
		if (isHydrating$jscomp$0) {
			if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
			getServerSnapshot = getServerSnapshot();
		} else getServerSnapshot = getSnapshot();
		var snapshotChanged = !objectIs((currentHook || hook).memoizedState, getServerSnapshot);
		snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = !0);
		hook = hook.queue;
		updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [subscribe]);
		subscribe = hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && 0 !== (workInProgressHook.memoizedState.tag & 1);
		pushSimpleEffect(subscribe ? 9 : 8, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot), null);
		if (subscribe) {
			fiber.flags |= 2048;
			if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
			isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
		}
		return getServerSnapshot;
	}
	function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
		fiber.flags |= 16384;
		fiber = {
			getSnapshot,
			value: renderedSnapshot
		};
		getSnapshot = currentlyRenderingFiber.updateQueue;
		null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
	}
	function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
		inst.value = nextSnapshot;
		inst.getSnapshot = getSnapshot;
		checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
	}
	function subscribeToStore(fiber, inst, subscribe) {
		return subscribe(function() {
			checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
		});
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function forceStoreRerender(fiber) {
		var root = enqueueConcurrentRenderForLane(fiber, 2);
		null !== root && scheduleUpdateOnFiber(root, fiber, 2);
	}
	function mountStateImpl(initialState) {
		var hook = mountWorkInProgressHook();
		if ("function" === typeof initialState) {
			var initialStateInitializer = initialState;
			initialState = initialStateInitializer();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					initialStateInitializer();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
		}
		hook.memoizedState = hook.baseState = initialState;
		hook.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: basicStateReducer,
			lastRenderedState: initialState
		};
		return hook;
	}
	function updateOptimisticImpl(hook, current, passthrough, reducer) {
		hook.baseState = passthrough;
		return updateReducerImpl(hook, currentHook, "function" === typeof reducer ? reducer : basicStateReducer);
	}
	function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
		if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
		fiber = actionQueue.action;
		if (null !== fiber) {
			var actionNode = {
				payload,
				action: fiber,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(listener) {
					actionNode.listeners.push(listener);
				}
			};
			null !== ReactSharedInternals.T ? setPendingState(!0) : actionNode.isTransition = !1;
			setState(actionNode);
			setPendingState = actionQueue.pending;
			null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
		}
	}
	function runActionStateAction(actionQueue, node) {
		var action = node.action, payload = node.payload, prevState = actionQueue.state;
		if (node.isTransition) {
			var prevTransition = ReactSharedInternals.T, currentTransition = {};
			currentTransition.types = null !== prevTransition ? prevTransition.types : null;
			ReactSharedInternals.T = currentTransition;
			try {
				var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
				null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
				handleActionReturnValue(actionQueue, node, returnValue);
			} catch (error) {
				onActionError(actionQueue, node, error);
			} finally {
				null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
			}
		} else try {
			prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
		} catch (error$70) {
			onActionError(actionQueue, node, error$70);
		}
	}
	function handleActionReturnValue(actionQueue, node, returnValue) {
		null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(function(nextState) {
			onActionSuccess(actionQueue, node, nextState);
		}, function(error) {
			return onActionError(actionQueue, node, error);
		}) : onActionSuccess(actionQueue, node, returnValue);
	}
	function onActionSuccess(actionQueue, actionNode, nextState) {
		actionNode.status = "fulfilled";
		actionNode.value = nextState;
		notifyActionListeners(actionNode);
		actionQueue.state = nextState;
		actionNode = actionQueue.pending;
		null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
	}
	function onActionError(actionQueue, actionNode, error) {
		var last = actionQueue.pending;
		actionQueue.pending = null;
		if (null !== last) {
			last = last.next;
			do
				actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
			while (actionNode !== last);
		}
		actionQueue.action = null;
	}
	function notifyActionListeners(actionNode) {
		actionNode = actionNode.listeners;
		for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
	}
	function actionStateReducer(oldState, newState) {
		return newState;
	}
	function mountActionState(action, initialStateProp) {
		if (isHydrating) {
			var ssrFormState = workInProgressRoot.formState;
			if (null !== ssrFormState) {
				a: {
					var JSCompiler_inline_result = currentlyRenderingFiber;
					if (isHydrating) {
						if (nextHydratableInstance) {
							b: {
								var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
								for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType;) {
									if (!inRootOrSingleton) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
									JSCompiler_inline_result$jscomp$0 = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
									if (null === JSCompiler_inline_result$jscomp$0) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
								}
								inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
								JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
							}
							if (JSCompiler_inline_result$jscomp$0) {
								nextHydratableInstance = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
								JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
								break a;
							}
						}
						throwOnHydrationMismatch(JSCompiler_inline_result);
					}
					JSCompiler_inline_result = !1;
				}
				JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
			}
		}
		ssrFormState = mountWorkInProgressHook();
		ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
		JSCompiler_inline_result = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: actionStateReducer,
			lastRenderedState: initialStateProp
		};
		ssrFormState.queue = JSCompiler_inline_result;
		ssrFormState = dispatchSetState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result);
		JSCompiler_inline_result.dispatch = ssrFormState;
		JSCompiler_inline_result = mountStateImpl(!1);
		inRootOrSingleton = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !1, JSCompiler_inline_result.queue);
		JSCompiler_inline_result = mountWorkInProgressHook();
		JSCompiler_inline_result$jscomp$0 = {
			state: initialStateProp,
			dispatch: null,
			action,
			pending: null
		};
		JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
		ssrFormState = dispatchActionState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result$jscomp$0, inRootOrSingleton, ssrFormState);
		JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
		JSCompiler_inline_result.memoizedState = action;
		return [
			initialStateProp,
			ssrFormState,
			!1
		];
	}
	function updateActionState(action) {
		return updateActionStateImpl(updateWorkInProgressHook(), currentHook, action);
	}
	function updateActionStateImpl(stateHook, currentStateHook, action) {
		currentStateHook = updateReducerImpl(stateHook, currentStateHook, actionStateReducer)[0];
		stateHook = updateReducer(basicStateReducer)[0];
		if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then) try {
			var state = useThenable(currentStateHook);
		} catch (x) {
			if (x === SuspenseException) throw SuspenseActionException;
			throw x;
		}
		else state = currentStateHook;
		currentStateHook = updateWorkInProgressHook();
		var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
		action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(9, { destroy: void 0 }, actionStateActionEffect.bind(null, actionQueue, action), null));
		return [
			state,
			dispatch,
			stateHook
		];
	}
	function actionStateActionEffect(actionQueue, action) {
		actionQueue.action = action;
	}
	function rerenderActionState(action) {
		var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
		if (null !== currentStateHook) return updateActionStateImpl(stateHook, currentStateHook, action);
		updateWorkInProgressHook();
		stateHook = stateHook.memoizedState;
		currentStateHook = updateWorkInProgressHook();
		var dispatch = currentStateHook.queue.dispatch;
		currentStateHook.memoizedState = action;
		return [
			stateHook,
			dispatch,
			!1
		];
	}
	function pushSimpleEffect(tag, inst, create, deps) {
		tag = {
			tag,
			create,
			deps,
			inst,
			next: null
		};
		inst = currentlyRenderingFiber.updateQueue;
		null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
		create = inst.lastEffect;
		null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
		return tag;
	}
	function updateRef() {
		return updateWorkInProgressHook().memoizedState;
	}
	function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = mountWorkInProgressHook();
		currentlyRenderingFiber.flags |= fiberFlags;
		hook.memoizedState = pushSimpleEffect(1 | hookFlags, { destroy: void 0 }, create, void 0 === deps ? null : deps);
	}
	function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var inst = hook.memoizedState.inst;
		null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(1 | hookFlags, inst, create, deps));
	}
	function mountEffect(create, deps) {
		mountEffectImpl(8390656, 8, create, deps);
	}
	function updateEffect(create, deps) {
		updateEffectImpl(2048, 8, create, deps);
	}
	function useEffectEventImpl(payload) {
		currentlyRenderingFiber.flags |= 4;
		var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
		if (null === componentUpdateQueue) componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
		else {
			var events = componentUpdateQueue.events;
			null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
		}
	}
	function updateEvent(callback) {
		var ref = updateWorkInProgressHook().memoizedState;
		useEffectEventImpl({
			ref,
			nextImpl: callback
		});
		return function() {
			if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
			return ref.impl.apply(void 0, arguments);
		};
	}
	function updateInsertionEffect(create, deps) {
		return updateEffectImpl(4, 2, create, deps);
	}
	function updateLayoutEffect(create, deps) {
		return updateEffectImpl(4, 4, create, deps);
	}
	function imperativeHandleEffect(create, ref) {
		if ("function" === typeof ref) {
			create = create();
			var refCleanup = ref(create);
			return function() {
				"function" === typeof refCleanup ? refCleanup() : ref(null);
			};
		}
		if (null !== ref && void 0 !== ref) return create = create(), ref.current = create, function() {
			ref.current = null;
		};
	}
	function updateImperativeHandle(ref, create, deps) {
		deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
		updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
	}
	function mountDebugValue() {}
	function updateCallback(callback, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		hook.memoizedState = [callback, deps];
		return callback;
	}
	function updateMemo(nextCreate, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		prevState = nextCreate();
		if (shouldDoubleInvokeUserFnsInHooksDEV) {
			setIsStrictModeForDevtools(!0);
			try {
				nextCreate();
			} finally {
				setIsStrictModeForDevtools(!1);
			}
		}
		hook.memoizedState = [prevState, deps];
		return prevState;
	}
	function mountDeferredValueImpl(hook, value, initialValue) {
		if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return hook.memoizedState = value;
		hook.memoizedState = initialValue;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return initialValue;
	}
	function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
		if (objectIs(value, prevValue)) return value;
		if (null !== currentTreeHiddenStackCursor.current) return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = !0), hook;
		if (0 === (renderLanes & 106) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return didReceiveUpdate = !0, hook.memoizedState = value;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return prevValue;
	}
	function startTransition(fiber, queue, pendingState, finishedState, callback) {
		var previousPriority = ReactDOMSharedInternals.p;
		ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		currentTransition.types = null !== prevTransition ? prevTransition.types : null;
		ReactSharedInternals.T = currentTransition;
		dispatchOptimisticSetState(fiber, !1, queue, pendingState);
		try {
			var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) dispatchSetStateInternal(fiber, queue, chainThenableValue(returnValue, finishedState), requestUpdateLane(fiber));
			else dispatchSetStateInternal(fiber, queue, finishedState, requestUpdateLane(fiber));
		} catch (error) {
			dispatchSetStateInternal(fiber, queue, {
				then: function() {},
				status: "rejected",
				reason: error
			}, requestUpdateLane());
		} finally {
			ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function noop() {}
	function startHostTransition(formFiber, pendingState, action, formData) {
		if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
		var queue = ensureFormComponentIsStateful(formFiber).queue;
		startTransition(formFiber, queue, pendingState, sharedNotPendingObject, null === action ? noop : function() {
			requestFormReset$1(formFiber);
			return action(formData);
		});
	}
	function ensureFormComponentIsStateful(formFiber) {
		var existingStateHook = formFiber.memoizedState;
		if (null !== existingStateHook) return existingStateHook;
		existingStateHook = {
			memoizedState: sharedNotPendingObject,
			baseState: sharedNotPendingObject,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: sharedNotPendingObject
			},
			next: null
		};
		var initialResetState = {};
		existingStateHook.next = {
			memoizedState: initialResetState,
			baseState: initialResetState,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: initialResetState
			},
			next: null
		};
		formFiber.memoizedState = existingStateHook;
		formFiber = formFiber.alternate;
		null !== formFiber && (formFiber.memoizedState = existingStateHook);
		return existingStateHook;
	}
	function requestFormReset$1(formFiber) {
		var stateHook = ensureFormComponentIsStateful(formFiber);
		null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
		dispatchSetStateInternal(formFiber, stateHook.next.queue, {}, requestUpdateLane());
	}
	function useHostTransitionStatus() {
		return readContext(HostTransitionContext);
	}
	function updateId() {
		return updateWorkInProgressHook().memoizedState;
	}
	function updateRefresh() {
		return updateWorkInProgressHook().memoizedState;
	}
	function refreshCache(fiber) {
		for (var provider = fiber.return; null !== provider;) {
			switch (provider.tag) {
				case 24:
				case 3:
					var lane = requestUpdateLane();
					fiber = createUpdate(lane);
					var root$73 = enqueueUpdate(provider, fiber, lane);
					null !== root$73 && (scheduleUpdateOnFiber(root$73, provider, lane), entangleTransitions(root$73, provider, lane));
					provider = { cache: createCache() };
					fiber.payload = provider;
					return;
			}
			provider = provider.return;
		}
	}
	function dispatchReducerAction(fiber, queue, action) {
		var lane = requestUpdateLane();
		action = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
	}
	function dispatchSetState(fiber, queue, action) {
		dispatchSetStateInternal(fiber, queue, action, requestUpdateLane());
	}
	function dispatchSetStateInternal(fiber, queue, action, lane) {
		var update = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
		else {
			var alternate = fiber.alternate;
			if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate)) try {
				var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
				update.hasEagerState = !0;
				update.eagerState = eagerState;
				if (objectIs(eagerState, currentState)) return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), !1;
			} catch (error) {}
			action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
			if (null !== action) return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), !0;
		}
		return !1;
	}
	function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
		action = {
			lane: 2,
			revertLane: requestTransitionLane(),
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) {
			if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
		} else throwIfDuringRender = enqueueConcurrentHookUpdate(fiber, queue, action, 2), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
	}
	function isRenderPhaseUpdate(fiber) {
		var alternate = fiber.alternate;
		return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
	}
	function enqueueRenderPhaseUpdate(queue, update) {
		didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = !0;
		var pending = queue.pending;
		null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		queue.pending = update;
	}
	function entangleTransitionUpdate(root, queue, lane) {
		if (0 !== (lane & 4194048)) {
			var queueLanes = queue.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			queue.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	var ContextOnlyDispatcher = {
		readContext,
		use,
		useCallback: throwInvalidHookError,
		useContext: throwInvalidHookError,
		useEffect: throwInvalidHookError,
		useImperativeHandle: throwInvalidHookError,
		useLayoutEffect: throwInvalidHookError,
		useInsertionEffect: throwInvalidHookError,
		useMemo: throwInvalidHookError,
		useReducer: throwInvalidHookError,
		useRef: throwInvalidHookError,
		useState: throwInvalidHookError,
		useDebugValue: throwInvalidHookError,
		useDeferredValue: throwInvalidHookError,
		useTransition: throwInvalidHookError,
		useSyncExternalStore: throwInvalidHookError,
		useId: throwInvalidHookError,
		useHostTransitionStatus: throwInvalidHookError,
		useFormState: throwInvalidHookError,
		useActionState: throwInvalidHookError,
		useOptimistic: throwInvalidHookError,
		useMemoCache: throwInvalidHookError,
		useCacheRefresh: throwInvalidHookError,
		useEffectEvent: throwInvalidHookError
	};
	var HooksDispatcherOnMount = {
		readContext,
		use,
		useCallback: function(callback, deps) {
			mountWorkInProgressHook().memoizedState = [callback, void 0 === deps ? null : deps];
			return callback;
		},
		useContext: readContext,
		useEffect: mountEffect,
		useImperativeHandle: function(ref, create, deps) {
			deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
			mountEffectImpl(4194308, 4, imperativeHandleEffect.bind(null, create, ref), deps);
		},
		useLayoutEffect: function(create, deps) {
			return mountEffectImpl(4194308, 4, create, deps);
		},
		useInsertionEffect: function(create, deps) {
			mountEffectImpl(4, 2, create, deps);
		},
		useMemo: function(nextCreate, deps) {
			var hook = mountWorkInProgressHook();
			deps = void 0 === deps ? null : deps;
			var nextValue = nextCreate();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					nextCreate();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
			hook.memoizedState = [nextValue, deps];
			return nextValue;
		},
		useReducer: function(reducer, initialArg, init) {
			var hook = mountWorkInProgressHook();
			if (void 0 !== init) {
				var initialState = init(initialArg);
				if (shouldDoubleInvokeUserFnsInHooksDEV) {
					setIsStrictModeForDevtools(!0);
					try {
						init(initialArg);
					} finally {
						setIsStrictModeForDevtools(!1);
					}
				}
			} else initialState = initialArg;
			hook.memoizedState = hook.baseState = initialState;
			reducer = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: reducer,
				lastRenderedState: initialState
			};
			hook.queue = reducer;
			reducer = reducer.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, reducer);
			return [hook.memoizedState, reducer];
		},
		useRef: function(initialValue) {
			var hook = mountWorkInProgressHook();
			initialValue = { current: initialValue };
			return hook.memoizedState = initialValue;
		},
		useState: function(initialState) {
			initialState = mountStateImpl(initialState);
			var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
			queue.dispatch = dispatch;
			return [initialState.memoizedState, dispatch];
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return mountDeferredValueImpl(mountWorkInProgressHook(), value, initialValue);
		},
		useTransition: function() {
			var stateHook = mountStateImpl(!1);
			stateHook = startTransition.bind(null, currentlyRenderingFiber, stateHook.queue, !0, !1);
			mountWorkInProgressHook().memoizedState = stateHook;
			return [!1, stateHook];
		},
		useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
			var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
			if (isHydrating) {
				if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
				getServerSnapshot = getServerSnapshot();
			} else {
				getServerSnapshot = getSnapshot();
				if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
				0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
			}
			hook.memoizedState = getServerSnapshot;
			var inst = {
				value: getServerSnapshot,
				getSnapshot
			};
			hook.queue = inst;
			mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
			fiber.flags |= 2048;
			pushSimpleEffect(9, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, inst, getServerSnapshot, getSnapshot), null);
			return getServerSnapshot;
		},
		useId: function() {
			var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
			if (isHydrating) {
				var JSCompiler_inline_result = treeContextOverflow;
				var idWithLeadingBit = treeContextId;
				JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
				identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
				JSCompiler_inline_result = localIdCounter++;
				0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
				identifierPrefix += "_";
			} else JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
			return hook.memoizedState = identifierPrefix;
		},
		useHostTransitionStatus,
		useFormState: mountActionState,
		useActionState: mountActionState,
		useOptimistic: function(passthrough) {
			var hook = mountWorkInProgressHook();
			hook.memoizedState = hook.baseState = passthrough;
			var queue = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			hook.queue = queue;
			hook = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !0, queue);
			queue.dispatch = hook;
			return [passthrough, hook];
		},
		useMemoCache,
		useCacheRefresh: function() {
			return mountWorkInProgressHook().memoizedState = refreshCache.bind(null, currentlyRenderingFiber);
		},
		useEffectEvent: function(callback) {
			var hook = mountWorkInProgressHook(), ref = { impl: callback };
			hook.memoizedState = ref;
			return function() {
				if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
				return ref.impl.apply(void 0, arguments);
			};
		}
	};
	var HooksDispatcherOnUpdate = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: updateReducer,
		useRef: updateRef,
		useState: function() {
			return updateReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return updateDeferredValueImpl(updateWorkInProgressHook(), currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: updateActionState,
		useActionState: updateActionState,
		useOptimistic: function(passthrough, reducer) {
			return updateOptimisticImpl(updateWorkInProgressHook(), currentHook, passthrough, reducer);
		},
		useMemoCache,
		useCacheRefresh: updateRefresh,
		useEffectEvent: updateEvent
	};
	var HooksDispatcherOnRerender = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: rerenderReducer,
		useRef: updateRef,
		useState: function() {
			return rerenderReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			var hook = updateWorkInProgressHook();
			return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: rerenderActionState,
		useActionState: rerenderActionState,
		useOptimistic: function(passthrough, reducer) {
			var hook = updateWorkInProgressHook();
			if (null !== currentHook) return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
			hook.baseState = passthrough;
			return [passthrough, hook.queue.dispatch];
		},
		useMemoCache,
		useCacheRefresh: updateRefresh,
		useEffectEvent: updateEvent
	};
	function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
		ctor = workInProgress.memoizedState;
		getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
		getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
		workInProgress.memoizedState = getDerivedStateFromProps;
		0 === workInProgress.lanes && (workInProgress.updateQueue.baseState = getDerivedStateFromProps);
	}
	var classComponentUpdater = {
		enqueueSetState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueReplaceState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 1;
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueForceUpdate: function(inst, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 2;
			void 0 !== callback && null !== callback && (update.callback = callback);
			callback = enqueueUpdate(inst, update, lane);
			null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
		}
	};
	function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
		workInProgress = workInProgress.stateNode;
		return "function" === typeof workInProgress.shouldComponentUpdate ? workInProgress.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : !0;
	}
	function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
		workInProgress = instance.state;
		"function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
		"function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
		instance.state !== workInProgress && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
	}
	function resolveClassComponentProps(Component, baseProps) {
		var newProps = baseProps;
		if ("ref" in baseProps) {
			newProps = {};
			for (var propName in baseProps) "ref" !== propName && (newProps[propName] = baseProps[propName]);
		}
		if (Component = Component.defaultProps) {
			newProps === baseProps && (newProps = assign({}, newProps));
			for (var propName$77 in Component) void 0 === newProps[propName$77] && (newProps[propName$77] = Component[propName$77]);
		}
		return newProps;
	}
	function defaultOnUncaughtError(error) {
		reportGlobalError(error);
	}
	function defaultOnCaughtError(error) {
		console.error(error);
	}
	function defaultOnRecoverableError(error) {
		reportGlobalError(error);
	}
	function logUncaughtError(root, errorInfo) {
		try {
			var onUncaughtError = root.onUncaughtError;
			onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
		} catch (e$78) {
			setTimeout(function() {
				throw e$78;
			});
		}
	}
	function logCaughtError(root, boundary, errorInfo) {
		try {
			var onCaughtError = root.onCaughtError;
			onCaughtError(errorInfo.value, {
				componentStack: errorInfo.stack,
				errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
			});
		} catch (e$79) {
			setTimeout(function() {
				throw e$79;
			});
		}
	}
	function createRootErrorUpdate(root, errorInfo, lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		lane.payload = { element: null };
		lane.callback = function() {
			logUncaughtError(root, errorInfo);
		};
		return lane;
	}
	function createClassErrorUpdate(lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		return lane;
	}
	function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
		var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
		if ("function" === typeof getDerivedStateFromError) {
			var error = errorInfo.value;
			update.payload = function() {
				return getDerivedStateFromError(error);
			};
			update.callback = function() {
				logCaughtError(root, fiber, errorInfo);
			};
		}
		var inst = fiber.stateNode;
		null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
			logCaughtError(root, fiber, errorInfo);
			"function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
			var stack = errorInfo.stack;
			this.componentDidCatch(errorInfo.value, { componentStack: null !== stack ? stack : "" });
		});
	}
	function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
		sourceFiber.flags |= 32768;
		if (null !== value && "object" === typeof value && "function" === typeof value.then) {
			returnFiber = sourceFiber.alternate;
			null !== returnFiber && propagateParentContextChanges(returnFiber, sourceFiber, rootRenderLanes, !0);
			sourceFiber = suspenseHandlerStackCursor.current;
			if (null !== sourceFiber) {
				switch (sourceFiber.tag) {
					case 31:
					case 13:
					case 19: return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root, value, rootRenderLanes)), !1;
					case 22: return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([value])
					}, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root, value, rootRenderLanes)), !1;
				}
				throw Error(formatProdErrorMessage(435, sourceFiber.tag));
			}
			attachPingListener(root, value, rootRenderLanes);
			renderDidSuspendDelayIfPossible();
			return !1;
		}
		if (isHydrating) return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), { cause: value }), queueHydrationError(createCapturedValueAtFiber(returnFiber, sourceFiber))), root = root.current.alternate, root.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(root.stateNode, value, rootRenderLanes), enqueueCapturedUpdate(root, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), !1;
		var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
		wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
		null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
		4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
		if (null === returnFiber) return !0;
		value = createCapturedValueAtFiber(value, sourceFiber);
		sourceFiber = returnFiber;
		do {
			switch (sourceFiber.tag) {
				case 3: return sourceFiber.flags |= 65536, root = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root, root = createRootErrorUpdate(sourceFiber.stateNode, value, root), enqueueCapturedUpdate(sourceFiber, root), !1;
				case 1:
					returnFiber = sourceFiber.type;
					wrapperError = sourceFiber.stateNode;
					if (0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError)))) return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(rootRenderLanes, root, sourceFiber, value), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), !1;
					break;
				case 22: if (null !== sourceFiber.memoizedState) return sourceFiber.flags |= 65536, !1;
			}
			sourceFiber = sourceFiber.return;
		} while (null !== sourceFiber);
		return !1;
	}
	var SelectiveHydrationException = Error(formatProdErrorMessage(461));
	var didReceiveUpdate = !1;
	function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
		workInProgress.child = null === current ? mountChildFibers(workInProgress, null, nextChildren, renderLanes) : reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
	}
	function updateForwardRef(current, workInProgress, Component, nextProps, renderLanes) {
		Component = Component.render;
		var ref = workInProgress.ref;
		if ("ref" in nextProps) {
			var propsWithoutRef = {};
			for (var key in nextProps) "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
		} else propsWithoutRef = nextProps;
		prepareToReadContext(workInProgress);
		nextProps = renderWithHooks(current, workInProgress, Component, propsWithoutRef, ref, renderLanes);
		key = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && key && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null === current) {
			var type = Component.type;
			if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare) return workInProgress.tag = 15, workInProgress.type = type, updateSimpleMemoComponent(current, workInProgress, type, nextProps, renderLanes);
			current = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress, workInProgress.mode, renderLanes);
			current.ref = workInProgress.ref;
			current.return = workInProgress;
			return workInProgress.child = current;
		}
		type = current.child;
		if (!checkScheduledUpdateOrContext(current, renderLanes)) {
			var prevProps = type.memoizedProps;
			Component = Component.compare;
			Component = null !== Component ? Component : shallowEqual;
			if (Component(prevProps, nextProps) && current.ref === workInProgress.ref) return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		workInProgress.flags |= 1;
		current = createWorkInProgress(type, nextProps);
		current.ref = workInProgress.ref;
		current.return = workInProgress;
		return workInProgress.child = current;
	}
	function updateSimpleMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null !== current) {
			var prevProps = current.memoizedProps;
			if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress.ref) if (didReceiveUpdate = !1, workInProgress.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes)) 0 !== (current.flags & 131072) && (didReceiveUpdate = !0);
			else return workInProgress.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		return updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes);
	}
	function updateOffscreenComponent(current, workInProgress, renderLanes, nextProps) {
		var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
		null === current && null === workInProgress.stateNode && (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		if ("hidden" === nextProps.mode) {
			if (0 !== (workInProgress.flags & 128)) {
				prevState = null !== prevState ? prevState.baseLanes | renderLanes : renderLanes;
				if (null !== current) {
					nextProps = workInProgress.child = current.child;
					for (nextChildren = 0; null !== nextProps;) nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
					nextProps = nextChildren & ~prevState;
				} else nextProps = 0, workInProgress.child = null;
				return deferHiddenOffscreenComponent(current, workInProgress, prevState, renderLanes, nextProps);
			}
			if (0 !== (renderLanes & 536870912)) workInProgress.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, null !== current && pushTransition(workInProgress, null !== prevState ? prevState.cachePool : null), null !== prevState ? pushHiddenContext(workInProgress, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress);
			else return nextProps = workInProgress.lanes = 536870912, deferHiddenOffscreenComponent(current, workInProgress, null !== prevState ? prevState.baseLanes | renderLanes : renderLanes, renderLanes, nextProps);
		} else null !== prevState ? (pushTransition(workInProgress, prevState.cachePool), pushHiddenContext(workInProgress, prevState), reuseSuspenseHandlerOnStack(), workInProgress.memoizedState = null) : (null !== current && pushTransition(workInProgress, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	function bailoutOffscreenComponent(current, workInProgress) {
		null !== current && 22 === current.tag || null !== workInProgress.stateNode || (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		return workInProgress.sibling;
	}
	function deferHiddenOffscreenComponent(current, workInProgress, nextBaseLanes, renderLanes, remainingChildLanes) {
		var JSCompiler_inline_result = peekCacheFromPool();
		JSCompiler_inline_result = null === JSCompiler_inline_result ? null : {
			parent: CacheContext._currentValue,
			pool: JSCompiler_inline_result
		};
		workInProgress.memoizedState = {
			baseLanes: nextBaseLanes,
			cachePool: JSCompiler_inline_result
		};
		null !== current && pushTransition(workInProgress, null);
		reuseHiddenContextOnStack();
		pushOffscreenSuspenseHandler(workInProgress);
		null !== current && propagateParentContextChanges(current, workInProgress, renderLanes, !0);
		workInProgress.childLanes = remainingChildLanes;
		return null;
	}
	function mountActivityChildren(workInProgress, nextProps) {
		nextProps = mountWorkInProgressOffscreenFiber({
			mode: nextProps.mode,
			children: nextProps.children
		}, workInProgress.mode);
		nextProps.ref = workInProgress.ref;
		workInProgress.child = nextProps;
		nextProps.return = workInProgress;
		return nextProps;
	}
	function retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountActivityChildren(workInProgress, workInProgress.pendingProps);
		current.flags |= 2;
		popSuspenseHandler(workInProgress);
		workInProgress.memoizedState = null;
		return current;
	}
	function updateActivityComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, didSuspend = 0 !== (workInProgress.flags & 128);
		workInProgress.flags &= -129;
		if (null === current) {
			if (isHydrating) {
				if ("hidden" === nextProps.mode) return current = mountActivityChildren(workInProgress, nextProps), workInProgress.lanes = 536870912, current.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, bailoutOffscreenComponent(null, current);
				pushDehydratedActivitySuspenseHandler(workInProgress);
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				workInProgress.lanes = 536870912;
				return null;
			}
			return mountActivityChildren(workInProgress, nextProps);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated = prevState.dehydrated;
			pushDehydratedActivitySuspenseHandler(workInProgress);
			if (didSuspend) if (workInProgress.flags & 256) workInProgress.flags &= -257, workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			else if (null !== workInProgress.memoizedState) workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null;
			else throw Error(formatProdErrorMessage(558));
			else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1), didSuspend = 0 !== (renderLanes & current.childLanes), didReceiveUpdate || didSuspend) {
				if (null === currentTreeHiddenStackCursor.current) {
					nextProps = workInProgressRoot;
					if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes), 0 !== dehydrated && dehydrated !== prevState.retryLane)) throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
					renderDidSuspendDelayIfPossible();
				}
				workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress, isHydrating = !0, hydrationErrors = null, rootOrSingletonContext = !1, null !== current && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountActivityChildren(workInProgress, nextProps), workInProgress.flags |= 134221824;
			return workInProgress;
		}
		current = createWorkInProgress(current.child, {
			mode: nextProps.mode,
			children: nextProps.children
		});
		current.ref = workInProgress.ref;
		workInProgress.child = current;
		current.return = workInProgress;
		return current;
	}
	function markRef(current, workInProgress) {
		var ref = workInProgress.ref;
		if (null === ref) null !== current && null !== current.ref && (workInProgress.flags |= 4194816);
		else {
			if ("function" !== typeof ref && "object" !== typeof ref) throw Error(formatProdErrorMessage(284));
			if (null === current || current.ref !== ref) workInProgress.flags |= 4194816;
		}
	}
	function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		Component = renderWithHooks(current, workInProgress, Component, nextProps, void 0, renderLanes);
		nextProps = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && nextProps && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, Component, renderLanes);
		return workInProgress.child;
	}
	function replayFunctionComponent(current, workInProgress, nextProps, Component, secondArg, renderLanes) {
		prepareToReadContext(workInProgress);
		workInProgress.updateQueue = null;
		nextProps = renderWithHooksAgain(workInProgress, Component, nextProps, secondArg);
		finishRenderingHooks(current);
		Component = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && Component && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		if (null === workInProgress.stateNode) {
			var context = emptyContextObject, contextType = Component.contextType;
			"object" === typeof contextType && null !== contextType && (context = readContext(contextType));
			context = new Component(nextProps, context);
			workInProgress.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
			context.updater = classComponentUpdater;
			workInProgress.stateNode = context;
			context._reactInternals = workInProgress;
			context = workInProgress.stateNode;
			context.props = nextProps;
			context.state = workInProgress.memoizedState;
			context.refs = {};
			initializeUpdateQueue(workInProgress);
			contextType = Component.contextType;
			context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
			context.state = workInProgress.memoizedState;
			contextType = Component.getDerivedStateFromProps;
			"function" === typeof contextType && (applyDerivedStateFromProps(workInProgress, Component, contextType, nextProps), context.state = workInProgress.memoizedState);
			"function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress, nextProps, context, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress.memoizedState);
			"function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308);
			nextProps = !0;
		} else if (null === current) {
			context = workInProgress.stateNode;
			var unresolvedOldProps = workInProgress.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
			context.props = oldProps;
			var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
			contextType = emptyContextObject;
			"object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
			var getDerivedStateFromProps = Component.getDerivedStateFromProps;
			contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
			unresolvedOldProps = workInProgress.pendingProps !== unresolvedOldProps;
			contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(workInProgress, context, nextProps, contextType);
			hasForceUpdate = !1;
			var oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			oldContext = workInProgress.memoizedState;
			unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, nextProps), oldContext = workInProgress.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, oldContext, contextType)) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), nextProps = !1);
		} else {
			context = workInProgress.stateNode;
			cloneUpdateQueue(current, workInProgress);
			contextType = workInProgress.memoizedProps;
			contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
			context.props = contextType$jscomp$0;
			getDerivedStateFromProps = workInProgress.pendingProps;
			oldState = context.context;
			oldContext = Component.contextType;
			oldProps = emptyContextObject;
			"object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
			unresolvedOldProps = Component.getDerivedStateFromProps;
			(oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(workInProgress, context, nextProps, oldProps);
			hasForceUpdate = !1;
			oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			var newState = workInProgress.memoizedState;
			contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(workInProgress, Component, unresolvedOldProps, nextProps), newState = workInProgress.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, contextType$jscomp$0, nextProps, oldState, newState, oldProps) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(nextProps, newState, oldProps)), "function" === typeof context.componentDidUpdate && (workInProgress.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), nextProps = !1);
		}
		context = nextProps;
		markRef(current, workInProgress);
		nextProps = 0 !== (workInProgress.flags & 128);
		context || nextProps ? (context = workInProgress.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress.flags |= 1, null !== current && nextProps ? (workInProgress.child = reconcileChildFibers(workInProgress, current.child, null, renderLanes), workInProgress.child = reconcileChildFibers(workInProgress, null, Component, renderLanes)) : reconcileChildren(current, workInProgress, Component, renderLanes), workInProgress.memoizedState = context.state, current = workInProgress.child) : current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		return current;
	}
	function mountHostRootWithoutHydrating(current, workInProgress, nextChildren, renderLanes) {
		resetHydrationState();
		workInProgress.flags |= 256;
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	var SUSPENDED_MARKER = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function mountSuspenseOffscreenState(renderLanes) {
		return {
			baseLanes: renderLanes,
			cachePool: getSuspendedCache()
		};
	}
	function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes) {
		current = null !== current ? current.childLanes & ~renderLanes : 0;
		primaryTreeDidDefer && (current |= workInProgressDeferredLane);
		return current;
	}
	function updateSuspenseComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, showFallback = !1, didSuspend = 0 !== (workInProgress.flags & 128), JSCompiler_temp;
		(JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? !1 : 0 !== (suspenseStackCursor.current & 2));
		JSCompiler_temp && (showFallback = !0, workInProgress.flags &= -129);
		JSCompiler_temp = 0 !== (workInProgress.flags & 32);
		workInProgress.flags &= -33;
		if (null === current) {
			if (isHydrating) {
				showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress) : reuseSuspenseHandlerOnStack();
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				isSuspenseInstanceFallback(current) ? workInProgress.lanes = 32 : workInProgress.lanes = 536870912;
				return null;
			}
			didSuspend = nextProps.children;
			nextProps = nextProps.fallback;
			if (showFallback) return reuseSuspenseHandlerOnStack(), showFallback = workInProgress.mode, didSuspend = mountWorkInProgressOffscreenFiber({
				mode: "hidden",
				children: didSuspend
			}, showFallback), nextProps = createFiberFromFragment(nextProps, showFallback, renderLanes, null), didSuspend.return = workInProgress, nextProps.return = workInProgress, didSuspend.sibling = nextProps, workInProgress.child = didSuspend, nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
			pushPrimaryTreeSuspenseHandler(workInProgress);
			return mountSuspensePrimaryChildren(workInProgress, didSuspend);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated$96 = prevState.dehydrated;
			if (null !== dehydrated$96) return updateDehydratedSuspenseComponent(current, workInProgress, didSuspend, JSCompiler_temp, nextProps, dehydrated$96, prevState, renderLanes);
		}
		if (showFallback) return reuseSuspenseHandlerOnStack(), showFallback = nextProps.fallback, didSuspend = workInProgress.mode, prevState = current.child, dehydrated$96 = prevState.sibling, nextProps = createWorkInProgress(prevState, {
			mode: "hidden",
			children: nextProps.children
		}), nextProps.subtreeFlags = prevState.subtreeFlags & 1206910976, null !== dehydrated$96 ? showFallback = createWorkInProgress(dehydrated$96, showFallback) : (showFallback = createFiberFromFragment(showFallback, didSuspend, renderLanes, null), showFallback.flags |= 2), showFallback.return = workInProgress, nextProps.return = workInProgress, nextProps.sibling = showFallback, workInProgress.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress.child, showFallback = current.child.memoizedState, null === showFallback ? showFallback = mountSuspenseOffscreenState(renderLanes) : (didSuspend = showFallback.cachePool, null !== didSuspend ? (prevState = CacheContext._currentValue, didSuspend = didSuspend.parent !== prevState ? {
			parent: prevState,
			pool: prevState
		} : didSuspend) : didSuspend = getSuspendedCache(), showFallback = {
			baseLanes: showFallback.baseLanes | renderLanes,
			cachePool: didSuspend
		}), nextProps.memoizedState = showFallback, nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
		pushPrimaryTreeSuspenseHandler(workInProgress);
		renderLanes = current.child;
		current = renderLanes.sibling;
		renderLanes = createWorkInProgress(renderLanes, {
			mode: "visible",
			children: nextProps.children
		});
		renderLanes.return = workInProgress;
		renderLanes.sibling = null;
		null !== current && (JSCompiler_temp = workInProgress.deletions, null === JSCompiler_temp ? (workInProgress.deletions = [current], workInProgress.flags |= 16) : JSCompiler_temp.push(current));
		workInProgress.child = renderLanes;
		workInProgress.memoizedState = null;
		return renderLanes;
	}
	function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
		primaryChildren = mountWorkInProgressOffscreenFiber({
			mode: "visible",
			children: primaryChildren
		}, workInProgress.mode);
		primaryChildren.return = workInProgress;
		return workInProgress.child = primaryChildren;
	}
	function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
		offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
		offscreenProps.lanes = 0;
		return offscreenProps;
	}
	function retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountSuspensePrimaryChildren(workInProgress, workInProgress.pendingProps.children);
		current.flags |= 2;
		workInProgress.memoizedState = null;
		return current;
	}
	function updateDehydratedSuspenseComponent(current, workInProgress, didSuspend, didPrimaryChildrenDefer, nextProps, suspenseInstance, suspenseState, renderLanes) {
		if (didSuspend) {
			if (workInProgress.flags & 256) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags &= -257, retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			if (null !== workInProgress.memoizedState) return reuseSuspenseHandlerOnStack(), workInProgress.child = current.child, workInProgress.flags |= 128, null;
			reuseSuspenseHandlerOnStack();
			suspenseInstance = nextProps.fallback;
			suspenseState = workInProgress.mode;
			nextProps = mountWorkInProgressOffscreenFiber({
				mode: "visible",
				children: nextProps.children
			}, suspenseState);
			suspenseInstance = createFiberFromFragment(suspenseInstance, suspenseState, renderLanes, null);
			suspenseInstance.flags |= 2;
			nextProps.return = workInProgress;
			suspenseInstance.return = workInProgress;
			nextProps.sibling = suspenseInstance;
			workInProgress.child = nextProps;
			reconcileChildFibers(workInProgress, current.child, null, renderLanes);
			nextProps = workInProgress.child;
			nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes);
			nextProps.childLanes = getRemainingWorkInPrimaryTree(current, didPrimaryChildrenDefer, renderLanes);
			workInProgress.memoizedState = SUSPENDED_MARKER;
			return bailoutOffscreenComponent(null, nextProps);
		}
		pushPrimaryTreeSuspenseHandler(workInProgress);
		if (isSuspenseInstanceFallback(suspenseInstance)) {
			didPrimaryChildrenDefer = suspenseInstance.nextSibling && suspenseInstance.nextSibling.dataset;
			if (didPrimaryChildrenDefer) var digest = didPrimaryChildrenDefer.dgst;
			didPrimaryChildrenDefer = digest;
			"" !== didPrimaryChildrenDefer && (nextProps = Error(formatProdErrorMessage(419)), nextProps.stack = "", nextProps.digest = didPrimaryChildrenDefer, queueHydrationError({
				value: nextProps,
				source: null,
				stack: null
			}));
			return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
		}
		didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1);
		didPrimaryChildrenDefer = 0 !== (renderLanes & current.childLanes);
		if (didReceiveUpdate || didPrimaryChildrenDefer) {
			if (null !== currentTreeHiddenStackCursor.current) return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			didPrimaryChildrenDefer = workInProgressRoot;
			if (null !== didPrimaryChildrenDefer && (nextProps = getBumpedLaneForHydration(didPrimaryChildrenDefer, renderLanes), 0 !== nextProps && nextProps !== suspenseState.retryLane)) throw suspenseState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(didPrimaryChildrenDefer, current, nextProps), SelectiveHydrationException;
			isSuspenseInstancePending(suspenseInstance) || renderDidSuspendDelayIfPossible();
			return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
		}
		if (isSuspenseInstancePending(suspenseInstance)) return workInProgress.flags |= 192, workInProgress.child = current.child, null;
		current = suspenseState.treeContext;
		nextHydratableInstance = getNextHydratable(suspenseInstance.nextSibling);
		hydrationParentFiber = workInProgress;
		isHydrating = !0;
		hydrationErrors = null;
		rootOrSingletonContext = !1;
		null !== current && restoreSuspendedTreeContext(workInProgress, current);
		workInProgress = mountSuspensePrimaryChildren(workInProgress, nextProps.children);
		workInProgress.flags |= 134221824;
		return workInProgress;
	}
	function scheduleSuspenseWorkOnFiber(fiber, renderLanes, propagationRoot) {
		fiber.lanes |= renderLanes;
		var alternate = fiber.alternate;
		null !== alternate && (alternate.lanes |= renderLanes);
		scheduleContextWorkOnParentPath(fiber.return, renderLanes, propagationRoot);
	}
	function findLastContentRow(firstChild) {
		for (var lastContentRow = null; null !== firstChild;) {
			var currentRow = firstChild.alternate;
			null !== currentRow && null === findFirstSuspended(currentRow) && (lastContentRow = firstChild);
			firstChild = firstChild.sibling;
		}
		return lastContentRow;
	}
	function initSuspenseListRenderState(workInProgress, isBackwards, tail, lastContentRow, tailMode, treeForkCount) {
		var renderState = workInProgress.memoizedState;
		null === renderState ? workInProgress.memoizedState = {
			isBackwards,
			rendering: null,
			renderingStartTime: 0,
			last: lastContentRow,
			tail,
			tailMode,
			treeForkCount
		} : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount);
	}
	function reverseChildren(fiber) {
		var row = fiber.child;
		for (fiber.child = null; null !== row;) {
			var nextRow = row.sibling;
			row.sibling = fiber.child;
			fiber.child = row;
			row = nextRow;
		}
	}
	function updateSuspenseListComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
		nextProps = nextProps.children;
		var suspenseContext = suspenseStackCursor.current;
		if (workInProgress.flags & 128) return pushSuspenseListContext(workInProgress, suspenseContext), null;
		var shouldForceFallback = 0 !== (suspenseContext & 2);
		shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress.flags |= 128) : suspenseContext &= 1;
		pushSuspenseListContext(workInProgress, suspenseContext);
		"backwards" === revealOrder && null !== current ? (reverseChildren(current), reconcileChildren(current, workInProgress, nextProps, renderLanes), reverseChildren(current)) : reconcileChildren(current, workInProgress, nextProps, renderLanes);
		nextProps = isHydrating ? treeForkCount : 0;
		if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128)) a: for (current = workInProgress.child; null !== current;) {
			if (13 === current.tag) null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (19 === current.tag) scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (null !== current.child) {
				current.child.return = current;
				current = current.child;
				continue;
			}
			if (current === workInProgress) break a;
			for (; null === current.sibling;) {
				if (null === current.return || current.return === workInProgress) break a;
				current = current.return;
			}
			current.sibling.return = current.return;
			current = current.sibling;
		}
		switch (revealOrder) {
			case "backwards":
				renderLanes = findLastContentRow(workInProgress.child);
				null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null, reverseChildren(workInProgress));
				initSuspenseListRenderState(workInProgress, !0, revealOrder, null, tailMode, nextProps);
				break;
			case "unstable_legacy-backwards":
				renderLanes = null;
				revealOrder = workInProgress.child;
				for (workInProgress.child = null; null !== revealOrder;) {
					current = revealOrder.alternate;
					if (null !== current && null === findFirstSuspended(current)) {
						workInProgress.child = revealOrder;
						break;
					}
					current = revealOrder.sibling;
					revealOrder.sibling = renderLanes;
					renderLanes = revealOrder;
					revealOrder = current;
				}
				initSuspenseListRenderState(workInProgress, !0, renderLanes, null, tailMode, nextProps);
				break;
			case "together":
				initSuspenseListRenderState(workInProgress, !1, null, null, void 0, nextProps);
				break;
			case "independent":
				workInProgress.memoizedState = null;
				break;
			default: renderLanes = findLastContentRow(workInProgress.child), null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null), initSuspenseListRenderState(workInProgress, !1, revealOrder, renderLanes, tailMode, nextProps);
		}
		return workInProgress.child;
	}
	function updateContextProvider(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		pushProvider(workInProgress, workInProgress.type, newProps.value);
		reconcileChildren(current, workInProgress, newProps.children, renderLanes);
		return workInProgress.child;
	}
	function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
		null !== current && (workInProgress.dependencies = current.dependencies);
		workInProgressRootSkippedLanes |= workInProgress.lanes;
		if (0 === (renderLanes & workInProgress.childLanes)) if (null !== current) {
			if (propagateParentContextChanges(current, workInProgress, renderLanes, !1), 0 === (renderLanes & workInProgress.childLanes)) return null;
		} else return null;
		if (null !== current && workInProgress.child !== current.child) throw Error(formatProdErrorMessage(153));
		if (null !== workInProgress.child) {
			current = workInProgress.child;
			renderLanes = createWorkInProgress(current, current.pendingProps);
			workInProgress.child = renderLanes;
			for (renderLanes.return = workInProgress; null !== current.sibling;) current = current.sibling, renderLanes = renderLanes.sibling = createWorkInProgress(current, current.pendingProps), renderLanes.return = workInProgress;
			renderLanes.sibling = null;
		}
		return workInProgress.child;
	}
	function checkScheduledUpdateOrContext(current, renderLanes) {
		if (0 !== (current.lanes & renderLanes)) return !0;
		current = current.dependencies;
		return null !== current && checkIfContextChanged(current) ? !0 : !1;
	}
	function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes) {
		switch (workInProgress.tag) {
			case 3:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
				resetHydrationState();
				break;
			case 27:
			case 5:
				pushHostContext(workInProgress);
				break;
			case 4:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				break;
			case 10:
				pushProvider(workInProgress, workInProgress.type, workInProgress.memoizedProps.value);
				break;
			case 31:
				if (null !== workInProgress.memoizedState) return workInProgress.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress), null;
				break;
			case 13:
				var state$108 = workInProgress.memoizedState;
				if (null !== state$108) {
					if (null !== state$108.dehydrated) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags |= 128, null;
					state$108 = propagateParentContextChanges(current, workInProgress, renderLanes, !1);
					var primaryChildLanes = workInProgress.child.childLanes;
					if (state$108 || 0 !== (renderLanes & primaryChildLanes)) return updateSuspenseComponent(current, workInProgress, renderLanes);
					pushPrimaryTreeSuspenseHandler(workInProgress);
					current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
					return null !== current ? current.sibling : null;
				}
				pushPrimaryTreeSuspenseHandler(workInProgress);
				break;
			case 19:
				if (workInProgress.flags & 128) return updateSuspenseListComponent(current, workInProgress, renderLanes);
				primaryChildLanes = 0 !== (current.flags & 128);
				state$108 = 0 !== (renderLanes & workInProgress.childLanes);
				state$108 || (propagateParentContextChanges(current, workInProgress, renderLanes, !1), state$108 = 0 !== (renderLanes & workInProgress.childLanes));
				if (primaryChildLanes) {
					if (state$108) return updateSuspenseListComponent(current, workInProgress, renderLanes);
					workInProgress.flags |= 128;
				}
				primaryChildLanes = workInProgress.memoizedState;
				null !== primaryChildLanes && (primaryChildLanes.rendering = null, primaryChildLanes.tail = null, primaryChildLanes.lastEffect = null);
				pushSuspenseListContext(workInProgress, suspenseStackCursor.current);
				if (state$108) break;
				else return null;
			case 22: return workInProgress.lanes = 0, updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
		}
		return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
	}
	function beginWork(current, workInProgress, renderLanes) {
		if (null !== current) if (current.memoizedProps !== workInProgress.pendingProps) didReceiveUpdate = !0;
		else {
			if (!checkScheduledUpdateOrContext(current, renderLanes) && 0 === (workInProgress.flags & 128)) return didReceiveUpdate = !1, attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
			didReceiveUpdate = 0 !== (current.flags & 131072) ? !0 : !1;
		}
		else didReceiveUpdate = !1, isHydrating && 0 !== (workInProgress.flags & 1048576) && pushTreeId(workInProgress, treeForkCount, workInProgress.index);
		workInProgress.lanes = 0;
		switch (workInProgress.tag) {
			case 16:
				a: {
					var props = workInProgress.pendingProps;
					current = resolveLazy(workInProgress.elementType);
					workInProgress.type = current;
					if ("function" === typeof current) shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress.tag = 1, workInProgress = updateClassComponent(null, workInProgress, current, props, renderLanes)) : (workInProgress.tag = 0, workInProgress = updateFunctionComponent(null, workInProgress, current, props, renderLanes));
					else {
						if (void 0 !== current && null !== current) {
							var $$typeof = current.$$typeof;
							if ($$typeof === REACT_FORWARD_REF_TYPE) {
								workInProgress.tag = 11;
								workInProgress = updateForwardRef(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_MEMO_TYPE) {
								workInProgress.tag = 14;
								workInProgress = updateMemoComponent(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_CONTEXT_TYPE) {
								workInProgress.tag = 10;
								workInProgress.type = current;
								workInProgress = updateContextProvider(null, workInProgress, renderLanes);
								break a;
							}
						}
						workInProgress = getComponentNameFromType(current) || current;
						throw Error(formatProdErrorMessage(306, workInProgress, ""));
					}
				}
				return workInProgress;
			case 0: return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 1: return props = workInProgress.type, $$typeof = resolveClassComponentProps(props, workInProgress.pendingProps), updateClassComponent(current, workInProgress, props, $$typeof, renderLanes);
			case 3:
				a: {
					pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
					if (null === current) throw Error(formatProdErrorMessage(387));
					props = workInProgress.pendingProps;
					var prevState = workInProgress.memoizedState;
					$$typeof = prevState.element;
					cloneUpdateQueue(current, workInProgress);
					processUpdateQueue(workInProgress, props, null, renderLanes);
					var nextState = workInProgress.memoizedState;
					props = nextState.cache;
					pushProvider(workInProgress, CacheContext, props);
					props !== prevState.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0);
					suspendIfUpdateReadFromEntangledAsyncAction();
					props = nextState.element;
					if (prevState.isDehydrated) if (prevState = {
						element: props,
						isDehydrated: !1,
						cache: nextState.cache
					}, workInProgress.updateQueue.baseState = prevState, workInProgress.memoizedState = prevState, workInProgress.flags & 256) {
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else if (props !== $$typeof) {
						$$typeof = createCapturedValueAtFiber(Error(formatProdErrorMessage(424)), workInProgress);
						queueHydrationError($$typeof);
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else {
						current = workInProgress.stateNode.containerInfo;
						switch (current.nodeType) {
							case 9:
								current = current.body;
								break;
							default: current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
						}
						nextHydratableInstance = getNextHydratable(current.firstChild);
						hydrationParentFiber = workInProgress;
						isHydrating = !0;
						hydrationErrors = null;
						rootOrSingletonContext = !0;
						renderLanes = mountChildFibers(workInProgress, null, props, renderLanes);
						for (workInProgress.child = renderLanes; renderLanes;) renderLanes.flags = renderLanes.flags & -3 | 134221824, renderLanes = renderLanes.sibling;
					}
					else {
						resetHydrationState();
						if (props === $$typeof) {
							workInProgress = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
							break a;
						}
						reconcileChildren(current, workInProgress, props, renderLanes);
					}
					workInProgress = workInProgress.child;
				}
				return workInProgress;
			case 26: return markRef(current, workInProgress), null === current ? (renderLanes = getResource(workInProgress.type, null, workInProgress.pendingProps, null)) ? workInProgress.memoizedState = renderLanes : isHydrating || (workInProgress.stateNode = createHoistableInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current, workInProgress)) : workInProgress.memoizedState = getResource(workInProgress.type, current.memoizedProps, workInProgress.pendingProps, current.memoizedState), null;
			case 27: return pushHostContext(workInProgress), null === current && isHydrating && (props = workInProgress.stateNode = resolveSingletonInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current), hydrationParentFiber = workInProgress, rootOrSingletonContext = !0, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), markRef(current, workInProgress), null === current && (workInProgress.flags |= 4194304), workInProgress.child;
			case 5:
				if (null === current && isHydrating) {
					if ($$typeof = props = nextHydratableInstance) props = canHydrateInstance(props, workInProgress.type, workInProgress.pendingProps, rootOrSingletonContext), null !== props ? (workInProgress.stateNode = props, hydrationParentFiber = workInProgress, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = !1, $$typeof = !0) : $$typeof = !1;
					$$typeof || throwOnHydrationMismatch(workInProgress);
				}
				pushHostContext(workInProgress);
				$$typeof = workInProgress.type;
				prevState = workInProgress.pendingProps;
				nextState = null !== current ? current.memoizedProps : null;
				props = prevState.children;
				shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress.flags |= 32);
				null !== workInProgress.memoizedState && ($$typeof = renderWithHooks(current, workInProgress, TransitionAwareHostComponent, null, null, renderLanes), HostTransitionContext._currentValue = $$typeof);
				markRef(current, workInProgress);
				reconcileChildren(current, workInProgress, props, renderLanes);
				return workInProgress.child;
			case 6:
				if (null === current && isHydrating) {
					if (current = renderLanes = nextHydratableInstance) renderLanes = canHydrateTextInstance(renderLanes, workInProgress.pendingProps, rootOrSingletonContext), null !== renderLanes ? (workInProgress.stateNode = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null, current = !0) : current = !1;
					current || throwOnHydrationMismatch(workInProgress);
				}
				return null;
			case 13: return updateSuspenseComponent(current, workInProgress, renderLanes);
			case 4: return pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo), props = workInProgress.pendingProps, null === current ? workInProgress.child = reconcileChildFibers(workInProgress, null, props, renderLanes) : reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 11: return updateForwardRef(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 7: return props = workInProgress.pendingProps, markRef(current, workInProgress), reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 8: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 12: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 10: return updateContextProvider(current, workInProgress, renderLanes);
			case 9: return $$typeof = workInProgress.type._context, props = workInProgress.pendingProps.children, prepareToReadContext(workInProgress), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress.flags |= 1, reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 14: return updateMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 15: return updateSimpleMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 19: return updateSuspenseListComponent(current, workInProgress, renderLanes);
			case 31: return updateActivityComponent(current, workInProgress, renderLanes);
			case 22: return updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: return prepareToReadContext(workInProgress), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes), $$typeof = prevState), workInProgress.memoizedState = {
				parent: props,
				cache: $$typeof
			}, initializeUpdateQueue(workInProgress), pushProvider(workInProgress, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes) && (cloneUpdateQueue(current, workInProgress), processUpdateQueue(workInProgress, null, null, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress.memoizedState, $$typeof.parent !== props ? ($$typeof = {
				parent: props,
				cache: props
			}, workInProgress.memoizedState = $$typeof, 0 === workInProgress.lanes && (workInProgress.memoizedState = workInProgress.updateQueue.baseState = $$typeof), pushProvider(workInProgress, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0))), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 30: return null === workInProgress.stateNode && (workInProgress.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), props = workInProgress.pendingProps, null != props.name && "auto" !== props.name ? workInProgress.flags |= null === current ? 18882560 : 18874368 : isHydrating && pushMaterializedTreeId(workInProgress), null !== current && current.memoizedProps.name !== props.name ? workInProgress.flags |= 4194816 : markRef(current, workInProgress), reconcileChildren(current, workInProgress, props.children, renderLanes), workInProgress.child;
			case 29: throw workInProgress.pendingProps;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function markUpdate(workInProgress) {
		workInProgress.flags |= 4;
	}
	function preloadInstanceAndSuspendIfNeeded(workInProgress, type, oldProps, newProps, renderLanes) {
		var JSCompiler_temp;
		if (JSCompiler_temp = 0 !== (workInProgress.mode & 32)) JSCompiler_temp = null === oldProps ? maySuspendCommit(type, newProps) : maySuspendCommit(type, newProps) && (newProps.src !== oldProps.src || newProps.srcSet !== oldProps.srcSet);
		if (JSCompiler_temp) {
			if (workInProgress.flags |= 16777216, (renderLanes & 335544128) === renderLanes) if (workInProgress.stateNode.complete) workInProgress.flags |= 8192;
			else if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
			else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
		} else workInProgress.flags &= -16777217;
	}
	function preloadResourceAndSuspendIfNeeded(workInProgress, resource) {
		if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4)) workInProgress.flags &= -16777217;
		else if (workInProgress.flags |= 16777216, !preloadResource(resource)) if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
		else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
	}
	function scheduleRetryEffect(workInProgress, retryQueue) {
		null !== retryQueue && (workInProgress.flags |= 4);
		workInProgress.flags & 16384 && (retryQueue = 22 !== workInProgress.tag ? claimNextRetryLane() : 536870912, workInProgress.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
	}
	function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
		if (!isHydrating) switch (renderState.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var tailNode = renderState.tail, lastTailNode = null; null !== tailNode;) null !== tailNode.alternate && (lastTailNode = tailNode), tailNode = tailNode.sibling;
				null === lastTailNode ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode.sibling = null;
				break;
			default:
				hasRenderedATailFallback = renderState.tail;
				for (tailNode = null; null !== hasRenderedATailFallback;) null !== hasRenderedATailFallback.alternate && (tailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
				null === tailNode ? renderState.tail = null : tailNode.sibling = null;
		}
	}
	function bubbleProperties(completedWork) {
		var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
		if (didBailout) for (var child$113 = completedWork.child; null !== child$113;) newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags & 1206910976, subtreeFlags |= child$113.flags & 1206910976, child$113.return = completedWork, child$113 = child$113.sibling;
		else for (child$113 = completedWork.child; null !== child$113;) newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags, subtreeFlags |= child$113.flags, child$113.return = completedWork, child$113 = child$113.sibling;
		completedWork.subtreeFlags |= subtreeFlags;
		completedWork.childLanes = newChildLanes;
		return didBailout;
	}
	function completeWork(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return bubbleProperties(workInProgress), null;
			case 1: return bubbleProperties(workInProgress), null;
			case 3:
				renderLanes = workInProgress.stateNode;
				newProps = null;
				null !== current && (newProps = current.memoizedState.cache);
				workInProgress.memoizedState.cache !== newProps && (workInProgress.flags |= 2048);
				popProvider(CacheContext);
				popHostContainer();
				renderLanes.pendingContext && (renderLanes.context = renderLanes.pendingContext, renderLanes.pendingContext = null);
				if (null === current || null === current.child) popHydrationState(workInProgress) ? markUpdate(workInProgress) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress.flags & 256) || (workInProgress.flags |= 1024, upgradeHydrationErrorsToRecoverable());
				bubbleProperties(workInProgress);
				return null;
			case 26:
				var type = workInProgress.type, nextResource = workInProgress.memoizedState;
				null === current ? (markUpdate(workInProgress), null !== nextResource ? (bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, null, newProps, renderLanes))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress), bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), workInProgress.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress), bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, current, newProps, renderLanes));
				return null;
			case 27:
				popHostContext(workInProgress);
				renderLanes = rootInstanceStackCursor.current;
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						workInProgress.subtreeFlags &= -33554433;
						return null;
					}
					current = contextStackCursor.current;
					popHydrationState(workInProgress) ? prepareToHydrateHostInstance(workInProgress, current) : (current = resolveSingletonInstance(type, newProps, renderLanes), workInProgress.stateNode = current, markUpdate(workInProgress));
				}
				bubbleProperties(workInProgress);
				workInProgress.subtreeFlags &= -33554433;
				return null;
			case 5:
				popHostContext(workInProgress);
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						workInProgress.subtreeFlags &= -33554433;
						return null;
					}
					nextResource = contextStackCursor.current;
					if (popHydrationState(workInProgress)) prepareToHydrateHostInstance(workInProgress, nextResource);
					else {
						var ownerDocument = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current);
						switch (nextResource) {
							case 1:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
								break;
							case 2:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
								break;
							default: switch (type) {
								case "svg":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
									break;
								case "math":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
									break;
								case "script":
									nextResource = ownerDocument.createElement("div");
									nextResource.innerHTML = "<script><\/script>";
									nextResource = nextResource.removeChild(nextResource.firstChild);
									break;
								case "select":
									nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", { is: newProps.is }) : ownerDocument.createElement("select");
									newProps.multiple ? nextResource.multiple = !0 : newProps.size && (nextResource.size = newProps.size);
									break;
								default: nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
							}
						}
						nextResource[internalInstanceKey] = workInProgress;
						nextResource[internalPropsKey] = newProps;
						a: for (ownerDocument = workInProgress.child; null !== ownerDocument;) {
							if (5 === ownerDocument.tag || 6 === ownerDocument.tag) nextResource.appendChild(ownerDocument.stateNode);
							else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
								ownerDocument.child.return = ownerDocument;
								ownerDocument = ownerDocument.child;
								continue;
							}
							if (ownerDocument === workInProgress) break a;
							for (; null === ownerDocument.sibling;) {
								if (null === ownerDocument.return || ownerDocument.return === workInProgress) break a;
								ownerDocument = ownerDocument.return;
							}
							ownerDocument.sibling.return = ownerDocument.return;
							ownerDocument = ownerDocument.sibling;
						}
						workInProgress.stateNode = nextResource;
						a: switch (setInitialProperties(nextResource, type, newProps), type) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								newProps = !!newProps.autoFocus;
								break a;
							case "img":
								newProps = !0;
								break a;
							default: newProps = !1;
						}
						newProps && markUpdate(workInProgress);
					}
				}
				bubbleProperties(workInProgress);
				workInProgress.subtreeFlags &= -33554433;
				preloadInstanceAndSuspendIfNeeded(workInProgress, workInProgress.type, null === current ? null : current.memoizedProps, workInProgress.pendingProps, renderLanes);
				return null;
			case 6:
				if (current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if ("string" !== typeof newProps && null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
					current = rootInstanceStackCursor.current;
					if (popHydrationState(workInProgress)) {
						current = workInProgress.stateNode;
						renderLanes = workInProgress.memoizedProps;
						newProps = null;
						type = hydrationParentFiber;
						if (null !== type) switch (type.tag) {
							case 27:
							case 5: newProps = type.memoizedProps;
						}
						current[internalInstanceKey] = workInProgress;
						current = current.nodeValue === renderLanes || null !== newProps && !0 === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes) ? !0 : !1;
						current || throwOnHydrationMismatch(workInProgress, !0);
					} else current = getOwnerDocumentFromRootContainer(current).createTextNode(newProps), current[internalInstanceKey] = workInProgress, workInProgress.stateNode = current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 31:
				renderLanes = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState) {
					newProps = popHydrationState(workInProgress);
					if (null !== renderLanes) {
						if (null === current) {
							if (!newProps) throw Error(formatProdErrorMessage(318));
							current = workInProgress.memoizedState;
							current = null !== current ? current.dehydrated : null;
							if (!current) throw Error(formatProdErrorMessage(557));
							current[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						current = !1;
					} else renderLanes = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes), current = !0;
					if (!current) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
					if (0 !== (workInProgress.flags & 128)) throw Error(formatProdErrorMessage(558));
				}
				bubbleProperties(workInProgress);
				return null;
			case 13:
				newProps = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
					type = popHydrationState(workInProgress);
					if (null !== newProps && null !== newProps.dehydrated) {
						if (null === current) {
							if (!type) throw Error(formatProdErrorMessage(318));
							type = workInProgress.memoizedState;
							type = null !== type ? type.dehydrated : null;
							if (!type) throw Error(formatProdErrorMessage(317));
							type[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						type = !1;
					} else type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = !0;
					if (!type) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
				}
				popSuspenseHandler(workInProgress);
				if (0 !== (workInProgress.flags & 128)) return workInProgress.lanes = renderLanes, workInProgress;
				renderLanes = null !== newProps;
				current = null !== current && null !== current.memoizedState;
				renderLanes && (newProps = workInProgress.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
				renderLanes !== current && renderLanes && (workInProgress.child.flags |= 8192);
				scheduleRetryEffect(workInProgress, workInProgress.updateQueue);
				bubbleProperties(workInProgress);
				return null;
			case 4: return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress.stateNode.containerInfo), workInProgress.flags |= 67108864, bubbleProperties(workInProgress), null;
			case 10: return popProvider(workInProgress.type), bubbleProperties(workInProgress), null;
			case 19:
				popSuspenseListContext(workInProgress);
				newProps = workInProgress.memoizedState;
				if (null === newProps) return bubbleProperties(workInProgress), null;
				type = 0 !== (workInProgress.flags & 128);
				nextResource = newProps.rendering;
				if (null === nextResource) if (type) cutOffTailIfNeeded(newProps, !1);
				else {
					if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128)) for (current = workInProgress.child; null !== current;) {
						nextResource = findFirstSuspended(current);
						if (null !== nextResource) {
							workInProgress.flags |= 128;
							cutOffTailIfNeeded(newProps, !1);
							current = nextResource.updateQueue;
							workInProgress.updateQueue = current;
							scheduleRetryEffect(workInProgress, current);
							workInProgress.subtreeFlags = 0;
							current = renderLanes;
							for (renderLanes = workInProgress.child; null !== renderLanes;) resetWorkInProgress(renderLanes, current), renderLanes = renderLanes.sibling;
							pushSuspenseListContext(workInProgress, suspenseStackCursor.current & 1 | 2);
							isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
							return workInProgress.child;
						}
						current = current.sibling;
					}
					null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
				}
				else {
					if (!type) if (current = findFirstSuspended(nextResource), null !== current) {
						if (workInProgress.flags |= 128, type = !0, current = current.updateQueue, workInProgress.updateQueue = current, scheduleRetryEffect(workInProgress, current), cutOffTailIfNeeded(newProps, !0), null === newProps.tail && "collapsed" !== newProps.tailMode && "visible" !== newProps.tailMode && !nextResource.alternate && !isHydrating) return bubbleProperties(workInProgress), null;
					} else 2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
					newProps.isBackwards ? (nextResource.sibling = workInProgress.child, workInProgress.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress.child = nextResource, newProps.last = nextResource);
				}
				if (null !== newProps.tail) {
					current = newProps.tail;
					a: {
						for (renderLanes = current; null !== renderLanes;) {
							if (null !== renderLanes.alternate) {
								renderLanes = !1;
								break a;
							}
							renderLanes = renderLanes.sibling;
						}
						renderLanes = !0;
					}
					newProps.rendering = current;
					newProps.tail = current.sibling;
					newProps.renderingStartTime = now();
					current.sibling = null;
					nextResource = suspenseStackCursor.current;
					nextResource = type ? nextResource & 1 | 2 : nextResource & 1;
					"visible" === newProps.tailMode || "collapsed" === newProps.tailMode || !renderLanes || isHydrating ? pushSuspenseListContext(workInProgress, nextResource) : (renderLanes = nextResource, push(suspenseHandlerStackCursor, workInProgress), push(suspenseStackCursor, renderLanes), null === shellBoundary && (shellBoundary = workInProgress));
					isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
					return current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), newProps = null !== workInProgress.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress.flags |= 8192) : newProps && (workInProgress.flags |= 8192), newProps ? 0 !== (renderLanes & 536870912) && 0 === (workInProgress.flags & 128) && (bubbleProperties(workInProgress), workInProgress.subtreeFlags & 6 && (workInProgress.flags |= 8192)) : bubbleProperties(workInProgress), renderLanes = workInProgress.updateQueue, null !== renderLanes && scheduleRetryEffect(workInProgress, renderLanes.retryQueue), renderLanes = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress.memoizedState && null !== workInProgress.memoizedState.cachePool && (newProps = workInProgress.memoizedState.cachePool.pool), newProps !== renderLanes && (workInProgress.flags |= 2048), null !== current && pop(resumedCache), null;
			case 24: return renderLanes = null, null !== current && (renderLanes = current.memoizedState.cache), workInProgress.memoizedState.cache !== renderLanes && (workInProgress.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress), null;
			case 25: return null;
			case 30: return workInProgress.flags |= 33554432, bubbleProperties(workInProgress), null;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function unwindWork(current, workInProgress) {
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 1: return current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 3: return popProvider(CacheContext), popHostContainer(), current = workInProgress.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 26:
			case 27:
			case 5: return popHostContext(workInProgress), null;
			case 31:
				if (null !== workInProgress.memoizedState) {
					popSuspenseHandler(workInProgress);
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 13:
				popSuspenseHandler(workInProgress);
				current = workInProgress.memoizedState;
				if (null !== current && null !== current.dehydrated) {
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 19: return popSuspenseListContext(workInProgress), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, current = workInProgress.memoizedState, null !== current && (current.rendering = null, current.tail = null), workInProgress.flags |= 4, workInProgress) : null;
			case 4: return popHostContainer(), null;
			case 10: return popProvider(workInProgress.type), null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 24: return popProvider(CacheContext), null;
			case 25: return null;
			default: return null;
		}
	}
	function unwindInterruptedWork(current, interruptedWork) {
		popTreeContext(interruptedWork);
		switch (interruptedWork.tag) {
			case 3:
				popProvider(CacheContext);
				popHostContainer();
				break;
			case 26:
			case 27:
			case 5:
				popHostContext(interruptedWork);
				break;
			case 4:
				popHostContainer();
				break;
			case 31:
				null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
				break;
			case 13:
				popSuspenseHandler(interruptedWork);
				break;
			case 19:
				popSuspenseListContext(interruptedWork);
				break;
			case 10:
				popProvider(interruptedWork.type);
				break;
			case 22:
			case 23:
				popSuspenseHandler(interruptedWork);
				popHiddenContext();
				null !== current && pop(resumedCache);
				break;
			case 24: popProvider(CacheContext);
		}
	}
	function commitHookEffectListMount(flags, finishedWork) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						lastEffect = void 0;
						var create = updateQueue.create, inst = updateQueue.inst;
						lastEffect = create();
						inst.destroy = lastEffect;
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						var inst = updateQueue.inst, destroy = inst.destroy;
						if (void 0 !== destroy) {
							inst.destroy = void 0;
							lastEffect = finishedWork;
							var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
							try {
								destroy_();
							} catch (error) {
								captureCommitPhaseError(lastEffect, nearestMountedAncestor, error);
							}
						}
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitClassCallbacks(finishedWork) {
		var updateQueue = finishedWork.updateQueue;
		if (null !== updateQueue) {
			var instance = finishedWork.stateNode;
			try {
				commitCallbacks(updateQueue, instance);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
		instance.props = resolveClassComponentProps(current.type, current.memoizedProps);
		instance.state = current.memoizedState;
		try {
			instance.componentWillUnmount();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyAttachRef(current, nearestMountedAncestor) {
		try {
			var ref = current.ref;
			if (null !== ref) {
				switch (current.tag) {
					case 26:
					case 27:
					case 5:
						var instanceToUse = current.stateNode;
						break;
					case 30:
						var instance = current.stateNode, name = getViewTransitionName(current.memoizedProps, instance);
						if (null === instance.ref || instance.ref.name !== name) instance.ref = createViewTransitionInstance(name);
						instanceToUse = instance.ref;
						break;
					case 7:
						if (null === current.stateNode) {
							var fragmentInstance = new FragmentInstance(current);
							traverseVisibleInstancesAndTextInstances(current.child, !1, addFragmentHandleToFiber, fragmentInstance, void 0, void 0);
							current.stateNode = fragmentInstance;
						}
						instanceToUse = current.stateNode;
						break;
					default: instanceToUse = current.stateNode;
				}
				"function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
			}
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyDetachRef(current, nearestMountedAncestor) {
		var ref = current.ref, refCleanup = current.refCleanup;
		if (null !== ref) if ("function" === typeof refCleanup) try {
			refCleanup();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		} finally {
			current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
		}
		else if ("function" === typeof ref) try {
			ref(null);
		} catch (error$148) {
			captureCommitPhaseError(current, nearestMountedAncestor, error$148);
		}
		else ref.current = null;
	}
	function commitNewChildToFragmentInstances(fiber, parentFragmentInstances) {
		if ((5 === fiber.tag || 27 === fiber.tag || 6 === fiber.tag) && null === fiber.alternate && null !== parentFragmentInstances) for (var i = 0; i < parentFragmentInstances.length; i++) commitNewChildToFragmentInstance(fiber.stateNode, parentFragmentInstances[i]);
	}
	function commitFragmentInstanceInsertionEffects(fiber) {
		for (var parent = fiber.return; null !== parent;) {
			isFragmentInstanceParent(parent) && commitNewChildToFragmentInstance(fiber.stateNode, parent.stateNode);
			if (isFragmentInstanceHostBoundary(parent)) break;
			parent = parent.return;
		}
	}
	function commitFragmentInstanceDeletionEffects(fiber) {
		for (var parent = fiber.return; null !== parent;) {
			isFragmentInstanceParent(parent) && deleteChildFromFragmentInstance(fiber.stateNode, parent.stateNode);
			if (isFragmentInstanceHostBoundary(parent)) break;
			parent = parent.return;
		}
	}
	function isFragmentInstanceHostBoundary(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 27 === fiber.tag;
	}
	function isFragmentInstanceParent(fiber) {
		return fiber && 7 === fiber.tag && null !== fiber.stateNode;
	}
	function commitHostMount(finishedWork) {
		var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
		try {
			a: switch (type) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					props.autoFocus && instance.focus();
					break a;
				case "img": props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHostUpdate(finishedWork, newProps, oldProps) {
		try {
			var domElement = finishedWork.stateNode;
			updateProperties(domElement, finishedWork.type, oldProps, newProps);
			domElement[internalPropsKey] = newProps;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function isHostParent(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
	}
	function getHostSibling(fiber) {
		a: for (;;) {
			for (; null === fiber.sibling;) {
				if (null === fiber.return || isHostParent(fiber.return)) return null;
				fiber = fiber.return;
			}
			fiber.sibling.return = fiber.return;
			for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag;) {
				if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
				if (fiber.flags & 2) continue a;
				if (null === fiber.child || 4 === fiber.tag) continue a;
				else fiber.child.return = fiber, fiber = fiber.child;
			}
			if (!(fiber.flags & 2)) return fiber.stateNode;
		}
	}
	function insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) tag = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(tag, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(tag), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1)), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = !0;
		else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode, before = null)), node = node.child, null !== node)) for (insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances), node = node.sibling; null !== node;) insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances), node = node.sibling;
	}
	function insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) tag = node.stateNode, before ? parent.insertBefore(tag, before) : parent.appendChild(tag), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = !0;
		else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode)), node = node.child, null !== node)) for (insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances), node = node.sibling; null !== node;) insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances), node = node.sibling;
	}
	function commitHostSingletonAcquisition(finishedWork) {
		var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
		try {
			for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length;) singleton.removeAttributeNode(attributes[0]);
			setInitialProperties(singleton, type, props);
			singleton[internalInstanceKey] = finishedWork;
			singleton[internalPropsKey] = props;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	var shouldStartViewTransition = !1;
	var appearingViewTransitions = null;
	function trackEnterViewTransitions(placement) {
		if (30 === placement.tag || 0 !== (placement.subtreeFlags & 33554432)) shouldStartViewTransition = !0;
	}
	var viewTransitionCancelableChildren = null;
	function pushViewTransitionCancelableScope() {
		var prevChildren = viewTransitionCancelableChildren;
		viewTransitionCancelableChildren = null;
		return prevChildren;
	}
	var viewTransitionHostInstanceIdx = 0;
	function applyViewTransitionToHostInstances(fiber, name, className, collectMeasurements, stopAtNestedViewTransitions) {
		viewTransitionHostInstanceIdx = 0;
		return applyViewTransitionToHostInstancesRecursive(fiber.child, name, className, collectMeasurements, stopAtNestedViewTransitions);
	}
	function applyViewTransitionToHostInstancesRecursive(child, name, className, collectMeasurements, stopAtNestedViewTransitions) {
		for (var inViewport = !1; null !== child;) {
			if (5 === child.tag) {
				var instance = child.stateNode;
				if (null !== collectMeasurements) {
					var measurement = measureInstance(instance);
					collectMeasurements.push(measurement);
					measurement.view && (inViewport = !0);
				} else inViewport || measureInstance(instance).view && (inViewport = !0);
				shouldStartViewTransition = !0;
				applyViewTransitionName(instance, 0 === viewTransitionHostInstanceIdx ? name : name + "_" + viewTransitionHostInstanceIdx, className);
				viewTransitionHostInstanceIdx++;
			} else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions || applyViewTransitionToHostInstancesRecursive(child.child, name, className, collectMeasurements, stopAtNestedViewTransitions) && (inViewport = !0);
			child = child.sibling;
		}
		return inViewport;
	}
	function restoreViewTransitionOnHostInstances(child, stopAtNestedViewTransitions) {
		for (; null !== child;) {
			if (5 === child.tag) restoreViewTransitionName(child.stateNode, child.memoizedProps);
			else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions || restoreViewTransitionOnHostInstances(child.child, stopAtNestedViewTransitions);
			child = child.sibling;
		}
	}
	function commitAppearingPairViewTransitions(placement) {
		if (0 !== (placement.subtreeFlags & 18874368)) for (placement = placement.child; null !== placement;) {
			if (22 !== placement.tag || null === placement.memoizedState) {
				if (commitAppearingPairViewTransitions(placement), 30 === placement.tag && 0 !== (placement.flags & 18874368) && placement.stateNode.paired) {
					var props = placement.memoizedProps;
					if (null == props.name || "auto" === props.name) throw Error(formatProdErrorMessage(544));
					var name = props.name;
					props = getViewTransitionClassName(props.default, props.share);
					"none" !== props && (applyViewTransitionToHostInstances(placement, name, props, null, !1) || restoreViewTransitionOnHostInstances(placement.child, !1));
				}
			}
			placement = placement.sibling;
		}
	}
	function commitEnterViewTransitions(placement, gesture) {
		if (30 === placement.tag) {
			var state = placement.stateNode, props = placement.memoizedProps, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, state.paired ? props.share : props.enter);
			"none" !== className ? applyViewTransitionToHostInstances(placement, name, className, null, !1) ? (commitAppearingPairViewTransitions(placement), state.paired || gesture || scheduleViewTransitionEvent(placement, props.onEnter)) : restoreViewTransitionOnHostInstances(placement.child, !1) : commitAppearingPairViewTransitions(placement);
		} else if (0 !== (placement.subtreeFlags & 33554432)) for (placement = placement.child; null !== placement;) commitEnterViewTransitions(placement, gesture), placement = placement.sibling;
		else commitAppearingPairViewTransitions(placement);
	}
	function commitDeletedPairViewTransitions(deletion) {
		if (null !== appearingViewTransitions && 0 !== appearingViewTransitions.size) {
			var pairs = appearingViewTransitions;
			if (0 !== (deletion.subtreeFlags & 18874368)) for (deletion = deletion.child; null !== deletion;) {
				if (22 !== deletion.tag || null === deletion.memoizedState) {
					if (30 === deletion.tag && 0 !== (deletion.flags & 18874368)) {
						var props = deletion.memoizedProps, name = props.name;
						if (null != name && "auto" !== name) {
							var pair = pairs.get(name);
							if (void 0 !== pair) {
								var className = getViewTransitionClassName(props.default, props.share);
								"none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, !1) ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, scheduleViewTransitionEvent(deletion, props.onShare)) : restoreViewTransitionOnHostInstances(deletion.child, !1));
								pairs.delete(name);
								if (0 === pairs.size) break;
							}
						}
					}
					commitDeletedPairViewTransitions(deletion);
				}
				deletion = deletion.sibling;
			}
		}
	}
	function commitExitViewTransitions(deletion) {
		if (30 === deletion.tag) {
			var props = deletion.memoizedProps, name = getViewTransitionName(props, deletion.stateNode), pair = null !== appearingViewTransitions ? appearingViewTransitions.get(name) : void 0, className = getViewTransitionClassName(props.default, void 0 !== pair ? props.share : props.exit);
			"none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, !1) ? void 0 !== pair ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, appearingViewTransitions.delete(name), scheduleViewTransitionEvent(deletion, props.onShare)) : scheduleViewTransitionEvent(deletion, props.onExit) : restoreViewTransitionOnHostInstances(deletion.child, !1));
			null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
		} else if (0 !== (deletion.subtreeFlags & 33554432)) for (deletion = deletion.child; null !== deletion;) commitExitViewTransitions(deletion), deletion = deletion.sibling;
		else null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
	}
	function commitNestedViewTransitions(changedParent) {
		for (changedParent = changedParent.child; null !== changedParent;) {
			if (30 === changedParent.tag) {
				var props = changedParent.memoizedProps, name = getViewTransitionName(props, changedParent.stateNode);
				props = getViewTransitionClassName(props.default, props.update);
				changedParent.flags &= -5;
				"none" !== props && applyViewTransitionToHostInstances(changedParent, name, props, changedParent.memoizedState = [], !1);
			} else 0 !== (changedParent.subtreeFlags & 33554432) && commitNestedViewTransitions(changedParent);
			changedParent = changedParent.sibling;
		}
	}
	function restorePairedViewTransitions(parent) {
		if (0 !== (parent.subtreeFlags & 18874368)) for (parent = parent.child; null !== parent;) {
			if (22 !== parent.tag || null === parent.memoizedState) {
				if (30 === parent.tag && 0 !== (parent.flags & 18874368)) {
					var instance = parent.stateNode;
					null !== instance.paired && (instance.paired = null, restoreViewTransitionOnHostInstances(parent.child, !1));
				}
				restorePairedViewTransitions(parent);
			}
			parent = parent.sibling;
		}
	}
	function restoreEnterOrExitViewTransitions(fiber) {
		if (30 === fiber.tag) fiber.stateNode.paired = null, restoreViewTransitionOnHostInstances(fiber.child, !1), restorePairedViewTransitions(fiber);
		else if (0 !== (fiber.subtreeFlags & 33554432)) for (fiber = fiber.child; null !== fiber;) restoreEnterOrExitViewTransitions(fiber), fiber = fiber.sibling;
		else restorePairedViewTransitions(fiber);
	}
	function restoreNestedViewTransitions(changedParent) {
		for (changedParent = changedParent.child; null !== changedParent;) 30 === changedParent.tag ? restoreViewTransitionOnHostInstances(changedParent.child, !1) : 0 !== (changedParent.subtreeFlags & 33554432) && restoreNestedViewTransitions(changedParent), changedParent = changedParent.sibling;
	}
	function measureViewTransitionHostInstancesRecursive(parentViewTransition, child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) {
		for (var inViewport = !1; null !== child;) {
			if (5 === child.tag) {
				var instance = child.stateNode;
				if (null !== previousMeasurements && viewTransitionHostInstanceIdx < previousMeasurements.length) {
					var previousMeasurement = previousMeasurements[viewTransitionHostInstanceIdx], nextMeasurement = measureInstance(instance);
					if (previousMeasurement.view || nextMeasurement.view) inViewport = !0;
					var JSCompiler_temp;
					if (JSCompiler_temp = 0 === (parentViewTransition.flags & 4)) if (nextMeasurement.clip) JSCompiler_temp = !0;
					else {
						JSCompiler_temp = previousMeasurement.rect;
						var newRect = nextMeasurement.rect;
						JSCompiler_temp = JSCompiler_temp.y !== newRect.y || JSCompiler_temp.x !== newRect.x || JSCompiler_temp.height !== newRect.height || JSCompiler_temp.width !== newRect.width;
					}
					JSCompiler_temp && (parentViewTransition.flags |= 4);
					nextMeasurement.abs ? nextMeasurement = !previousMeasurement.abs : (previousMeasurement = previousMeasurement.rect, nextMeasurement = nextMeasurement.rect, nextMeasurement = previousMeasurement.height !== nextMeasurement.height || previousMeasurement.width !== nextMeasurement.width);
					nextMeasurement && (parentViewTransition.flags |= 32);
				} else parentViewTransition.flags |= 32;
				0 !== (parentViewTransition.flags & 4) && applyViewTransitionName(instance, 0 === viewTransitionHostInstanceIdx ? newName : newName + "_" + viewTransitionHostInstanceIdx, className);
				inViewport && 0 !== (parentViewTransition.flags & 4) || (null === viewTransitionCancelableChildren && (viewTransitionCancelableChildren = []), viewTransitionCancelableChildren.push(instance, 0 === viewTransitionHostInstanceIdx ? oldName : oldName + "_" + viewTransitionHostInstanceIdx, child.memoizedProps));
				viewTransitionHostInstanceIdx++;
			} else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions ? parentViewTransition.flags |= child.flags & 32 : measureViewTransitionHostInstancesRecursive(parentViewTransition, child.child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) && (inViewport = !0);
			child = child.sibling;
		}
		return inViewport;
	}
	function measureNestedViewTransitions(changedParent, gesture) {
		for (changedParent = changedParent.child; null !== changedParent;) {
			if (30 === changedParent.tag) {
				var props = changedParent.memoizedProps, state = changedParent.stateNode, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, props.update);
				if (gesture) {
					state = state.clones;
					var previousMeasurements = null === state ? null : state.map(measureClonedInstance);
				} else previousMeasurements = changedParent.memoizedState, changedParent.memoizedState = null;
				state = changedParent;
				var child = changedParent.child;
				viewTransitionHostInstanceIdx = 0;
				name = measureViewTransitionHostInstancesRecursive(state, child, name, name, className, previousMeasurements, !1);
				0 !== (changedParent.flags & 4) && name && (gesture || scheduleViewTransitionEvent(changedParent, props.onUpdate));
			} else 0 !== (changedParent.subtreeFlags & 33554432) && measureNestedViewTransitions(changedParent, gesture);
			changedParent = changedParent.sibling;
		}
	}
	var offscreenSubtreeIsHidden = !1;
	var offscreenSubtreeWasHidden = !1;
	var offscreenDirectParentIsHidden = !1;
	var needsFormReset = !1;
	var PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set;
	var nextEffect = null;
	var viewTransitionContextChanged = !1;
	var inUpdateViewTransition = !1;
	var rootViewTransitionAffected = !1;
	var rootViewTransitionNameCanceled = !1;
	function commitBeforeMutationEffects(root, firstChild, committedLanes) {
		root = root.containerInfo;
		eventsEnabled = _enabled;
		root = getActiveElementDeep(root);
		if (hasSelectionCapabilities(root)) {
			if ("selectionStart" in root) var JSCompiler_temp = {
				start: root.selectionStart,
				end: root.selectionEnd
			};
			else a: {
				JSCompiler_temp = (JSCompiler_temp = root.ownerDocument) && JSCompiler_temp.defaultView || window;
				var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
				if (selection && 0 !== selection.rangeCount) {
					JSCompiler_temp = selection.anchorNode;
					var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
					selection = selection.focusOffset;
					try {
						JSCompiler_temp.nodeType, focusNode.nodeType;
					} catch (e$21) {
						JSCompiler_temp = null;
						break a;
					}
					var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root, parentNode = null;
					b: for (;;) {
						for (var next;;) {
							node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
							node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
							3 === node.nodeType && (length += node.nodeValue.length);
							if (null === (next = node.firstChild)) break;
							parentNode = node;
							node = next;
						}
						for (;;) {
							if (node === root) break b;
							parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
							parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
							if (null !== (next = node.nextSibling)) break;
							node = parentNode;
							parentNode = node.parentNode;
						}
						node = next;
					}
					JSCompiler_temp = -1 === start || -1 === end ? null : {
						start,
						end
					};
				} else JSCompiler_temp = null;
			}
			JSCompiler_temp = JSCompiler_temp || {
				start: 0,
				end: 0
			};
		} else JSCompiler_temp = null;
		selectionInformation = {
			focusedElem: root,
			selectionRange: JSCompiler_temp
		};
		_enabled = !1;
		committedLanes = (committedLanes & 335544064) === committedLanes;
		nextEffect = firstChild;
		for (firstChild = committedLanes ? 9270 : 1024; null !== nextEffect;) {
			root = nextEffect;
			if (committedLanes && (JSCompiler_temp = root.deletions, null !== JSCompiler_temp)) for (anchorOffset = 0; anchorOffset < JSCompiler_temp.length; anchorOffset++) committedLanes && commitExitViewTransitions(JSCompiler_temp[anchorOffset]);
			if (null === root.alternate && 0 !== (root.flags & 2)) committedLanes && trackEnterViewTransitions(root), commitBeforeMutationEffects_complete(committedLanes);
			else {
				if (22 === root.tag) {
					if (JSCompiler_temp = root.alternate, null !== root.memoizedState) {
						null !== JSCompiler_temp && null === JSCompiler_temp.memoizedState && committedLanes && commitExitViewTransitions(JSCompiler_temp);
						commitBeforeMutationEffects_complete(committedLanes);
						continue;
					} else if (null !== JSCompiler_temp && null !== JSCompiler_temp.memoizedState) {
						committedLanes && trackEnterViewTransitions(root);
						commitBeforeMutationEffects_complete(committedLanes);
						continue;
					}
				}
				JSCompiler_temp = root.child;
				0 !== (root.subtreeFlags & firstChild) && null !== JSCompiler_temp ? (JSCompiler_temp.return = root, nextEffect = JSCompiler_temp) : (committedLanes && commitNestedViewTransitions(root), commitBeforeMutationEffects_complete(committedLanes));
			}
		}
		appearingViewTransitions = null;
	}
	function commitBeforeMutationEffects_complete(isViewTransitionEligible$jscomp$0) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect, isViewTransitionEligible = isViewTransitionEligible$jscomp$0, current = fiber.alternate, flags = fiber.flags;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (0 !== (flags & 1024) && null !== current) {
						isViewTransitionEligible = void 0;
						flags = current.memoizedProps;
						current = current.memoizedState;
						var instance = fiber.stateNode;
						try {
							var resolvedPrevProps = resolveClassComponentProps(fiber.type, flags);
							isViewTransitionEligible = instance.getSnapshotBeforeUpdate(resolvedPrevProps, current);
							instance.__reactInternalSnapshotBeforeUpdate = isViewTransitionEligible;
						} catch (error) {
							captureCommitPhaseError(fiber, fiber.return, error);
						}
					}
					break;
				case 3:
					if (0 !== (flags & 1024)) {
						if (current = fiber.stateNode.containerInfo, isViewTransitionEligible = current.nodeType, 9 === isViewTransitionEligible) clearContainerSparingly(current);
						else if (1 === isViewTransitionEligible) switch (current.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								clearContainerSparingly(current);
								break;
							default: current.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					isViewTransitionEligible && null !== current && (isViewTransitionEligible = getViewTransitionName(current.memoizedProps, current.stateNode), flags = fiber.memoizedProps, flags = getViewTransitionClassName(flags.default, flags.update), "none" !== flags && applyViewTransitionToHostInstances(current, isViewTransitionEligible, flags, current.memoizedState = [], !0));
					break;
				default: if (0 !== (flags & 1024)) throw Error(formatProdErrorMessage(163));
			}
			current = fiber.sibling;
			if (null !== current) {
				current.return = fiber.return;
				nextEffect = current;
				break;
			}
			nextEffect = fiber.return;
		}
	}
	function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitHookEffectListMount(5, finishedWork);
				break;
			case 1:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 4) if (finishedRoot = finishedWork.stateNode, null === current) try {
					finishedRoot.componentDidMount();
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				else {
					var prevProps = resolveClassComponentProps(finishedWork.type, current.memoizedProps);
					current = current.memoizedState;
					try {
						finishedRoot.componentDidUpdate(prevProps, current, finishedRoot.__reactInternalSnapshotBeforeUpdate);
					} catch (error$146) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error$146);
					}
				}
				flags & 64 && commitClassCallbacks(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
					current = null;
					if (null !== finishedWork.child) switch (finishedWork.child.tag) {
						case 27:
						case 5:
							current = finishedWork.child.stateNode;
							break;
						case 1: current = finishedWork.child.stateNode;
					}
					try {
						commitCallbacks(finishedRoot, current);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 27: null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
			case 26:
			case 5:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				null === current && flags & 4 && commitHostMount(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 12:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				break;
			case 31:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
				break;
			case 13:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
				flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(null, finishedWork), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
				break;
			case 22:
				flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
				if (!flags) {
					var newOffscreenSubtreeWasHidden = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
					current = offscreenSubtreeIsHidden;
					prevProps = offscreenSubtreeWasHidden;
					offscreenSubtreeIsHidden = flags;
					(offscreenSubtreeWasHidden = newOffscreenSubtreeWasHidden) && !prevProps ? (flags = 2, 0 !== (finishedWork.subtreeFlags & 8772) && (flags |= 1), recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, flags)) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
					offscreenSubtreeIsHidden = current;
					offscreenSubtreeWasHidden = prevProps;
				}
				break;
			case 30:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 7: flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
			default: recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		}
	}
	function hideOrUnhideAllChildren(parentFiber, isHidden) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) hideOrUnhideAllChildrenOnFiber(parentFiber, isHidden), parentFiber = parentFiber.sibling;
	}
	function hideOrUnhideAllChildrenOnFiber(fiber, isHidden) {
		switch (fiber.tag) {
			case 5:
			case 26:
				try {
					var instance = fiber.stateNode;
					if (isHidden) {
						var style = instance.style;
						"function" === typeof style.setProperty ? style.setProperty("display", "none", "important") : style.display = "none";
					} else {
						var instance$jscomp$0 = fiber.stateNode, styleProp = fiber.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
						instance$jscomp$0.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
					}
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				hideOrUnhideNearestPortals(fiber, isHidden);
				break;
			case 6:
				try {
					fiber.stateNode.nodeValue = isHidden ? "" : fiber.memoizedProps, viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				break;
			case 18:
				try {
					var instance$jscomp$1 = fiber.stateNode;
					isHidden ? hideOrUnhideDehydratedBoundary(instance$jscomp$1, !0) : hideOrUnhideDehydratedBoundary(fiber.stateNode, !1);
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				break;
			case 22:
			case 23:
				null === fiber.memoizedState && hideOrUnhideAllChildren(fiber, isHidden);
				break;
			default: hideOrUnhideAllChildren(fiber, isHidden);
		}
	}
	function hideOrUnhideNearestPortals(parentFiber, isHidden$jscomp$0) {
		if (parentFiber.subtreeFlags & 67108864) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			a: {
				var fiber = parentFiber, isHidden = isHidden$jscomp$0;
				switch (fiber.tag) {
					case 4:
						hideOrUnhideAllChildrenOnFiber(fiber, isHidden);
						break a;
					case 22:
						null === fiber.memoizedState && hideOrUnhideNearestPortals(fiber, isHidden);
						break a;
					default: hideOrUnhideNearestPortals(fiber, isHidden);
				}
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function detachFiberAfterEffects(fiber) {
		var alternate = fiber.alternate;
		null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
		fiber.child = null;
		fiber.deletions = null;
		fiber.sibling = null;
		5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
		fiber.stateNode = null;
		fiber.return = null;
		fiber.dependencies = null;
		fiber.memoizedProps = null;
		fiber.memoizedState = null;
		fiber.pendingProps = null;
		fiber.stateNode = null;
		fiber.updateQueue = null;
	}
	var hostParent = null;
	var hostParentIsContainer = !1;
	function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
		for (parent = parent.child; null !== parent;) commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
	}
	function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
		if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount) try {
			injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
		} catch (err) {}
		switch (deletedFiber.tag) {
			case 26:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && !offscreenSubtreeWasHidden && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
				break;
			case 27:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				commitFragmentInstanceDeletionEffects(deletedFiber);
				var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
				isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = !1);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				releaseSingletonInstance(deletedFiber.stateNode, deletedFiber.type, deletedFiber.memoizedProps);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 5: offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor), commitFragmentInstanceDeletionEffects(deletedFiber);
			case 6:
				6 === deletedFiber.tag && commitFragmentInstanceDeletionEffects(deletedFiber);
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = null;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				if (null !== hostParent) if (hostParentIsContainer) try {
					(9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode), viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				else try {
					hostParent.removeChild(deletedFiber.stateNode), viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				break;
			case 18:
				null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, deletedFiber.stateNode), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
				break;
			case 4:
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = deletedFiber.stateNode.containerInfo;
				hostParentIsContainer = !0;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
				offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 1:
				offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, prevHostParent));
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 21:
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 22:
				offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				offscreenSubtreeWasHidden = prevHostParent;
				break;
			case 30:
				safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 7:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			default: recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
		}
	}
	function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
			finishedRoot = finishedRoot.dehydrated;
			try {
				retryIfBlockedOn(finishedRoot);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot)))) try {
			retryIfBlockedOn(finishedRoot);
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function getRetryCache(finishedWork) {
		switch (finishedWork.tag) {
			case 31:
			case 13:
			case 19:
				var retryCache = finishedWork.stateNode;
				null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
				return retryCache;
			case 22: return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
			default: throw Error(formatProdErrorMessage(435, finishedWork.tag));
		}
	}
	function attachSuspenseRetryListeners(finishedWork, wakeables) {
		var retryCache = getRetryCache(finishedWork);
		wakeables.forEach(function(wakeable) {
			if (!retryCache.has(wakeable)) {
				retryCache.add(wakeable);
				var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
				wakeable.then(retry, retry);
			}
		});
	}
	function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber, lanes) {
		var deletions = parentFiber.deletions;
		if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
			var childToDelete = deletions[i], root = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
			a: for (; null !== parent;) {
				switch (parent.tag) {
					case 27:
						if (isSingletonScope(parent.type)) {
							hostParent = parent.stateNode;
							hostParentIsContainer = !1;
							break a;
						}
						break;
					case 5:
						hostParent = parent.stateNode;
						hostParentIsContainer = !1;
						break a;
					case 3:
					case 4:
						hostParent = parent.stateNode.containerInfo;
						hostParentIsContainer = !0;
						break a;
				}
				parent = parent.return;
			}
			if (null === hostParent) throw Error(formatProdErrorMessage(160));
			commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
			hostParent = null;
			hostParentIsContainer = !1;
			root = childToDelete.alternate;
			null !== root && (root.return = null);
			childToDelete.return = null;
		}
		if (parentFiber.subtreeFlags & 13886) for (parentFiber = parentFiber.child; null !== parentFiber;) commitMutationEffectsOnFiber(parentFiber, root$jscomp$0, lanes), parentFiber = parentFiber.sibling;
	}
	var currentHoistableRoot = null;
	function commitMutationEffectsOnFiber(finishedWork, root, lanes) {
		var current = finishedWork.alternate, flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (flags & 4 && (current = finishedWork.updateQueue, current = null !== current ? current.events : null, null !== current)) for (var ii = 0; ii < current.length; ii++) {
					var _eventPayloads$ii2 = current[ii];
					_eventPayloads$ii2.ref.impl = _eventPayloads$ii2.nextImpl;
				}
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
				break;
			case 1:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (root = finishedWork.callbacks, null !== root && (lanes = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === lanes ? root : lanes.concat(root))));
				break;
			case 26:
				ii = currentHoistableRoot;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (flags & 4) if (flags = null !== current ? current.memoizedState : null, lanes = finishedWork.memoizedState, null === current) if (null === lanes) if (null === finishedWork.stateNode) if (offscreenSubtreeIsHidden) finishedWork.stateNode = createHoistableInstance(finishedWork.type, finishedWork.memoizedProps, root.containerInfo, finishedWork);
				else {
					a: {
						root = finishedWork.type;
						lanes = finishedWork.memoizedProps;
						flags = ii.ownerDocument || ii;
						b: switch (root) {
							case "title":
								current = flags.getElementsByTagName("title")[0];
								if (!current || current[internalHoistableMarker] || current[internalInstanceKey] || "http://www.w3.org/2000/svg" === current.namespaceURI || current.hasAttribute("itemprop")) current = flags.createElement(root), flags.head.insertBefore(current, flags.querySelector("head > title"));
								setInitialProperties(current, root, lanes);
								current[internalInstanceKey] = finishedWork;
								markNodeAsHoistable(current);
								root = current;
								break a;
							case "link":
								if (ii = getHydratableHoistableCache("link", "href", flags).get(root + (lanes.href || ""))) {
									for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++) if (current = ii[_eventPayloads$ii2], current.getAttribute("href") === (null == lanes.href || "" === lanes.href ? null : lanes.href) && current.getAttribute("rel") === (null == lanes.rel ? null : lanes.rel) && current.getAttribute("title") === (null == lanes.title ? null : lanes.title) && current.getAttribute("crossorigin") === (null == lanes.crossOrigin ? null : lanes.crossOrigin)) {
										ii.splice(_eventPayloads$ii2, 1);
										break b;
									}
								}
								current = flags.createElement(root);
								setInitialProperties(current, root, lanes);
								flags.head.appendChild(current);
								break;
							case "meta":
								if (ii = getHydratableHoistableCache("meta", "content", flags).get(root + (lanes.content || ""))) {
									for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++) if (current = ii[_eventPayloads$ii2], current.getAttribute("content") === (null == lanes.content ? null : "" + lanes.content) && current.getAttribute("name") === (null == lanes.name ? null : lanes.name) && current.getAttribute("property") === (null == lanes.property ? null : lanes.property) && current.getAttribute("http-equiv") === (null == lanes.httpEquiv ? null : lanes.httpEquiv) && current.getAttribute("charset") === (null == lanes.charSet ? null : lanes.charSet)) {
										ii.splice(_eventPayloads$ii2, 1);
										break b;
									}
								}
								current = flags.createElement(root);
								setInitialProperties(current, root, lanes);
								flags.head.appendChild(current);
								break;
							default: throw Error(formatProdErrorMessage(468, root));
						}
						current[internalInstanceKey] = finishedWork;
						markNodeAsHoistable(current);
						root = current;
					}
					finishedWork.stateNode = root;
				}
				else offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode);
				else finishedWork.stateNode = acquireResource(ii, lanes, finishedWork.memoizedProps);
				else flags !== lanes ? (null === flags ? (root = current.stateNode, null === root || offscreenSubtreeWasHidden || root.parentNode.removeChild(root)) : flags.count--, null === lanes ? offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode) : acquireResource(ii, lanes, finishedWork.memoizedProps)) : null === lanes && null !== finishedWork.stateNode && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 27:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				null !== current && flags & 4 && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 5:
				ii = offscreenDirectParentIsHidden;
				offscreenDirectParentIsHidden = !1;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				offscreenDirectParentIsHidden = ii;
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (finishedWork.flags & 32) {
					root = finishedWork.stateNode;
					try {
						setTextContent(root, ""), viewTransitionMutationContext = !0;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				flags & 4 && null != finishedWork.stateNode && (root = finishedWork.memoizedProps, commitHostUpdate(finishedWork, root, null !== current ? current.memoizedProps : root));
				flags & 1024 && (needsFormReset = !0);
				break;
			case 6:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				if (flags & 4) {
					if (null === finishedWork.stateNode) throw Error(formatProdErrorMessage(162));
					root = finishedWork.memoizedProps;
					lanes = finishedWork.stateNode;
					try {
						lanes.nodeValue = root, viewTransitionMutationContext = !0;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 3:
				viewTransitionMutationContext = !1;
				tagCaches = null;
				ii = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(root.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				currentHoistableRoot = ii;
				commitReconciliationEffects(finishedWork);
				if (flags & 4 && null !== current && current.memoizedState.isDehydrated) try {
					retryIfBlockedOn(root.containerInfo);
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				needsFormReset && (needsFormReset = !1, recursivelyResetForms(finishedWork));
				viewTransitionMutationContext = !1;
				break;
			case 4:
				flags = offscreenDirectParentIsHidden;
				offscreenDirectParentIsHidden = offscreenSubtreeIsHidden;
				current = pushMutationContext();
				ii = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(finishedWork.stateNode.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				currentHoistableRoot = ii;
				viewTransitionMutationContext && inUpdateViewTransition && (rootViewTransitionAffected = !0);
				viewTransitionMutationContext = current;
				offscreenDirectParentIsHidden = flags;
				break;
			case 12:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				break;
			case 31:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 13:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 22:
				ii = null !== finishedWork.memoizedState;
				_eventPayloads$ii2 = null !== current && null !== current.memoizedState;
				var prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden, prevOffscreenDirectParentIsHidden$166 = offscreenDirectParentIsHidden;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || ii;
				offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166 || ii;
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || _eventPayloads$ii2;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
				offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
				commitReconciliationEffects(finishedWork);
				flags & 8192 && (root = finishedWork.stateNode, root._visibility = ii ? root._visibility & -2 : root._visibility | 1, !ii || null === current || _eventPayloads$ii2 || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || (root = _eventPayloads$ii2 || offscreenSubtreeWasHidden, lanes = offscreenSubtreeIsHidden, current = offscreenSubtreeWasHidden, offscreenSubtreeIsHidden = ii || offscreenSubtreeIsHidden, offscreenSubtreeWasHidden = root, recursivelyTraverseDisappearLayoutEffects(finishedWork, 2), offscreenSubtreeIsHidden = lanes, offscreenSubtreeWasHidden = current), !ii && offscreenDirectParentIsHidden || hideOrUnhideAllChildren(finishedWork, ii));
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (lanes = root.retryQueue, null !== lanes && (root.retryQueue = null, attachSuspenseRetryListeners(finishedWork, lanes))));
				break;
			case 19:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 30:
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags = pushMutationContext();
				ii = inUpdateViewTransition;
				_eventPayloads$ii2 = (lanes & 335544064) === lanes;
				prevOffscreenSubtreeIsHidden = finishedWork.memoizedProps;
				inUpdateViewTransition = _eventPayloads$ii2 && "none" !== getViewTransitionClassName(prevOffscreenSubtreeIsHidden.default, prevOffscreenSubtreeIsHidden.update);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				_eventPayloads$ii2 && null !== current && viewTransitionMutationContext && (finishedWork.flags |= 4);
				inUpdateViewTransition = ii;
				viewTransitionMutationContext = flags;
				break;
			case 21: break;
			case 7: flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return)), current && null !== current.stateNode && (current.stateNode._fragmentFiber = finishedWork);
			default: recursivelyTraverseMutationEffects(root, finishedWork, lanes), commitReconciliationEffects(finishedWork);
		}
	}
	function commitReconciliationEffects(finishedWork) {
		var flags = finishedWork.flags;
		if (flags & 2) {
			try {
				for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber;) {
					if (isHostParent(parentFiber)) {
						hostParentFiber = parentFiber;
						break;
					}
					parentFiber = parentFiber.return;
				}
				parentFiber = null;
				for (var parent = finishedWork.return; null !== parent;) {
					if (isFragmentInstanceParent(parent)) {
						var fragmentInstance = parent.stateNode;
						null === parentFiber ? parentFiber = [fragmentInstance] : parentFiber.push(fragmentInstance);
					}
					if (isFragmentInstanceHostBoundary(parent)) break;
					parent = parent.return;
				}
				var JSCompiler_inline_result = parentFiber;
				if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
				switch (hostParentFiber.tag) {
					case 27:
						var parent$jscomp$0 = hostParentFiber.stateNode;
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$jscomp$0, JSCompiler_inline_result);
						break;
					case 5:
						var parent$149 = hostParentFiber.stateNode;
						hostParentFiber.flags & 32 && (setTextContent(parent$149, ""), hostParentFiber.flags &= -33);
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$149, JSCompiler_inline_result);
						break;
					case 3:
					case 4:
						var parent$151 = hostParentFiber.stateNode.containerInfo;
						insertOrAppendPlacementNodeIntoContainer(finishedWork, getHostSibling(finishedWork), parent$151, JSCompiler_inline_result);
						break;
					default: throw Error(formatProdErrorMessage(161));
				}
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
			finishedWork.flags &= -3;
		}
		flags & 4096 && (finishedWork.flags &= -4097);
	}
	function recursivelyResetForms(parentFiber) {
		if (parentFiber.subtreeFlags & 1024) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var fiber = parentFiber;
			recursivelyResetForms(fiber);
			5 === fiber.tag && fiber.flags & 1024 && (fiber = fiber.stateNode, _enabled = !0, fiber.reset(), _enabled = !1);
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAfterMutationEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 9270) for (parentFiber = parentFiber.child; null !== parentFiber;) commitAfterMutationEffectsOnFiber(parentFiber, root), parentFiber = parentFiber.sibling;
		else measureNestedViewTransitions(parentFiber, !1);
	}
	function commitAfterMutationEffectsOnFiber(finishedWork, root) {
		var current = finishedWork.alternate;
		if (null === current) commitEnterViewTransitions(finishedWork, !1);
		else switch (finishedWork.tag) {
			case 3:
				rootViewTransitionNameCanceled = viewTransitionContextChanged = !1;
				pushViewTransitionCancelableScope();
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				if (!viewTransitionContextChanged && !rootViewTransitionAffected) {
					finishedWork = viewTransitionCancelableChildren;
					if (null !== finishedWork) for (var i = 0; i < finishedWork.length; i += 3) {
						current = finishedWork[i];
						var oldName = finishedWork[i + 1];
						restoreViewTransitionName(current, finishedWork[i + 2]);
						current = current.ownerDocument.documentElement;
						null !== current && current.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + oldName + ")"
						});
					}
					finishedWork = root.containerInfo;
					finishedWork = 9 === finishedWork.nodeType ? finishedWork.documentElement : finishedWork.ownerDocument.documentElement;
					null !== finishedWork && "" === finishedWork.style.viewTransitionName && (finishedWork.style.viewTransitionName = "none", finishedWork.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), finishedWork.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					}));
					rootViewTransitionNameCanceled = !0;
				}
				viewTransitionCancelableChildren = null;
				break;
			case 5:
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				break;
			case 4:
				i = viewTransitionContextChanged;
				viewTransitionContextChanged = !1;
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				viewTransitionContextChanged && (rootViewTransitionAffected = !0);
				viewTransitionContextChanged = i;
				break;
			case 22:
				null === finishedWork.memoizedState && (null !== current.memoizedState ? commitEnterViewTransitions(finishedWork, !1) : recursivelyTraverseAfterMutationEffects(root, finishedWork));
				break;
			case 30:
				i = viewTransitionContextChanged;
				oldName = pushViewTransitionCancelableScope();
				viewTransitionContextChanged = !1;
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				viewTransitionContextChanged && (finishedWork.flags |= 4);
				var props = finishedWork.memoizedProps, state = finishedWork.stateNode;
				root = getViewTransitionName(props, state);
				state = getViewTransitionName(current.memoizedProps, state);
				var className = getViewTransitionClassName(props.default, props.update);
				"none" === className ? root = !1 : (props = current.memoizedState, current.memoizedState = null, current = finishedWork.child, viewTransitionHostInstanceIdx = 0, root = measureViewTransitionHostInstancesRecursive(finishedWork, current, root, state, className, props, !0), viewTransitionHostInstanceIdx !== (null === props ? 0 : props.length) && (finishedWork.flags |= 32));
				0 !== (finishedWork.flags & 4) && root ? (scheduleViewTransitionEvent(finishedWork, finishedWork.memoizedProps.onUpdate), viewTransitionCancelableChildren = oldName) : null !== oldName && (oldName.push.apply(oldName, viewTransitionCancelableChildren), viewTransitionCancelableChildren = oldName);
				viewTransitionContextChanged = 0 !== (finishedWork.flags & 32) ? !0 : i;
				break;
			default: recursivelyTraverseAfterMutationEffects(root, finishedWork);
		}
	}
	function recursivelyTraverseLayoutEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 8772) for (parentFiber = parentFiber.child; null !== parentFiber;) commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
	}
	function recursivelyTraverseDisappearLayoutEffects(parentFiber, layoutEffectTraversalFlags$jscomp$0) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedWork = parentFiber, layoutEffectTraversalFlags = layoutEffectTraversalFlags$jscomp$0;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 1:
					safelyDetachRef(finishedWork, finishedWork.return);
					var instance = finishedWork.stateNode;
					"function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(finishedWork, finishedWork.return, instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 27: 0 !== (layoutEffectTraversalFlags & 2) && releaseSingletonInstance(finishedWork.stateNode, finishedWork.type, finishedWork.memoizedProps);
				case 5:
					safelyDetachRef(finishedWork, finishedWork.return);
					5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceDeletionEffects(finishedWork);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 6:
					commitFragmentInstanceDeletionEffects(finishedWork);
					break;
				case 26:
					safelyDetachRef(finishedWork, finishedWork.return);
					instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState || null === instance || offscreenSubtreeWasHidden || instance.parentNode.removeChild(instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 30:
					safelyDetachRef(finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 7: safelyDetachRef(finishedWork, finishedWork.return);
				default: recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, layoutEffectTraversalFlags) {
		layoutEffectTraversalFlags = 0 !== (parentFiber.subtreeFlags & 8772) ? layoutEffectTraversalFlags : layoutEffectTraversalFlags & -2;
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags, includeWorkInProgressEffects = 0 !== (layoutEffectTraversalFlags & 1);
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					commitHookEffectListMount(4, finishedWork);
					break;
				case 1:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					current = finishedWork;
					finishedRoot = current.stateNode;
					if ("function" === typeof finishedRoot.componentDidMount) try {
						finishedRoot.componentDidMount();
					} catch (error) {
						captureCommitPhaseError(current, current.return, error);
					}
					current = finishedWork;
					finishedRoot = current.updateQueue;
					if (null !== finishedRoot) {
						var instance = current.stateNode;
						try {
							var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
							if (null !== hiddenCallbacks) for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++) callCallback(hiddenCallbacks[finishedRoot], instance);
						} catch (error) {
							captureCommitPhaseError(current, current.return, error);
						}
					}
					includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 27: 0 !== (layoutEffectTraversalFlags & 2) && commitHostSingletonAcquisition(finishedWork);
				case 5:
					5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceInsertionEffects(finishedWork);
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 6:
					commitFragmentInstanceInsertionEffects(finishedWork);
					break;
				case 26:
					instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState || null === instance || offscreenSubtreeIsHidden || mountHoistable(getHoistableRoot(instance.ownerDocument), finishedWork.type, instance);
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 12:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					break;
				case 31:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 13:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 30:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 7: safelyAttachRef(finishedWork, finishedWork.return);
				default: recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitOffscreenPassiveMountEffects(current, finishedWork) {
		var previousCache = null;
		null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
		current = null;
		null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
		current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
	}
	function commitCachePassiveMountEffect(current, finishedWork) {
		current = null;
		null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
		finishedWork = finishedWork.memoizedState.cache;
		finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
	}
	function recursivelyTraversePassiveMountEffects(root, parentFiber, committedLanes, committedTransitions) {
		var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
		if (parentFiber.subtreeFlags & (isViewTransitionEligible ? 10262 : 10256)) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveMountOnFiber(root, parentFiber, committedLanes, committedTransitions), parentFiber = parentFiber.sibling;
		else isViewTransitionEligible && restoreNestedViewTransitions(parentFiber);
	}
	function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
		var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
		isViewTransitionEligible && null === finishedWork.alternate && null !== finishedWork.return && null !== finishedWork.return.alternate && restoreEnterOrExitViewTransitions(finishedWork);
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitHookEffectListMount(9, finishedWork);
				break;
			case 1:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 3:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				isViewTransitionEligible && rootViewTransitionNameCanceled && (finishedRoot = finishedRoot.containerInfo, finishedRoot = 9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, "root" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""), finishedRoot = finishedRoot.ownerDocument.documentElement, null !== finishedRoot && "none" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""));
				flags & 2048 && (flags = null, null !== finishedWork.alternate && (flags = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== flags && (finishedWork.refCount++, null != flags && releaseCache(flags)));
				break;
			case 12:
				if (flags & 2048) {
					recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
					flags = finishedWork.stateNode;
					try {
						var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
						"function" === typeof onPostCommit && onPostCommit(id, null === finishedWork.alternate ? "mount" : "update", flags.passiveEffectDuration, -0);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				} else recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 31:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 13:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 23: break;
			case 22:
				_finishedWork$memoize2 = finishedWork.stateNode;
				id = finishedWork.alternate;
				null !== finishedWork.memoizedState ? (isViewTransitionEligible && null !== id && null === id.memoizedState && restoreEnterOrExitViewTransitions(id), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork)) : (isViewTransitionEligible && null !== id && null !== id.memoizedState && restoreEnterOrExitViewTransitions(finishedWork), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, 0 !== (finishedWork.subtreeFlags & 10256) || !1)));
				flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
				break;
			case 24:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
				break;
			case 30:
				isViewTransitionEligible && (flags = finishedWork.alternate, null !== flags && (restoreViewTransitionOnHostInstances(flags.child, !0), restoreViewTransitionOnHostInstances(finishedWork.child, !0)));
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			default: recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
		}
	}
	function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
		includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || !1);
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					commitHookEffectListMount(8, finishedWork);
					break;
				case 23: break;
				case 22:
					var instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects));
					includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 22:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	var suspenseyCommitFlag = 8192;
	function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
		if (parentFiber.subtreeFlags & suspenseyCommitFlag) for (parentFiber = parentFiber.child; null !== parentFiber;) accumulateSuspenseyCommitOnFiber(parentFiber, committedLanes, suspendedState), parentFiber = parentFiber.sibling;
	}
	function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
		switch (fiber.tag) {
			case 26:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && (null !== fiber.memoizedState ? suspendResource(suspendedState, currentHoistableRoot, fiber.memoizedState, fiber.memoizedProps) : (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber)));
				break;
			case 5:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber));
				break;
			case 3:
			case 4:
				var previousHoistableRoot = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				currentHoistableRoot = previousHoistableRoot;
				break;
			case 22:
				null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState));
				break;
			case 30:
				if (0 !== (fiber.flags & suspenseyCommitFlag) && (previousHoistableRoot = fiber.memoizedProps.name, null != previousHoistableRoot && "auto" !== previousHoistableRoot)) {
					var state = fiber.stateNode;
					state.paired = null;
					null === appearingViewTransitions && (appearingViewTransitions = /* @__PURE__ */ new Map());
					appearingViewTransitions.set(previousHoistableRoot, state);
				}
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				break;
			default: recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
		}
	}
	function detachAlternateSiblings(parentFiber) {
		var previousFiber = parentFiber.alternate;
		if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
			previousFiber.child = null;
			do
				previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
			while (null !== parentFiber);
		}
	}
	function recursivelyTraversePassiveUnmountEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
	}
	function commitPassiveUnmountOnFiber(finishedWork) {
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 12:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 22:
				var instance = finishedWork.stateNode;
				null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			default: recursivelyTraversePassiveUnmountEffects(finishedWork);
		}
	}
	function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			deletions = parentFiber;
			switch (deletions.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, deletions, deletions.return);
					recursivelyTraverseDisconnectPassiveEffects(deletions);
					break;
				case 22:
					i = deletions.stateNode;
					i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
					break;
				default: recursivelyTraverseDisconnectPassiveEffects(deletions);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
					break;
				case 23:
				case 22:
					if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
						var cache = fiber.memoizedState.cachePool.pool;
						null != cache && cache.refCount++;
					}
					break;
				case 24: releaseCache(fiber.memoizedState.cache);
			}
			cache = fiber.child;
			if (null !== cache) cache.return = fiber, nextEffect = cache;
			else a: for (fiber = deletedSubtreeRoot; null !== nextEffect;) {
				cache = nextEffect;
				var sibling = cache.sibling, returnFiber = cache.return;
				detachFiberAfterEffects(cache);
				if (cache === fiber) {
					nextEffect = null;
					break a;
				}
				if (null !== sibling) {
					sibling.return = returnFiber;
					nextEffect = sibling;
					break a;
				}
				nextEffect = returnFiber;
			}
		}
	}
	var DefaultAsyncDispatcher = {
		getCacheForType: function(resourceType) {
			var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
			void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
			return cacheForType;
		},
		cacheSignal: function() {
			return readContext(CacheContext).controller.signal;
		}
	};
	var PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map;
	var executionContext = 0;
	var workInProgressRoot = null;
	var workInProgress = null;
	var workInProgressRootRenderLanes = 0;
	var workInProgressSuspendedReason = 0;
	var workInProgressThrownValue = null;
	var workInProgressRootDidSkipSuspendedSiblings = !1;
	var workInProgressRootIsPrerendering = !1;
	var workInProgressRootDidAttachPingListener = !1;
	var entangledRenderLanes = 0;
	var workInProgressRootExitStatus = 0;
	var workInProgressRootSkippedLanes = 0;
	var workInProgressRootInterleavedUpdatedLanes = 0;
	var workInProgressRootPingedLanes = 0;
	var workInProgressDeferredLane = 0;
	var workInProgressSuspendedRetryLanes = 0;
	var workInProgressRootConcurrentErrors = null;
	var workInProgressRootRecoverableErrors = null;
	var workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
	var globalMostRecentFallbackTime = 0;
	var globalMostRecentTransitionTime = 0;
	var workInProgressRootRenderTargetTime = Infinity;
	var workInProgressTransitions = null;
	var legacyErrorBoundariesThatAlreadyFailed = null;
	var pendingEffectsStatus = 0;
	var pendingEffectsRoot = null;
	var pendingFinishedWork = null;
	var pendingEffectsLanes = 0;
	var pendingEffectsRemainingLanes = 0;
	var pendingPassiveTransitions = null;
	var pendingRecoverableErrors = null;
	var pendingViewTransition = null;
	var pendingViewTransitionEvents = null;
	var pendingTransitionTypes = null;
	var nestedUpdateCount = 0;
	var rootWithNestedUpdates = null;
	function requestUpdateLane() {
		return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
	}
	function requestDeferredLane() {
		if (0 === workInProgressDeferredLane) if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
			var lane = nextTransitionDeferredLane;
			nextTransitionDeferredLane <<= 1;
			0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
			workInProgressDeferredLane = lane;
		} else workInProgressDeferredLane = 536870912;
		lane = suspenseHandlerStackCursor.current;
		null !== lane && (lane.flags |= 32);
		return workInProgressDeferredLane;
	}
	function scheduleViewTransitionEvent(fiber, callback) {
		if (null != callback) {
			var state = fiber.stateNode, instance = state.ref;
			null === instance && (instance = state.ref = createViewTransitionInstance(getViewTransitionName(fiber.memoizedProps, state)));
			null === pendingViewTransitionEvents && (pendingViewTransitionEvents = []);
			pendingViewTransitionEvents.push(callback.bind(null, instance));
		}
	}
	function scheduleUpdateOnFiber(root, fiber, lane) {
		if (root === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) prepareFreshStack(root, 0), markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
		markRootUpdated$1(root, lane);
		if (0 === (executionContext & 2) || root !== workInProgressRoot) root === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1)), ensureRootIsScheduled(root);
	}
	function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, !0), renderWasConcurrent = shouldTimeSlice;
		do {
			if (0 === exitStatus) {
				workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, !1);
				break;
			} else {
				forceSync = root$jscomp$0.current.alternate;
				if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
					exitStatus = renderRootSync(root$jscomp$0, lanes, !1);
					renderWasConcurrent = !1;
					continue;
				}
				if (2 === exitStatus) {
					renderWasConcurrent = lanes;
					if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent) var JSCompiler_inline_result = 0;
					else JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
					if (0 !== JSCompiler_inline_result) {
						lanes = JSCompiler_inline_result;
						a: {
							var root = root$jscomp$0;
							exitStatus = workInProgressRootConcurrentErrors;
							var wasRootDehydrated = root.current.memoizedState.isDehydrated;
							wasRootDehydrated && (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
							JSCompiler_inline_result = renderRootSync(root, JSCompiler_inline_result, !1);
							if (2 !== JSCompiler_inline_result && 6 !== JSCompiler_inline_result) {
								if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
									root.errorRecoveryDisabledLanes |= renderWasConcurrent;
									workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
									exitStatus = 4;
									break a;
								}
								renderWasConcurrent = workInProgressRootRecoverableErrors;
								workInProgressRootRecoverableErrors = exitStatus;
								null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, renderWasConcurrent));
							}
							exitStatus = JSCompiler_inline_result;
						}
						renderWasConcurrent = !1;
						if (2 !== exitStatus) continue;
					}
				}
				if (1 === exitStatus) {
					prepareFreshStack(root$jscomp$0, 0);
					markRootSuspended(root$jscomp$0, lanes, 0, !0);
					break;
				}
				a: {
					shouldTimeSlice = root$jscomp$0;
					renderWasConcurrent = exitStatus;
					switch (renderWasConcurrent) {
						case 0:
						case 1: throw Error(formatProdErrorMessage(345));
						case 4: if ((lanes & 4194048) !== lanes && (lanes & 62914560) !== lanes) break;
						case 6:
							markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
							break a;
						case 2:
							workInProgressRootRecoverableErrors = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(formatProdErrorMessage(329));
					}
					if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
						markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
						if (0 !== getNextLanes(shouldTimeSlice, 0, !0)) break a;
						pendingEffectsLanes = lanes;
						shouldTimeSlice.timeoutHandle = scheduleTimeout(completeRootWhenReady.bind(null, shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, "Throttled", -0, 0), exitStatus);
						break a;
					}
					completeRootWhenReady(shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, null, -0, 0);
				}
			}
			break;
		} while (1);
		ensureRootIsScheduled(root$jscomp$0);
	}
	function completeRootWhenReady(root, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
		root.timeoutHandle = -1;
		var subtreeFlags = finishedWork.subtreeFlags, isViewTransitionEligible = (lanes & 335544064) === lanes;
		suspendedCommitReason = null;
		if (isViewTransitionEligible || subtreeFlags & 8192 || 16785408 === (subtreeFlags & 16785408)) {
			if (suspendedCommitReason = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: noop$1
			}, appearingViewTransitions = null, accumulateSuspenseyCommitOnFiber(finishedWork, lanes, suspendedCommitReason), isViewTransitionEligible && (subtreeFlags = suspendedCommitReason, isViewTransitionEligible = root.containerInfo, isViewTransitionEligible = (9 === isViewTransitionEligible.nodeType ? isViewTransitionEligible : isViewTransitionEligible.ownerDocument).__reactViewTransition, null != isViewTransitionEligible && (subtreeFlags.count++, subtreeFlags.waitingForViewTransition = !0, subtreeFlags = onUnsuspend.bind(subtreeFlags), isViewTransitionEligible.finished.then(subtreeFlags, subtreeFlags))), subtreeFlags = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0, subtreeFlags = waitForCommitToBeReady(suspendedCommitReason, subtreeFlags), null !== subtreeFlags) {
				pendingEffectsLanes = lanes;
				root.cancelPendingCommit = subtreeFlags(completeRoot.bind(null, root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, null, completedRenderStartTime, completedRenderEndTime));
				markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
				return;
			}
		}
		completeRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason);
	}
	function isRenderConsistentWithExternalStores(finishedWork) {
		for (var node = finishedWork;;) {
			var tag = node.tag;
			if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag))) for (var i = 0; i < tag.length; i++) {
				var check = tag[i], getSnapshot = check.getSnapshot;
				check = check.value;
				try {
					if (!objectIs(getSnapshot(), check)) return !1;
				} catch (error) {
					return !1;
				}
			}
			tag = node.child;
			if (node.subtreeFlags & 16384 && null !== tag) tag.return = node, node = tag;
			else {
				if (node === finishedWork) break;
				for (; null === node.sibling;) {
					if (null === node.return || node.return === finishedWork) return !0;
					node = node.return;
				}
				node.sibling.return = node.return;
				node = node.sibling;
			}
		}
		return !0;
	}
	function markRootSuspended(root, suspendedLanes, spawnedLane, didAttemptEntireTree) {
		suspendedLanes = getEntangledLanes(root, suspendedLanes);
		suspendedLanes &= ~workInProgressRootPingedLanes;
		suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
		root.suspendedLanes |= suspendedLanes;
		root.pingedLanes &= ~suspendedLanes;
		didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
		didAttemptEntireTree = root.expirationTimes;
		for (var lanes = suspendedLanes; 0 < lanes;) {
			var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
			didAttemptEntireTree[index$6] = -1;
			lanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
	}
	function flushSyncWork$1() {
		return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, !1), !1) : !0;
	}
	function resetWorkInProgressStack() {
		if (null !== workInProgress) {
			if (0 === workInProgressSuspendedReason) var interruptedWork = workInProgress.return;
			else interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
			for (; null !== interruptedWork;) unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
			workInProgress = null;
		}
	}
	function prepareFreshStack(root, lanes) {
		var timeoutHandle = root.timeoutHandle;
		-1 !== timeoutHandle && (root.timeoutHandle = -1, cancelTimeout(timeoutHandle));
		timeoutHandle = root.cancelPendingCommit;
		null !== timeoutHandle && (root.cancelPendingCommit = null, timeoutHandle());
		pendingEffectsLanes = 0;
		resetWorkInProgressStack();
		workInProgressRoot = root;
		workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
		workInProgressRootRenderLanes = lanes;
		workInProgressSuspendedReason = 0;
		workInProgressThrownValue = null;
		workInProgressRootDidSkipSuspendedSiblings = !1;
		workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		workInProgressRootDidAttachPingListener = !1;
		workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
		workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
		workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
		entangledRenderLanes = getEntangledLanes(root, lanes);
		finishQueueingConcurrentUpdates();
		return timeoutHandle;
	}
	function handleThrow(root, thrownValue) {
		currentlyRenderingFiber = null;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
		workInProgressThrownValue = thrownValue;
		null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current)));
	}
	function shouldRemainOnPreviousScreen() {
		var handler = suspenseHandlerStackCursor.current;
		return null === handler ? !0 : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? !0 : !1 : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : !1;
	}
	function pushDispatcher() {
		var prevDispatcher = ReactSharedInternals.H;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
	}
	function pushAsyncDispatcher() {
		var prevAsyncDispatcher = ReactSharedInternals.A;
		ReactSharedInternals.A = DefaultAsyncDispatcher;
		return prevAsyncDispatcher;
	}
	function renderDidSuspendDelayIfPossible() {
		workInProgressRootExitStatus = 4;
		workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = !0);
		0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(workInProgressRoot, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
	}
	function renderRootSync(root, lanes, shouldYieldForPrerendering) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) workInProgressTransitions = null, prepareFreshStack(root, lanes);
		lanes = !1;
		var exitStatus = workInProgressRootExitStatus;
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
					switch (workInProgressSuspendedReason) {
						case 8:
							resetWorkInProgressStack();
							exitStatus = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							null === suspenseHandlerStackCursor.current && (lanes = !0);
							var reason = workInProgressSuspendedReason;
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
							if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
								exitStatus = 0;
								break a;
							}
							break;
						default: reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
					}
				}
				workLoopSync();
				exitStatus = workInProgressRootExitStatus;
				break;
			} catch (thrownValue$184) {
				handleThrow(root, thrownValue$184);
			}
		while (1);
		lanes && root.shellSuspendCounter++;
		lastContextDependency = currentlyRenderingFiber$1 = null;
		executionContext = prevExecutionContext;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
		return exitStatus;
	}
	function workLoopSync() {
		for (; null !== workInProgress;) performUnitOfWork(workInProgress);
	}
	function renderRootConcurrent(root, lanes) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					lanes = workInProgress;
					var thrownValue = workInProgressThrownValue;
					b: switch (workInProgressSuspendedReason) {
						case 1:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
							break;
						case 2:
						case 9:
							if (isThenableResolved(thrownValue)) {
								workInProgressSuspendedReason = 0;
								workInProgressThrownValue = null;
								replaySuspendedUnitOfWork(lanes);
								break;
							}
							lanes = function() {
								2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root || (workInProgressSuspendedReason = 7);
								ensureRootIsScheduled(root);
							};
							thrownValue.then(lanes, lanes);
							break a;
						case 3:
							workInProgressSuspendedReason = 7;
							break a;
						case 4:
							workInProgressSuspendedReason = 5;
							break a;
						case 7:
							isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
							break;
						case 5:
							var resource = null;
							switch (workInProgress.tag) {
								case 26: resource = workInProgress.memoizedState;
								case 5:
								case 27:
									var hostFiber = workInProgress;
									if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
										workInProgressSuspendedReason = 0;
										workInProgressThrownValue = null;
										var sibling = hostFiber.sibling;
										if (null !== sibling) workInProgress = sibling;
										else {
											var returnFiber = hostFiber.return;
											null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
										}
										break b;
									}
							}
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
							break;
						case 6:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
							break;
						case 8:
							resetWorkInProgressStack();
							workInProgressRootExitStatus = 6;
							break a;
						default: throw Error(formatProdErrorMessage(462));
					}
				}
				workLoopConcurrentByScheduler();
				break;
			} catch (thrownValue$186) {
				handleThrow(root, thrownValue$186);
			}
		while (1);
		lastContextDependency = currentlyRenderingFiber$1 = null;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		executionContext = prevExecutionContext;
		if (null !== workInProgress) return 0;
		workInProgressRoot = null;
		workInProgressRootRenderLanes = 0;
		finishQueueingConcurrentUpdates();
		return workInProgressRootExitStatus;
	}
	function workLoopConcurrentByScheduler() {
		for (; null !== workInProgress && !shouldYield();) performUnitOfWork(workInProgress);
	}
	function performUnitOfWork(unitOfWork) {
		var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function replaySuspendedUnitOfWork(unitOfWork) {
		var next = unitOfWork;
		var current = next.alternate;
		switch (next.tag) {
			case 15:
			case 0:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type, void 0, workInProgressRootRenderLanes);
				break;
			case 11:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type.render, next.ref, workInProgressRootRenderLanes);
				break;
			case 5:
				resetHooksOnUnwind(next);
				var fiber = next;
				fiber === hydrationParentFiber && (isHydrating ? (popToNextHostParent(fiber), 5 === fiber.tag && null != fiber.stateNode && (nextHydratableInstance = fiber.stateNode)) : (popToNextHostParent(fiber), isHydrating = !0));
			default: unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
		}
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, suspendedReason) {
		lastContextDependency = currentlyRenderingFiber$1 = null;
		resetHooksOnUnwind(unitOfWork);
		thenableState$1 = null;
		thenableIndexCounter$1 = 0;
		var returnFiber = unitOfWork.return;
		try {
			if (throwException(root, returnFiber, unitOfWork, thrownValue, workInProgressRootRenderLanes)) {
				workInProgressRootExitStatus = 1;
				logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
				workInProgress = null;
				return;
			}
		} catch (error) {
			if (null !== returnFiber) throw workInProgress = returnFiber, error;
			workInProgressRootExitStatus = 1;
			logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
			workInProgress = null;
			return;
		}
		if (unitOfWork.flags & 32768) {
			if (isHydrating || 1 === suspendedReason) root = !0;
			else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912)) root = !1;
			else if (workInProgressRootDidSkipSuspendedSiblings = root = !0, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason) suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
			unwindUnitOfWork(unitOfWork, root);
		} else completeUnitOfWork(unitOfWork);
	}
	function completeUnitOfWork(unitOfWork) {
		var completedWork = unitOfWork;
		do {
			if (0 !== (completedWork.flags & 32768)) {
				unwindUnitOfWork(completedWork, workInProgressRootDidSkipSuspendedSiblings);
				return;
			}
			unitOfWork = completedWork.return;
			var next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes);
			if (null !== next) {
				workInProgress = next;
				return;
			}
			completedWork = completedWork.sibling;
			if (null !== completedWork) {
				workInProgress = completedWork;
				return;
			}
			workInProgress = completedWork = unitOfWork;
		} while (null !== completedWork);
		0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
	}
	function unwindUnitOfWork(unitOfWork, skipSiblings) {
		do {
			var next = unwindWork(unitOfWork.alternate, unitOfWork);
			if (null !== next) {
				next.flags &= 32767;
				workInProgress = next;
				return;
			}
			next = unitOfWork.return;
			null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
			if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
				workInProgress = unitOfWork;
				return;
			}
			workInProgress = unitOfWork = next;
		} while (null !== unitOfWork);
		workInProgressRootExitStatus = 6;
		workInProgress = null;
	}
	function completeRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedState) {
		root.cancelPendingCommit = null;
		do
			flushPendingEffects();
		while (0 !== pendingEffectsStatus);
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		if (null !== finishedWork) {
			if (finishedWork === root.current) throw Error(formatProdErrorMessage(177));
			root === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
			pendingFinishedWork = finishedWork;
			pendingEffectsRoot = root;
			pendingEffectsLanes = lanes;
			pendingPassiveTransitions = transitions;
			pendingRecoverableErrors = recoverableErrors;
			commitRoot(root, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState);
		}
	}
	function commitRoot(root, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState) {
		var remainingLanes = finishedWork.lanes | finishedWork.childLanes;
		pendingEffectsRemainingLanes = remainingLanes;
		remainingLanes |= concurrentlyUpdatedLanes;
		markRootFinished(root, lanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes);
		pendingViewTransitionEvents = null;
		(lanes & 335544064) === lanes ? (pendingTransitionTypes = claimQueuedTransitionTypes(root), spawnedLane = 10262) : (pendingTransitionTypes = null, spawnedLane = 10256);
		0 !== (finishedWork.subtreeFlags & spawnedLane) || 0 !== (finishedWork.flags & spawnedLane) ? (root.callbackNode = null, root.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
			flushPassiveEffects();
			return null;
		})) : (root.callbackNode = null, root.callbackPriority = 0);
		shouldStartViewTransition = !1;
		spawnedLane = 0 !== (finishedWork.flags & 13878);
		if (0 !== (finishedWork.subtreeFlags & 13878) || spawnedLane) {
			spawnedLane = ReactSharedInternals.T;
			ReactSharedInternals.T = null;
			updatedLanes = ReactDOMSharedInternals.p;
			ReactDOMSharedInternals.p = 2;
			suspendedRetryLanes = executionContext;
			executionContext |= 4;
			try {
				commitBeforeMutationEffects(root, finishedWork, lanes);
			} finally {
				executionContext = suspendedRetryLanes, ReactDOMSharedInternals.p = updatedLanes, ReactSharedInternals.T = spawnedLane;
			}
		}
		pendingEffectsStatus = 1;
		shouldStartViewTransition ? pendingViewTransition = startViewTransition(suspendedState, root.containerInfo, pendingTransitionTypes, flushMutationEffects, flushLayoutEffects, flushAfterMutationEffects, flushSpawnedWork, flushPassiveEffects, reportViewTransitionError, null, null) : (flushMutationEffects(), flushLayoutEffects(), flushSpawnedWork());
	}
	function reportViewTransitionError(error) {
		if (0 !== pendingEffectsStatus) {
			var onRecoverableError = pendingEffectsRoot.onRecoverableError;
			onRecoverableError(error, { componentStack: null });
		}
	}
	function flushAfterMutationEffects() {
		3 === pendingEffectsStatus && (pendingEffectsStatus = 0, commitAfterMutationEffectsOnFiber(pendingFinishedWork, pendingEffectsRoot), pendingEffectsStatus = 4);
	}
	function flushMutationEffects() {
		if (1 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
			if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
				rootMutationHasEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					inUpdateViewTransition = rootViewTransitionAffected = !1;
					commitMutationEffectsOnFiber(finishedWork, root, lanes);
					lanes = selectionInformation;
					var curFocusedElem = getActiveElementDeep(root.containerInfo), priorFocusedElem = lanes.focusedElem, priorSelectionRange = lanes.selectionRange;
					if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(priorFocusedElem.ownerDocument.documentElement, priorFocusedElem)) {
						if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
							var start = priorSelectionRange.start, end = priorSelectionRange.end;
							void 0 === end && (end = start);
							if ("selectionStart" in priorFocusedElem) priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(end, priorFocusedElem.value.length);
							else {
								var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
								if (win.getSelection) {
									var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
									!selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
									var startMarker = getNodeForCharacterOffset(priorFocusedElem, start$jscomp$0), endMarker = getNodeForCharacterOffset(priorFocusedElem, end$jscomp$0);
									if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
										var range = doc.createRange();
										range.setStart(startMarker.node, startMarker.offset);
										selection.removeAllRanges();
										start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
									}
								}
							}
						}
						doc = [];
						for (selection = priorFocusedElem; selection = selection.parentNode;) 1 === selection.nodeType && doc.push({
							element: selection,
							left: selection.scrollLeft,
							top: selection.scrollTop
						});
						"function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
						for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
							var info = doc[priorFocusedElem];
							info.element.scrollLeft = info.left;
							info.element.scrollTop = info.top;
						}
					}
					_enabled = !!eventsEnabled;
					selectionInformation = eventsEnabled = null;
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
				}
			}
			root.current = finishedWork;
			pendingEffectsStatus = 2;
		}
	}
	function flushLayoutEffects() {
		if (2 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
			if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
				rootHasLayoutEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
				}
			}
			pendingEffectsStatus = 3;
		}
	}
	function flushSpawnedWork() {
		if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var committedViewTransition = pendingViewTransition;
			pendingViewTransition = null;
			requestPaint();
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors, passiveSubtreeMask = (lanes & 335544064) === lanes ? 10262 : 10256;
			0 !== (finishedWork.subtreeFlags & passiveSubtreeMask) || 0 !== (finishedWork.flags & passiveSubtreeMask) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root, root.pendingLanes));
			passiveSubtreeMask = root.pendingLanes;
			0 === passiveSubtreeMask && (legacyErrorBoundariesThatAlreadyFailed = null);
			lanesToEventPriority(lanes);
			finishedWork = finishedWork.stateNode;
			if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot) try {
				injectedHook.onCommitFiberRoot(rendererID, finishedWork, void 0, 128 === (finishedWork.current.flags & 128));
			} catch (err) {}
			if (null !== recoverableErrors) {
				finishedWork = ReactSharedInternals.T;
				passiveSubtreeMask = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				ReactSharedInternals.T = null;
				try {
					for (var onRecoverableError = root.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
						var recoverableError = recoverableErrors[i];
						onRecoverableError(recoverableError.value, { componentStack: recoverableError.stack });
					}
				} finally {
					ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = passiveSubtreeMask;
				}
			}
			recoverableErrors = pendingViewTransitionEvents;
			onRecoverableError = pendingTransitionTypes;
			pendingTransitionTypes = null;
			if (null !== recoverableErrors && (pendingViewTransitionEvents = null, null === onRecoverableError && (onRecoverableError = []), null !== committedViewTransition)) for (recoverableError = 0; recoverableError < recoverableErrors.length; recoverableError++) finishedWork = (0, recoverableErrors[recoverableError])(onRecoverableError), void 0 !== finishedWork && committedViewTransition.finished.finally(finishedWork);
			0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
			ensureRootIsScheduled(root);
			passiveSubtreeMask = root.pendingLanes;
			0 !== (lanes & 261930) && 0 !== (passiveSubtreeMask & 42) ? root === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root) : (nestedUpdateCount = 0, rootWithNestedUpdates = null);
			flushSyncWorkAcrossRoots_impl(0, !1);
		}
	}
	function releaseRootPooledCache(root, remainingLanes) {
		0 === (root.pooledCacheLanes &= remainingLanes) && (remainingLanes = root.pooledCache, null != remainingLanes && (root.pooledCache = null, releaseCache(remainingLanes)));
	}
	function flushPendingEffects() {
		null !== pendingViewTransition && (pendingViewTransition.skipTransition(), pendingViewTransition = null);
		flushMutationEffects();
		flushLayoutEffects();
		flushSpawnedWork();
		return flushPassiveEffects();
	}
	function flushPassiveEffects() {
		if (5 !== pendingEffectsStatus) return !1;
		var root = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
		pendingEffectsRemainingLanes = 0;
		var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
			ReactSharedInternals.T = null;
			renderPriority = pendingPassiveTransitions;
			pendingPassiveTransitions = null;
			var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
			pendingEffectsStatus = 0;
			pendingFinishedWork = pendingEffectsRoot = null;
			pendingEffectsLanes = 0;
			if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
			var prevExecutionContext = executionContext;
			executionContext |= 4;
			commitPassiveUnmountOnFiber(root$jscomp$0.current);
			commitPassiveMountOnFiber(root$jscomp$0, root$jscomp$0.current, lanes, renderPriority);
			executionContext = prevExecutionContext;
			flushSyncWorkAcrossRoots_impl(0, !1);
			if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot) try {
				injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
			} catch (err) {}
			return !0;
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root, remainingLanes);
		}
	}
	function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
		sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
		sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
		rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
		null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
	}
	function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
		if (3 === sourceFiber.tag) captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
		else for (; null !== nearestMountedAncestor;) {
			if (3 === nearestMountedAncestor.tag) {
				captureCommitPhaseErrorOnRoot(nearestMountedAncestor, sourceFiber, error);
				break;
			} else if (1 === nearestMountedAncestor.tag) {
				var instance = nearestMountedAncestor.stateNode;
				if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
					sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
					error = createClassErrorUpdate(2);
					instance = enqueueUpdate(nearestMountedAncestor, error, 2);
					null !== instance && (initializeClassErrorUpdate(error, instance, nearestMountedAncestor, sourceFiber), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
					break;
				}
			}
			nearestMountedAncestor = nearestMountedAncestor.return;
		}
	}
	function attachPingListener(root, wakeable, lanes) {
		var pingCache = root.pingCache;
		if (null === pingCache) {
			pingCache = root.pingCache = new PossiblyWeakMap();
			var threadIDs = /* @__PURE__ */ new Set();
			pingCache.set(wakeable, threadIDs);
		} else threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
		threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = !0, threadIDs.add(lanes), root = pingSuspendedRoot.bind(null, root, wakeable, lanes), wakeable.then(root, root));
	}
	function pingSuspendedRoot(root, wakeable, pingedLanes) {
		var pingCache = root.pingCache;
		null !== pingCache && pingCache.delete(wakeable);
		root.pingedLanes |= root.suspendedLanes & pingedLanes;
		root.warmLanes &= ~pingedLanes;
		workInProgressRoot === root && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) ? prepareFreshStack(root, 0) : workInProgressRootPingedLanes |= pingedLanes : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
		ensureRootIsScheduled(root);
	}
	function retryTimedOutBoundary(boundaryFiber, retryLane) {
		0 === retryLane && (retryLane = claimNextRetryLane());
		boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
		null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
	}
	function retryDehydratedSuspenseBoundary(boundaryFiber) {
		var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
		null !== suspenseState && (retryLane = suspenseState.retryLane);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function resolveRetryWakeable(boundaryFiber, wakeable) {
		var retryLane = 0;
		switch (boundaryFiber.tag) {
			case 31:
			case 13:
				var retryCache = boundaryFiber.stateNode;
				var suspenseState = boundaryFiber.memoizedState;
				null !== suspenseState && (retryLane = suspenseState.retryLane);
				break;
			case 19:
				retryCache = boundaryFiber.stateNode;
				break;
			case 22:
				retryCache = boundaryFiber.stateNode._retryCache;
				break;
			default: throw Error(formatProdErrorMessage(314));
		}
		null !== retryCache && retryCache.delete(wakeable);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function scheduleCallback$1(priorityLevel, callback) {
		return scheduleCallback$3(priorityLevel, callback);
	}
	var firstScheduledRoot = null;
	var lastScheduledRoot = null;
	var didScheduleMicrotask = !1;
	var mightHavePendingSyncWork = !1;
	var isFlushingWork = !1;
	var currentEventTransitionLane = 0;
	function ensureRootIsScheduled(root) {
		root !== lastScheduledRoot && null === root.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root : lastScheduledRoot = lastScheduledRoot.next = root);
		mightHavePendingSyncWork = !0;
		didScheduleMicrotask || (didScheduleMicrotask = !0, scheduleImmediateRootScheduleTask());
	}
	function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
		if (!isFlushingWork && mightHavePendingSyncWork) {
			isFlushingWork = !0;
			do {
				var didPerformSomeWork = !1;
				for (var root$190 = firstScheduledRoot; null !== root$190;) {
					if (!onlyLegacy) if (0 !== syncTransitionLanes) {
						var pendingLanes = root$190.pendingLanes;
						if (0 === pendingLanes) var JSCompiler_inline_result = 0;
						else {
							var suspendedLanes = root$190.suspendedLanes, pingedLanes = root$190.pingedLanes;
							JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
							JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
							JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
						}
						0 !== JSCompiler_inline_result && (didPerformSomeWork = !0, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
					} else JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(root$190, root$190 === workInProgressRoot ? JSCompiler_inline_result : 0, null !== root$190.cancelPendingCommit || -1 !== root$190.timeoutHandle), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$190, JSCompiler_inline_result) || (didPerformSomeWork = !0, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
					root$190 = root$190.next;
				}
			} while (didPerformSomeWork);
			isFlushingWork = !1;
		}
	}
	function processRootScheduleInImmediateTask() {
		processRootScheduleInMicrotask();
	}
	function processRootScheduleInMicrotask() {
		mightHavePendingSyncWork = didScheduleMicrotask = !1;
		var syncTransitionLanes = 0;
		0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
		for (var currentTime = now(), prev = null, root = firstScheduledRoot; null !== root;) {
			var next = root.next, nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
			if (0 === nextLanes) root.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
			else if (prev = root, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3)) mightHavePendingSyncWork = !0;
			root = next;
		}
		0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, !1);
		0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
	}
	function scheduleTaskForRootDuringMicrotask(root, currentTime) {
		for (var suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes, expirationTimes = root.expirationTimes, lanes = root.pendingLanes & -62914561; 0 < lanes;) {
			var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
			if (-1 === expirationTime) {
				if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes)) expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
			} else expirationTime <= currentTime && (root.expiredLanes |= lane);
			lanes &= ~lane;
		}
		currentTime = workInProgressRoot;
		suspendedLanes = workInProgressRootRenderLanes;
		suspendedLanes = getNextLanes(root, root === currentTime ? suspendedLanes : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		pingedLanes = root.callbackNode;
		if (0 === suspendedLanes || root === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root.callbackNode = null, root.callbackPriority = 0;
		if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root, suspendedLanes)) {
			currentTime = suspendedLanes & -suspendedLanes;
			if (currentTime === root.callbackPriority) return currentTime;
			null !== pingedLanes && cancelCallback$1(pingedLanes);
			switch (lanesToEventPriority(suspendedLanes)) {
				case 2:
				case 8:
					suspendedLanes = UserBlockingPriority;
					break;
				case 32:
					suspendedLanes = NormalPriority$1;
					break;
				case 268435456:
					suspendedLanes = IdlePriority;
					break;
				default: suspendedLanes = NormalPriority$1;
			}
			pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
			suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
			root.callbackPriority = currentTime;
			root.callbackNode = suspendedLanes;
			return currentTime;
		}
		null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
		root.callbackPriority = 2;
		root.callbackNode = null;
		return 2;
	}
	function performWorkOnRootViaSchedulerTask(root, didTimeout) {
		if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus) return root.callbackNode = null, root.callbackPriority = 0, null;
		var originalCallbackNode = root.callbackNode;
		if (flushPendingEffects() && root.callbackNode !== originalCallbackNode) return null;
		var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
		workInProgressRootRenderLanes$jscomp$0 = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
		performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
		scheduleTaskForRootDuringMicrotask(root, now());
		return null != root.callbackNode && root.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root) : null;
	}
	function performSyncWorkOnRoot(root, lanes) {
		if (flushPendingEffects()) return null;
		performWorkOnRoot(root, lanes, !0);
	}
	function scheduleImmediateRootScheduleTask() {
		scheduleMicrotask(function() {
			0 !== (executionContext & 6) ? scheduleCallback$3(ImmediatePriority, processRootScheduleInImmediateTask) : processRootScheduleInMicrotask();
		});
	}
	function requestTransitionLane() {
		if (0 === currentEventTransitionLane) {
			var actionScopeLane = currentEntangledLane;
			0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
			currentEventTransitionLane = actionScopeLane;
		}
		return currentEventTransitionLane;
	}
	function coerceFormActionProp(actionProp) {
		return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL(actionProp);
	}
	function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
		if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
			var action = coerceFormActionProp((nativeEventTarget[internalPropsKey] || null).action), submitter = nativeEvent.submitter;
			submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
			var event = new SyntheticEvent("action", "action", null, nativeEvent, nativeEventTarget);
			dispatchQueue.push({
				event,
				listeners: [{
					instance: null,
					listener: function() {
						if (nativeEvent.defaultPrevented) {
							if (0 !== currentEventTransitionLane) {
								var formData = new FormData(nativeEventTarget, submitter);
								startHostTransition(maybeTargetInst, {
									pending: !0,
									data: formData,
									method: nativeEventTarget.method,
									action
								}, null, formData);
							}
						} else "function" === typeof action && (event.preventDefault(), formData = new FormData(nativeEventTarget, submitter), startHostTransition(maybeTargetInst, {
							pending: !0,
							data: formData,
							method: nativeEventTarget.method,
							action
						}, action, formData));
					},
					currentTarget: nativeEventTarget
				}]
			});
		}
	}
	for (var i$jscomp$inline_1667 = 0; i$jscomp$inline_1667 < simpleEventPluginEvents.length; i$jscomp$inline_1667++) {
		var eventName$jscomp$inline_1668 = simpleEventPluginEvents[i$jscomp$inline_1667];
		registerSimpleEvent(eventName$jscomp$inline_1668.toLowerCase(), "on" + (eventName$jscomp$inline_1668[0].toUpperCase() + eventName$jscomp$inline_1668.slice(1)));
	}
	registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
	registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
	registerSimpleEvent(ANIMATION_START, "onAnimationStart");
	registerSimpleEvent("dblclick", "onDoubleClick");
	registerSimpleEvent("focusin", "onFocus");
	registerSimpleEvent("focusout", "onBlur");
	registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
	registerSimpleEvent(TRANSITION_START, "onTransitionStart");
	registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
	registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
	registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
	registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
	registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
	registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
	registerTwoPhaseEvent("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
	registerTwoPhaseEvent("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
	registerTwoPhaseEvent("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]);
	registerTwoPhaseEvent("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
	var nonDelegatedEvents = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes));
	function processDispatchQueue(dispatchQueue, eventSystemFlags) {
		eventSystemFlags = 0 !== (eventSystemFlags & 4);
		for (var i = 0; i < dispatchQueue.length; i++) {
			var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
			_dispatchQueue$i = _dispatchQueue$i.listeners;
			a: {
				var previousInstance = void 0;
				if (eventSystemFlags) for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
					var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
				else for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
					_dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
					instance = _dispatchListeners$i.instance;
					currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
			}
		}
	}
	function listenToNonDelegatedEvent(domEventName, targetElement) {
		var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
		void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
		var listenerSetKey = domEventName + "__bubble";
		JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, !1), JSCompiler_inline_result.add(listenerSetKey));
	}
	function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
		var eventSystemFlags = 0;
		isCapturePhaseListener && (eventSystemFlags |= 4);
		addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
	}
	var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
	function listenToAllSupportedEvents(rootContainerElement) {
		if (!rootContainerElement[listeningMarker]) {
			rootContainerElement[listeningMarker] = !0;
			allNativeEvents.forEach(function(domEventName) {
				"selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, !1, rootContainerElement), listenToNativeEvent(domEventName, !0, rootContainerElement));
			});
			var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
			null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = !0, listenToNativeEvent("selectionchange", !1, ownerDocument));
		}
	}
	function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
		switch (getEventPriority(domEventName)) {
			case 2:
				var listenerWrapper = dispatchDiscreteEvent;
				break;
			case 8:
				listenerWrapper = dispatchContinuousEvent;
				break;
			default: listenerWrapper = dispatchEvent;
		}
		eventSystemFlags = listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
		listenerWrapper = void 0;
		!passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = !0);
		isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
			capture: !0,
			passive: listenerWrapper
		}) : targetContainer.addEventListener(domEventName, eventSystemFlags, !0) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, { passive: listenerWrapper }) : targetContainer.addEventListener(domEventName, eventSystemFlags, !1);
	}
	function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
		var ancestorInst = targetInst$jscomp$0;
		if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0) a: for (;;) {
			if (null === targetInst$jscomp$0) return;
			var nodeTag = targetInst$jscomp$0.tag;
			if (3 === nodeTag || 4 === nodeTag) {
				var container = targetInst$jscomp$0.stateNode.containerInfo;
				if (container === targetContainer) break;
				if (4 === nodeTag) for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag;) {
					var grandTag = nodeTag.tag;
					if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer) return;
					nodeTag = nodeTag.return;
				}
				for (; null !== container;) {
					nodeTag = getClosestInstanceFromNode(container);
					if (null === nodeTag) return;
					grandTag = nodeTag.tag;
					if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
						targetInst$jscomp$0 = ancestorInst = nodeTag;
						continue a;
					}
					container = container.parentNode;
				}
			}
			targetInst$jscomp$0 = targetInst$jscomp$0.return;
		}
		batchedUpdates$1(function() {
			var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
			a: {
				var reactName = topLevelEventsToReactNames.get(domEventName);
				if (void 0 !== reactName) {
					var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
					switch (domEventName) {
						case "keypress": if (0 === getEventCharCode(nativeEvent)) break a;
						case "keydown":
						case "keyup":
							SyntheticEventCtor = SyntheticKeyboardEvent;
							break;
						case "focusin":
							reactEventType = "focus";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "focusout":
							reactEventType = "blur";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "beforeblur":
						case "afterblur":
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "click": if (2 === nativeEvent.button) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							SyntheticEventCtor = SyntheticMouseEvent;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							SyntheticEventCtor = SyntheticDragEvent;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							SyntheticEventCtor = SyntheticTouchEvent;
							break;
						case ANIMATION_END:
						case ANIMATION_ITERATION:
						case ANIMATION_START:
							SyntheticEventCtor = SyntheticAnimationEvent;
							break;
						case TRANSITION_END:
							SyntheticEventCtor = SyntheticTransitionEvent;
							break;
						case "scroll":
						case "scrollend":
							SyntheticEventCtor = SyntheticUIEvent;
							break;
						case "wheel":
							SyntheticEventCtor = SyntheticWheelEvent;
							break;
						case "copy":
						case "cut":
						case "paste":
							SyntheticEventCtor = SyntheticClipboardEvent;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							SyntheticEventCtor = SyntheticPointerEvent;
							break;
						case "submit":
							SyntheticEventCtor = SyntheticSubmitEvent;
							break;
						case "toggle":
						case "beforetoggle": SyntheticEventCtor = SyntheticToggleEvent;
					}
					var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
					inCapturePhase = [];
					for (var instance = targetInst, lastHostComponent; null !== instance;) {
						var _instance = instance;
						lastHostComponent = _instance.stateNode;
						_instance = _instance.tag;
						5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(createDispatchListener(instance, _instance, lastHostComponent)));
						if (accumulateTargetOnly) break;
						instance = instance.return;
					}
					0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
						event: reactName,
						listeners: inCapturePhase
					}));
				}
			}
			if (0 === (eventSystemFlags & 7)) {
				a: {
					SyntheticEventCtor = "mouseover" === domEventName || "pointerover" === domEventName;
					reactName = "mouseout" === domEventName || "pointerout" === domEventName;
					if (SyntheticEventCtor && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey])) break a;
					if (reactName || SyntheticEventCtor) {
						reactEventType = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (SyntheticEventCtor = nativeEventTarget.ownerDocument) ? SyntheticEventCtor.defaultView || SyntheticEventCtor.parentWindow : window;
						if (reactName) {
							if (SyntheticEventCtor = nativeEvent.relatedTarget || nativeEvent.toElement, reactName = targetInst, SyntheticEventCtor = SyntheticEventCtor ? getClosestInstanceFromNode(SyntheticEventCtor) : null, null !== SyntheticEventCtor && (accumulateTargetOnly = getNearestMountedFiber(SyntheticEventCtor), inCapturePhase = SyntheticEventCtor.tag, SyntheticEventCtor !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase)) SyntheticEventCtor = null;
						} else reactName = null, SyntheticEventCtor = targetInst;
						if (reactName !== SyntheticEventCtor) {
							inCapturePhase = SyntheticMouseEvent;
							_instance = "onMouseLeave";
							reactEventName = "onMouseEnter";
							instance = "mouse";
							if ("pointerout" === domEventName || "pointerover" === domEventName) inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
							accumulateTargetOnly = null == reactName ? reactEventType : getNodeFromInstance(reactName);
							lastHostComponent = null == SyntheticEventCtor ? reactEventType : getNodeFromInstance(SyntheticEventCtor);
							reactEventType = new inCapturePhase(_instance, instance + "leave", reactName, nativeEvent, nativeEventTarget);
							reactEventType.target = accumulateTargetOnly;
							reactEventType.relatedTarget = lastHostComponent;
							_instance = null;
							getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(reactEventName, instance + "enter", SyntheticEventCtor, nativeEvent, nativeEventTarget), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
							accumulateTargetOnly = _instance;
							inCapturePhase = reactName && SyntheticEventCtor ? getLowestCommonAncestor(reactName, SyntheticEventCtor, getParent) : null;
							null !== reactName && accumulateEnterLeaveListenersForEvent(dispatchQueue, reactEventType, reactName, inCapturePhase, !1);
							null !== SyntheticEventCtor && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(dispatchQueue, accumulateTargetOnly, SyntheticEventCtor, inCapturePhase, !0);
						}
					}
				}
				a: {
					reactName = targetInst ? getNodeFromInstance(targetInst) : window;
					SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
					if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type) var getTargetInstFunc = getTargetInstForChangeEvent;
					else if (isTextInputElement(reactName)) if (isInputEventSupported) getTargetInstFunc = getTargetInstForInputOrChangeEvent;
					else {
						getTargetInstFunc = getTargetInstForInputEventPolyfill;
						var handleEventFunc = handleEventsForInputEventPolyfill;
					}
					else SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
					if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
						createAndAccumulateChangeEvent(dispatchQueue, getTargetInstFunc, nativeEvent, nativeEventTarget);
						break a;
					}
					handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
				}
				handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
				switch (domEventName) {
					case "focusin":
						if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable) activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
						break;
					case "focusout":
						lastSelection = activeElementInst = activeElement = null;
						break;
					case "mousedown":
						mouseDown = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						mouseDown = !1;
						constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
						break;
					case "selectionchange": if (skipSelectionChangeEvent) break;
					case "keydown":
					case "keyup": constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
				}
				var fallbackData;
				if (canUseCompositionEvent) b: {
					switch (domEventName) {
						case "compositionstart":
							var eventType = "onCompositionStart";
							break b;
						case "compositionend":
							eventType = "onCompositionEnd";
							break b;
						case "compositionupdate":
							eventType = "onCompositionUpdate";
							break b;
					}
					eventType = void 0;
				}
				else isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
				eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = !0)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: eventType,
					listeners: handleEventFunc
				}), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
				if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent)) eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: handleEventFunc,
					listeners: eventType
				}), handleEventFunc.data = fallbackData);
				extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
			}
			processDispatchQueue(dispatchQueue, eventSystemFlags);
		});
	}
	function createDispatchListener(instance, listener, currentTarget) {
		return {
			instance,
			listener,
			currentTarget
		};
	}
	function accumulateTwoPhaseListeners(targetFiber, reactName) {
		for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber;) {
			var _instance2 = targetFiber, stateNode = _instance2.stateNode;
			_instance2 = _instance2.tag;
			5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(createDispatchListener(targetFiber, _instance2, stateNode)), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(createDispatchListener(targetFiber, _instance2, stateNode)));
			if (3 === targetFiber.tag) return listeners;
			targetFiber = targetFiber.return;
		}
		return [];
	}
	function getParent(inst) {
		if (null === inst) return null;
		do
			inst = inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag);
		return inst ? inst : null;
	}
	function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
		for (var registrationName = event._reactName, listeners = []; null !== target && target !== common;) {
			var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
			_instance3 = _instance3.tag;
			if (null !== alternate && alternate === common) break;
			5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(createDispatchListener(target, stateNode, alternate))) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(createDispatchListener(target, stateNode, alternate))));
			target = target.return;
		}
		0 !== listeners.length && dispatchQueue.push({
			event,
			listeners
		});
	}
	var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
	var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
	function normalizeMarkupForTextOrAttribute(markup) {
		return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
	}
	function checkForUnmatchedText(serverText, clientText) {
		clientText = normalizeMarkupForTextOrAttribute(clientText);
		return normalizeMarkupForTextOrAttribute(serverText) === clientText ? !0 : !1;
	}
	function setProp(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "children":
				if ("string" === typeof value) "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value);
				else if ("number" === typeof value || "bigint" === typeof value) "body" !== tag && setTextContent(domElement, "" + value);
				else return;
				break;
			case "className":
				setValueForKnownAttribute(domElement, "class", value);
				break;
			case "tabIndex":
				setValueForKnownAttribute(domElement, "tabindex", value);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				setValueForKnownAttribute(domElement, key, value);
				break;
			case "style":
				setValueForStyles(domElement, value, prevValue);
				return;
			case "data": if ("object" !== tag) {
				setValueForKnownAttribute(domElement, "data", value);
				break;
			}
			case "src":
			case "href":
				if ("" === value && ("a" !== tag || "href" !== key)) {
					domElement.removeAttribute(key);
					break;
				}
				if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL(value);
				domElement.setAttribute(key, value);
				break;
			case "action":
			case "formAction":
				if ("function" === typeof value) {
					domElement.setAttribute(key, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(domElement, tag, "formEncType", props.formEncType, props, null), setProp(domElement, tag, "formMethod", props.formMethod, props, null), setProp(domElement, tag, "formTarget", props.formTarget, props, null)) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
				if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL(value);
				domElement.setAttribute(key, value);
				break;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				return;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				return;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				return;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						(null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
					}
				}
				break;
			case "multiple":
				domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "muted":
				domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
					domElement.removeAttribute("xlink:href");
					break;
				}
				key = sanitizeURL(value);
				domElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", key);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
				break;
			case "capture":
			case "download":
				!0 === value ? domElement.setAttribute(key, "") : !1 !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "rowSpan":
			case "start":
				null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
				break;
			case "popover":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				setValueForAttribute(domElement, "popover", value);
				break;
			case "xlinkActuate":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:actuate", value);
				break;
			case "xlinkArcrole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:arcrole", value);
				break;
			case "xlinkRole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:role", value);
				break;
			case "xlinkShow":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:show", value);
				break;
			case "xlinkTitle":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:title", value);
				break;
			case "xlinkType":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:type", value);
				break;
			case "xmlBase":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:base", value);
				break;
			case "xmlLang":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:lang", value);
				break;
			case "xmlSpace":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:space", value);
				break;
			case "is":
				setValueForAttribute(domElement, "is", value);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1]) key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
			else return;
		}
		viewTransitionMutationContext = !0;
	}
	function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "style":
				setValueForStyles(domElement, value, prevValue);
				return;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						(null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
					}
				}
				break;
			case "children":
				if ("string" === typeof value) setTextContent(domElement, value);
				else if ("number" === typeof value || "bigint" === typeof value) setTextContent(domElement, "" + value);
				else return;
				break;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				return;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				return;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!registrationNameDependencies.hasOwnProperty(key)) a: {
					if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), prevValue = key.slice(2, props ? key.length - 7 : void 0), tag = domElement[internalPropsKey] || null, tag = null != tag ? tag[key] : null, "function" === typeof tag && domElement.removeEventListener(prevValue, tag, props), "function" === typeof value)) {
						"function" !== typeof tag && null !== tag && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
						domElement.addEventListener(prevValue, value, props);
						break a;
					}
					viewTransitionMutationContext = !0;
					key in domElement ? domElement[key] = value : !0 === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
				}
				return;
		}
		viewTransitionMutationContext = !0;
	}
	function setInitialProperties(domElement, tag, props) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				var hasSrc = !1, hasSrcSet = !1, propKey;
				for (propKey in props) if (props.hasOwnProperty(propKey)) {
					var propValue = props[propKey];
					if (null != propValue) switch (propKey) {
						case "src":
							hasSrc = !0;
							break;
						case "srcSet":
							hasSrcSet = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
						default: setProp(domElement, tag, propKey, propValue, props, null);
					}
				}
				hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
				hasSrc && setProp(domElement, tag, "src", props.src, props, null);
				return;
			case "input":
				listenToNonDelegatedEvent("invalid", domElement);
				var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
				for (hasSrc in props) if (props.hasOwnProperty(hasSrc)) {
					var propValue$204 = props[hasSrc];
					if (null != propValue$204) switch (hasSrc) {
						case "name":
							hasSrcSet = propValue$204;
							break;
						case "type":
							propValue = propValue$204;
							break;
						case "checked":
							checked = propValue$204;
							break;
						case "defaultChecked":
							defaultChecked = propValue$204;
							break;
						case "value":
							propKey = propValue$204;
							break;
						case "defaultValue":
							defaultValue = propValue$204;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propValue$204) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: setProp(domElement, tag, hasSrc, propValue$204, props, null);
					}
				}
				initInput(domElement, propKey, defaultValue, checked, defaultChecked, propValue, hasSrcSet, !1);
				return;
			case "select":
				listenToNonDelegatedEvent("invalid", domElement);
				hasSrc = propValue = propKey = null;
				for (hasSrcSet in props) if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue)) switch (hasSrcSet) {
					case "value":
						propKey = defaultValue;
						break;
					case "defaultValue":
						propValue = defaultValue;
						break;
					case "multiple": hasSrc = defaultValue;
					default: setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
				}
				tag = propKey;
				props = propValue;
				domElement.multiple = !!hasSrc;
				null != tag ? updateOptions(domElement, !!hasSrc, tag, !1) : null != props && updateOptions(domElement, !!hasSrc, props, !0);
				return;
			case "textarea":
				listenToNonDelegatedEvent("invalid", domElement);
				propKey = hasSrcSet = hasSrc = null;
				for (propValue in props) if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue)) switch (propValue) {
					case "value":
						hasSrc = defaultValue;
						break;
					case "defaultValue":
						hasSrcSet = defaultValue;
						break;
					case "children":
						propKey = defaultValue;
						break;
					case "dangerouslySetInnerHTML":
						if (null != defaultValue) throw Error(formatProdErrorMessage(91));
						break;
					default: setProp(domElement, tag, propValue, defaultValue, props, null);
				}
				initTextarea(domElement, hasSrc, hasSrcSet, propKey);
				return;
			case "option":
				for (checked in props) if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc)) switch (checked) {
					case "selected":
						domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
						break;
					default: setProp(domElement, tag, checked, hasSrc, props, null);
				}
				return;
			case "dialog":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				listenToNonDelegatedEvent("cancel", domElement);
				listenToNonDelegatedEvent("close", domElement);
				break;
			case "iframe":
			case "object":
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "video":
			case "audio":
				for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++) listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
				break;
			case "image":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", domElement);
				break;
			case "embed":
			case "source":
			case "link": listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (defaultChecked in props) if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc)) switch (defaultChecked) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
					default: setProp(domElement, tag, defaultChecked, hasSrc, props, null);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (propValue$204 in props) props.hasOwnProperty(propValue$204) && (hasSrc = props[propValue$204], void 0 !== hasSrc && setPropOnCustomElement(domElement, tag, propValue$204, hasSrc, props, void 0));
				return;
			}
		}
		for (defaultValue in props) props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
	}
	var emptyProps = {};
	function updateProperties(domElement, tag, lastProps, nextProps) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
				for (propKey in lastProps) {
					var lastProp = lastProps[propKey];
					if (lastProps.hasOwnProperty(propKey) && null != lastProp) switch (propKey) {
						case "checked": break;
						case "value": break;
						case "defaultValue": lastDefaultValue = lastProp;
						default: nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
					}
				}
				for (var propKey$221 in nextProps) {
					var propKey = nextProps[propKey$221];
					lastProp = lastProps[propKey$221];
					if (nextProps.hasOwnProperty(propKey$221) && (null != propKey || null != lastProp)) switch (propKey$221) {
						case "type":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							type = propKey;
							break;
						case "name":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							name = propKey;
							break;
						case "checked":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							checked = propKey;
							break;
						case "defaultChecked":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							defaultChecked = propKey;
							break;
						case "value":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							value = propKey;
							break;
						case "defaultValue":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							defaultValue = propKey;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propKey) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: propKey !== lastProp && setProp(domElement, tag, propKey$221, propKey, nextProps, lastProp);
					}
				}
				updateInput(domElement, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name);
				return;
			case "select":
				propKey = value = defaultValue = propKey$221 = null;
				for (type in lastProps) if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue) switch (type) {
					case "value": break;
					case "multiple": propKey = lastDefaultValue;
					default: nextProps.hasOwnProperty(type) || setProp(domElement, tag, type, null, nextProps, lastDefaultValue);
				}
				for (name in nextProps) if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue)) switch (name) {
					case "value":
						type !== lastDefaultValue && (viewTransitionMutationContext = !0);
						propKey$221 = type;
						break;
					case "defaultValue":
						type !== lastDefaultValue && (viewTransitionMutationContext = !0);
						defaultValue = type;
						break;
					case "multiple": type !== lastDefaultValue && (viewTransitionMutationContext = !0), value = type;
					default: type !== lastDefaultValue && setProp(domElement, tag, name, type, nextProps, lastDefaultValue);
				}
				tag = defaultValue;
				lastProps = value;
				nextProps = propKey;
				null != propKey$221 ? updateOptions(domElement, !!lastProps, propKey$221, !1) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, !0) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", !1));
				return;
			case "textarea":
				propKey = propKey$221 = null;
				for (defaultValue in lastProps) if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue)) switch (defaultValue) {
					case "value": break;
					case "children": break;
					default: setProp(domElement, tag, defaultValue, null, nextProps, name);
				}
				for (value in nextProps) if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type)) switch (value) {
					case "value":
						name !== type && (viewTransitionMutationContext = !0);
						propKey$221 = name;
						break;
					case "defaultValue":
						name !== type && (viewTransitionMutationContext = !0);
						propKey = name;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (null != name) throw Error(formatProdErrorMessage(91));
						break;
					default: name !== type && setProp(domElement, tag, value, name, nextProps, type);
				}
				updateTextarea(domElement, propKey$221, propKey);
				return;
			case "option":
				for (var propKey$237 in lastProps) if (propKey$221 = lastProps[propKey$237], lastProps.hasOwnProperty(propKey$237) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$237)) switch (propKey$237) {
					case "selected":
						domElement.selected = !1;
						break;
					default: setProp(domElement, tag, propKey$237, null, nextProps, propKey$221);
				}
				for (lastDefaultValue in nextProps) if (propKey$221 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$221 !== propKey && (null != propKey$221 || null != propKey)) switch (lastDefaultValue) {
					case "selected":
						propKey$221 !== propKey && (viewTransitionMutationContext = !0);
						domElement.selected = propKey$221 && "function" !== typeof propKey$221 && "symbol" !== typeof propKey$221;
						break;
					default: setProp(domElement, tag, lastDefaultValue, propKey$221, nextProps, propKey);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var propKey$242 in lastProps) propKey$221 = lastProps[propKey$242], lastProps.hasOwnProperty(propKey$242) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$242) && setProp(domElement, tag, propKey$242, null, nextProps, propKey$221);
				for (checked in nextProps) if (propKey$221 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$221 !== propKey && (null != propKey$221 || null != propKey)) switch (checked) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (null != propKey$221) throw Error(formatProdErrorMessage(137, tag));
						break;
					default: setProp(domElement, tag, checked, propKey$221, nextProps, propKey);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (var propKey$247 in lastProps) propKey$221 = lastProps[propKey$247], lastProps.hasOwnProperty(propKey$247) && void 0 !== propKey$221 && !nextProps.hasOwnProperty(propKey$247) && setPropOnCustomElement(domElement, tag, propKey$247, void 0, nextProps, propKey$221);
				for (defaultChecked in nextProps) propKey$221 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$221 === propKey || void 0 === propKey$221 && void 0 === propKey || setPropOnCustomElement(domElement, tag, defaultChecked, propKey$221, nextProps, propKey);
				return;
			}
		}
		for (var propKey$252 in lastProps) propKey$221 = lastProps[propKey$252], lastProps.hasOwnProperty(propKey$252) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$252) && setProp(domElement, tag, propKey$252, null, nextProps, propKey$221);
		for (lastProp in nextProps) propKey$221 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$221 === propKey || null == propKey$221 && null == propKey || setProp(domElement, tag, lastProp, propKey$221, nextProps, propKey);
	}
	function isLikelyStaticResource(initiatorType) {
		switch (initiatorType) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function estimateBandwidth() {
		if ("function" === typeof performance.getEntriesByType) {
			for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
				var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
				if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
					initiatorType = 0;
					duration = entry.responseEnd;
					for (i += 1; i < resourceEntries.length; i++) {
						var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
						if (overlapStartTime > duration) break;
						var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
						overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
					}
					--i;
					bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
					count++;
					if (10 < count) break;
				}
			}
			if (0 < count) return bits / count / 1e6;
		}
		return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
	}
	var eventsEnabled = null;
	var selectionInformation = null;
	function getOwnerDocumentFromRootContainer(rootContainerElement) {
		return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
	}
	function getOwnHostContext(namespaceURI) {
		switch (namespaceURI) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function getChildHostContextProd(parentNamespace, type) {
		if (0 === parentNamespace) switch (type) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
	}
	function createHoistableInstance(type, props, rootContainerInstance, internalInstanceHandle) {
		rootContainerInstance = getOwnerDocumentFromRootContainer(rootContainerInstance).createElement(type);
		rootContainerInstance[internalInstanceKey] = internalInstanceHandle;
		rootContainerInstance[internalPropsKey] = props;
		setInitialProperties(rootContainerInstance, type, props);
		markNodeAsHoistable(rootContainerInstance);
		return rootContainerInstance;
	}
	function shouldSetTextContent(type, props) {
		return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
	}
	var currentPopstateTransitionEvent = null;
	function shouldAttemptEagerTransition() {
		var event = window.event;
		if (event && "popstate" === event.type) {
			if (event === currentPopstateTransitionEvent) return !1;
			currentPopstateTransitionEvent = event;
			return !0;
		}
		currentPopstateTransitionEvent = null;
		return !1;
	}
	var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0;
	var cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0;
	var localPromise = "function" === typeof Promise ? Promise : void 0;
	var localRequestAnimationFrame = "function" === typeof requestAnimationFrame ? requestAnimationFrame : scheduleTimeout;
	var scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
		return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
	} : scheduleTimeout;
	function handleErrorInNextTick(error) {
		setTimeout(function() {
			throw error;
		});
	}
	function isSingletonScope(type) {
		return "head" === type;
	}
	function clearHydrationBoundary(parentInstance, hydrationInstance) {
		var node = hydrationInstance, depth = 0;
		do {
			var nextNode = node.nextSibling;
			parentInstance.removeChild(node);
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node || "/&" === node) {
				if (0 === depth) {
					parentInstance.removeChild(nextNode);
					retryIfBlockedOn(hydrationInstance);
					return;
				}
				depth--;
			} else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node) depth++;
			else if ("html" === node) clearSingletonPreambleContribution(parentInstance.ownerDocument.documentElement);
			else if ("head" === node) {
				node = parentInstance.ownerDocument.head;
				clearSingletonPreambleContribution(node);
				for (var node$jscomp$0 = node.firstChild; node$jscomp$0;) {
					var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
					node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
					node$jscomp$0 = nextNode$jscomp$0;
				}
			} else "body" === node && clearSingletonPreambleContribution(parentInstance.ownerDocument.body);
			node = nextNode;
		} while (node);
		retryIfBlockedOn(hydrationInstance);
	}
	function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
		var node = suspenseInstance;
		suspenseInstance = 0;
		do {
			var nextNode = node.nextSibling;
			1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node) if (0 === suspenseInstance) break;
			else suspenseInstance--;
			else "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
			node = nextNode;
		} while (node);
	}
	function applyViewTransitionName(instance, name, className) {
		name = CSS.escape(name) !== name ? "r-" + btoa(name).replace(/=/g, "") : name;
		instance.style.viewTransitionName = name;
		null != className && (instance.style.viewTransitionClass = className);
		className = getComputedStyle(instance);
		if ("inline" === className.display) {
			name = instance.getClientRects();
			if (1 === name.length) var JSCompiler_inline_result = 1;
			else for (var i = JSCompiler_inline_result = 0; i < name.length; i++) {
				var rect = name[i];
				0 < rect.width && 0 < rect.height && JSCompiler_inline_result++;
			}
			1 === JSCompiler_inline_result && (instance = instance.style, instance.display = 1 === name.length ? "inline-block" : "block", instance.marginTop = "-" + className.paddingTop, instance.marginBottom = "-" + className.paddingBottom);
		}
	}
	function restoreViewTransitionName(instance, props) {
		instance = instance.style;
		props = props.style;
		var viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionName") ? props.viewTransitionName : props.hasOwnProperty("view-transition-name") ? props["view-transition-name"] : null : null;
		instance.viewTransitionName = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
		viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionClass") ? props.viewTransitionClass : props.hasOwnProperty("view-transition-class") ? props["view-transition-class"] : null : null;
		instance.viewTransitionClass = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
		"inline-block" === instance.display && (null == props ? instance.display = instance.margin = "" : (viewTransitionName = props.display, instance.display = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, viewTransitionName = props.margin, null != viewTransitionName ? instance.margin = viewTransitionName : (viewTransitionName = props.hasOwnProperty("marginTop") ? props.marginTop : props["margin-top"], instance.marginTop = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, props = props.hasOwnProperty("marginBottom") ? props.marginBottom : props["margin-bottom"], instance.marginBottom = null == props || "boolean" === typeof props ? "" : props)));
	}
	function createMeasurement(rect, computedStyle, element) {
		element = element.ownerDocument.defaultView;
		return {
			rect,
			abs: "absolute" === computedStyle.position || "fixed" === computedStyle.position,
			clip: "none" !== computedStyle.clipPath || "visible" !== computedStyle.overflow || "none" !== computedStyle.filter || "none" !== computedStyle.mask || "none" !== computedStyle.mask || "0px" !== computedStyle.borderRadius,
			view: 0 <= rect.bottom && 0 <= rect.right && rect.top <= element.innerHeight && rect.left <= element.innerWidth
		};
	}
	function measureInstance(instance) {
		return createMeasurement(instance.getBoundingClientRect(), getComputedStyle(instance), instance);
	}
	function measureClonedInstance(instance) {
		var measuredRect = instance.getBoundingClientRect();
		measuredRect = new DOMRect(measuredRect.x + 2e4, measuredRect.y + 2e4, measuredRect.width, measuredRect.height);
		var computedStyle = getComputedStyle(instance);
		return createMeasurement(measuredRect, computedStyle, instance);
	}
	function forceLayout(ownerDocument) {
		return ownerDocument.documentElement.clientHeight;
	}
	function waitForImageToLoad(resolve) {
		this.addEventListener("load", resolve);
		this.addEventListener("error", resolve);
	}
	function startViewTransition(suspendedState, rootContainer, transitionTypes, mutationCallback, layoutCallback, afterMutationCallback, spawnedWorkCallback, passiveCallback, errorCallback) {
		var ownerDocument = 9 === rootContainer.nodeType ? rootContainer : rootContainer.ownerDocument;
		try {
			var transition = ownerDocument.startViewTransition({
				update: function() {
					var ownerWindow = ownerDocument.defaultView, pendingNavigation = ownerWindow.navigation && ownerWindow.navigation.transition, previousFontLoadingStatus = ownerDocument.fonts.status;
					mutationCallback();
					var blockingPromises = [];
					"loaded" === previousFontLoadingStatus && (forceLayout(ownerDocument), "loading" === ownerDocument.fonts.status && blockingPromises.push(ownerDocument.fonts.ready));
					previousFontLoadingStatus = blockingPromises.length;
					if (null !== suspendedState) for (var suspenseyImages = suspendedState.suspenseyImages, imgBytes = 0, i = 0; i < suspenseyImages.length; i++) {
						var suspenseyImage = suspenseyImages[i];
						if (!suspenseyImage.complete) {
							var rect = suspenseyImage.getBoundingClientRect();
							if (0 < rect.bottom && 0 < rect.right && rect.top < ownerWindow.innerHeight && rect.left < ownerWindow.innerWidth) {
								imgBytes += estimateImageBytes(suspenseyImage);
								if (imgBytes > estimatedBytesWithinLimit) {
									blockingPromises.length = previousFontLoadingStatus;
									break;
								}
								suspenseyImage = new Promise(waitForImageToLoad.bind(suspenseyImage));
								blockingPromises.push(suspenseyImage);
							}
						}
					}
					if (0 < blockingPromises.length) return ownerWindow = Promise.race([Promise.all(blockingPromises), new Promise(function(resolve) {
						return setTimeout(resolve, 500);
					})]).then(layoutCallback, layoutCallback), (pendingNavigation ? Promise.allSettled([pendingNavigation.finished, ownerWindow]) : ownerWindow).then(afterMutationCallback, afterMutationCallback);
					layoutCallback();
					if (pendingNavigation) return pendingNavigation.finished.then(afterMutationCallback, afterMutationCallback);
					afterMutationCallback();
				},
				types: transitionTypes
			});
			ownerDocument.__reactViewTransition = transition;
			var viewTransitionAnimations = [];
			transition.ready.then(function() {
				for (var animations = ownerDocument.documentElement.getAnimations({ subtree: !0 }), i = 0; i < animations.length; i++) {
					var animation = animations[i], effect = animation.effect, pseudoElement = effect.pseudoElement;
					if (null != pseudoElement && pseudoElement.startsWith("::view-transition")) {
						viewTransitionAnimations.push(animation);
						animation = effect.getKeyframes();
						for (var height = pseudoElement = void 0, unchangedDimensions = !0, j = 0; j < animation.length; j++) {
							var keyframe = animation[j], w = keyframe.width;
							if (void 0 === pseudoElement) pseudoElement = w;
							else if (pseudoElement !== w) {
								unchangedDimensions = !1;
								break;
							}
							w = keyframe.height;
							if (void 0 === height) height = w;
							else if (height !== w) {
								unchangedDimensions = !1;
								break;
							}
							delete keyframe.width;
							delete keyframe.height;
							"none" === keyframe.transform && delete keyframe.transform;
						}
						unchangedDimensions && void 0 !== pseudoElement && void 0 !== height && (effect.setKeyframes(animation), unchangedDimensions = getComputedStyle(effect.target, effect.pseudoElement), unchangedDimensions.width !== pseudoElement || unchangedDimensions.height !== height) && (unchangedDimensions = animation[0], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, unchangedDimensions = animation[animation.length - 1], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, effect.setKeyframes(animation));
					}
				}
				spawnedWorkCallback();
			}, function(error) {
				ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
				try {
					if ("object" === typeof error && null !== error) switch (error.name) {
						case "InvalidStateError": if ("View transition was skipped because document visibility state is hidden." === error.message || "Skipping view transition because document visibility state has become hidden." === error.message || "Skipping view transition because viewport size changed." === error.message || "Transition was aborted because of invalid state" === error.message) error = null;
					}
					null !== error && errorCallback(error);
				} finally {
					mutationCallback(), layoutCallback(), spawnedWorkCallback();
				}
			});
			transition.finished.finally(function() {
				for (var i = 0; i < viewTransitionAnimations.length; i++) viewTransitionAnimations[i].cancel();
				ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
				passiveCallback();
			});
			return transition;
		} catch (x) {
			return mutationCallback(), layoutCallback(), spawnedWorkCallback(), null;
		}
	}
	function ViewTransitionPseudoElement(pseudo, name) {
		this._scope = document.documentElement;
		this._selector = "::view-transition-" + pseudo + "(" + name + ")";
	}
	ViewTransitionPseudoElement.prototype.animate = function(keyframes, options) {
		options = "number" === typeof options ? { duration: options } : assign({}, options);
		options.pseudoElement = this._selector;
		return this._scope.animate(keyframes, options);
	};
	ViewTransitionPseudoElement.prototype.getAnimations = function() {
		for (var scope = this._scope, selector = this._selector, animations = scope.getAnimations({ subtree: !0 }), result = [], i = 0; i < animations.length; i++) {
			var effect = animations[i].effect;
			null !== effect && effect.target === scope && effect.pseudoElement === selector && result.push(animations[i]);
		}
		return result;
	};
	ViewTransitionPseudoElement.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function createViewTransitionInstance(name) {
		return {
			name,
			group: new ViewTransitionPseudoElement("group", name),
			imagePair: new ViewTransitionPseudoElement("image-pair", name),
			old: new ViewTransitionPseudoElement("old", name),
			new: new ViewTransitionPseudoElement("new", name)
		};
	}
	function FragmentInstance(fragmentFiber) {
		this._fragmentFiber = fragmentFiber;
		this._observers = this._eventListeners = null;
	}
	FragmentInstance.prototype.addEventListener = function(type, listener, optionsOrUseCapture) {
		var signal = null, cleanup = null;
		if (null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && (signal = optionsOrUseCapture.signal || null, null !== signal && signal.aborted)) return;
		null === this._eventListeners && (this._eventListeners = []);
		var listeners = this._eventListeners;
		if (-1 === indexOfEventListener(listeners, type, listener, optionsOrUseCapture)) {
			var fragmentInstance = this, attachedListener = listener;
			null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && !0 === optionsOrUseCapture.once && (attachedListener = function(event) {
				fragmentInstance.removeEventListener(type, listener, optionsOrUseCapture);
				"function" === typeof listener ? listener.call(this, event) : listener.handleEvent(event);
			});
			null !== signal && (cleanup = fragmentInstance.removeEventListener.bind(fragmentInstance, type, listener, optionsOrUseCapture), signal.addEventListener("abort", cleanup, { once: !0 }), cleanup = signal.removeEventListener.bind(signal, "abort", cleanup));
			signal = getAttachOptions(optionsOrUseCapture);
			listeners.push({
				type,
				listener,
				optionsOrUseCapture,
				attachedListener,
				cleanup
			});
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, addEventListenerToChild, type, attachedListener, signal);
		}
		this._eventListeners = listeners;
	};
	function addEventListenerToChild(child, type, listener, optionsOrUseCapture) {
		getInstanceFromHostFiber(child).addEventListener(type, listener, optionsOrUseCapture);
		return !1;
	}
	FragmentInstance.prototype.removeEventListener = function(type, listener, optionsOrUseCapture) {
		var listeners = this._eventListeners;
		if (null !== listeners && (listener = indexOfEventListener(listeners, type, listener, optionsOrUseCapture), -1 !== listener)) {
			var _listeners$index = listeners[listener];
			optionsOrUseCapture = _listeners$index.attachedListener;
			var cleanup = _listeners$index.cleanup;
			_listeners$index = getAttachOptions(_listeners$index.optionsOrUseCapture);
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, removeEventListenerFromChild, type, optionsOrUseCapture, _listeners$index);
			listeners.splice(listener, 1);
			null !== cleanup && cleanup();
		}
	};
	function removeEventListenerFromChild(child, type, listener, optionsOrUseCapture) {
		getInstanceFromHostFiber(child).removeEventListener(type, listener, optionsOrUseCapture);
		return !1;
	}
	function getAttachOptions(opts) {
		return null != opts && "boolean" !== typeof opts && (!0 === opts.once || opts.signal instanceof AbortSignal) ? {
			capture: opts.capture,
			passive: opts.passive
		} : opts;
	}
	function normalizeListenerOptions(opts) {
		return null == opts ? "c=0" : "boolean" === typeof opts ? "c=" + (opts ? "1" : "0") : "c=" + (opts.capture ? "1" : "0");
	}
	function indexOfEventListener(eventListeners, type, listener, optionsOrUseCapture) {
		if (0 === eventListeners.length) return -1;
		optionsOrUseCapture = normalizeListenerOptions(optionsOrUseCapture);
		for (var i = 0; i < eventListeners.length; i++) {
			var item = eventListeners[i];
			if (item.type === type && item.listener === listener && normalizeListenerOptions(item.optionsOrUseCapture) === optionsOrUseCapture) return i;
		}
		return -1;
	}
	FragmentInstance.prototype.dispatchEvent = function(event) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		if (null === parentHostFiber) return !0;
		parentHostFiber = getInstanceFromHostFiber(parentHostFiber);
		var eventListeners = this._eventListeners;
		if (null !== eventListeners && 0 < eventListeners.length || !event.bubbles) {
			var temp = 9 === parentHostFiber.nodeType ? parentHostFiber.createComment("") : document.createTextNode("");
			if (eventListeners) for (var i = 0; i < eventListeners.length; i++) {
				var _eventListeners$i = eventListeners[i];
				temp.addEventListener(_eventListeners$i.type, _eventListeners$i.attachedListener, getAttachOptions(_eventListeners$i.optionsOrUseCapture));
			}
			parentHostFiber.appendChild(temp);
			event = temp.dispatchEvent(event);
			if (eventListeners) for (i = 0; i < eventListeners.length; i++) _eventListeners$i = eventListeners[i], temp.removeEventListener(_eventListeners$i.type, _eventListeners$i.attachedListener, getAttachOptions(_eventListeners$i.optionsOrUseCapture));
			parentHostFiber.removeChild(temp);
			return event;
		}
		return parentHostFiber.dispatchEvent(event);
	};
	FragmentInstance.prototype.focus = function(focusOptions) {
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !0, setFocusOnFiberIfFocusable, focusOptions, void 0, void 0);
	};
	function setFocusOnFiberIfFocusable(fiber, focusOptions) {
		if (6 === fiber.tag) return !1;
		fiber = getInstanceFromHostFiber(fiber);
		return setFocusIfFocusable(fiber, focusOptions);
	}
	FragmentInstance.prototype.focusLast = function(focusOptions) {
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !0, collectChildren, children, void 0, void 0);
		for (var i = children.length - 1; 0 <= i && !setFocusOnFiberIfFocusable(children[i], focusOptions); i--);
	};
	function collectChildren(child, collection) {
		collection.push(child);
		return !1;
	}
	FragmentInstance.prototype.blur = function() {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		null !== parentHostFiber && (parentHostFiber = getInstanceFromHostFiber(parentHostFiber), parentHostFiber = getOwnerDocumentFromRootContainer(parentHostFiber).activeElement, null !== parentHostFiber && traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, blurActiveElementWithinFragment, parentHostFiber, void 0, void 0));
	};
	function blurActiveElementWithinFragment(child, activeElement) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		return child === activeElement || child.contains(activeElement) ? (activeElement.blur(), !0) : !1;
	}
	FragmentInstance.prototype.observeUsing = function(observer) {
		null === this._observers && (this._observers = /* @__PURE__ */ new Set());
		this._observers.add(observer);
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, observeChild, observer, void 0, void 0);
	};
	function observeChild(child, observer) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		observer.observe(child);
		return !1;
	}
	FragmentInstance.prototype.unobserveUsing = function(observer) {
		var observers = this._observers;
		if (null !== observers && observers.has(observer)) {
			observers.delete(observer);
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, unobserveChild, observer, void 0, void 0);
			for (var i = observers = 0; i < pendingIntersectionUnobserves.length; i++) {
				var pending = pendingIntersectionUnobserves[i];
				pending.fragmentInstance === this && pending.observer === observer ? observer.unobserve(pending.instance) : pendingIntersectionUnobserves[observers++] = pending;
			}
			pendingIntersectionUnobserves.length = observers;
		}
	};
	function unobserveChild(child, observer) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		observer.unobserve(child);
		return !1;
	}
	var pendingIntersectionUnobserves = [];
	var intersectionUnobserveScheduled = !1;
	function schedulePendingIntersectionUnobserve(fragmentInstance, observer, instance) {
		pendingIntersectionUnobserves.push({
			fragmentInstance,
			observer,
			instance
		});
		intersectionUnobserveScheduled || (intersectionUnobserveScheduled = !0, requestPostPaintCallback(function() {
			intersectionUnobserveScheduled = !1;
			var pending = pendingIntersectionUnobserves;
			pendingIntersectionUnobserves = [];
			for (var i = 0; i < pending.length; i++) {
				var item = pending[i];
				item.observer.unobserve(item.instance);
			}
		}));
	}
	FragmentInstance.prototype.getClientRects = function() {
		var rects = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectClientRects, rects, void 0, void 0);
		return rects;
	};
	function collectClientRects(child, rects) {
		if (6 === child.tag) {
			child = child.stateNode;
			var range = child.ownerDocument.createRange();
			range.selectNodeContents(child);
			rects.push.apply(rects, range.getClientRects());
		} else child = getInstanceFromHostFiber(child), rects.push.apply(rects, child.getClientRects());
		return !1;
	}
	FragmentInstance.prototype.getRootNode = function(getRootNodeOptions) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		return null === parentHostFiber ? this : getInstanceFromHostFiber(parentHostFiber).getRootNode(getRootNodeOptions);
	};
	FragmentInstance.prototype.compareDocumentPosition = function(otherNode) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		if (null === parentHostFiber) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectChildren, children, void 0, void 0);
		var parentHostInstance = getInstanceFromHostFiber(parentHostFiber);
		if (0 === children.length) {
			children = parentHostInstance;
			if (fiberIsPortaledIntoHost(this._fragmentFiber)) {
				a: {
					for (parentHostFiber = this._fragmentFiber.return; null !== parentHostFiber;) {
						if (4 === parentHostFiber.tag) {
							parentHostFiber = parentHostFiber.stateNode.containerInfo;
							break a;
						}
						if (3 === parentHostFiber.tag || 5 === parentHostFiber.tag || 27 === parentHostFiber.tag) break;
						parentHostFiber = parentHostFiber.return;
					}
					parentHostFiber = null;
				}
				null != parentHostFiber && (children = parentHostFiber);
			}
			parentHostFiber = this._fragmentFiber;
			var result = parentHostInstance = children.compareDocumentPosition(otherNode);
			children === otherNode ? result = Node.DOCUMENT_POSITION_CONTAINS : parentHostInstance & Node.DOCUMENT_POSITION_CONTAINED_BY && (children = getFragmentInstanceOrTextInstanceSiblings(parentHostFiber)[1], null === children ? result = Node.DOCUMENT_POSITION_PRECEDING : (otherNode = getInstanceFromHostFiber(children).compareDocumentPosition(otherNode), result = 0 === otherNode || otherNode & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING));
			return result |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		parentHostFiber = getInstanceFromHostFiber(children[0]);
		result = getInstanceFromHostFiber(children[children.length - 1]);
		var parentHostInstanceFromDOM = fiberIsPortaledIntoHost(this._fragmentFiber) ? parentHostFiber.parentElement : parentHostInstance;
		if (null == parentHostInstanceFromDOM) return Node.DOCUMENT_POSITION_DISCONNECTED;
		parentHostInstance = parentHostInstanceFromDOM.compareDocumentPosition(parentHostFiber) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		parentHostInstanceFromDOM = parentHostInstanceFromDOM.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var firstResult = parentHostFiber.compareDocumentPosition(otherNode), lastResult = result.compareDocumentPosition(otherNode), otherNodeIsWithinFirstOrLastChild = firstResult & Node.DOCUMENT_POSITION_CONTAINED_BY || lastResult & Node.DOCUMENT_POSITION_CONTAINED_BY;
		lastResult = parentHostInstance && parentHostInstanceFromDOM && firstResult & Node.DOCUMENT_POSITION_FOLLOWING && lastResult & Node.DOCUMENT_POSITION_PRECEDING;
		parentHostFiber = parentHostInstance && parentHostFiber === otherNode || parentHostInstanceFromDOM && result === otherNode || otherNodeIsWithinFirstOrLastChild || lastResult ? Node.DOCUMENT_POSITION_CONTAINED_BY : !parentHostInstance && parentHostFiber === otherNode || !parentHostInstanceFromDOM && result === otherNode ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : firstResult;
		return parentHostFiber & Node.DOCUMENT_POSITION_DISCONNECTED || parentHostFiber & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || validateDocumentPositionWithFiberTree(parentHostFiber, this._fragmentFiber, children[0], children[children.length - 1], otherNode) ? parentHostFiber : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function validateDocumentPositionWithFiberTree(documentPosition, fragmentFiber, precedingBoundaryFiber, followingBoundaryFiber, otherNode) {
		var otherFiber = getClosestInstanceFromNode(otherNode);
		if (documentPosition & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (precedingBoundaryFiber = !!otherFiber) a: {
				for (; null !== otherFiber;) {
					if (7 === otherFiber.tag && (otherFiber === fragmentFiber || otherFiber.alternate === fragmentFiber)) {
						precedingBoundaryFiber = !0;
						break a;
					}
					otherFiber = otherFiber.return;
				}
				precedingBoundaryFiber = !1;
			}
			return precedingBoundaryFiber;
		}
		if (documentPosition & Node.DOCUMENT_POSITION_CONTAINS) {
			if (null === otherFiber) return otherFiber = otherNode.ownerDocument, otherNode === otherFiber || otherNode === otherFiber.documentElement || otherNode === otherFiber.body;
			a: {
				otherFiber = fragmentFiber;
				for (fragmentFiber = getFragmentParentInstanceOrContainerFiber(fragmentFiber); null !== otherFiber;) {
					if (!(5 !== otherFiber.tag && 3 !== otherFiber.tag && 27 !== otherFiber.tag || otherFiber !== fragmentFiber && otherFiber.alternate !== fragmentFiber)) {
						otherFiber = !0;
						break a;
					}
					otherFiber = otherFiber.return;
				}
				otherFiber = !1;
			}
			return otherFiber;
		}
		return documentPosition & Node.DOCUMENT_POSITION_PRECEDING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === precedingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(precedingBoundaryFiber, otherFiber, getParentForFragmentAncestors), null === fragmentFiber ? fragmentFiber = !1 : (traverseVisibleInstancesAndTextInstances(fragmentFiber, !0, isFiberPrecedingCheck, otherFiber, precedingBoundaryFiber), otherFiber = searchTarget, searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === followingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(followingBoundaryFiber, otherFiber, getParentForFragmentAncestors), null === fragmentFiber ? fragmentFiber = !1 : (traverseVisibleInstancesAndTextInstances(fragmentFiber, !0, isFiberFollowingCheck, otherFiber, followingBoundaryFiber), otherFiber = searchTarget, searchBoundary = searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : !1;
	}
	function scrollTextNodeIntoView(textNode, resolvedAlignToTop) {
		var range = textNode.ownerDocument.createRange();
		range.selectNodeContents(textNode);
		textNode = range.getBoundingClientRect();
		window.scrollTo(window.scrollX + textNode.left, resolvedAlignToTop ? window.scrollY + textNode.top : window.scrollY + textNode.bottom - window.innerHeight);
	}
	FragmentInstance.prototype.scrollIntoView = function(alignToTop) {
		if ("object" === typeof alignToTop) throw Error(formatProdErrorMessage(566));
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectChildren, children, void 0, void 0);
		var resolvedAlignToTop = !1 !== alignToTop;
		if (0 === children.length) {
			var hostSiblings = getFragmentInstanceOrTextInstanceSiblings(this._fragmentFiber);
			hostSiblings = resolvedAlignToTop ? hostSiblings[1] || hostSiblings[0] || getFragmentParentInstanceOrContainerFiber(this._fragmentFiber) : hostSiblings[0] || hostSiblings[1];
			if (null === hostSiblings) return;
			if (6 === hostSiblings.tag) {
				alignToTop = getInstanceFromHostFiber(hostSiblings);
				scrollTextNodeIntoView(alignToTop, resolvedAlignToTop);
				return;
			}
			hostSiblings = getInstanceFromHostFiber(hostSiblings);
			if (9 !== hostSiblings.nodeType) {
				if (11 === hostSiblings.nodeType) {
					resolvedAlignToTop = "host" in hostSiblings ? hostSiblings.host : null;
					null !== resolvedAlignToTop && resolvedAlignToTop.scrollIntoView(alignToTop);
					return;
				}
				hostSiblings.scrollIntoView(alignToTop);
			}
		}
		for (hostSiblings = resolvedAlignToTop ? children.length - 1 : 0; hostSiblings !== (resolvedAlignToTop ? -1 : children.length);) {
			var child = children[hostSiblings];
			6 === child.tag ? (child = getInstanceFromHostFiber(child), scrollTextNodeIntoView(child, resolvedAlignToTop)) : getInstanceFromHostFiber(child).scrollIntoView(alignToTop);
			hostSiblings += resolvedAlignToTop ? -1 : 1;
		}
	};
	function addFragmentHandleToFiber(child, fragmentInstance) {
		child = getInstanceFromHostFiber(child);
		addFragmentHandleToInstance(child, fragmentInstance);
		return !1;
	}
	function addFragmentHandleToInstance(instance, fragmentInstance) {
		instance.reactFragments ??= /* @__PURE__ */ new Set();
		instance.reactFragments.add(fragmentInstance);
	}
	function commitNewChildToFragmentInstance(childInstance, fragmentInstance) {
		var eventListeners = fragmentInstance._eventListeners;
		if (null !== eventListeners) for (var i$jscomp$0 = 0; i$jscomp$0 < eventListeners.length; i$jscomp$0++) {
			var _eventListeners$i3 = eventListeners[i$jscomp$0];
			childInstance.addEventListener(_eventListeners$i3.type, _eventListeners$i3.attachedListener, getAttachOptions(_eventListeners$i3.optionsOrUseCapture));
		}
		3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
			for (var writeIdx = 0, i = 0; i < pendingIntersectionUnobserves.length; i++) {
				var pending = pendingIntersectionUnobserves[i];
				if (pending.fragmentInstance !== fragmentInstance || pending.observer !== observer || pending.instance !== childInstance) pendingIntersectionUnobserves[writeIdx++] = pending;
			}
			pendingIntersectionUnobserves.length = writeIdx;
			observer.observe(childInstance);
		}), addFragmentHandleToInstance(childInstance, fragmentInstance));
	}
	function deleteChildFromFragmentInstance(childInstance, fragmentInstance) {
		var eventListeners = fragmentInstance._eventListeners;
		if (null !== eventListeners) for (var i = 0; i < eventListeners.length; i++) {
			var _eventListeners$i4 = eventListeners[i];
			childInstance.removeEventListener(_eventListeners$i4.type, _eventListeners$i4.attachedListener, getAttachOptions(_eventListeners$i4.optionsOrUseCapture));
		}
		3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
			"string" === typeof observer.rootMargin ? schedulePendingIntersectionUnobserve(fragmentInstance, observer, childInstance) : observer.unobserve(childInstance);
		}), null != childInstance.reactFragments && childInstance.reactFragments.delete(fragmentInstance));
	}
	function clearContainerSparingly(container) {
		var nextNode = container.firstChild;
		nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
		for (; nextNode;) {
			var node = nextNode;
			nextNode = nextNode.nextSibling;
			switch (node.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					clearContainerSparingly(node);
					detachDeletedInstance(node);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if ("stylesheet" === node.rel.toLowerCase()) continue;
			}
			container.removeChild(node);
		}
	}
	function canHydrateInstance(instance, type, props, inRootOrSingleton) {
		for (; 1 === instance.nodeType;) {
			var anyProps = props;
			if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
				if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type)) break;
			} else if (!inRootOrSingleton) if ("input" === type && "hidden" === instance.type) {
				var name = null == anyProps.name ? null : "" + anyProps.name;
				if ("hidden" === anyProps.type && instance.getAttribute("name") === name) return instance;
			} else return instance;
			else if (!instance[internalHoistableMarker]) switch (type) {
				case "meta":
					if (!instance.hasAttribute("itemprop")) break;
					return instance;
				case "link":
					name = instance.getAttribute("rel");
					if ("stylesheet" === name && instance.hasAttribute("data-precedence")) break;
					else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title)) break;
					return instance;
				case "style":
					if (instance.hasAttribute("data-precedence")) break;
					return instance;
				case "script":
					name = instance.getAttribute("src");
					if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop")) break;
					return instance;
				default: return instance;
			}
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) break;
		}
		return null;
	}
	function canHydrateTextInstance(instance, text, inRootOrSingleton) {
		if ("" === text) return null;
		for (; 3 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
		for (; 8 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function isSuspenseInstancePending(instance) {
		return "$?" === instance.data || "$~" === instance.data;
	}
	function isSuspenseInstanceFallback(instance) {
		return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
	}
	function registerSuspenseInstanceRetry(instance, callback) {
		var ownerDocument = instance.ownerDocument;
		if ("$~" === instance.data) instance._reactRetry = callback;
		else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState) callback();
		else {
			var listener = function() {
				callback();
				ownerDocument.removeEventListener("DOMContentLoaded", listener);
			};
			ownerDocument.addEventListener("DOMContentLoaded", listener);
			instance._reactRetry = listener;
		}
	}
	function getNextHydratable(node) {
		for (; null != node; node = node.nextSibling) {
			var nodeType = node.nodeType;
			if (1 === nodeType || 3 === nodeType) break;
			if (8 === nodeType) {
				nodeType = node.data;
				if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType) break;
				if ("/$" === nodeType || "/&" === nodeType) return null;
			}
		}
		return node;
	}
	var previousHydratableOnEnteringScopedSingleton = null;
	function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
		hydrationInstance = hydrationInstance.nextSibling;
		for (var depth = 0; hydrationInstance;) {
			if (8 === hydrationInstance.nodeType) {
				var data = hydrationInstance.data;
				if ("/$" === data || "/&" === data) {
					if (0 === depth) return getNextHydratable(hydrationInstance.nextSibling);
					depth--;
				} else "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
			}
			hydrationInstance = hydrationInstance.nextSibling;
		}
		return null;
	}
	function getParentHydrationBoundary(targetInstance) {
		targetInstance = targetInstance.previousSibling;
		for (var depth = 0; targetInstance;) {
			if (8 === targetInstance.nodeType) {
				var data = targetInstance.data;
				if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
					if (0 === depth) return targetInstance;
					depth--;
				} else "/$" !== data && "/&" !== data || depth++;
			}
			targetInstance = targetInstance.previousSibling;
		}
		return null;
	}
	function setFocusIfFocusable(node, focusOptions) {
		function handleFocus() {
			didFocus = !0;
		}
		if (node.ownerDocument.activeElement === node) return !0;
		var didFocus = !1;
		try {
			node.ownerDocument.addEventListener("focus", handleFocus, !0), (node.focus || HTMLElement.prototype.focus).call(node, focusOptions);
		} finally {
			node.ownerDocument.removeEventListener("focus", handleFocus, !0);
		}
		return didFocus;
	}
	function requestPostPaintCallback(callback) {
		localRequestAnimationFrame(function() {
			localRequestAnimationFrame(function(time) {
				return callback(time);
			});
		});
	}
	function resolveSingletonInstance(type, props, rootContainerInstance) {
		props = getOwnerDocumentFromRootContainer(rootContainerInstance);
		switch (type) {
			case "html":
				type = props.documentElement;
				if (!type) throw Error(formatProdErrorMessage(452));
				return type;
			case "head":
				type = props.head;
				if (!type) throw Error(formatProdErrorMessage(453));
				return type;
			case "body":
				type = props.body;
				if (!type) throw Error(formatProdErrorMessage(454));
				return type;
			default: throw Error(formatProdErrorMessage(451));
		}
	}
	function releaseSingletonInstance(instance, type, props) {
		for (var propKey in props) {
			var propValue = props[propKey];
			props.hasOwnProperty(propKey) && null != propValue && setProp(instance, type, propKey, null, emptyProps, propValue);
		}
		null != props.dangerouslySetInnerHTML && (instance.textContent = "");
		instance.onclick === noop$1 && (instance.onclick = null);
		detachDeletedInstance(instance);
	}
	function clearSingletonPreambleContribution(instance) {
		for (var attributes = instance.attributes; attributes.length;) instance.removeAttributeNode(attributes[0]);
		detachDeletedInstance(instance);
	}
	var preloadPropsMap = /* @__PURE__ */ new Map();
	var preconnectsSet = /* @__PURE__ */ new Set();
	function getHoistableRoot(container) {
		if ("function" === typeof container.getRootNode) {
			var rootNode = container.getRootNode();
			if (9 === rootNode.nodeType || 11 === rootNode.nodeType) return rootNode;
		}
		return 9 === container.nodeType ? container : container.ownerDocument;
	}
	var previousDispatcher = ReactDOMSharedInternals.d;
	ReactDOMSharedInternals.d = {
		f: flushSyncWork,
		r: requestFormReset,
		D: prefetchDNS,
		C: preconnect,
		L: preload,
		m: preloadModule,
		X: preinitScript,
		S: preinitStyle,
		M: preinitModuleScript
	};
	function flushSyncWork() {
		var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
		return previousWasRendering || wasRendering;
	}
	function requestFormReset(form) {
		var formInst = getInstanceFromNode(form);
		null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
	}
	var globalDocument = "undefined" === typeof document ? null : document;
	function preconnectAs(rel, href, crossOrigin) {
		var ownerDocument = globalDocument;
		if (ownerDocument && "string" === typeof href && href) {
			var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
			limitedEscapedHref = "link[rel=\"" + rel + "\"][href=\"" + limitedEscapedHref + "\"]";
			"string" === typeof crossOrigin && (limitedEscapedHref += "[crossorigin=\"" + crossOrigin + "\"]");
			preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = {
				rel,
				crossOrigin,
				href
			}, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
		}
	}
	function prefetchDNS(href) {
		previousDispatcher.D(href);
		preconnectAs("dns-prefetch", href, null);
	}
	function preconnect(href, crossOrigin) {
		previousDispatcher.C(href, crossOrigin);
		preconnectAs("preconnect", href, crossOrigin);
	}
	function preload(href, as, options) {
		previousDispatcher.L(href, as, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href && as) {
			var preloadSelector = "link[rel=\"preload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"]";
			"image" === as ? options && options.imageSrcSet ? (preloadSelector += "[imagesrcset=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSrcSet) + "\"]", "string" === typeof options.imageSizes && (preloadSelector += "[imagesizes=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSizes) + "\"]")) : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]" : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]";
			var key = preloadSelector;
			switch (as) {
				case "style":
					key = getStyleKey(href);
					break;
				case "script": key = getScriptKey(href);
			}
			if (!(preloadPropsMap.has(key) || (href = assign({
				rel: "preload",
				href: "image" === as && options && options.imageSrcSet ? void 0 : href,
				as
			}, options), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key))))) {
				var instance = ownerDocument.createElement("link");
				setInitialProperties(instance, "link", href);
				"style" === as && (instance[internalLoadPendingKey] = !0, instance.onload = instance.onerror = function() {
					clearPendingLoadOnNode(instance);
				});
				markNodeAsHoistable(instance);
				ownerDocument.head.appendChild(instance);
			}
		}
	}
	function preloadModule(href, options) {
		previousDispatcher.m(href, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var as = options && "string" === typeof options.as ? options.as : "script", preloadSelector = "link[rel=\"modulepreload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"][href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]", key = preloadSelector;
			switch (as) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": key = getScriptKey(href);
			}
			if (!preloadPropsMap.has(key) && (href = assign({
				rel: "modulepreload",
				href
			}, options), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
				switch (as) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (ownerDocument.querySelector(getScriptSelectorFromKey(key))) return;
				}
				as = ownerDocument.createElement("link");
				setInitialProperties(as, "link", href);
				markNodeAsHoistable(as);
				ownerDocument.head.appendChild(as);
			}
		}
	}
	function preinitStyle(href, precedence, options) {
		previousDispatcher.S(href, precedence, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
			precedence = precedence || "default";
			var resource = styles.get(key);
			if (!resource) {
				var state = {
					loading: 0,
					preload: null
				};
				if (resource = ownerDocument.querySelector(getStylesheetSelectorFromKey(key))) state.loading = 5;
				else {
					href = assign({
						rel: "stylesheet",
						href,
						"data-precedence": precedence
					}, options);
					(options = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options);
					var link = resource = ownerDocument.createElement("link");
					markNodeAsHoistable(link);
					setInitialProperties(link, "link", href);
					link._p = new Promise(function(resolve, reject) {
						link.onload = resolve;
						link.onerror = reject;
					});
					link.addEventListener("load", function() {
						state.loading |= 1;
					});
					link.addEventListener("error", function() {
						state.loading |= 2;
					});
					state.loading |= 4;
					insertStylesheet(resource, precedence, ownerDocument);
				}
				resource = {
					type: "stylesheet",
					instance: resource,
					count: 1,
					state
				};
				styles.set(key, resource);
			}
		}
	}
	function preinitScript(src, options) {
		previousDispatcher.X(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function preinitModuleScript(src, options) {
		previousDispatcher.M(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0,
				type: "module"
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function getResource(type, currentProps, pendingProps, currentResource) {
		var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
		if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
		switch (type) {
			case "meta":
			case "title": return null;
			case "style": return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (pendingProps = getStyleKey(pendingProps.href), currentProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, currentProps.set(pendingProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
					type = getStyleKey(pendingProps.href);
					var styles$268 = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, resource$269 = styles$268.get(type);
					resource$269 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$269 = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, styles$268.set(type, resource$269), (styles$268 = JSCompiler_inline_result.querySelector(getStylesheetSelectorFromKey(type))) ? styles$268._p || (resource$269.instance = styles$268, resource$269.state.loading = 5) : (styles$268 = preloadPropsMap.get(type), styles$268 || (styles$268 = {
						rel: "preload",
						as: "style",
						href: pendingProps.href,
						crossOrigin: pendingProps.crossOrigin,
						integrity: pendingProps.integrity,
						media: pendingProps.media,
						hrefLang: pendingProps.hrefLang,
						referrerPolicy: pendingProps.referrerPolicy
					}, preloadPropsMap.set(type, styles$268)), preloadStylesheet(JSCompiler_inline_result, type, styles$268, resource$269.state)));
					if (currentProps && null === currentResource) throw Error(formatProdErrorMessage(528, ""));
					return resource$269;
				}
				if (currentProps && null !== currentResource) throw Error(formatProdErrorMessage(529, ""));
				return null;
			case "script": return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (pendingProps = getScriptKey(pendingProps), currentProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableScripts, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, currentProps.set(pendingProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(formatProdErrorMessage(444, type));
		}
	}
	function getStyleKey(href) {
		return "href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"";
	}
	function getStylesheetSelectorFromKey(key) {
		return "link[rel=\"stylesheet\"][" + key + "]";
	}
	function stylesheetPropsFromRawProps(rawProps) {
		return assign({}, rawProps, {
			"data-precedence": rawProps.precedence,
			precedence: null
		});
	}
	function preloadStylesheet(ownerDocument, key, preloadProps, state) {
		if (key = ownerDocument.querySelector("link[rel=\"preload\"][as=\"style\"][" + key + "]")) {
			if (!0 !== key[internalLoadPendingKey]) {
				state.loading = 1;
				return;
			}
		} else key = ownerDocument.createElement("link"), key[internalLoadPendingKey] = !0, key.onload = key.onerror = clearPendingLoadOnNode.bind(null, key), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key);
		state.preload = key;
		key.addEventListener("load", function() {
			return state.loading |= 1;
		});
		key.addEventListener("error", function() {
			return state.loading |= 2;
		});
	}
	function getScriptKey(src) {
		return "[src=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(src) + "\"]";
	}
	function getScriptSelectorFromKey(key) {
		return "script[async]" + key;
	}
	function acquireResource(hoistableRoot, resource, props) {
		resource.count++;
		if (null === resource.instance) switch (resource.type) {
			case "style":
				var instance = hoistableRoot.querySelector("style[data-href~=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + "\"]");
				if (instance) return resource.instance = instance, markNodeAsHoistable(instance), instance;
				var styleProps = assign({}, props, {
					"data-href": props.href,
					"data-precedence": props.precedence,
					href: null,
					precedence: null
				});
				instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement("style");
				markNodeAsHoistable(instance);
				setInitialProperties(instance, "style", styleProps);
				insertStylesheet(instance, props.precedence, hoistableRoot);
				return resource.instance = instance;
			case "stylesheet":
				styleProps = getStyleKey(props.href);
				var instance$274 = hoistableRoot.querySelector(getStylesheetSelectorFromKey(styleProps));
				if (instance$274) return resource.state.loading |= 4, resource.instance = instance$274, markNodeAsHoistable(instance$274), instance$274;
				instance = stylesheetPropsFromRawProps(props);
				(styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
				instance$274 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
				markNodeAsHoistable(instance$274);
				var linkInstance = instance$274;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance$274, "link", instance);
				resource.state.loading |= 4;
				insertStylesheet(instance$274, props.precedence, hoistableRoot);
				return resource.instance = instance$274;
			case "script":
				instance$274 = getScriptKey(props.src);
				if (styleProps = hoistableRoot.querySelector(getScriptSelectorFromKey(instance$274))) return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
				instance = props;
				if (styleProps = preloadPropsMap.get(instance$274)) instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
				hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
				styleProps = hoistableRoot.createElement("script");
				markNodeAsHoistable(styleProps);
				setInitialProperties(styleProps, "link", instance);
				hoistableRoot.head.appendChild(styleProps);
				return resource.instance = styleProps;
			case "void": return null;
			default: throw Error(formatProdErrorMessage(443, resource.type));
		}
		else "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
		return resource.instance;
	}
	function insertStylesheet(instance, precedence, root) {
		for (var nodes = root.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.dataset.precedence === precedence) prior = node;
			else if (prior !== last) break;
		}
		prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root.nodeType ? root.head : root, precedence.insertBefore(instance, precedence.firstChild));
	}
	function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
		stylesheetProps.crossOrigin ??= preloadProps.crossOrigin;
		stylesheetProps.referrerPolicy ??= preloadProps.referrerPolicy;
		stylesheetProps.title ??= preloadProps.title;
	}
	function adoptPreloadPropsForScript(scriptProps, preloadProps) {
		scriptProps.crossOrigin ??= preloadProps.crossOrigin;
		scriptProps.referrerPolicy ??= preloadProps.referrerPolicy;
		scriptProps.integrity ??= preloadProps.integrity;
	}
	var tagCaches = null;
	function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
		if (null === tagCaches) {
			var cache = /* @__PURE__ */ new Map();
			var caches = tagCaches = /* @__PURE__ */ new Map();
			caches.set(ownerDocument, cache);
		} else caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
		if (cache.has(type)) return cache;
		cache.set(type, null);
		ownerDocument = ownerDocument.getElementsByTagName(type);
		for (caches = 0; caches < ownerDocument.length; caches++) {
			var node = ownerDocument[caches];
			if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
				var nodeKey = node.getAttribute(keyAttribute) || "";
				nodeKey = type + nodeKey;
				var existing = cache.get(nodeKey);
				existing ? existing.push(node) : cache.set(nodeKey, [node]);
			}
		}
		return cache;
	}
	function mountHoistable(hoistableRoot, type, instance) {
		hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
		hoistableRoot.head.insertBefore(instance, "title" === type ? hoistableRoot.querySelector("head > title") : null);
	}
	function isHostHoistableType(type, props, hostContext) {
		if (1 === hostContext || null != props.itemProp) return !1;
		switch (type) {
			case "meta":
			case "title": return !0;
			case "style":
				if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href) break;
				return !0;
			case "link":
				if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError) break;
				switch (props.rel) {
					case "stylesheet": return type = props.disabled, "string" === typeof props.precedence && null == type;
					default: return !0;
				}
			case "script": if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src) return !0;
		}
		return !1;
	}
	function maySuspendCommit(type, props) {
		return "img" === type && null != props.src && "" !== props.src && null == props.onLoad && "lazy" !== props.loading;
	}
	function preloadResource(resource) {
		return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? !1 : !0;
	}
	function estimateImageBytes(instance) {
		return (instance.width || 100) * (instance.height || 100) * ("number" === typeof devicePixelRatio ? devicePixelRatio : 1) * .25;
	}
	function suspendInstance(state, instance) {
		"function" === typeof instance.decode && (state.imgCount++, instance.complete || (state.imgBytes += estimateImageBytes(instance), state.suspenseyImages.push(instance)), state = onUnsuspendImg.bind(state), instance.decode().then(state, state));
	}
	function suspendResource(state, hoistableRoot, resource, props) {
		if ("stylesheet" === resource.type && ("string" !== typeof props.media || !1 !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
			if (null === resource.instance) {
				var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(getStylesheetSelectorFromKey(key));
				if (instance) {
					hoistableRoot = instance._p;
					null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
					resource.state.loading |= 4;
					resource.instance = instance;
					markNodeAsHoistable(instance);
					return;
				}
				instance = hoistableRoot.ownerDocument || hoistableRoot;
				props = stylesheetPropsFromRawProps(props);
				(key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
				instance = instance.createElement("link");
				markNodeAsHoistable(instance);
				var linkInstance = instance;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance, "link", props);
				resource.instance = instance;
			}
			null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
			state.stylesheets.set(resource, hoistableRoot);
			(hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
		}
	}
	var estimatedBytesWithinLimit = 0;
	function waitForCommitToBeReady(state, timeoutOffset) {
		state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
		return 0 < state.count || 0 < state.imgCount ? function(commit) {
			var stylesheetTimer = setTimeout(function() {
				state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
				if (state.unsuspend) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, 6e4 + timeoutOffset);
			0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
			var imgTimer = setTimeout(function() {
				state.waitingForImages = !1;
				if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset);
			state.unsuspend = commit;
			return function() {
				state.unsuspend = null;
				clearTimeout(stylesheetTimer);
				clearTimeout(imgTimer);
			};
		} : null;
	}
	function checkIfFullyUnsuspended(state) {
		if (0 === state.count && (0 === state.imgCount || !state.waitingForImages)) {
			if (state.stylesheets) insertSuspendedStylesheets(state, state.stylesheets);
			else if (state.unsuspend) {
				var unsuspend = state.unsuspend;
				state.unsuspend = null;
				unsuspend();
			}
		}
	}
	function onUnsuspend() {
		this.count--;
		checkIfFullyUnsuspended(this);
	}
	function onUnsuspendImg() {
		this.imgCount--;
		checkIfFullyUnsuspended(this);
	}
	var precedencesByRoot = null;
	function insertSuspendedStylesheets(state, resources) {
		state.stylesheets = null;
		null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
	}
	function insertStylesheetIntoRoot(root, resource) {
		if (!(resource.state.loading & 4)) {
			var precedences = precedencesByRoot.get(root);
			if (precedences) var last = precedences.get(null);
			else {
				precedences = /* @__PURE__ */ new Map();
				precedencesByRoot.set(root, precedences);
				for (var nodes = root.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media")) precedences.set(node.dataset.precedence, node), last = node;
				}
				last && precedences.set(null, last);
			}
			nodes = resource.instance;
			node = nodes.getAttribute("data-precedence");
			i = precedences.get(node) || last;
			i === last && precedences.set(null, nodes);
			precedences.set(node, nodes);
			this.count++;
			last = onUnsuspend.bind(this);
			nodes.addEventListener("load", last);
			nodes.addEventListener("error", last);
			i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root = 9 === root.nodeType ? root.head : root, root.insertBefore(nodes, root.firstChild));
			resource.state.loading |= 4;
		}
	}
	var HostTransitionContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Provider: null,
		Consumer: null,
		_currentValue: sharedNotPendingObject,
		_currentValue2: sharedNotPendingObject,
		_threadCount: 0
	};
	function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
		this.tag = 1;
		this.containerInfo = containerInfo;
		this.pingCache = this.current = this.pendingChildren = null;
		this.timeoutHandle = -1;
		this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
		this.callbackPriority = 0;
		this.expirationTimes = createLaneMap(-1);
		this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
		this.entanglements = createLaneMap(0);
		this.hiddenUpdates = createLaneMap(null);
		this.identifierPrefix = identifierPrefix;
		this.onUncaughtError = onUncaughtError;
		this.onCaughtError = onCaughtError;
		this.onRecoverableError = onRecoverableError;
		this.pooledCache = null;
		this.pooledCacheLanes = 0;
		this.formState = formState;
		this.transitionTypes = null;
		this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
		containerInfo = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState);
		tag = 1;
		!0 === isStrictMode && (tag |= 24);
		isStrictMode = createFiberImplClass(3, null, null, tag);
		containerInfo.current = isStrictMode;
		isStrictMode.stateNode = containerInfo;
		tag = createCache();
		tag.refCount++;
		containerInfo.pooledCache = tag;
		tag.refCount++;
		isStrictMode.memoizedState = {
			element: initialChildren,
			isDehydrated: hydrate,
			cache: tag
		};
		initializeUpdateQueue(isStrictMode);
		return containerInfo;
	}
	function getContextForSubtree(parentComponent) {
		if (!parentComponent) return emptyContextObject;
		parentComponent = emptyContextObject;
		return parentComponent;
	}
	function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
		parentComponent = getContextForSubtree(parentComponent);
		null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
		container = createUpdate(lane);
		container.payload = { element };
		callback = void 0 === callback ? null : callback;
		null !== callback && (container.callback = callback);
		element = enqueueUpdate(rootFiber, container, lane);
		null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
	}
	function markRetryLaneImpl(fiber, retryLane) {
		fiber = fiber.memoizedState;
		if (null !== fiber && null !== fiber.dehydrated) {
			var a = fiber.retryLane;
			fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
		}
	}
	function markRetryLaneIfNotHydrated(fiber, retryLane) {
		markRetryLaneImpl(fiber, retryLane);
		(fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
	}
	function attemptContinuousHydration(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var root = enqueueConcurrentRenderForLane(fiber, 67108864);
			null !== root && scheduleUpdateOnFiber(root, fiber, 67108864);
			markRetryLaneIfNotHydrated(fiber, 67108864);
		}
	}
	function attemptHydrationAtCurrentPriority(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var lane = requestUpdateLane();
			lane = getBumpedLaneForHydrationByLane(lane);
			var root = enqueueConcurrentRenderForLane(fiber, lane);
			null !== root && scheduleUpdateOnFiber(root, fiber, lane);
			markRetryLaneIfNotHydrated(fiber, lane);
		}
	}
	var _enabled = !0;
	function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (_enabled) {
			var blockedOn = findInstanceBlockingEvent(nativeEvent);
			if (null === blockedOn) dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer), clearIfContinuousEvent(domEventName, nativeEvent);
			else if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) nativeEvent.stopPropagation();
			else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
				for (; null !== blockedOn;) {
					var fiber = getInstanceFromNode(blockedOn);
					if (null !== fiber) switch (fiber.tag) {
						case 3:
							fiber = fiber.stateNode;
							if (fiber.current.memoizedState.isDehydrated) {
								var lanes = getHighestPriorityLanes(fiber.pendingLanes);
								if (0 !== lanes) {
									var root = fiber;
									root.pendingLanes |= 2;
									for (root.entangledLanes |= 2; lanes;) {
										var lane = 1 << 31 - clz32(lanes);
										root.entanglements[1] |= lane;
										lanes &= ~lane;
									}
									ensureRootIsScheduled(fiber);
									0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, !1));
								}
							}
							break;
						case 31:
						case 13: root = enqueueConcurrentRenderForLane(fiber, 2), null !== root && scheduleUpdateOnFiber(root, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
					}
					fiber = findInstanceBlockingEvent(nativeEvent);
					null === fiber && dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
					if (fiber === blockedOn) break;
					blockedOn = fiber;
				}
				null !== blockedOn && nativeEvent.stopPropagation();
			} else dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
		}
	}
	function findInstanceBlockingEvent(nativeEvent) {
		nativeEvent = getEventTarget(nativeEvent);
		return findInstanceBlockingTarget(nativeEvent);
	}
	var return_targetInst = null;
	function findInstanceBlockingTarget(targetNode) {
		return_targetInst = null;
		targetNode = getClosestInstanceFromNode(targetNode);
		if (null !== targetNode) {
			var nearestMounted = getNearestMountedFiber(targetNode);
			if (null === nearestMounted) targetNode = null;
			else {
				var tag = nearestMounted.tag;
				if (13 === tag) {
					targetNode = getSuspenseInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (31 === tag) {
					targetNode = getActivityInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (3 === tag) {
					if (nearestMounted.stateNode.current.memoizedState.isDehydrated) return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					targetNode = null;
				} else nearestMounted !== targetNode && (targetNode = null);
			}
		}
		return_targetInst = targetNode;
		return null;
	}
	function getEventPriority(domEventName) {
		switch (domEventName) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (getCurrentPriorityLevel()) {
				case ImmediatePriority: return 2;
				case UserBlockingPriority: return 8;
				case NormalPriority$1:
				case LowPriority: return 32;
				case IdlePriority: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var hasScheduledReplayAttempt = !1;
	var queuedFocus = null;
	var queuedDrag = null;
	var queuedMouse = null;
	var queuedPointers = /* @__PURE__ */ new Map();
	var queuedPointerCaptures = /* @__PURE__ */ new Map();
	var queuedExplicitHydrationTargets = [];
	var discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function clearIfContinuousEvent(domEventName, nativeEvent) {
		switch (domEventName) {
			case "focusin":
			case "focusout":
				queuedFocus = null;
				break;
			case "dragenter":
			case "dragleave":
				queuedDrag = null;
				break;
			case "mouseover":
			case "mouseout":
				queuedMouse = null;
				break;
			case "pointerover":
			case "pointerout":
				queuedPointers.delete(nativeEvent.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": queuedPointerCaptures.delete(nativeEvent.pointerId);
		}
	}
	function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent) return existingQueuedEvent = {
			blockedOn,
			domEventName,
			eventSystemFlags,
			nativeEvent,
			targetContainers: [targetContainer]
		}, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
		existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
		blockedOn = existingQueuedEvent.targetContainers;
		null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
		return existingQueuedEvent;
	}
	function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		switch (domEventName) {
			case "focusin": return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "dragenter": return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "mouseover": return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "pointerover":
				var pointerId = nativeEvent.pointerId;
				queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent));
				return !0;
			case "gotpointercapture": return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)), !0;
		}
		return !1;
	}
	function attemptExplicitHydrationTarget(queuedTarget) {
		var targetInst = getClosestInstanceFromNode(queuedTarget.target);
		if (null !== targetInst) {
			var nearestMounted = getNearestMountedFiber(targetInst);
			if (null !== nearestMounted) {
				if (targetInst = nearestMounted.tag, 13 === targetInst) {
					if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (31 === targetInst) {
					if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
					queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					return;
				}
			}
		}
		queuedTarget.blockedOn = null;
	}
	function attemptReplayContinuousQueuedEvent(queuedEvent) {
		if (null !== queuedEvent.blockedOn) return !1;
		for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length;) {
			var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
			if (null === nextBlockedOn) {
				nextBlockedOn = queuedEvent.nativeEvent;
				var nativeEventClone = new nextBlockedOn.constructor(nextBlockedOn.type, nextBlockedOn);
				currentReplayingEvent = nativeEventClone;
				nextBlockedOn.target.dispatchEvent(nativeEventClone);
				currentReplayingEvent = null;
			} else return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, !1;
			targetContainers.shift();
		}
		return !0;
	}
	function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
		attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
	}
	function replayUnblockedEvents() {
		hasScheduledReplayAttempt = !1;
		null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
		null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
		null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
		queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
		queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
	}
	function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
		queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = !0, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents)));
	}
	var lastScheduledReplayQueue = null;
	function scheduleReplayQueueIfNeeded(formReplayingQueue) {
		lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, function() {
			lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
			for (var i = 0; i < formReplayingQueue.length; i += 3) {
				var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
				if ("function" !== typeof submitterOrAction) if (null === findInstanceBlockingTarget(submitterOrAction || form)) continue;
				else break;
				var formInst = getInstanceFromNode(form);
				null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(formInst, {
					pending: !0,
					data: formData,
					method: form.method,
					action: submitterOrAction
				}, submitterOrAction, formData));
			}
		}));
	}
	function retryIfBlockedOn(unblocked) {
		function unblock(queuedEvent) {
			return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
		}
		null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
		null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
		null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
		queuedPointers.forEach(unblock);
		queuedPointerCaptures.forEach(unblock);
		for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
			var queuedTarget = queuedExplicitHydrationTargets[i];
			queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
		}
		for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn);) attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
		i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
		if (null != i) for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
			var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
			if ("function" === typeof submitterOrAction) formProps || scheduleReplayQueueIfNeeded(i);
			else if (formProps) {
				var action = null;
				if (submitterOrAction && submitterOrAction.hasAttribute("formAction")) {
					if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null) action = formProps.formAction;
					else if (null !== findInstanceBlockingTarget(form)) continue;
				} else action = formProps.action;
				"function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
				scheduleReplayQueueIfNeeded(i);
			}
		}
	}
	function defaultOnDefaultTransitionIndicator() {
		function handleNavigate(event) {
			event.canIntercept && "react-transition" === event.info && event.intercept({
				handler: function() {
					return new Promise(function(resolve) {
						return pendingResolve = resolve;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function handleNavigateComplete() {
			null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			isCancelled || setTimeout(startFakeNavigation, 20);
		}
		function startFakeNavigation() {
			if (!isCancelled && !navigation.transition) {
				var currentEntry = navigation.currentEntry;
				currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
					state: currentEntry.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if ("object" === typeof navigation) {
			var isCancelled = !1, pendingResolve = null;
			navigation.addEventListener("navigate", handleNavigate);
			navigation.addEventListener("navigatesuccess", handleNavigateComplete);
			navigation.addEventListener("navigateerror", handleNavigateComplete);
			setTimeout(startFakeNavigation, 100);
			return function() {
				isCancelled = !0;
				navigation.removeEventListener("navigate", handleNavigate);
				navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
				navigation.removeEventListener("navigateerror", handleNavigateComplete);
				null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			};
		}
	}
	function ReactDOMRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
		var root = this._internalRoot;
		if (null === root) throw Error(formatProdErrorMessage(409));
		var current = root.current;
		updateContainerImpl(current, requestUpdateLane(), children, root, null, null);
	};
	ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
		var root = this._internalRoot;
		if (null !== root) {
			this._internalRoot = null;
			var container = root.containerInfo;
			updateContainerImpl(root.current, 2, null, root, null, null);
			flushSyncWork$1();
			container[internalContainerInstanceKey] = null;
		}
	};
	function ReactDOMHydrationRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
		if (target) {
			var updatePriority = resolveUpdatePriority();
			target = {
				blockedOn: null,
				target,
				priority: updatePriority
			};
			for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++);
			queuedExplicitHydrationTargets.splice(i, 0, target);
			0 === i && attemptExplicitHydrationTarget(target);
		}
	};
	var isomorphicReactPackageVersion$jscomp$inline_2043 = React.version;
	if ("19.3.1" !== isomorphicReactPackageVersion$jscomp$inline_2043) throw Error(formatProdErrorMessage(527, isomorphicReactPackageVersion$jscomp$inline_2043, "19.3.1"));
	ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
		var fiber = componentOrElement._reactInternals;
		if (void 0 === fiber) {
			if ("function" === typeof componentOrElement.render) throw Error(formatProdErrorMessage(188));
			componentOrElement = Object.keys(componentOrElement).join(",");
			throw Error(formatProdErrorMessage(268, componentOrElement));
		}
		componentOrElement = findCurrentFiberUsingSlowPath(fiber);
		componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
		componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
		return componentOrElement;
	};
	var internals$jscomp$inline_2586 = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: ReactSharedInternals,
		reconcilerVersion: "19.3.1"
	};
	if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
		var hook$jscomp$inline_2587 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!hook$jscomp$inline_2587.isDisabled && hook$jscomp$inline_2587.supportsFiber) try {
			rendererID = hook$jscomp$inline_2587.inject(internals$jscomp$inline_2586), injectedHook = hook$jscomp$inline_2587;
		} catch (err) {}
	}
	exports.createRoot = function(container, options) {
		if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
		var isStrictMode = !1, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
		null !== options && void 0 !== options && (!0 === options.unstable_strictMode && (isStrictMode = !0), void 0 !== options.identifierPrefix && (identifierPrefix = options.identifierPrefix), void 0 !== options.onUncaughtError && (onUncaughtError = options.onUncaughtError), void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError), void 0 !== options.onRecoverableError && (onRecoverableError = options.onRecoverableError));
		options = createFiberRoot(container, 1, !1, null, null, isStrictMode, identifierPrefix, null, onUncaughtError, onCaughtError, onRecoverableError, defaultOnDefaultTransitionIndicator);
		container[internalContainerInstanceKey] = options.current;
		listenToAllSupportedEvents(container);
		return new ReactDOMRoot(options);
	};
}));
// node_modules/react-dom/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_client_production();
}));
// node_modules/lucide-react/dist/esm/shared/src/utils.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
var toPascalCase = (string) => {
	const camelCase = toCamelCase(string);
	return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
};
// node_modules/lucide-react/dist/esm/defaultAttributes.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
// node_modules/lucide-react/dist/esm/Icon.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Icon = (0, import_react.forwardRef)(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => (0, import_react.createElement)("svg", {
	ref,
	...defaultAttributes,
	width: size,
	height: size,
	stroke: color,
	strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
	className: mergeClasses("lucide", className),
	...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
	...rest
}, [...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)), ...Array.isArray(children) ? children : [children]]));
// node_modules/lucide-react/dist/esm/createLucideIcon.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var createLucideIcon = (iconName, iconNode) => {
	const Component = (0, import_react.forwardRef)(({ className, ...props }, ref) => (0, import_react.createElement)(Icon, {
		ref,
		iconNode,
		className: mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${iconName}`, className),
		...props
	}));
	Component.displayName = toPascalCase(iconName);
	return Component;
};
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Activity = createLucideIcon("activity", [["path", {
	d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
	key: "169zse"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowDown = createLucideIcon("arrow-down", [["path", {
	d: "M12 5v14",
	key: "s699le"
}], ["path", {
	d: "m19 12-7 7-7-7",
	key: "1idqje"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowLeft = createLucideIcon("arrow-left", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowRight = createLucideIcon("arrow-right", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "m12 5 7 7-7 7",
	key: "xquz4c"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowUpRight = createLucideIcon("arrow-up-right", [["path", {
	d: "M7 7h10v10",
	key: "1tivn9"
}], ["path", {
	d: "M7 17 17 7",
	key: "1vkiza"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowUp = createLucideIcon("arrow-up", [["path", {
	d: "m5 12 7-7 7 7",
	key: "hav0vg"
}], ["path", {
	d: "M12 19V5",
	key: "x0mq9r"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Calculator = createLucideIcon("calculator", [
	["rect", {
		width: "16",
		height: "20",
		x: "4",
		y: "2",
		rx: "2",
		key: "1nb95v"
	}],
	["line", {
		x1: "8",
		x2: "16",
		y1: "6",
		y2: "6",
		key: "x4nwl0"
	}],
	["line", {
		x1: "16",
		x2: "16",
		y1: "14",
		y2: "18",
		key: "wjye3r"
	}],
	["path", {
		d: "M16 10h.01",
		key: "1m94wz"
	}],
	["path", {
		d: "M12 10h.01",
		key: "1nrarc"
	}],
	["path", {
		d: "M8 10h.01",
		key: "19clt8"
	}],
	["path", {
		d: "M12 14h.01",
		key: "1etili"
	}],
	["path", {
		d: "M8 14h.01",
		key: "6423bh"
	}],
	["path", {
		d: "M12 18h.01",
		key: "mhygvu"
	}],
	["path", {
		d: "M8 18h.01",
		key: "lrp35t"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChartColumn = createLucideIcon("chart-column", [
	["path", {
		d: "M3 3v16a2 2 0 0 0 2 2h16",
		key: "c24i48"
	}],
	["path", {
		d: "M18 17V9",
		key: "2bz60n"
	}],
	["path", {
		d: "M13 17V5",
		key: "1frdt8"
	}],
	["path", {
		d: "M8 17v-3",
		key: "17ska0"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Check = createLucideIcon("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleCheck = createLucideIcon("circle-check", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleX = createLucideIcon("circle-x", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "m15 9-6 6",
		key: "1uzhvr"
	}],
	["path", {
		d: "m9 9 6 6",
		key: "z0biqf"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Clock = createLucideIcon("clock", [["path", {
	d: "M12 6v6l4 2",
	key: "mmk7yg"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Copy = createLucideIcon("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FileCode = createLucideIcon("file-code", [
	["path", {
		d: "M10 12.5 8 15l2 2.5",
		key: "1tg20x"
	}],
	["path", {
		d: "m14 12.5 2 2.5-2 2.5",
		key: "yinavb"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",
		key: "1mlx9k"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FileJson = createLucideIcon("file-json", [
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		key: "1rqfz7"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["path", {
		d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1",
		key: "1oajmo"
	}],
	["path", {
		d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1",
		key: "mpwhp6"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FolderTree = createLucideIcon("folder-tree", [
	["path", {
		d: "M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
		key: "hod4my"
	}],
	["path", {
		d: "M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
		key: "w4yl2u"
	}],
	["path", {
		d: "M3 5a2 2 0 0 0 2 2h3",
		key: "f2jnh7"
	}],
	["path", {
		d: "M3 3v13a2 2 0 0 0 2 2h3",
		key: "k8epm1"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LockOpen = createLucideIcon("lock-open", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 9.9-1",
	key: "1mm8w8"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Lock = createLucideIcon("lock", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 10 0v4",
	key: "fwvmzm"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var PenLine = createLucideIcon("pen-line", [["path", {
	d: "M13 21h8",
	key: "1jsn5i"
}], ["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Plus = createLucideIcon("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var RotateCcw = createLucideIcon("rotate-ccw", [["path", {
	d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
	key: "1357e3"
}], ["path", {
	d: "M3 3v5h5",
	key: "1xhq8a"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SlidersVertical = createLucideIcon("sliders-vertical", [
	["path", {
		d: "M10 8h4",
		key: "1sr2af"
	}],
	["path", {
		d: "M12 21v-9",
		key: "17s77i"
	}],
	["path", {
		d: "M12 8V3",
		key: "13r4qs"
	}],
	["path", {
		d: "M17 16h4",
		key: "h1uq16"
	}],
	["path", {
		d: "M19 12V3",
		key: "o1uvq1"
	}],
	["path", {
		d: "M19 21v-5",
		key: "qua636"
	}],
	["path", {
		d: "M3 14h4",
		key: "bcjad9"
	}],
	["path", {
		d: "M5 10V3",
		key: "cb8scm"
	}],
	["path", {
		d: "M5 21v-7",
		key: "1w1uti"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Trash2 = createLucideIcon("trash-2", [
	["path", {
		d: "M10 11v6",
		key: "nco0om"
	}],
	["path", {
		d: "M14 11v6",
		key: "outv1u"
	}],
	["path", {
		d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
		key: "miytrc"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
		key: "e791ji"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var TriangleAlert = createLucideIcon("triangle-alert", [
	["path", {
		d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
		key: "wmoenq"
	}],
	["path", {
		d: "M12 9v4",
		key: "juzpu7"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var X = createLucideIcon("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Zap = createLucideIcon("zap", [["path", {
	d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
	key: "1xq2db"
}]]);
// node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
// node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
// src/components/ExamRegistryDashboard.tsx
var import_client = require_client();
var import_jsx_runtime = require_jsx_runtime();
function computeChapterTCR(ledger) {
	if (!ledger) return {
		TQ: 0,
		MM: 0,
		LTM: 0,
		TCR: 0
	};
	const { timing, concepts } = ledger;
	const allQuestions = [];
	Object.values(concepts).forEach((qMap) => {
		Object.values(qMap).forEach((history) => {
			allQuestions.push(history);
		});
	});
	const TQ = allQuestions.length;
	let NQC = 0;
	let NQW = 0;
	let NQS = 0;
	let NQF = 0;
	let NQM = 0;
	let NQSl = 0;
	allQuestions.forEach((history) => {
		if (!history || history.length === 0) return;
		const [status, seconds] = history[history.length - 1];
		if (status === "C") {
			NQC += 1;
			if (seconds <= timing.fastLimit) NQF += 1;
			else if (seconds <= timing.mediumLimit) NQM += 1;
			else if (seconds <= timing.slowLimit) NQSl += 1;
		} else if (status === "W") NQW += 1;
		else if (status === "S") NQS += 1;
	});
	const MM = TQ * 3;
	const ARMNT = NQC * 1 - NQW * .5 - NQS * .2;
	const NTM = NQF * 2 + NQM * 1 + NQSl * .5;
	const LTM = Number((ARMNT + NTM).toFixed(2));
	return {
		TQ,
		MM,
		LTM,
		TCR: MM > 0 ? LTM / MM * 100 : 0
	};
}
var INITIAL_DOMAINS = [
	{
		id: "dom-1",
		name: "Quantitative Aptitude",
		code: "QA"
	},
	{
		id: "dom-2",
		name: "English Language",
		code: "Eng"
	},
	{
		id: "dom-3",
		name: "General Intelligence & Reasoning",
		code: "GI"
	},
	{
		id: "dom-4",
		name: "General Studies",
		code: "GS"
	}
];
var INITIAL_CHAPTERS = [
	{
		id: "ch-7",
		name: "Pronouns",
		code: "PN",
		domainCode: "Eng"
	},
	{
		id: "ch-6",
		name: "Time and Work",
		code: "TW",
		domainCode: "QA"
	},
	{
		id: "ch-1",
		name: "Time and Distance",
		code: "TD",
		domainCode: "QA"
	},
	{
		id: "ch-2",
		name: "Trigonometry",
		code: "TRG",
		domainCode: "QA"
	},
	{
		id: "ch-3",
		name: "Profit and Loss",
		code: "PL",
		domainCode: "QA"
	},
	{
		id: "ch-4",
		name: "Algebra",
		code: "ALG",
		domainCode: "QA"
	},
	{
		id: "ch-5",
		name: "Geometry",
		code: "GEO",
		domainCode: "QA"
	},
	{
		id: "ch-8",
		name: "Verbs & Tenses",
		code: "VB",
		domainCode: "Eng"
	},
	{
		id: "ch-9",
		name: "Adjectives",
		code: "ADJ",
		domainCode: "Eng"
	},
	{
		id: "ch-10",
		name: "Vocabulary & Cloze",
		code: "VOC",
		domainCode: "Eng"
	},
	{
		id: "ch-11",
		name: "Number & Letter Series",
		code: "SER",
		domainCode: "GI"
	},
	{
		id: "ch-12",
		name: "Analogy & Classification",
		code: "ANA",
		domainCode: "GI"
	},
	{
		id: "ch-13",
		name: "Coding-Decoding",
		code: "COD",
		domainCode: "GI"
	},
	{
		id: "ch-14",
		name: "Indian Polity",
		code: "POL",
		domainCode: "GS"
	},
	{
		id: "ch-15",
		name: "History & Culture",
		code: "HIS",
		domainCode: "GS"
	},
	{
		id: "ch-16",
		name: "General Science",
		code: "SCI",
		domainCode: "GS"
	}
];
var INITIAL_SUBTOPICS = [
	{
		id: "st-trg-bs",
		code: "Basics",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "st-4",
		code: "Degree",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "st-1",
		code: "Relative Pronouns",
		chapterCode: "PN",
		domainCode: "Eng"
	},
	{
		id: "st-2",
		code: "Personal Pronouns",
		chapterCode: "PN",
		domainCode: "Eng"
	},
	{
		id: "st-3",
		code: "Reciprocal Pronouns",
		chapterCode: "PN",
		domainCode: "Eng"
	},
	{
		id: "st-5",
		code: "Dishonest Dealer",
		chapterCode: "PL",
		domainCode: "QA"
	},
	{
		id: "st-6",
		code: "Basic Work Rates",
		chapterCode: "TD",
		domainCode: "QA"
	},
	{
		id: "st-7",
		code: "Relative Speed & Trains",
		chapterCode: "TD",
		domainCode: "QA"
	}
];
var INITIAL_CONCEPTS = [
	{
		id: "con-trg-fr",
		code: "FR",
		subtopicCode: "Basics",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "con-1",
		code: "ASTC",
		subtopicCode: "Degree",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "con-2",
		code: "Subjective Finite Verb Lock",
		subtopicCode: "Relative Pronouns",
		chapterCode: "PN",
		domainCode: "Eng"
	},
	{
		id: "con-3",
		code: "Profit & Loss Core Formulas",
		subtopicCode: "Dishonest Dealer",
		chapterCode: "PL",
		domainCode: "QA"
	},
	{
		id: "con-4",
		code: "V1",
		subtopicCode: "Basic Work Rates",
		chapterCode: "TD",
		domainCode: "QA"
	},
	{
		id: "con-5",
		code: "V2",
		subtopicCode: "Basic Work Rates",
		chapterCode: "TD",
		domainCode: "QA"
	},
	{
		id: "con-6",
		code: "V1",
		subtopicCode: "Relative Speed & Trains",
		chapterCode: "TD",
		domainCode: "QA"
	}
];
var INITIAL_MICRO_CONCEPTS = [
	{
		id: "mc-trg-1",
		code: "MC1 (Fundamental Right-Triangle Ratios: oppo / adj / hypo)",
		shortCode: "T1",
		conceptCode: "FR",
		subtopicCode: "Basics",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "mc-trg-2",
		code: "MC2 (Pythagorean Triplets Generator: Odd & Even Rules)",
		shortCode: "T2",
		conceptCode: "FR",
		subtopicCode: "Basics",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "mc-trg-3",
		code: "MC3 (Dual-Vertex / Complementary Angle Switch: A vs C & θ vs 90°-θ)",
		shortCode: "T3",
		conceptCode: "FR",
		subtopicCode: "Basics",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "mc-trg-tg",
		code: "TG (Target Algebraic Substitution & Fraction Simplification)",
		shortCode: "TG",
		conceptCode: "FR",
		subtopicCode: "Basics",
		chapterCode: "TRG",
		domainCode: "QA"
	},
	{
		id: "mc-td-1",
		code: "Speed = Distance / Time (Direct Ratio)",
		shortCode: "T1",
		conceptCode: "V1",
		subtopicCode: "Basic Work Rates",
		chapterCode: "TD",
		domainCode: "QA"
	},
	{
		id: "mc-td-2",
		code: "Unit Conversion (km/h × 5/18) & Harmonic Mean",
		shortCode: "T2",
		conceptCode: "V2",
		subtopicCode: "Basic Work Rates",
		chapterCode: "TD",
		domainCode: "QA"
	},
	{
		id: "mc-td-3",
		code: "Inverse Speed-Time Ratio & Meet-Time Proportionality",
		shortCode: "T3",
		conceptCode: "V1",
		subtopicCode: "Relative Speed & Trains",
		chapterCode: "TD",
		domainCode: "QA"
	},
	{
		id: "mc-4",
		code: "PL.C2 (Markup Over Cost Price)",
		shortCode: "PL-T1",
		conceptCode: "Profit & Loss Core Formulas",
		subtopicCode: "Dishonest Dealer",
		chapterCode: "PL",
		domainCode: "QA"
	},
	{
		id: "mc-5",
		code: "PL.C3 (False Weight Ratio Multiplier)",
		shortCode: "PL-T2",
		conceptCode: "Profit & Loss Core Formulas",
		subtopicCode: "Dishonest Dealer",
		chapterCode: "PL",
		domainCode: "QA"
	}
];
var INITIAL_EXAMS = [{
	id: "exam-ssc-chsl",
	name: "SSC CHSL",
	domains: [
		{
			domainCode: "QA",
			percentage: 25,
			chapters: [
				{
					chapterCode: "TD",
					percentage: 15
				},
				{
					chapterCode: "TRG",
					percentage: 25
				},
				{
					chapterCode: "PL",
					percentage: 20
				},
				{
					chapterCode: "ALG",
					percentage: 20
				},
				{
					chapterCode: "GEO",
					percentage: 20
				}
			]
		},
		{
			domainCode: "Eng",
			percentage: 25,
			chapters: [
				{
					chapterCode: "PN",
					percentage: 20
				},
				{
					chapterCode: "VB",
					percentage: 30
				},
				{
					chapterCode: "ADJ",
					percentage: 20
				},
				{
					chapterCode: "VOC",
					percentage: 30
				}
			]
		},
		{
			domainCode: "GI",
			percentage: 25,
			chapters: [
				{
					chapterCode: "SER",
					percentage: 40
				},
				{
					chapterCode: "ANA",
					percentage: 30
				},
				{
					chapterCode: "COD",
					percentage: 30
				}
			]
		},
		{
			domainCode: "GS",
			percentage: 25,
			chapters: [
				{
					chapterCode: "POL",
					percentage: 30
				},
				{
					chapterCode: "HIS",
					percentage: 30
				},
				{
					chapterCode: "SCI",
					percentage: 40
				}
			]
		}
	]
}];
var ExamRegistryDashboard = ({ ledgers, activeMode, onSwitchMode, onJumpToChapterLedger, onRegisterNewChapterLedger, domains, setDomains, chapters, setChapters, subtopics, setSubtopics, concepts, setConcepts, microConcepts, setMicroConcepts }) => {
	const [registryPage, setRegistryPage] = (0, import_react.useState)("domain");
	const [domNameInput, setDomNameInput] = (0, import_react.useState)("");
	const [domCodeInput, setDomCodeInput] = (0, import_react.useState)("");
	const [chDomainSelect, setChDomainSelect] = (0, import_react.useState)("QA");
	const [chNameInput, setChNameInput] = (0, import_react.useState)("");
	const [chIdInput, setChIdInput] = (0, import_react.useState)("");
	const [stChapterSelect, setStChapterSelect] = (0, import_react.useState)("PN");
	const [stCodeInput, setStCodeInput] = (0, import_react.useState)("");
	const [conSubtopicSelect, setConSubtopicSelect] = (0, import_react.useState)("Degree");
	const [conCodeInput, setConCodeInput] = (0, import_react.useState)("");
	const [mcConceptSelect, setMcConceptSelect] = (0, import_react.useState)("ASTC");
	const [mcCodeInput, setMcCodeInput] = (0, import_react.useState)("");
	const [mcShortCodeInput, setMcShortCodeInput] = (0, import_react.useState)("");
	const [exams, setExams] = (0, import_react.useState)(INITIAL_EXAMS);
	const [selectedExamId, setSelectedExamId] = (0, import_react.useState)(INITIAL_EXAMS[0].id);
	const [configTargetId, setConfigTargetId] = (0, import_react.useState)(INITIAL_EXAMS[0].id);
	const [draftExamName, setDraftExamName] = (0, import_react.useState)(INITIAL_EXAMS[0].name);
	const [draftDomains, setDraftDomains] = (0, import_react.useState)(JSON.parse(JSON.stringify(INITIAL_EXAMS[0].domains)));
	const [examSaveMessage, setExamSaveMessage] = (0, import_react.useState)(null);
	const handleSelectConfigTarget = (targetId) => {
		setConfigTargetId(targetId);
		setExamSaveMessage(null);
		if (targetId === "NEW") {
			setDraftExamName("");
			const defaultDom = domains[0]?.code || "QA";
			const defaultCh = chapters.find((c) => c.domainCode === defaultDom)?.code || "TD";
			setDraftDomains([{
				domainCode: defaultDom,
				percentage: 100,
				chapters: [{
					chapterCode: defaultCh,
					percentage: 100
				}]
			}]);
		} else {
			const found = exams.find((x) => x.id === targetId);
			if (found) {
				setDraftExamName(found.name);
				setDraftDomains(JSON.parse(JSON.stringify(found.domains)));
			}
		}
	};
	const handleCreateDomain = (e) => {
		e.preventDefault();
		const cleanName = domNameInput.trim();
		const cleanCode = domCodeInput.trim();
		if (!cleanName || !cleanCode) return;
		if (domains.some((d) => d.code.toLowerCase() === cleanCode.toLowerCase())) return;
		setDomains((prev) => [...prev, {
			id: `dom-${Date.now()}`,
			name: cleanName,
			code: cleanCode
		}]);
		setDomNameInput("");
		setDomCodeInput("");
	};
	const handleCreateChapter = (e) => {
		e.preventDefault();
		const cleanName = chNameInput.trim();
		const cleanId = chIdInput.trim().toUpperCase();
		if (!cleanName || !cleanId || !chDomainSelect) return;
		if (chapters.some((c) => c.code.toLowerCase() === cleanId.toLowerCase())) return;
		setChapters((prev) => [...prev, {
			id: `ch-${Date.now()}`,
			name: cleanName,
			code: cleanId,
			domainCode: chDomainSelect
		}]);
		onRegisterNewChapterLedger(cleanId, cleanName);
		setChNameInput("");
		setChIdInput("");
	};
	const handleCreateSubtopic = (e) => {
		e.preventDefault();
		const cleanCode = stCodeInput.trim();
		if (!cleanCode || !stChapterSelect) return;
		const parentCh = chapters.find((c) => c.code === stChapterSelect);
		const domainCode = parentCh ? parentCh.domainCode : "QA";
		setSubtopics((prev) => [...prev, {
			id: `st-${Date.now()}`,
			code: cleanCode,
			chapterCode: stChapterSelect,
			domainCode
		}]);
		setStCodeInput("");
	};
	const handleCreateConcept = (e) => {
		e.preventDefault();
		const cleanCode = conCodeInput.trim();
		if (!cleanCode || !conSubtopicSelect) return;
		const parentSt = subtopics.find((s) => s.code === conSubtopicSelect);
		setConcepts((prev) => [...prev, {
			id: `con-${Date.now()}`,
			code: cleanCode,
			subtopicCode: conSubtopicSelect,
			chapterCode: parentSt ? parentSt.chapterCode : "TRG",
			domainCode: parentSt ? parentSt.domainCode : "QA"
		}]);
		setConCodeInput("");
	};
	const handleCreateMicroConcept = (e) => {
		e.preventDefault();
		const cleanCode = mcCodeInput.trim();
		const cleanShort = mcShortCodeInput.trim();
		if (!cleanCode || !cleanShort || !mcConceptSelect) return;
		const parentCon = concepts.find((c) => c.code === mcConceptSelect);
		setMicroConcepts((prev) => [...prev, {
			id: `mc-${Date.now()}`,
			code: cleanCode,
			shortCode: cleanShort,
			conceptCode: mcConceptSelect,
			subtopicCode: parentCon ? parentCon.subtopicCode : "Degree",
			chapterCode: parentCon ? parentCon.chapterCode : "TRG",
			domainCode: parentCon ? parentCon.domainCode : "QA"
		}]);
		setMcCodeInput("");
		setMcShortCodeInput("");
	};
	const totalDomainPct = (0, import_react.useMemo)(() => draftDomains.reduce((acc, d) => acc + (Number(d.percentage) || 0), 0), [draftDomains]);
	const isDomainSumValid = Math.abs(totalDomainPct - 100) < .001;
	const domainChapterValidity = (0, import_react.useMemo)(() => {
		return draftDomains.map((d) => {
			const sum = d.chapters.reduce((acc, c) => acc + (Number(c.percentage) || 0), 0);
			const normalized = sum / 100;
			const isValid = d.chapters.length > 0 && Math.abs(sum - 100) < .001;
			return {
				domainCode: d.domainCode,
				sum,
				normalized,
				isValid
			};
		});
	}, [draftDomains]);
	const areAllChaptersValid = domainChapterValidity.every((v) => v.isValid);
	const canSaveExam = draftExamName.trim().length > 0 && draftDomains.length > 0 && isDomainSumValid && areAllChaptersValid;
	const handleAddDraftDomainRow = () => {
		const unusedDomain = domains.find((d) => !draftDomains.some((dd) => dd.domainCode === d.code)) || domains[0];
		if (!unusedDomain) return;
		const firstCh = chapters.find((c) => c.domainCode === unusedDomain.code);
		setDraftDomains((prev) => [...prev, {
			domainCode: unusedDomain.code,
			percentage: 0,
			chapters: firstCh ? [{
				chapterCode: firstCh.code,
				percentage: 100
			}] : []
		}]);
	};
	const handleRemoveDraftDomainRow = (idx) => {
		setDraftDomains((prev) => prev.filter((_, i) => i !== idx));
	};
	const handleMoveDraftDomainRow = (idx, direction) => {
		const targetIdx = idx + direction;
		if (targetIdx < 0 || targetIdx >= draftDomains.length) return;
		setDraftDomains((prev) => {
			const copy = [...prev];
			const temp = copy[idx];
			copy[idx] = copy[targetIdx];
			copy[targetIdx] = temp;
			return copy;
		});
	};
	const handleUpdateDraftDomainCode = (idx, nextDomainCode) => {
		const firstCh = chapters.find((c) => c.domainCode === nextDomainCode);
		setDraftDomains((prev) => prev.map((item, i) => i === idx ? {
			...item,
			domainCode: nextDomainCode,
			chapters: firstCh ? [{
				chapterCode: firstCh.code,
				percentage: 100
			}] : []
		} : item));
	};
	const handleUpdateDraftDomainPct = (idx, pct) => {
		setDraftDomains((prev) => prev.map((item, i) => i === idx ? {
			...item,
			percentage: pct
		} : item));
	};
	const handleAddDraftChapterRow = (domIdx) => {
		const targetDomCode = draftDomains[domIdx].domainCode;
		const domChapters = chapters.filter((c) => c.domainCode === targetDomCode);
		const unusedCh = domChapters.find((c) => !draftDomains[domIdx].chapters.some((dc) => dc.chapterCode === c.code)) || domChapters[0];
		if (!unusedCh) return;
		setDraftDomains((prev) => prev.map((dom, i) => i === domIdx ? {
			...dom,
			chapters: [...dom.chapters, {
				chapterCode: unusedCh.code,
				percentage: 0
			}]
		} : dom));
	};
	const handleRemoveDraftChapterRow = (domIdx, chIdx) => {
		setDraftDomains((prev) => prev.map((dom, i) => i === domIdx ? {
			...dom,
			chapters: dom.chapters.filter((_, j) => j !== chIdx)
		} : dom));
	};
	const handleMoveDraftChapterRow = (domIdx, chIdx, direction) => {
		setDraftDomains((prev) => prev.map((dom, i) => {
			if (i !== domIdx) return dom;
			const targetIdx = chIdx + direction;
			if (targetIdx < 0 || targetIdx >= dom.chapters.length) return dom;
			const nextChapters = [...dom.chapters];
			const temp = nextChapters[chIdx];
			nextChapters[chIdx] = nextChapters[targetIdx];
			nextChapters[targetIdx] = temp;
			return {
				...dom,
				chapters: nextChapters
			};
		}));
	};
	const handleUpdateDraftChapter = (domIdx, chIdx, field, value) => {
		setDraftDomains((prev) => prev.map((dom, i) => i === domIdx ? {
			...dom,
			chapters: dom.chapters.map((ch, j) => j === chIdx ? {
				...ch,
				[field]: value
			} : ch)
		} : dom));
	};
	const handleSaveExamProfile = (e) => {
		e.preventDefault();
		if (!canSaveExam) return;
		const cleanDomains = draftDomains.map((d) => ({
			domainCode: d.domainCode,
			percentage: Number(d.percentage),
			chapters: d.chapters.map((c) => ({
				chapterCode: c.chapterCode,
				percentage: Number(c.percentage)
			}))
		}));
		if (configTargetId === "NEW") {
			const newId = `exam-${Date.now()}`;
			const created = {
				id: newId,
				name: draftExamName.trim(),
				domains: cleanDomains
			};
			setExams((prev) => [...prev, created]);
			setSelectedExamId(newId);
			setConfigTargetId(newId);
			setExamSaveMessage(`Created new exam "${created.name}" with all calculation metadata! Selected in Page 1.`);
		} else {
			setExams((prev) => prev.map((ex) => ex.id === configTargetId ? {
				...ex,
				name: draftExamName.trim(),
				domains: cleanDomains
			} : ex));
			setSelectedExamId(configTargetId);
			setExamSaveMessage(`Updated exam "${draftExamName.trim()}" metadata! Changes are live in Exam Info Page 1.`);
		}
		setTimeout(() => setExamSaveMessage(null), 4e3);
	};
	const selectedExam = (0, import_react.useMemo)(() => exams.find((x) => x.id === selectedExamId) || exams[0], [exams, selectedExamId]);
	const examReadinessReport = (0, import_react.useMemo)(() => {
		if (!selectedExam) return null;
		const domainBreakdowns = selectedExam.domains.map((domWeight, dIdx) => {
			const domMeta = domains.find((d) => d.code === domWeight.domainCode);
			const DnPn = domWeight.percentage;
			const DnPnNorm = DnPn / 100;
			const chapterBreakdowns = domWeight.chapters.map((chWeight, cIdx) => {
				const chMeta = chapters.find((c) => c.code === chWeight.chapterCode);
				const ledger = ledgers[chWeight.chapterCode];
				const { TQ, MM, LTM, TCR } = computeChapterTCR(ledger);
				const CnPn = chWeight.percentage;
				const CnPnNorm = CnPn / 100;
				const CLRP = TCR * CnPnNorm;
				return {
					index: cIdx + 1,
					chapterCode: chWeight.chapterCode,
					chapterName: chMeta ? chMeta.name : ledger?.chapterName || chWeight.chapterCode,
					TQ,
					MM,
					LTM,
					TCR,
					CnPn,
					CnPnNorm,
					CLRP
				};
			});
			const DRP = chapterBreakdowns.reduce((acc, ch) => acc + ch.CLRP, 0);
			const erpContribution = DRP * DnPnNorm;
			return {
				index: dIdx + 1,
				domainCode: domWeight.domainCode,
				domainName: domMeta ? domMeta.name : domWeight.domainCode,
				DnPn,
				DnPnNorm,
				DRP,
				erpContribution,
				chapters: chapterBreakdowns
			};
		});
		const ERP = domainBreakdowns.reduce((acc, d) => acc + d.erpContribution, 0);
		return {
			examName: selectedExam.name,
			ERP,
			domains: domainBreakdowns
		};
	}, [
		selectedExam,
		domains,
		chapters,
		ledgers
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full space-y-3 font-sans",
		children: [
			activeMode === "registry" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white border border-[#DFDDD4] rounded-lg shadow-2xs overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-[#F9F8F4] border-b border-[#DFDDD4] px-4 py-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderTree, { className: "w-4 h-4 text-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827]",
								children: "REGISTRY — 5 SEPARATE PAGES (NO PERCENTAGES · PURE SYLLABUS & STEP IDs)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] font-mono text-[#6B7280]",
							children: ["Page ", registryPage === "domain" ? "1/5" : registryPage === "chapter" ? "2/5" : registryPage === "subtopic" ? "3/5" : registryPage === "concept" ? "4/5" : "5/5"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 sm:grid-cols-5 border-b border-[#DFDDD4] bg-[#F5F4EF] text-xs font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setRegistryPage("domain"),
								className: `py-3 px-3 text-left sm:text-center border-r border-b sm:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${registryPage === "domain" ? "bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]" : "text-[#4B5563] hover:bg-white/60"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Domain Registry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-[#6B7280] mt-0.5",
									children: [
										"Page 1 (",
										domains.length,
										")"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setRegistryPage("chapter"),
								className: `py-3 px-3 text-left sm:text-center border-r border-b sm:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${registryPage === "chapter" ? "bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]" : "text-[#4B5563] hover:bg-white/60"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Chapter Registry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-[#6B7280] mt-0.5",
									children: [
										"Page 2 (",
										chapters.length,
										")"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setRegistryPage("subtopic"),
								className: `py-3 px-3 text-left sm:text-center border-r border-b sm:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${registryPage === "subtopic" ? "bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]" : "text-[#4B5563] hover:bg-white/60"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Subtopic Registry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-[#6B7280] mt-0.5",
									children: [
										"Page 3 (",
										subtopics.length,
										")"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setRegistryPage("concept"),
								className: `py-3 px-3 text-left sm:text-center border-r border-[#DFDDD4] transition-colors cursor-pointer ${registryPage === "concept" ? "bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]" : "text-[#4B5563] hover:bg-white/60"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Concept Registry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-[#6B7280] mt-0.5",
									children: [
										"Page 4 (",
										concepts.length,
										")"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setRegistryPage("micro"),
								className: `py-3 px-3 text-left sm:text-center col-span-2 sm:col-span-1 transition-colors cursor-pointer ${registryPage === "micro" ? "bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]" : "text-[#4B5563] hover:bg-white/60"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Micro Concept Registry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-[#6B7280] mt-0.5",
									children: [
										"Page 5 (",
										microConcepts.length,
										")"
									]
								})]
							})
						]
					}),
					registryPage === "domain" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3",
							children: "1) Domain Registry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border border-[#DFDDD4] rounded-lg overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left border-collapse font-mono text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 w-16",
											children: "S.No"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Domain Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-right",
											children: "Domain Code"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-[#F0EFEA]",
									children: domains.map((d, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-[#F9F8F4]/60",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-[#6B7280]",
												children: [idx + 1, ")"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 font-sans font-semibold text-[#111827]",
												children: d.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold",
													children: d.code
												})
											})
										]
									}, d.id))
								})]
							})
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleCreateDomain,
							className: "p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-mono font-bold text-[#1D4ED8]",
								children: "1a) Domain creation form"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter name",
										value: domNameInput,
										onChange: (e) => setDomNameInput(e.target.value),
										className: "flex-1 min-w-[220px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter code",
										value: domCodeInput,
										onChange: (e) => setDomCodeInput(e.target.value),
										className: "w-48 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create Domain" })]
									})
								]
							})]
						})]
					}),
					registryPage === "chapter" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3",
							children: "2) Chapter Registry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border border-[#DFDDD4] rounded-lg overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left border-collapse font-mono text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 w-16",
											children: "S.No"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Chapter Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Chapter ID"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-right",
											children: "Domain"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-[#F0EFEA]",
									children: chapters.map((c, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-[#F9F8F4]/60",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-[#6B7280]",
												children: [idx + 1, ")"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 font-sans font-semibold text-[#111827]",
												children: c.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 font-bold text-[#374151]",
												children: c.code
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold",
													children: c.domainCode
												})
											})
										]
									}, c.id))
								})]
							})
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleCreateChapter,
							className: "p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-mono font-bold text-[#1D4ED8]",
								children: "2a) Chapter creation form"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: chDomainSelect,
										onChange: (e) => setChDomainSelect(e.target.value),
										className: "px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]",
										children: domains.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: d.code,
											children: [
												"Select Domain: ",
												d.name,
												" (",
												d.code,
												")"
											]
										}, d.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter chapter name",
										value: chNameInput,
										onChange: (e) => setChNameInput(e.target.value),
										className: "flex-1 min-w-[200px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter ID",
										value: chIdInput,
										onChange: (e) => setChIdInput(e.target.value),
										className: "w-40 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create Chapter" })]
									})
								]
							})]
						})]
					}),
					registryPage === "subtopic" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3",
							children: "3) Subtopic Registry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border border-[#DFDDD4] rounded-lg overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left border-collapse font-mono text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 w-16",
											children: "S.No"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Subtopic Name / Code"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Domain"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-right",
											children: "Chapter"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-[#F0EFEA]",
									children: subtopics.map((st, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-[#F9F8F4]/60",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-[#6B7280]",
												children: [idx + 1, ")"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 font-sans font-semibold text-[#111827]",
												children: st.code
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-[#374151]",
												children: st.domainCode
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold",
													children: st.chapterCode
												})
											})
										]
									}, st.id))
								})]
							})
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleCreateSubtopic,
							className: "p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-mono font-bold text-[#1D4ED8]",
								children: "3a) Subtopic creation form"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: stChapterSelect,
										onChange: (e) => setStChapterSelect(e.target.value),
										className: "px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]",
										children: chapters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: c.code,
											children: [
												"Select chapter: ",
												c.name,
												" (",
												c.code,
												" · ",
												c.domainCode,
												")"
											]
										}, c.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter code",
										value: stCodeInput,
										onChange: (e) => setStCodeInput(e.target.value),
										className: "flex-1 min-w-[220px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create Subtopic" })]
									})
								]
							})]
						})]
					}),
					registryPage === "concept" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3",
							children: "4) Concept Registry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border border-[#DFDDD4] rounded-lg overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left border-collapse font-mono text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 w-16",
											children: "S.No"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Concept Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "ST (Subtopic)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Chapter"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-right",
											children: "Domain"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-[#F0EFEA]",
									children: concepts.map((con, idx) => {
										const chObj = chapters.find((c) => c.code === con.chapterCode);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-[#F9F8F4]/60",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "py-2.5 px-4 text-[#6B7280]",
													children: [idx + 1, ")"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-4 font-sans font-semibold text-[#111827]",
													children: con.code
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-4 text-[#374151]",
													children: con.subtopicCode
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-4 text-[#374151]",
													children: chObj ? `${chObj.name} (${con.chapterCode})` : con.chapterCode
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-4 text-right",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold",
														children: con.domainCode
													})
												})
											]
										}, con.id);
									})
								})]
							})
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleCreateConcept,
							className: "p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-mono font-bold text-[#1D4ED8]",
								children: "4a) Concept creation form"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: conSubtopicSelect,
										onChange: (e) => setConSubtopicSelect(e.target.value),
										className: "px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]",
										children: subtopics.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: st.code,
											children: [
												"Select subtopic: ",
												st.code,
												" (",
												st.chapterCode,
												" · ",
												st.domainCode,
												")"
											]
										}, st.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter code",
										value: conCodeInput,
										onChange: (e) => setConCodeInput(e.target.value),
										className: "flex-1 min-w-[200px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create Concept" })]
									})
								]
							})]
						})]
					}),
					registryPage === "micro" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3",
							children: "5) Micro Concept Registry (Step-Level IDs & Short Form)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border border-[#DFDDD4] rounded-lg overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left border-collapse font-mono text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 w-16",
											children: "S.No"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Micro Concept (Chapter, Domain)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4",
											children: "Parent Concept / ST"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-right",
											children: "Short form"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-[#F0EFEA]",
									children: microConcepts.map((mc, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-[#F9F8F4]/60",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-[#6B7280]",
												children: [idx + 1, ")"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 font-sans font-semibold text-[#111827]",
												children: [
													mc.code,
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono text-[#6B7280]",
														children: [
															"(",
															mc.chapterCode,
															", ",
															mc.domainCode,
															")"
														]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-[#374151]",
												children: [
													mc.conceptCode,
													" · ",
													mc.subtopicCode
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "px-2.5 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded font-bold",
													children: mc.shortCode
												})
											})
										]
									}, mc.id))
								})]
							})
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleCreateMicroConcept,
							className: "p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-mono font-bold text-[#1D4ED8]",
								children: "5a) Micro Concept creation form"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: mcConceptSelect,
										onChange: (e) => setMcConceptSelect(e.target.value),
										className: "px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]",
										children: concepts.map((con) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: con.code,
											children: [
												"Select concept: ",
												con.code,
												" (",
												con.chapterCode,
												" · ",
												con.domainCode,
												")"
											]
										}, con.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter code (e.g. MC2)",
										value: mcCodeInput,
										onChange: (e) => setMcCodeInput(e.target.value),
										className: "flex-1 min-w-[160px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Enter unique short code (e.g. T1)",
										value: mcShortCodeInput,
										onChange: (e) => setMcShortCodeInput(e.target.value),
										className: "w-56 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create Micro Concept" })]
									})
								]
							})]
						})]
					})
				]
			}),
			activeMode === "exam-page-1" && examReadinessReport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-widest text-[#6B7280]",
								children: "EXAM INFO — PAGE 1 (RESULTS VIEWER · SELECT EXAM TO LOAD METADATA)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap items-center gap-2 mt-1",
								children: exams.map((ex, idx) => {
									const isSelected = ex.id === selectedExamId;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setSelectedExamId(ex.id),
										className: `px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${isSelected ? "bg-[#1D4ED8] text-white shadow-2xs" : "bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] hover:bg-[#EFECE6]"}`,
										children: [
											idx + 1,
											") ",
											ex.name
										]
									}, ex.id);
								})
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-mono text-[#6B7280]",
							children: "Exam Editor is located at the bottom of this page"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white border-2 border-[#1D4ED8] rounded-lg p-5 shadow-2xs space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1D4ED8]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["EXAM READINESS PERCENTAGE (ERP) — ", examReadinessReport.examName] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline gap-3 mt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-4xl font-mono font-extrabold text-[#111827]",
									children: [examReadinessReport.ERP.toFixed(3), "%"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-mono text-[#6B7280]",
									children: [
										"(Weighted Roll-Up Across ",
										examReadinessReport.domains.length,
										" Configured Domains)"
									]
								})]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full md:w-96 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs font-mono",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#4B5563]",
										children: "Overall Exam Readiness"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-[#1D4ED8]",
										children: [examReadinessReport.ERP.toFixed(2), "% / 100%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full h-3 bg-[#EFECE6] rounded-full overflow-hidden border border-[#DFDDD4]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-gradient-to-r from-[#1D4ED8] to-[#16A34A] rounded-full transition-all duration-300",
										style: { width: `${Math.min(100, Math.max(0, examReadinessReport.ERP))}%` }
									})
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded bg-[#F9F8F4] border border-[#DFDDD4] font-mono text-xs space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[#4B5563] font-bold",
									children: "Formula: ERP = DRP₁(D₁P₁ / 100) + ... + DRPₙ(DₙPₙ / 100)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[#111827] break-words",
									children: [
										"ERP =",
										" ",
										examReadinessReport.domains.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [i > 0 && " + ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											d.DRP.toFixed(3),
											"% × (",
											d.DnPn,
											"/100)"
										] })] }, d.domainCode))
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[#1D4ED8] font-bold",
									children: [
										"ERP =",
										" ",
										examReadinessReport.domains.map((d) => `${d.erpContribution.toFixed(3)}%`).join(" + "),
										" ",
										"= ",
										examReadinessReport.ERP.toFixed(3),
										"%"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
						children: examReadinessReport.domains.map((dom) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs space-y-3 flex flex-col justify-between",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-[#E5E3DC]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D4ED8]",
											children: [
												"DOMAIN ",
												dom.index,
												": ",
												dom.domainName,
												" [",
												dom.domainCode,
												"]"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs font-mono text-[#6B7280] mt-0.5",
											children: [
												"Exam Weight (D",
												dom.index,
												"P",
												dom.index,
												"): ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [dom.DnPn, "%"] }),
												" (",
												dom.DnPnNorm.toFixed(2),
												") · ERP Contribution:",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#15803D]",
													children: [
														"+",
														dom.erpContribution.toFixed(3),
														"%"
													]
												})
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] font-mono uppercase text-[#6B7280]",
												children: [
													"DOMAIN READINESS (DRP_",
													dom.index,
													")"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-2xl font-mono font-extrabold text-[#111827]",
												children: [dom.DRP.toFixed(3), "%"]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-3 py-2 rounded bg-[#F9F8F4] border border-[#E5E3DC] font-mono text-[11px] space-y-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[#4B5563] font-semibold",
											children: [
												"DRP_",
												dom.index,
												" = CLRP₁ + ... + CLRPₙ"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[#1D4ED8] font-bold",
											children: [
												"DRP_",
												dom.index,
												" =",
												" ",
												dom.chapters.map((c) => `${c.CLRP.toFixed(3)}%`).join(" + "),
												" =",
												" ",
												dom.DRP.toFixed(3),
												"%"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] font-mono font-bold uppercase tracking-wider text-[#374151]",
											children: "CHAPTER LEVEL READINESS PERCENTAGE (CLRP = TCRₖ × CₖPₖ/100):"
										}), dom.chapters.map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2.5 rounded border border-[#E5E3DC] bg-[#F9F8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-sans font-bold text-[#111827]",
														children: [
															ch.index,
															". ",
															ch.chapterName,
															" [",
															ch.chapterCode,
															"]"
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => onJumpToChapterLedger(ch.chapterCode),
														className: "px-1.5 py-0.5 text-[10px] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded flex items-center gap-0.5 cursor-pointer",
														title: "Inspect this chapter's question pool ledger",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TCR Ledger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "w-3 h-3" })]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] text-[#6B7280]",
													children: [
														"TCR_",
														ch.index,
														":",
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
															className: "text-[#111827]",
															children: [ch.TCR.toFixed(3), "%"]
														}),
														" (LTM / MM = ",
														ch.LTM,
														" / ",
														ch.MM,
														") · Weight C",
														ch.index,
														"P",
														ch.index,
														":",
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [ch.CnPn, "%"] }),
														" (",
														ch.CnPnNorm.toFixed(2),
														")"
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "sm:text-right bg-white px-2.5 py-1.5 rounded border border-[#DFDDD4] shrink-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-[#6B7280]",
													children: [
														"CLRP_",
														ch.index,
														" = ",
														ch.TCR.toFixed(2),
														"% × ",
														ch.CnPnNorm.toFixed(2)
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-sm font-bold text-[#15803D]",
													children: [
														"= ",
														ch.CLRP.toFixed(3),
														"%"
													]
												})]
											})]
										}, ch.chapterCode))]
									})
								]
							})
						}, dom.domainCode))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono text-[#6B7280]",
							children: "Exam Info Sub-Page · Configure Domain & Chapter Percentages or Create New Exams"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								handleSelectConfigTarget(selectedExamId);
								onSwitchMode("exam-page-2");
							},
							className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "w-3.5 h-3.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Open Exam Editor (Configure & Create Exams)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })
							]
						})]
					})
				]
			}),
			activeMode === "exam-page-2" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E3DC]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827]",
								children: "EXAM EDITOR — SUB-PAGE OF EXAM INFO (CREATION & CONFIGURATION ENGINE)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 text-xs font-mono",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#6B7280]",
										children: "Select Exam to Edit or Create New:"
									}),
									exams.map((ex, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => handleSelectConfigTarget(ex.id),
										className: `px-2.5 py-1 rounded border flex items-center gap-1 cursor-pointer transition-colors ${configTargetId === ex.id ? "bg-[#1D4ED8] text-white border-[#1D4ED8] font-bold" : "bg-[#F9F8F4] text-[#374151] border-[#DFDDD4] hover:bg-[#EFECE6]"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											i + 1,
											") ",
											ex.name
										] })]
									}, ex.id)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => handleSelectConfigTarget("NEW"),
										className: `px-3 py-1 rounded border flex items-center gap-1 cursor-pointer transition-colors ${configTargetId === "NEW" ? "bg-[#15803D] text-white border-[#15803D] font-bold" : "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7] font-semibold"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+ Create New Exam" })]
									})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSaveExamProfile,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3 bg-[#F9F8F4] p-3 rounded-lg border border-[#DFDDD4]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-3 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-mono font-bold text-[#374151]",
										children: configTargetId === "NEW" ? "NEW EXAM NAME:" : "EDITING EXAM NAME:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: draftExamName,
										onChange: (e) => setDraftExamName(e.target.value),
										placeholder: "Enter Exam Name (e.g. SSC CGL Tier 1)",
										className: "px-3 py-1.5 text-sm font-mono font-bold bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8] min-w-[260px]"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-mono text-[#6B7280]",
									children: configTargetId === "NEW" ? "Mode: Creating brand new exam metadata profile" : "Mode: Editing existing exam metadata profile"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3.5 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-mono font-bold text-[#111827]",
											children: "STEP 1: SELECT, ORDER & INPUT DOMAIN PERCENTAGES (DnPn)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: handleAddDraftDomainRow,
											className: "px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+ Add Domain" })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "space-y-2",
										children: draftDomains.map((domRow, dIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2 bg-white p-2 rounded border border-[#E5E3DC]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-0.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: dIdx === 0,
														onClick: () => handleMoveDraftDomainRow(dIdx, -1),
														className: "p-1 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer",
														title: "Move Domain Up",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "w-3.5 h-3.5" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: dIdx === draftDomains.length - 1,
														onClick: () => handleMoveDraftDomainRow(dIdx, 1),
														className: "p-1 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer",
														title: "Move Domain Down",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "w-3.5 h-3.5" })
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs font-mono font-bold text-[#1D4ED8] w-14",
													children: [
														"D",
														dIdx + 1,
														"P",
														dIdx + 1,
														":"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													value: domRow.domainCode,
													onChange: (e) => handleUpdateDraftDomainCode(dIdx, e.target.value),
													className: "flex-1 min-w-[180px] px-2.5 py-1 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827]",
													children: domains.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
														value: d.code,
														children: [
															d.name,
															" (",
															d.code,
															")"
														]
													}, d.id))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "number",
														min: 0,
														max: 100,
														step: "any",
														value: domRow.percentage,
														onChange: (e) => handleUpdateDraftDomainPct(dIdx, parseFloat(e.target.value) || 0),
														className: "w-24 px-2.5 py-1 text-right text-xs font-mono font-bold bg-white border border-[#D1CFC7] rounded text-[#111827]"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-mono text-[#4B5563]",
														children: "%"
													})]
												}),
												draftDomains.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleRemoveDraftDomainRow(dIdx),
													className: "p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded cursor-pointer",
													title: "Remove domain",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5" })
												})
											]
										}, `${domRow.domainCode}-${dIdx}`))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `p-2.5 rounded border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${isDomainSumValid ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]" : "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [isDomainSumValid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 shrink-0 text-[#16A34A]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 shrink-0 text-[#D97706]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "RULE 1:" }),
												" All percentage summation must be",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "exactly 100%" }),
												" for any given exam (Σ DnPn = 100%)."
											] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold",
											children: [
												"Current Sum: ",
												totalDomainPct.toFixed(1),
												"% / 100%",
												" ",
												isDomainSumValid ? "✓" : "✗"
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3.5 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-mono font-bold text-[#111827]",
										children: "STEP 2: SELECT, ORDER & INPUT CHAPTER PERCENTAGES PER DOMAIN (CnPn)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-1 md:grid-cols-2 gap-3",
										children: draftDomains.map((domRow, dIdx) => {
											const domChapters = chapters.filter((c) => c.domainCode === domRow.domainCode);
											const validity = domainChapterValidity[dIdx];
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "bg-white border border-[#DFDDD4] rounded-lg p-3 space-y-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between border-b border-[#E5E3DC] pb-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-xs font-mono font-bold text-[#1D4ED8]",
															children: [
																"Domain ",
																dIdx + 1,
																": ",
																domRow.domainCode,
																" (D",
																dIdx + 1,
																"P",
																dIdx + 1,
																" =",
																" ",
																domRow.percentage,
																"%)"
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => handleAddDraftChapterRow(dIdx),
															className: "px-2 py-0.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-[11px] font-mono font-semibold cursor-pointer",
															children: "+ Add Chapter"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "space-y-1.5",
														children: domRow.chapters.map((chRow, cIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1 text-xs font-mono",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex items-center",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																		type: "button",
																		disabled: cIdx === 0,
																		onClick: () => handleMoveDraftChapterRow(dIdx, cIdx, -1),
																		className: "p-0.5 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer",
																		title: "Move Chapter Up",
																		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "w-3 h-3" })
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																		type: "button",
																		disabled: cIdx === domRow.chapters.length - 1,
																		onClick: () => handleMoveDraftChapterRow(dIdx, cIdx, 1),
																		className: "p-0.5 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer",
																		title: "Move Chapter Down",
																		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "w-3 h-3" })
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "text-[11px] font-bold text-[#6B7280] w-11",
																	children: [
																		"C",
																		cIdx + 1,
																		"P",
																		cIdx + 1,
																		":"
																	]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
																	value: chRow.chapterCode,
																	onChange: (e) => handleUpdateDraftChapter(dIdx, cIdx, "chapterCode", e.target.value),
																	className: "flex-1 px-2 py-1 bg-white border border-[#D1CFC7] rounded text-[#111827]",
																	children: domChapters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
																		value: c.code,
																		children: [
																			c.name,
																			" [",
																			c.code,
																			"]"
																		]
																	}, c.id))
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																	type: "number",
																	min: 0,
																	max: 100,
																	step: "any",
																	value: chRow.percentage,
																	onChange: (e) => handleUpdateDraftChapter(dIdx, cIdx, "percentage", parseFloat(e.target.value) || 0),
																	className: "w-18 px-2 py-1 text-right font-bold bg-white border border-[#D1CFC7] rounded text-[#111827]"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[#6B7280]",
																	children: "%"
																}),
																domRow.chapters.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																	type: "button",
																	onClick: () => handleRemoveDraftChapterRow(dIdx, cIdx),
																	className: "p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded cursor-pointer",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3 h-3" })
																})
															]
														}, `${chRow.chapterCode}-${cIdx}`))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: `px-2.5 py-1.5 rounded text-[11px] font-mono flex items-center justify-between ${validity?.isValid ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]" : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Normalized Sum (Σ CnPn/100):" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
															validity?.normalized.toFixed(2),
															" (",
															validity?.sum.toFixed(1),
															"%)",
															validity?.isValid ? " = 1.00 ✓" : " ≠ 1.00 ✗"
														] })]
													})
												]
											}, `ch-group-${domRow.domainCode}-${dIdx}`);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `p-2.5 rounded border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${areAllChaptersValid ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]" : "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [areAllChaptersValid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 shrink-0 text-[#16A34A]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 shrink-0 text-[#D97706]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "RULE 2:" }),
												" For every domain, sum of all its chapters' percentage must also equal ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "1 (100%)" }),
												"."
											] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold",
											children: areAllChaptersValid ? "All Domains Equal 1.00 (100%) ✓" : "Fix Chapter Sums to Equal 100%"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: !canSaveExam,
									className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#9CA3AF] text-white text-xs font-mono font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: configTargetId === "NEW" ? "Create & Save New Exam Profile" : `Save Changes to "${draftExamName}"` })]
								}), examSaveMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-mono font-bold text-[#15803D]",
									children: examSaveMessage
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSwitchMode("exam-page-1"),
						className: "px-3.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "w-3.5 h-3.5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Back to Exam Info (Results Dashboard)" })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-mono text-[#6B7280]",
						children: "Exam Editor · Sub-page of Exam Info"
					})]
				})]
			})
		]
	});
};
// src/utils/mkmlStorageScanner.ts
var CHAPTER_MKML_STORAGE = {
	TD: `<Domain == QA>
<Chapter == QA-TD>
<link-css-id: qa-td>

<!-- Root Node for Time and Distance -->
<box points = (40,1),(60,1),(60,4),(40,4) background-color = #0F172A color = #FFFFFF>
  TIME AND DISTANCE (QA-TD)
</box>

<!-- SUBTOPIC 1: BASIC WORK RATES (QA-TD-BWR) -->
<Subtopic == QA-TD-BWR>
  <box points = (5,6),(45,6),(45,40),(5,40) background-color = #0F172A color = #38BDF8>
    1) Basic Work Rates (QA-TD-BWR)
  </box>

  <!-- CONCEPT / VARIANT 1.1: V1 (2 Questions) -->
  <Concept == QA-TD-BWR-V1>
    <MC == QA-TD-BWR-V1-MC1>
      Step T1: Speed = Distance / Time (Direct Ratio Conversion)
    </MC>
    <qn all>
      <Qn>
        <id == QA-TD-BWR-V1-1>
        <text = A train covers 180 km in 3 hours. Find its speed in m/s.>
        <Options>
          <A = 16.67 m/s>
          <B = 15 m/s>
          <C = 20 m/s>
          <D = 18 m/s>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TD-BWR-V1-2>
        <text = Walking at 3/4 of his usual speed, a man is 15 minutes late. Find his usual time.>
        <Options>
          <A = 30 min>
          <B = 45 min>
          <C = 60 min>
          <D = 75 min>
        </Options>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>

  <!-- CONCEPT / VARIANT 1.2: V2 (1 Question) -->
  <Concept == QA-TD-BWR-V2>
    <MC == QA-TD-BWR-V2-MC1>
      Step T2: Average Speed Harmonic Mean = 2xy / (x + y)
    </MC>
    <qn all>
      <Qn>
        <id == QA-TD-BWR-V2-1>
        <text = A car travels from A to B at 40 km/h and returns at 60 km/h. Find average speed.>
        <Options>
          <A = 50 km/h>
          <B = 48 km/h>
          <C = 45 km/h>
          <D = 52 km/h>
        </Options>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>

<!-- SUBTOPIC 2: RELATIVE SPEED & TRAINS (QA-TD-RST) -->
<Subtopic == QA-TD-RST>
  <box points = (50,6),(90,6),(90,40),(50,40) background-color = #0F172A color = #38BDF8>
    2) Relative Speed & Trains (QA-TD-RST)
  </box>

  <!-- CONCEPT / VARIANT 2.1: V1 (3 Questions) -->
  <Concept == QA-TD-RST-V1>
    <MC == QA-TD-RST-V1-MC1>
      Step T3: Opposite Direction Relative Speed = (S1 + S2)
    </MC>
    <qn all>
      <Qn>
        <id == QA-TD-RST-V1-1>
        <text = Two trains 120m and 180m long run in opposite directions at 50 km/h and 40 km/h. Time to cross?>
        <Options>
          <A = 10 s>
          <B = 12 s>
          <C = 15 s>
          <D = 18 s>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TD-RST-V1-2>
        <text = A train crosses a pole in 15s and a 100m platform in 25s. Find the length of the train.>
        <Options>
          <A = 120 m>
          <B = 150 m>
          <C = 180 m>
          <D = 200 m>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TD-RST-V1-3>
        <text = Two trains start at the same time from A and B towards each other and after crossing take 4h and 9h. Ratio of speeds?>
        <Options>
          <A = 2 : 3>
          <B = 3 : 2>
          <C = 4 : 9>
          <D = 9 : 4>
        </Options>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>`,
	TRG: `<Domain == QA>
<Chapter == QA-TRG>
<link-css-id: qa-trg>

<line m color = #38BDF8>(13,4),(13,7)</line m>
<line m color = #38BDF8>(13,10),(13,11),(6,11),(6,12)</line m>
<line m color = #38BDF8>(13,11),(20,11),(20,12)</line m>
<line m color = #0D9488>(6,25),(6,28)</line m>
<line m color = #2563EB>(20,25),(20,28)</line m>

<box points = (7,1),(19,1),(19,4),(7,4) background-color = #1E3A8A color = #FFFFFF>
  <h2>TRIGONOMETRY (QA-TRG)</h2>
</box>

<Subtopic == QA-TRG-BS>
  <box points = (5,7),(21,7),(21,10),(5,10) background-color = #0D9488 color = #FFFFFF>
    <h3>Subtopic 1: Basics (QA-TRG-BS)</h3>
  </box>

  <Concept == QA-TRG-BS-FR>
    <MC == QA-TRG-BS-FR-MC1>
      <box points = (2,12),(10,12),(10,25),(2,25) background-color = #F1F5F9 color = #0F172A>
        <h3>MC1 (T1): Fundamental Right-Triangle Ratios</h3>
        <p><math == sin theta = oppo / hypo> | <math == cos theta = Adj / hypo></p>
        <p><math == tan theta = sin theta / cos theta = oppo / Adj></p>
        <p><math == cosec theta = 1 / sin theta = hypo / oppo></p>
        <p><math == sec theta = 1 / cos theta = hypo / Adj></p>
        <p><math == cot theta = 1 / tan theta = Adj / oppo></p>
        <rule == Warm-up (3-4-5 tri): (i) <math == sin alpha + cos beta = 3/5 + 3/5 = 6/5> (ii) <math == tan^2 alpha + cot^2 beta = 9/16 + 9/16 = 9/8>>
      </box>
    </MC>

    <line d line-color = #1D4ED8 text-color = #1E3A8A>(11,13),(11,20) oppo (O = 3)</line d>
    <line d line-color = #15803D text-color = #14532D>(11,20),(15,20) Adj (M = 4)</line d>
    <line d line-color = #E11D48 text-color = #991B1B>(11,13),(15,20) hypo (H = 5)</line d>

    <box w points = (10,22),(16,22),(16,25),(10,25) text-color = #0F172A>
      Right ΔABC (∠B = 90°, α at A, β at C)
    </box w>

    <MC == QA-TRG-BS-FR-MC2>
      <box points = (16,12),(24,12),(24,25),(16,25) background-color = #FFF4CC color = #78350F>
        <h3>MC2 (T2): Pythagorean Triplets Generator</h3>
        <p>Odd n: <math == n -> n^2 -> n^2 / 2 => (5, 12, 13)></p>
        <p>Even y: <math == y -> y^2 / 2 = A -> 2x + 2 = A => (6, 8, 10)></p>
      </box>
    </MC>

    <MC == QA-TRG-BS-FR-MC3>
      <box points = (2,28),(12,28),(12,37),(2,37) background-color = #DCFCE7 color = #14532D>
        <h3>MC3 (T3): Dual-Vertex / Complementary Angle Switch</h3>
        <p>In right <math == tri ABC> (<math == ang B = 90 deg>): <math == sin A = cos C> | <math == cos A = sin C></p>
      </box>
    </MC>

    <MC == QA-TRG-BS-FR-TG>
      <box points = (14,28),(24,28),(24,37),(14,37) background-color = #F1F5F9 color = #0F172A>
        <h3>TG: Target Algebraic Substitution &amp; Simplification</h3>
        <p>Homogeneous <math == sin theta / cos theta> substitution &amp; fraction reduction.</p>
      </box>
    </MC>

    <qn all>
      <Qn>
        <id == QA-TRG-BS-FR-1>
        <text = 1) If tan A = 4/3, 0° ≤ A ≤ 90°, then find the value of sin A.>
        <Options>
          <A = 4/5>
          <B = 3/5>
          <C = 3/4>
          <D = 5/4>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-2>
        <text = 2) If sin θ = 9/41, 0° < θ < 90°, then find cot θ. [SSC CGL Mains 2022]>
        <Options>
          <A = 9/40>
          <B = 40/9>
          <C = 41/40>
          <D = 40/41>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-3>
        <text = 3) If tan A = 2/5, find sec²A / cosec²A ? [SSC CPO]>
        <Options>
          <A = 2/5>
          <B = 4/25>
          <C = 25/4>
          <D = 4/29>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-4>
        <text = 4) If sin β = 1/3, find (sec β - tan β)³ = ?>
        <Options>
          <A = 1 / √8>
          <B = 1 / 8>
          <C = √8 / 3>
          <D = 2 / √8>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-5>
        <text = 5) If cos θ = √3 / 2, find tan²θ × cos²θ = ? [SSC CGL 2023]>
        <Options>
          <A = 1/2>
          <B = 1/3>
          <C = 1/4>
          <D = 3/4>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-6>
        <text = 6) If 5 sin θ - 4 cos θ = 0, 0° < θ < 90°, then find (5 sin θ + 2 cos θ) / (5 sin θ + 3 cos θ) = ? [SSC CGL 2023]>
        <Options>
          <A = 5/7>
          <B = 6/7>
          <C = 4/7>
          <D = 3/7>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-7>
        <text = 7) If tan θ = 3/4, then find (1 + sin θ) / (1 - sin θ) = ?>
        <Options>
          <A = 2>
          <B = 3>
          <C = 4>
          <D = 5>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-8>
        <text = 8) If 5 cot θ = 3, then find (6 sin θ - 3 cos θ) / (7 sin θ + 3 cos θ) = ? [SSC CGL Prelims 2023]>
        <Options>
          <A = 21/44>
          <B = 39/44>
          <C = 21/35>
          <D = 19/44>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-9>
        <text = 9) If sin A = 2/5, find the value of (5 sin A + 2 cosec A) / (√21 sec A) = ? [SSC CHSL 2023]>
        <Options>
          <A = 5/7>
          <B = 7/5>
          <C = 2/5>
          <D = 7/21>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-10>
        <text = 10) If sec A = 17/8, find the value of (34 sin A + 15 cot A) / (68 cos A - 16 tan A) = ?>
        <Options>
          <A = 17>
          <B = 19>
          <C = 21>
          <D = 38>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-11>
        <text = 11) If (3 sin θ - cos θ) / (cos θ + sin θ) = 1, then find cot θ = ?>
        <Options>
          <A = 0>
          <B = 1>
          <C = 1/2>
          <D = 2>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-12>
        <text = 12) If (sin θ - cos θ) / (sin θ + cos θ) = 4/5, find cosec²θ / (2 - cosec²θ) = ? [SSC CHSL]>
        <Options>
          <A = 40/41>
          <B = 41/40>
          <C = 82/81>
          <D = 81/80>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-13>
        <text = 13) If sec θ = a/b, then find (1 - tan²θ) / (2 - sin²θ) = ? [SSC CGL Mains]>
        <Options>
          <A = a²(2b² - a²) / [b²(a² + b²)]>
          <B = b²(2a² - b²) / [a²(a² + b²)]>
          <C = a²(a² - 2b²) / [b²(a² + b²)]>
          <D = (2b² - a²) / (a² + b²)>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-14>
        <text = 14) If sin²θ / (tan²θ - sin²θ) = 5, find (24 sin²θ - 15 sec²θ) / (6 cosec²θ - 7 cot²θ) = ?>
        <Options>
          <A = 14>
          <B = -14>
          <C = -12>
          <D = 12>
        </Options>
        <answer = B>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-15>
        <text = 15) If (sec θ - tan θ) / (sec θ + tan θ) = 1/7, find (cosec θ + cot²θ) / (cosec θ - cot²θ) = ?>
        <Options>
          <A = 19/5>
          <B = 5/19>
          <C = 17/5>
          <D = 19/9>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-16>
        <text = 15b) In ΔABC right-angled at B, if tan A = 1 / √3, find sin A cos C + cos A sin C = ?>
        <Options>
          <A = 0>
          <B = 1/2>
          <C = 1>
          <D = √3 / 2>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-17>
        <text = 16) In ΔABC right-angled at B, if tan A = 1/2, then find [sin A (cos C + cos A)] / [cos C (sin C - sin A)] = ?>
        <Options>
          <A = 1>
          <B = 2>
          <C = 3>
          <D = 5>
        </Options>
        <answer = C>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-18>
        <text = 17) In ΔABC, ∠B = 90° and AB : BC = 1 : 2. What is the value of cos A + tan C ?>
        <Options>
          <A = (2 + √5) / (2√5)>
          <B = (1 + √5) / (2√5)>
          <C = 3 / √5>
          <D = √5 / 2>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-19>
        <text = 18) If sin A = 5/13 and 7 cot B = 24, find (sec A cos B)(cosec B tan A) = ?>
        <Options>
          <A = 65/42>
          <B = 42/65>
          <C = 13/14>
          <D = 25/12>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-20>
        <text = 19) If sin 23° = a/b, find sec 23° - sin 67° = ?>
        <Options>
          <A = a² / [b √(b² - a²)]>
          <B = b² / [a √(b² - a²)]>
          <C = a / √(b² - a²)>
          <D = √(b² - a²) / b>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-21>
        <text = 20) If sec 31° = x, find sin² 59° + (1 / sec² 31°) - [1 / (sin² 59° cosec² 59°)] = ?>
        <Options>
          <A = (2 - x²) / x²>
          <B = (x² - 2) / x²>
          <C = 2 / x²>
          <D = 1 / x²>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-22>
        <text = 21) If tan B = 5/3, find (cosec B + sin B) / (cos B - sec B) = ?>
        <Options>
          <A = -177 / 125>
          <B = 177 / 125>
          <C = -59 / 25>
          <D = 59 / 125>
        </Options>
        <answer = A>
      </Qn>
      <Qn>
        <id == QA-TRG-BS-FR-23>
        <text = 22) If cos θ = 12/13, find [sin θ (1 - tan θ)] / [tan θ (1 + cosec θ)] = ?>
        <Options>
          <A = 35 / 234>
          <B = 25 / 234>
          <C = 35 / 156>
          <D = 7 / 18>
        </Options>
        <answer = A>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>`,
	PN: `<Domain == Eng>
<Chapter == Eng-PN>
<Subtopic == Eng-PN-PER>
  <Concept == Eng-PN-PER-C1>
    <MC == Eng-PN-PER-C1-MC1>Trap 1: Prepositions (between, let, like, but, except) force objective case</MC>
    <qn all>
      <Qn>
        <id == Eng-PN-PER-C1-1>
        <text = Between you and I, the secretary is not going to resign.>
        <answer = A>
      </Qn>
      <Qn>
        <id == Eng-PN-PER-C1-2>
        <text = Let he and I complete the assignment first.>
        <answer = A>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>
<Subtopic == Eng-PN-REL>
  <Concept == Eng-PN-REL-C1>
    <MC == Eng-PN-REL-C1-MC1>Who vs Whom: Count Finite Verbs (F.V) vs Subjects</MC>
    <qn all>
      <Qn>
        <id == Eng-PN-REL-C1-1>
        <text = The candidate whom you said was selected has arrived.>
        <answer = B>
      </Qn>
    </qn all>
  </Concept>
</Subtopic>`
};
function scanChapterStorageAndMarks(chapterCode, ledger, domains, chapters, subtopics, concepts, _microConcepts, customMkml) {
	const chMeta = chapters.find((c) => c.code.toUpperCase() === chapterCode.toUpperCase());
	const domainCode = chMeta ? chMeta.domainCode : chapterCode === "PN" ? "Eng" : "QA";
	const domMeta = domains.find((d) => d.code.toUpperCase() === domainCode.toUpperCase());
	const domainName = domMeta ? domMeta.name : domainCode;
	const chapterName = chMeta ? chMeta.name : ledger.chapterName || chapterCode;
	const chapterId = `${domainCode}-${chapterCode}`;
	const rawMkml = customMkml || CHAPTER_MKML_STORAGE[chapterCode] || "";
	const attemptsByUniqueId = {};
	const orderedLedgerAttempts = [];
	Object.entries(ledger.concepts).forEach(([_cKey, qMap]) => {
		Object.entries(qMap).forEach(([qKey, history]) => {
			attemptsByUniqueId[qKey] = history;
			orderedLedgerAttempts.push(history);
		});
	});
	const scannedSubtopics = [];
	const allQuestions = [];
	const subtopicRegex = /<Subtopic\s*==\s*([^>]+)>([\s\S]*?)<\/Subtopic>/gi;
	let stMatch;
	let globalQCursor = 0;
	while ((stMatch = subtopicRegex.exec(rawMkml)) !== null) {
		const rawSubtopicId = stMatch[1].trim();
		const stBody = stMatch[2];
		const stParts = rawSubtopicId.split("-");
		const subtopicShortCode = stParts[stParts.length - 1] || rawSubtopicId;
		const regSubtopic = subtopics.find((s) => s.code.toUpperCase() === rawSubtopicId.toUpperCase() || s.code.toUpperCase() === subtopicShortCode.toUpperCase() || s.chapterCode.toUpperCase() === chapterCode.toUpperCase() && s.code.toUpperCase().includes(subtopicShortCode.toUpperCase()));
		const subtopicName = regSubtopic ? regSubtopic.code : {
			BS: "Basics",
			BWR: "Basic Work Rates",
			RST: "Relative Speed & Trains",
			ANG: "Degree (Allied Angles)",
			PER: "Personal Pronouns",
			REL: "Relative Pronouns"
		}[subtopicShortCode.toUpperCase()] || subtopicShortCode;
		const scannedConcepts = [];
		const subtopicQuestions = [];
		const conceptRegex = /<Concept\s*==\s*([^>]+)>([\s\S]*?)<\/Concept>/gi;
		let conMatch;
		while ((conMatch = conceptRegex.exec(stBody)) !== null) {
			const rawConceptId = conMatch[1].trim();
			const conBody = conMatch[2];
			const conParts = rawConceptId.split("-");
			const conceptShortCode = conParts[conParts.length - 1] || rawConceptId;
			const mcIds = [];
			const mcRegex = /<MC\s*==\s*([^>]+)>/gi;
			let mcMatch;
			while ((mcMatch = mcRegex.exec(conBody)) !== null) mcIds.push(mcMatch[1].trim());
			const regConcept = concepts.find((c) => c.code.toUpperCase() === rawConceptId.toUpperCase() || c.code.toUpperCase() === conceptShortCode.toUpperCase());
			const conceptName = regConcept ? regConcept.code : conceptShortCode;
			const qnRegex = /<Qn>([\s\S]*?)<\/Qn>/gi;
			let qnMatch;
			let qIdxInConcept = 0;
			const conceptQuestions = [];
			while ((qnMatch = qnRegex.exec(conBody)) !== null) {
				qIdxInConcept++;
				const qnBody = qnMatch[1];
				const explicitIdMatch = qnBody.match(/<id\s*==\s*([^>]+)>/i);
				const chainedUniqueId = explicitIdMatch ? explicitIdMatch[1].trim() : `${domainCode}-${chapterCode}-${subtopicShortCode}-${conceptShortCode}-${qIdxInConcept}`;
				const attempts = attemptsByUniqueId[chainedUniqueId] || orderedLedgerAttempts[globalQCursor] || [];
				globalQCursor++;
				const qItem = {
					uniqueId: chainedUniqueId,
					questionIndex: qIdxInConcept,
					domainCode,
					chapterCode,
					subtopicId: rawSubtopicId,
					subtopicShortCode,
					conceptId: rawConceptId,
					conceptShortCode,
					microConceptIds: mcIds,
					rawQnBody: qnBody.trim(),
					attempts
				};
				conceptQuestions.push(qItem);
				subtopicQuestions.push(qItem);
				allQuestions.push(qItem);
			}
			scannedConcepts.push({
				conceptId: rawConceptId,
				conceptCode: conceptShortCode,
				conceptName,
				subtopicId: rawSubtopicId,
				microConceptIds: mcIds,
				questions: conceptQuestions
			});
		}
		scannedSubtopics.push({
			subtopicId: rawSubtopicId,
			subtopicCode: subtopicShortCode,
			subtopicName,
			concepts: scannedConcepts,
			questions: subtopicQuestions
		});
	}
	if (scannedSubtopics.length === 0) {
		const defaultSubtopicCode = subtopics.filter((s) => s.chapterCode.toUpperCase() === chapterCode.toUpperCase())[0]?.code || "ST1";
		const defaultSubtopicId = `${domainCode}-${chapterCode}-${defaultSubtopicCode.replace(/\s+/g, "")}`;
		const conceptNodes = [];
		const stQuestions = [];
		Object.entries(ledger.concepts).forEach(([cMid, qMap]) => {
			const cId = `${defaultSubtopicId}-${cMid}`;
			const cQuestions = [];
			let idx = 0;
			Object.entries(qMap).forEach(([_oldQid, history]) => {
				idx++;
				const uniqueId = `${domainCode}-${chapterCode}-${defaultSubtopicCode.replace(/\s+/g, "")}-${cMid}-${idx}`;
				const item = {
					uniqueId,
					questionIndex: idx,
					domainCode,
					chapterCode,
					subtopicId: defaultSubtopicId,
					subtopicShortCode: defaultSubtopicCode,
					conceptId: cId,
					conceptShortCode: cMid,
					microConceptIds: [],
					rawQnBody: `<id == ${uniqueId}>`,
					attempts: history
				};
				cQuestions.push(item);
				stQuestions.push(item);
				allQuestions.push(item);
			});
			conceptNodes.push({
				conceptId: cId,
				conceptCode: cMid,
				conceptName: cMid,
				subtopicId: defaultSubtopicId,
				microConceptIds: [],
				questions: cQuestions
			});
		});
		scannedSubtopics.push({
			subtopicId: defaultSubtopicId,
			subtopicCode: defaultSubtopicCode,
			subtopicName: defaultSubtopicCode,
			concepts: conceptNodes,
			questions: stQuestions
		});
	}
	return {
		domainCode,
		domainName,
		chapterId,
		chapterCode,
		chapterName,
		subtopics: scannedSubtopics,
		allQuestions
	};
}
function formatMarksTexFile(tree, timing) {
	const lines = [
		`# marks.tex — Separate Marks & Attempt Storage for <Chapter == ${tree.chapterId}>`,
		`# Pace Thresholds: Fast <= ${timing.fastLimit}s (+2) | Med <= ${timing.mediumLimit}s (+1) | Slow <= ${timing.slowLimit}s (+0.5)`,
		""
	];
	tree.allQuestions.forEach((q) => {
		lines.push("{");
		lines.push(`  unique ID : <${q.uniqueId}>`);
		if (q.attempts.length === 0) lines.push("  # Status: Not Asked Yet (Pending)");
		else q.attempts.forEach((att, idx) => {
			const [status, seconds, accMark, timeMark] = att;
			const isCorrectStr = status === "C" ? `Yes - +${accMark}` : status === "W" ? `Wrong - ${accMark}` : `Skipped - ${accMark}`;
			const timeStr = status === "C" ? `${seconds}s - +${timeMark}` : `Nil (${seconds}s) - 0`;
			lines.push("  {");
			lines.push(`    A${idx + 1} :`);
			lines.push(`      Is correct - ${isCorrectStr}`);
			lines.push(`      Time       - ${timeStr}`);
			lines.push("  }");
		});
		lines.push("}");
		lines.push("");
	});
	return lines.join("\n");
}
function computeScopeMetrics(questions, timing, topicTotalQs, topicTotalLTM) {
	const scopeQuestionsCount = questions.length;
	let NQC = 0;
	let NQW = 0;
	let NQS = 0;
	let NQNA = 0;
	let nFast = 0;
	let nMed = 0;
	let nSlow = 0;
	let nOverTimeCorrect = 0;
	questions.forEach((q) => {
		if (!q.attempts || q.attempts.length === 0) {
			NQNA++;
			return;
		}
		const [status, seconds] = q.attempts[q.attempts.length - 1];
		if (status === "C") {
			NQC++;
			if (seconds <= timing.fastLimit) nFast++;
			else if (seconds <= timing.mediumLimit) nMed++;
			else if (seconds <= timing.slowLimit) nSlow++;
			else nOverTimeCorrect++;
		} else if (status === "W") NQW++;
		else if (status === "S") NQS++;
	});
	const attemptedCount = NQC + NQW + NQS;
	const MMS = scopeQuestionsCount * 3;
	const correctMarks = NQC * 1;
	const wrongPenalty = NQW * .5;
	const skipPenalty = NQS * .2;
	const ARMNT = Number((correctMarks - wrongPenalty - skipPenalty).toFixed(2));
	const fastMarks = nFast * 2;
	const medMarks = nMed * 1;
	const slowMarks = nSlow * .5;
	const NTMS = Number((fastMarks + medMarks + slowMarks).toFixed(2));
	const LTMS = Number((ARMNT + NTMS).toFixed(2));
	const availableMarks = Number((MMS - LTMS).toFixed(2));
	const completionPct = MMS > 0 ? LTMS / MMS * 100 : 0;
	const sharedEffectiveContributionPct = topicTotalLTM > 0 ? LTMS / topicTotalLTM * 100 : 0;
	const topicWeightagePct = topicTotalQs > 0 ? scopeQuestionsCount / topicTotalQs * 100 : 0;
	const accuracyDenominator = attemptedCount > 0 ? attemptedCount : scopeQuestionsCount;
	const accuracyPct = accuracyDenominator > 0 ? NQC / accuracyDenominator * 100 : 0;
	const nZeroTime = NQW + NQS + nOverTimeCorrect;
	return {
		scopeQuestionsCount,
		MMS,
		LTMS,
		availableMarks,
		completionPct,
		sharedEffectiveContributionPct,
		topicWeightagePct,
		NQC,
		NQW,
		NQS,
		NQNA,
		attemptedCount,
		accuracyPct,
		correctMarks,
		wrongPenalty,
		skipPenalty,
		ARMNT,
		nFast,
		nMed,
		nSlow,
		nZeroTime,
		fastMarks,
		medMarks,
		slowMarks,
		NTMS
	};
}
var DEFAULT_STEPS_BY_UNIQUE_ID = {
	"QA-TD-BWR-V1-1": [{
		stepNumber: 1,
		text: "Compute speed in km/h using Speed = Distance / Time = 180 / 3 = 60 km/h.",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "Convert km/h to m/s by multiplying by 5/18: 60 × (5/18) = 16.67 m/s.",
		stepId: "T2"
	}],
	"QA-TD-BWR-V1-2": [{
		stepNumber: 1,
		text: "At 3/4 of usual speed, time ratio becomes 4/3 of usual time (extra time = 1/3 T).",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "Equate extra time (1/3) T = 15 min => Usual Time T = 15 × 3 = 45 min.",
		stepId: "T3"
	}],
	"QA-TD-BWR-V2-1": [{
		stepNumber: 1,
		text: "Identify equal distance traveled in both directions (x = 40 km/h, y = 60 km/h).",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "Apply Harmonic Mean formula: Average Speed = 2xy / (x + y) = (2 × 40 × 60) / 100 = 48 km/h.",
		stepId: "T2"
	}],
	"QA-TD-RST-V1-1": [
		{
			stepNumber: 1,
			text: "Total crossing distance = Sum of train lengths = 120 m + 180 m = 300 m.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "Opposite direction Relative Speed = (50 + 40) = 90 km/h = 90 × (5/18) = 25 m/s.",
			stepId: "T2"
		},
		{
			stepNumber: 3,
			text: "Crossing Time = Total Distance / Relative Speed = 300 / 25 = 12 s.",
			stepId: "T3"
		}
	],
	"QA-TD-RST-V1-2": [{
		stepNumber: 1,
		text: "Extra time (25s - 15s = 10s) covers the 100m platform => Train Speed = 100 / 10 = 10 m/s.",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "Length of train = Speed × Pole crossing time = 10 m/s × 15 s = 150 m.",
		stepId: "T2"
	}],
	"QA-TD-RST-V1-3": [{
		stepNumber: 1,
		text: "After meeting, time taken to reach destinations is t1 = 4h and t2 = 9h.",
		stepId: "T2"
	}, {
		stepNumber: 2,
		text: "Apply Meet-Time Speed Ratio formula: S1 / S2 = sqrt(t2 / t1) = sqrt(9 / 4) = 3 : 2.",
		stepId: "T3"
	}],
	"QA-TRG-BS-FR-1": [
		{
			stepNumber: 1,
			text: "tan A = 4/3 => oppo = 4, Adj = 3.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "3 is odd: 3² / 2 = 9/2 = 4.5 -> 4 (oppo) and 5 (hypo) match triplet (3, 4, 5).",
			stepId: "T2"
		},
		{
			stepNumber: 3,
			text: "sin A = oppo / hypo = 4 / 5.",
			stepId: "T1"
		}
	],
	"QA-TRG-BS-FR-2": [{
		stepNumber: 1,
		text: "sin θ = 9/41 => 9 (oppo) is odd: 9² = 81 -> 81/2 = 40.5 -> 40 (adj), 41 (hypo).",
		stepId: "T2"
	}, {
		stepNumber: 2,
		text: "cot θ = adj / oppo = 40 / 9.",
		stepId: "T1"
	}],
	"QA-TRG-BS-FR-3": [
		{
			stepNumber: 1,
			text: "tan A = 2/5 => oppo = 2, Adj = 5.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "hypo = √(2² + 5²) = √29.",
			stepId: "TG"
		},
		{
			stepNumber: 3,
			text: "sec²A = (hypo / Adj)² = 29 / 25.",
			stepId: "T1"
		},
		{
			stepNumber: 4,
			text: "cosec²A = (hypo / oppo)² = 29 / 4.",
			stepId: "T1"
		},
		{
			stepNumber: 5,
			text: "sec²A / cosec²A = (29 / 25) × (4 / 29) = 4 / 25.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-4": [
		{
			stepNumber: 1,
			text: "sin β = 1/3 => oppo = 1, hypo = 3.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "Adj = √(3² - 1²) = √8.",
			stepId: "T2"
		},
		{
			stepNumber: 3,
			text: "(sec β - tan β)³ = (3/√8 - 1/√8)³ = (2/√8)³ = 8 / (8√8) = 1 / √8.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-5": [{
		stepNumber: 1,
		text: "cos θ = √3 / 2 => adj = √3, hypo = 2 => oppo = 1.",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "tan²θ × cos²θ = (1/√3)² × (√3/2)² = (1/3) × (3/4) = 1/4.",
		stepId: "T1"
	}],
	"QA-TRG-BS-FR-6": [{
		stepNumber: 1,
		text: "5 sin θ - 4 cos θ = 0 => sin θ / cos θ = 4 / 5 (take sin θ = 4, cos θ = 5).",
		stepId: "TG"
	}, {
		stepNumber: 2,
		text: "[5(4) + 2(5)] / [5(4) + 3(5)] = 30 / 35 = 6 / 7.",
		stepId: "TG"
	}],
	"QA-TRG-BS-FR-7": [{
		stepNumber: 1,
		text: "tan θ = 3/4 => oppo = 3, adj = 4, hypo = 5.",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "(1 + sin θ) / (1 - sin θ) = (1 + 3/5) / (1 - 3/5) = (8/5) × (5/2) = 8/2 = 4.",
		stepId: "T1"
	}],
	"QA-TRG-BS-FR-8": [{
		stepNumber: 1,
		text: "5 cot θ = 3 => 5(cos θ / sin θ) = 3 => cos θ = 3, sin θ = 5.",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "[6(5) - 3(3)] / [7(5) + 3(3)] = (30 - 9) / (35 + 9) = 21 / 44.",
		stepId: "TG"
	}],
	"QA-TRG-BS-FR-9": [
		{
			stepNumber: 1,
			text: "sin A = 2/5 => oppo = 2, hypo = 5 => adj = √21.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "cos A = √21 / 5 => sec A = 5 / √21, cosec A = 5 / 2.",
			stepId: "T1"
		},
		{
			stepNumber: 3,
			text: "[5(2/5) + 2(5/2)] / [√21 × (5/√21)] = (2 + 5) / 5 = 7 / 5.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-10": [
		{
			stepNumber: 1,
			text: "sec A = 17/8 => cos A = 8/17, sin A = 15/17 (8-15-17 triplet).",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "tan A = 15/8, cot A = 8/15.",
			stepId: "T1"
		},
		{
			stepNumber: 3,
			text: "[34(15/17) + 15(8/15)] / [68(8/17) - 16(15/8)] = (30 + 8) / (32 - 30) = 38 / 2 = 19.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-11": [{
		stepNumber: 1,
		text: "(3 sin θ - cos θ) / (cos θ + sin θ) = 1 => 3 sin θ - cos θ = cos θ + sin θ => sin θ = 1, cos θ = 1 => tan θ = 1.",
		stepId: "TG"
	}, {
		stepNumber: 2,
		text: "cot θ = 1 / tan θ = 1.",
		stepId: "T1"
	}],
	"QA-TRG-BS-FR-12": [
		{
			stepNumber: 1,
			text: "(sin θ - cos θ) / (sin θ + cos θ) = 4/5 => sin θ = 9, cos θ = 1 => tan θ = 9.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "hypo = √(9² + 1²) = √82 => cosec²θ = 82 / 81.",
			stepId: "T2"
		},
		{
			stepNumber: 3,
			text: "(82/81) / (2 - 82/81) = (82/81) × (81/80) = 41 / 40.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-13": [
		{
			stepNumber: 1,
			text: "sec θ = a/b => hypo = a, adj = b.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "oppo = √(a² - b²).",
			stepId: "T1"
		},
		{
			stepNumber: 3,
			text: "Substitute tan²θ = (a² - b²)/b² and sin²θ = (a² - b²)/a² into [1 - (a² - b²)/b²] / [2 - (a² - b²)/a²].",
			stepId: "T1"
		},
		{
			stepNumber: 4,
			text: "Simplify numerator and denominator: [(2b² - a²) / b²] × [a² / (a² + b²)].",
			stepId: "TG"
		},
		{
			stepNumber: 5,
			text: "Final expression = a²(2b² - a²) / [b²(a² + b²)].",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-14": [
		{
			stepNumber: 1,
			text: "sin²θ / (tan²θ - sin²θ) = 5 => 6 sin²θ = 5(sin²θ / cos²θ) => cos²θ = 5/6.",
			stepId: "TG"
		},
		{
			stepNumber: 2,
			text: "cos θ = √5 / √6 => adj = √5, hypo = √6, oppo = 1.",
			stepId: "T1"
		},
		{
			stepNumber: 3,
			text: "[24(1/6) - 15(6/5)] / [6(6/1) - 7(5/1)] = (4 - 18) / (36 - 35).",
			stepId: "TG"
		},
		{
			stepNumber: 4,
			text: "-14 / 1 = -14.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-15": [
		{
			stepNumber: 1,
			text: "(sec θ - tan θ) / (sec θ + tan θ) = 1/7 => 6 sec θ = 8 tan θ => 3(1/cos θ) = 4(sin θ / cos θ).",
			stepId: "TG"
		},
		{
			stepNumber: 2,
			text: "sin θ = 3/4 => oppo = 3, hypo = 4.",
			stepId: "T1"
		},
		{
			stepNumber: 3,
			text: "Adj = √(4² - 3²) = √7 => cosec θ = 4/3, cot²θ = 7/9.",
			stepId: "T1"
		},
		{
			stepNumber: 4,
			text: "(4/3 + 7/9) / (4/3 - 7/9) = (19/9) × (9/5).",
			stepId: "TG"
		},
		{
			stepNumber: 5,
			text: "Final value = 19 / 5.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-16": [
		{
			stepNumber: 1,
			text: "tan A = 1 / √3 => oppo = 1, Adj = √3, hypo = 2.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "sin A = 1/2, cos A = √3/2; from vertex C: cos C = 1/2, sin C = √3/2.",
			stepId: "T1"
		},
		{
			stepNumber: 3,
			text: "sin A cos C + cos A sin C = (1/2)(1/2) + (√3/2)(√3/2) = 1/4 + 3/4 = 1.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-17": [
		{
			stepNumber: 1,
			text: "tan A = 1/2 => oppo = 1, adj = 2 => hypo = √5.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "sin A = 1/√5, cos A = 2/√5; switching to vertex C: sin C = 2/√5, cos C = 1/√5.",
			stepId: "T3"
		},
		{
			stepNumber: 3,
			text: "[(1/√5)(1/√5 + 2/√5)] / [(1/√5)(2/√5 - 1/√5)] = (3/5) × (5/1) = 3.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-18": [
		{
			stepNumber: 1,
			text: "In ΔABC (∠B = 90°), AB = 1, BC = 2 => hypo AC = √5 => cos A = 1/√5.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "From vertex C, opposite = AB = 1, adjacent = BC = 2 => tan C = 1/2.",
			stepId: "T3"
		},
		{
			stepNumber: 3,
			text: "cos A + tan C = 1/√5 + 1/2 = (2 + √5) / (2√5).",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-19": [
		{
			stepNumber: 1,
			text: "sin A = 5/13 => oppo = 5, hypo = 13, Adj = 12; 7 cot B = 24 => cot B = 24/7 (7-24-25 triangle).",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "Extract ratios for distinct angles A and B: sec A = 13/12, cos B = 24/25, cosec B = 25/7, tan A = 5/12.",
			stepId: "T3"
		},
		{
			stepNumber: 3,
			text: "(13/12 × 24/25) × (25/7 × 5/12) = (13/6) × (5/7) = 65 / 42.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-20": [
		{
			stepNumber: 1,
			text: "sin 23° = a/b => oppo = a, hypo = b, adj = √(b² - a²) => sec 23° = b / √(b² - a²).",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "From complementary angle 67° (= 90° - 23°), sin 67° = √(b² - a²) / b.",
			stepId: "T3"
		},
		{
			stepNumber: 3,
			text: "sec 23° - sin 67° = [b² - (b² - a²)] / [b √(b² - a²)] = a² / [b √(b² - a²)].",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-21": [
		{
			stepNumber: 1,
			text: "sec 31° = x => hypo = x, adj = 1, oppo = √(x² - 1) in right triangle with angles 31° and 59°.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "From complementary vertex 59°, sin 59° = 1 / x.",
			stepId: "T3"
		},
		{
			stepNumber: 3,
			text: "sin² 59° = 1 / x².",
			stepId: "T1"
		},
		{
			stepNumber: 4,
			text: "1 / sec² 31° = cos² 31° = 1 / x².",
			stepId: "T1"
		},
		{
			stepNumber: 5,
			text: "1 / (sin² 59° cosec² 59°) = cosec² 59° / cosec² 59° = 1.",
			stepId: "T1"
		},
		{
			stepNumber: 6,
			text: "1/x² + 1/x² - 1 = 2/x² - 1 = (2 - x²) / x².",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-22": [
		{
			stepNumber: 1,
			text: "tan B = 5/3 => oppo = 5, Adj = 3 => hypo = √34.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "Substitute ratios: (√34/5 + 5/√34) / (3/√34 - √34/3).",
			stepId: "TG"
		},
		{
			stepNumber: 3,
			text: "[59 / (5√34)] × [3√34 / (-25)] = -177 / 125.",
			stepId: "TG"
		}
	],
	"QA-TRG-BS-FR-23": [
		{
			stepNumber: 1,
			text: "cos θ = 12/13 => Adj = 12, hypo = 13, oppo = 5.",
			stepId: "T1"
		},
		{
			stepNumber: 2,
			text: "sin θ = 5/13, tan θ = 5/12, cosec θ = 13/5.",
			stepId: "T1"
		},
		{
			stepNumber: 3,
			text: "[(5/13)(1 - 5/12)] / [(5/12)(1 + 13/5)] = [(5/13)(7/12)] / [(5/12)(18/5)] = (5/13) × (7/12) × (12/18) = 35 / 234.",
			stepId: "TG"
		}
	]
};
function getQuestionExplanationSteps(uniqueId, customStepsByQid) {
	if (customStepsByQid && customStepsByQid[uniqueId] && customStepsByQid[uniqueId].length > 0) return customStepsByQid[uniqueId];
	if (DEFAULT_STEPS_BY_UNIQUE_ID[uniqueId]) return DEFAULT_STEPS_BY_UNIQUE_ID[uniqueId];
	return [{
		stepNumber: 1,
		text: "Apply primary domain relation to isolate target variable.",
		stepId: "T1"
	}, {
		stepNumber: 2,
		text: "Substitute given values and simplify to final answer.",
		stepId: "T2"
	}];
}
function getStructuralQuestionIdFromSteps(stepsOrUniqueId, customStepsByQid) {
	const ids = (Array.isArray(stepsOrUniqueId) ? stepsOrUniqueId : getQuestionExplanationSteps(stepsOrUniqueId, customStepsByQid)).map((s) => s.stepId.trim()).filter(Boolean);
	return ids.length > 0 ? ids.join("-") : "T1";
}
function computeMicroConceptDiagnostics(questions, microConcepts, chapterCode, customStepsByQid, attemptSelector = "latest") {
	const stepMap = /* @__PURE__ */ new Map();
	questions.forEach((q) => {
		const steps = getQuestionExplanationSteps(q.uniqueId, customStepsByQid);
		const stepChainId = getStructuralQuestionIdFromSteps(steps);
		const uniqueStepIdsInQuestion = Array.from(new Set(steps.map((s) => s.stepId.trim().toUpperCase()).filter(Boolean)));
		let status = "NA";
		let totalMark = 0;
		if (q.attempts && q.attempts.length > 0) {
			const tuple = attemptSelector === "first" ? q.attempts[0] : q.attempts[q.attempts.length - 1];
			status = tuple[0];
			totalMark = Number(((tuple[2] || 0) + (tuple[3] || 0)).toFixed(2));
		}
		uniqueStepIdsInQuestion.forEach((stepCode) => {
			const list = stepMap.get(stepCode) || [];
			list.push({
				uniqueId: q.uniqueId,
				subtopicCode: q.subtopicShortCode,
				conceptCode: q.conceptShortCode,
				status,
				totalMark,
				stepChainId
			});
			stepMap.set(stepCode, list);
		});
	});
	const rows = [];
	stepMap.forEach((involvedQuestions, stepCode) => {
		const involvedQuestionsCount = involvedQuestions.length;
		let correctCount = 0;
		let wrongCount = 0;
		let skippedCount = 0;
		let unattemptedCount = 0;
		involvedQuestions.forEach((iq) => {
			if (iq.status === "C") correctCount++;
			else if (iq.status === "W") wrongCount++;
			else if (iq.status === "S") skippedCount++;
			else unattemptedCount++;
		});
		const attemptedQuestionsCount = correctCount + wrongCount + skippedCount;
		const rawAccuracyPct = attemptedQuestionsCount > 0 ? correctCount / attemptedQuestionsCount * 100 : 0;
		const wrongRatePct = attemptedQuestionsCount > 0 ? wrongCount / attemptedQuestionsCount * 100 : 0;
		const netAccuracyMarks = Number((correctCount * 1 - wrongCount * .5 - skippedCount * .2).toFixed(2));
		const netAccuracyValuationPct = attemptedQuestionsCount > 0 ? netAccuracyMarks / attemptedQuestionsCount * 100 : 0;
		const regMatch = microConcepts.find((mc) => mc.chapterCode.toLowerCase() === chapterCode.toLowerCase() && mc.shortCode.toLowerCase() === stepCode.toLowerCase()) || microConcepts.find((mc) => mc.shortCode.toLowerCase() === stepCode.toLowerCase());
		const stepName = regMatch ? regMatch.code : `Step ${stepCode} Operation`;
		const microConceptId = regMatch ? `${regMatch.domainCode}-${regMatch.chapterCode}-${stepCode}` : `QA-${chapterCode}-${stepCode}`;
		let diagnosticStatus = "UNATTEMPTED";
		if (attemptedQuestionsCount > 0) {
			if (rawAccuracyPct <= 60 || wrongCount > 0 && rawAccuracyPct < 75) diagnosticStatus = "WEAK STEP";
			else if (rawAccuracyPct < 85) diagnosticStatus = "MODERATE";
			else diagnosticStatus = "STRONG";
		}
		rows.push({
			microConceptId,
			stepCode,
			stepName,
			involvedQuestions,
			involvedQuestionsCount,
			attemptedQuestionsCount,
			correctCount,
			wrongCount,
			skippedCount,
			unattemptedCount,
			correctToWrongRatioLabel: `${correctCount} C : ${wrongCount} W`,
			rawAccuracyPct,
			wrongRatePct,
			netAccuracyMarks,
			netAccuracyValuationPct,
			diagnosticStatus
		});
	});
	rows.sort((a, b) => a.stepCode.localeCompare(b.stepCode, void 0, { numeric: true }));
	return rows;
}
// src/utils/anglesCustomSyntaxPatch.ts
var HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
function normalizeHex(raw, fallback) {
	if (!raw) return fallback;
	const trimmed = raw.trim();
	return HEX_COLOR_REGEX.test(trimmed) ? trimmed : fallback;
}
function parseCoordinatePairs(raw) {
	const pts = [];
	const pairRegex = /\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)/g;
	let m;
	while ((m = pairRegex.exec(raw)) !== null) {
		const col = parseFloat(m[1]);
		const row = parseFloat(m[2]);
		if (col >= 1 && row >= 1) pts.push({
			col,
			row
		});
	}
	return pts;
}
function extractBoxWElements(rawMkml, cellWidthPx = 28, rowHeightPx = 32, topOriginPx = 47) {
	const items = [];
	const boxWRegex = /<box\s+w\s+([^>]+)>([\s\S]*?)<\/box\s+w>/gi;
	let idx = 0;
	return {
		items,
		cleanedMkml: rawMkml.replace(boxWRegex, (_full, attrStr, innerText) => {
			idx++;
			const ptsMatch = attrStr.match(/points\s*=\s*([^\s>]+(?:\s*,\s*\(\s*\d+\s*,\s*\d+\s*\))*)/i);
			const pts = parseCoordinatePairs(ptsMatch ? ptsMatch[1] : attrStr);
			if (pts.length !== 4) return "";
			const bgMatch = attrStr.match(/bg-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);
			const textMatch = attrStr.match(/text-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);
			const bgColor = bgMatch ? normalizeHex(bgMatch[1], "transparent") : "transparent";
			const borderColor = bgMatch ? normalizeHex(bgMatch[1], "transparent") : "transparent";
			const textColor = textMatch ? normalizeHex(textMatch[1], "#000000") : "#000000";
			const toPx = (p) => ({
				x: (p.col - 1) * cellWidthPx,
				y: topOriginPx + (p.row - 1) * rowHeightPx
			});
			const p1 = toPx(pts[0]);
			const p2 = toPx(pts[1]);
			const p3 = toPx(pts[2]);
			const p4 = toPx(pts[3]);
			const t = .75;
			const baselineStart = {
				x: p1.x + (p4.x - p1.x) * t,
				y: p1.y + (p4.y - p1.y) * t
			};
			const baselineEnd = {
				x: p2.x + (p3.x - p2.x) * t,
				y: p2.y + (p3.y - p2.y) * t
			};
			const baselineMidpoint = {
				x: (baselineStart.x + baselineEnd.x) / 2,
				y: (baselineStart.y + baselineEnd.y) / 2
			};
			let angleDeg = Math.atan2(baselineEnd.y - baselineStart.y, baselineEnd.x - baselineStart.x) * 180 / Math.PI;
			if (angleDeg > 90) angleDeg -= 180;
			if (angleDeg < -90) angleDeg += 180;
			items.push({
				id: `box-w-${idx}`,
				points: [
					pts[0],
					pts[1],
					pts[2],
					pts[3]
				],
				bgColor,
				borderColor,
				textColor,
				rawText: innerText.trim(),
				baselineStart,
				baselineEnd,
				baselineMidpoint,
				angleDeg
			});
			return "";
		})
	};
}
function extractLineDElements(rawMkml, cellWidthPx = 28, rowHeightPx = 32, topOriginPx = 47) {
	const items = [];
	const lineDRegex = /<line\s+d([^>]*)>([\s\S]*?)(?:<\/line\s+d>|<line\s+d>)/gi;
	let idx = 0;
	return {
		items,
		cleanedMkml: rawMkml.replace(lineDRegex, (_full, attrStr, bodyStr) => {
			idx++;
			const lineColorMatch = attrStr.match(/line-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i) || attrStr.match(/color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);
			const textColorMatch = attrStr.match(/text-color\s*[:=]\s*(#[0-9A-Fa-f]{3,6})/i);
			const lineColor = lineColorMatch ? normalizeHex(lineColorMatch[1], "#000000") : "#000000";
			const textColor = textColorMatch ? normalizeHex(textColorMatch[1], "#000000") : "#000000";
			const pts = parseCoordinatePairs(bodyStr);
			if (pts.length < 2) return "";
			const labelText = bodyStr.replace(/\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*\)/g, "").replace(/^[\s,|:-]+/, "").trim();
			const toPx = (p) => ({
				x: (p.col - 1) * cellWidthPx,
				y: topOriginPx + (p.row - 1) * rowHeightPx
			});
			const segIdx = Math.floor((pts.length - 1) / 2);
			const pA = toPx(pts[segIdx]);
			const pB = toPx(pts[segIdx + 1]);
			const midpoint = {
				x: (pA.x + pB.x) / 2,
				y: (pA.y + pB.y) / 2
			};
			let angleDeg = Math.atan2(pB.y - pA.y, pB.x - pA.x) * 180 / Math.PI;
			if (angleDeg > 90) angleDeg -= 180;
			if (angleDeg < -90) angleDeg += 180;
			items.push({
				id: `line-d-${idx}`,
				points: pts,
				lineColor,
				textColor,
				labelText,
				midpoint,
				angleDeg,
				offsetPx: 15.12
			});
			return "";
		})
	};
}
function compileAnglesMathExpression(expr) {
	let out = expr.trim();
	out = out.replace(/cbrt\(([^()]+)\)/gi, "∛($1)");
	out = out.replace(/sqrt\(([^()]*\([^()]*\)[^()]*)\)/gi, "√($1)");
	out = out.replace(/sqrt\(([^()]+)\)/gi, "√($1)");
	Object.entries({
		theta: "θ",
		alpha: "α",
		beta: "β",
		gamma: "γ",
		delta: "δ",
		phi: "φ",
		omega: "ω",
		pi: "π",
		inf: "∞",
		infinity: "∞",
		tri: "Δ",
		ang: "∠",
		deg: "°",
		perp: "⊥",
		par: "∥",
		div: "÷"
	}).forEach(([word, sym]) => {
		const re = new RegExp(`\\b${word}\\b`, "gi");
		out = out.replace(re, sym);
	});
	out = out.replace(/<=>/g, "⇔").replace(/=>/g, "⇒").replace(/->/g, "→").replace(/~=/g, "≅").replace(/!=/g, "≠").replace(/<=/g, "≤").replace(/>=/g, "≥").replace(/\+-/g, "±").replace(/\/\//g, "÷").replace(/\*/g, "×");
	out = out.replace(/\^\(([^)]+)\)/g, "<sup>$1</sup>");
	out = out.replace(/\^([0-9a-zA-Z+-]+)/g, "<sup>$1</sup>");
	out = out.replace(/_\(([^)]+)\)/g, "<sub>$1</sub>");
	out = out.replace(/_([0-9a-zA-Z+-]+)/g, "<sub>$1</sub>");
	return out;
}
function compileAnglesMathTags(rawText) {
	return rawText.replace(/<math\s*==\s*([^>]+)>/gi, (_m, expr) => {
		return compileAnglesMathExpression(expr);
	});
}
// src/components/TrackerPageTwo.tsx
function fmt(n, decimals = 2) {
	if (Number.isInteger(n)) return n.toString();
	return Number(n.toFixed(decimals)).toString();
}
var TrackerPageTwo = ({ ledger, allLedgers, onSelectChapter, onSimulateAttemptInScope, onBackToPartOne, onOpenQuestionIndex, onLaunchScopedQuestionsDirect, domains, chapters, subtopics, concepts, microConcepts, stepsByQid }) => {
	const [customMkmlByChapter, setCustomMkmlByChapter] = (0, import_react.useState)({});
	const [showStorageModal, setShowStorageModal] = (0, import_react.useState)(null);
	const [copiedModal, setCopiedModal] = (0, import_react.useState)(false);
	const [applyToGraph, setApplyToGraph] = (0, import_react.useState)(true);
	const [microDiagnosticPoolMode, setMicroDiagnosticPoolMode] = (0, import_react.useState)("TOPIC");
	const scannedTree = (0, import_react.useMemo)(() => scanChapterStorageAndMarks(ledger.chapterCode, ledger, domains, chapters, subtopics, concepts, microConcepts, customMkmlByChapter[ledger.chapterCode]), [
		ledger,
		domains,
		chapters,
		subtopics,
		concepts,
		microConcepts,
		customMkmlByChapter
	]);
	const defaultScopeId = scannedTree.subtopics[0]?.concepts[0]?.conceptId || scannedTree.subtopics[0]?.subtopicId || "OVERVIEW";
	const [selectedScopeId, setSelectedScopeId] = (0, import_react.useState)(defaultScopeId);
	const effectiveScopeId = (0, import_react.useMemo)(() => {
		if (selectedScopeId === "OVERVIEW") return "OVERVIEW";
		for (const st of scannedTree.subtopics) {
			if (st.subtopicId === selectedScopeId) return selectedScopeId;
			for (const con of st.concepts) if (con.conceptId === selectedScopeId) return selectedScopeId;
		}
		return scannedTree.subtopics[0]?.concepts[0]?.conceptId || scannedTree.subtopics[0]?.subtopicId || "OVERVIEW";
	}, [selectedScopeId, scannedTree]);
	const topicMetrics = (0, import_react.useMemo)(() => computeScopeMetrics(scannedTree.allQuestions, ledger.timing, scannedTree.allQuestions.length, 0), [scannedTree, ledger.timing]);
	const activeScopeInfo = (0, import_react.useMemo)(() => {
		if (effectiveScopeId === "OVERVIEW") return {
			scopeType: "OVERVIEW",
			titleLabel: `${scannedTree.chapterName.toUpperCase()} (ENTIRE TOPIC)`,
			shortScopeCode: scannedTree.chapterCode,
			conceptHint: Object.keys(ledger.concepts)[0] || "C1",
			questions: scannedTree.allQuestions
		};
		for (const st of scannedTree.subtopics) {
			if (st.subtopicId === effectiveScopeId) return {
				scopeType: "SUBTOPIC",
				titleLabel: `${st.subtopicName.toUpperCase()} (${st.subtopicCode})`,
				shortScopeCode: st.subtopicCode,
				conceptHint: st.concepts[0]?.conceptCode || "C1",
				questions: st.questions
			};
			for (const con of st.concepts) if (con.conceptId === effectiveScopeId) return {
				scopeType: "CONCEPT",
				titleLabel: `${st.subtopicName.toUpperCase()} (${con.conceptCode})`,
				shortScopeCode: con.conceptCode,
				conceptHint: con.conceptCode,
				questions: con.questions
			};
		}
		return {
			scopeType: "OVERVIEW",
			titleLabel: scannedTree.chapterName.toUpperCase(),
			shortScopeCode: scannedTree.chapterCode,
			conceptHint: "C1",
			questions: scannedTree.allQuestions
		};
	}, [
		effectiveScopeId,
		scannedTree,
		ledger.concepts
	]);
	const scopeMetrics = (0, import_react.useMemo)(() => computeScopeMetrics(activeScopeInfo.questions, ledger.timing, topicMetrics.scopeQuestionsCount, topicMetrics.LTMS), [
		activeScopeInfo.questions,
		ledger.timing,
		topicMetrics.scopeQuestionsCount,
		topicMetrics.LTMS
	]);
	const topContributors = (0, import_react.useMemo)(() => {
		const subtopicRows = scannedTree.subtopics.map((st) => {
			const m = computeScopeMetrics(st.questions, ledger.timing, topicMetrics.scopeQuestionsCount, topicMetrics.LTMS);
			return {
				id: st.subtopicId,
				name: st.subtopicName,
				code: st.subtopicCode,
				LTMS: m.LTMS,
				sharedContributionPct: m.sharedEffectiveContributionPct,
				completionPct: m.completionPct
			};
		}).sort((a, b) => b.sharedContributionPct - a.sharedContributionPct);
		const variantRows = [];
		scannedTree.subtopics.forEach((st) => {
			st.concepts.forEach((con) => {
				const m = computeScopeMetrics(con.questions, ledger.timing, topicMetrics.scopeQuestionsCount, topicMetrics.LTMS);
				variantRows.push({
					id: con.conceptId,
					label: `${st.subtopicName} [${con.conceptCode}]`,
					isCurrent: con.conceptId === effectiveScopeId,
					LTMS: m.LTMS,
					sharedContributionPct: m.sharedEffectiveContributionPct,
					completionPct: m.completionPct
				});
			});
		});
		variantRows.sort((a, b) => b.sharedContributionPct - a.sharedContributionPct);
		return {
			subtopicRows,
			variantRows,
			totalVariantsCount: variantRows.length
		};
	}, [
		scannedTree,
		ledger.timing,
		topicMetrics,
		effectiveScopeId
	]);
	const microDiagnosticQuestions = microDiagnosticPoolMode === "SCOPE" ? activeScopeInfo.questions : scannedTree.allQuestions;
	const microConceptDiagnostics = (0, import_react.useMemo)(() => computeMicroConceptDiagnostics(microDiagnosticQuestions, microConcepts, scannedTree.chapterId, stepsByQid, "latest"), [
		microDiagnosticQuestions,
		microConcepts,
		scannedTree.chapterId,
		stepsByQid
	]);
	const weakestMicroStep = (0, import_react.useMemo)(() => {
		const attemptedSteps = microConceptDiagnostics.filter((r) => r.attemptedQuestionsCount > 0);
		if (attemptedSteps.length === 0) return null;
		return [...attemptedSteps].sort((a, b) => a.rawAccuracyPct - b.rawAccuracyPct || b.wrongCount - a.wrongCount)[0];
	}, [microConceptDiagnostics]);
	const marksTexContent = (0, import_react.useMemo)(() => formatMarksTexFile(scannedTree, ledger.timing), [scannedTree, ledger.timing]);
	const rawChapterMkml = customMkmlByChapter[ledger.chapterCode] || CHAPTER_MKML_STORAGE[ledger.chapterCode] || `<Domain == ${scannedTree.domainCode}>\n<Chapter == ${scannedTree.chapterId}>\n<!-- Add <Subtopic == ...> and <Concept == ...> tags here -->`;
	const parsedCustomSyntax = (0, import_react.useMemo)(() => {
		const boxWResult = extractBoxWElements(rawChapterMkml, 14, 18, 16);
		const lineDResult = extractLineDElements(rawChapterMkml, 14, 18, 16);
		const mathSamples = [];
		const mathRegex = /<math\s*==\s*([^>]+)>/gi;
		let m;
		while ((m = mathRegex.exec(rawChapterMkml)) !== null) mathSamples.push({
			raw: `<math == ${m[1].trim()}>`,
			compiled: compileAnglesMathTags(`<math == ${m[1].trim()}>`)
		});
		return {
			boxWItems: boxWResult.items,
			lineDItems: lineDResult.items,
			mathSamples
		};
	}, [rawChapterMkml]);
	const handleCopyText = (text) => {
		navigator.clipboard.writeText(text);
		setCopiedModal(true);
		setTimeout(() => setCopiedModal(false), 1800);
	};
	const { timing } = ledger;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full space-y-2 font-sans select-none text-[#111827]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 text-[#6B7280] uppercase tracking-wider",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ANGLES" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TOPIC ANALYSIS" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[#1D4ED8] font-bold",
							children: "PART 2: SUBTOPIC BREAKDOWN"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#16A34A]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[#6B7280] uppercase",
							children: "TARGET SCOPE:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-bold",
							children: activeScopeInfo.titleLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[#15803D] font-semibold",
							children: "• ACTIVE EVALUATION"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded",
						children: "DIAGNOSTIC MATRIX"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D4ED8]",
						children: "ANALYTICS & WEIGHTAGE ENGINE"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2.5 mt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-bold text-[#111827] tracking-tight",
							children: "Subtopic Analysis"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: ledger.chapterCode,
							onChange: (e) => onSelectChapter(e.target.value),
							className: "px-2.5 py-1 text-xs font-mono font-bold bg-[#F9F8F4] text-[#111827] border border-[#DFDDD4] rounded hover:border-[#1D4ED8] focus:outline-none cursor-pointer",
							children: Object.values(allLedgers).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: l.chapterCode,
								children: [
									l.chapterName,
									" [",
									l.chapterCode,
									"]"
								]
							}, l.chapterCode))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2 py-0.5 text-[10px] font-mono bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-semibold",
							children: [
								"<Domain == ",
								scannedTree.domainCode,
								"> · <Chapter == ",
								scannedTree.chapterId,
								">"
							]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-5 text-xs font-mono",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-l border-[#E5E3DC] pl-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-wider text-[#6B7280]",
								children: "CURRENT SCOPE"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold text-[#111827] mt-0.5",
								children: activeScopeInfo.shortScopeCode
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-l border-[#E5E3DC] pl-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-wider text-[#6B7280]",
								children: "EVALUATION DATE"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold text-[#111827] mt-0.5",
								children: ledger.evaluationDate
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-l border-[#E5E3DC] pl-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-wider text-[#6B7280]",
								children: "BANK SYNC"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold text-[#15803D] mt-0.5",
								children: "MKML + MARKS.TEX"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-[#1D4ED8] font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SCOPE POOL:" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-bold",
							children: ["Questions in Scope: ", scopeMetrics.scopeQuestionsCount]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]",
							children: ["Topic Total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								className: "text-[#1D4ED8]",
								children: [topicMetrics.scopeQuestionsCount, " Qs"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]",
							children: ["Topic LTM: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								className: "text-[#15803D]",
								children: [fmt(topicMetrics.LTMS), "m"]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5 text-[11px] font-mono",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShowStorageModal("marks"),
							className: "px-2.5 py-1 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#111827] border border-[#DFDDD4] rounded font-semibold cursor-pointer",
							children: [
								"• Live marks.tex (",
								scannedTree.allQuestions.length,
								" IDs)"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSimulateAttemptInScope(activeScopeInfo.questions.map((q) => q.uniqueId), "C", Math.max(10, timing.fastLimit - 18), activeScopeInfo.conceptHint),
							className: "px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] rounded font-semibold cursor-pointer",
							children: [
								"+Test Correct (",
								Math.max(10, timing.fastLimit - 18),
								"s)"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSimulateAttemptInScope(activeScopeInfo.questions.map((q) => q.uniqueId), "W", timing.mediumLimit - 15, activeScopeInfo.conceptHint),
							className: "px-2.5 py-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded font-semibold cursor-pointer",
							children: [
								"+Test Wrong (",
								timing.mediumLimit - 15,
								"s)"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onSimulateAttemptInScope(activeScopeInfo.questions.map((q) => q.uniqueId), "S", 30, activeScopeInfo.conceptHint),
							className: "px-2.5 py-1 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded font-semibold cursor-pointer",
							children: "+Skip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShowStorageModal("mkml"),
							className: "px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold flex items-center gap-1 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "[MKML Tags]" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShowStorageModal("json"),
							className: "px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold flex items-center gap-1 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "[Ledger JSON]" })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-3 bg-white border border-[#DFDDD4] rounded-lg p-3.5 flex flex-col justify-between space-y-4 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between px-3 py-2 rounded bg-[#F9F8F4] border border-[#DFDDD4] text-xs cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-sans font-semibold text-[#111827]",
									children: "Apply Settings to Graph Too"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: applyToGraph,
									onChange: (e) => setApplyToGraph(e.target.checked),
									className: "w-4 h-4 accent-[#1D4ED8] rounded cursor-pointer"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#6B7280] px-1 pt-1 border-b border-[#E5E3DC] pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SCOPE HIERARCHY" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									scannedTree.subtopics.length,
									" SUBTOPICS / ",
									topContributors.totalVariantsCount,
									" VAR"
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelectedScopeId("OVERVIEW"),
								className: `w-full px-3 py-2 rounded text-left text-xs font-mono flex items-center justify-between border transition-colors cursor-pointer ${effectiveScopeId === "OVERVIEW" ? "bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] font-bold" : "bg-[#F9F8F4] border-[#DFDDD4] text-[#374151] hover:bg-[#EFECE6]"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "■ Overview (Entire Topic)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-1.5 py-0.5 text-[9px] bg-white border border-[#DFDDD4] rounded text-[#6B7280]",
									children: "PARENT"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3 pt-1 font-mono",
								children: scannedTree.subtopics.map((st, sIdx) => {
									const isSubtopicSelected = effectiveScopeId === st.subtopicId;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setSelectedScopeId(st.subtopicId),
											className: `w-full px-2.5 py-1.5 rounded text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${isSubtopicSelected ? "bg-[#EFF6FF] border border-[#1D4ED8] text-[#1D4ED8] font-bold" : "hover:bg-[#F9F8F4] text-[#111827]"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-sans font-bold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[#1D4ED8] font-mono mr-1.5",
													children: [sIdx + 1, ")"]
												}), st.subtopicName]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] text-[#6B7280]",
												children: [st.questions.length, "Q"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "pl-3 border-l-2 border-[#E5E3DC] space-y-1.5 ml-2",
											children: st.concepts.map((con, cIdx) => {
												const isSelected = effectiveScopeId === con.conceptId;
												const conMetrics = computeScopeMetrics(con.questions, ledger.timing, topicMetrics.scopeQuestionsCount, topicMetrics.LTMS);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => setSelectedScopeId(con.conceptId),
													className: `w-full px-3 py-1.5 rounded text-left text-xs flex items-center justify-between border transition-colors cursor-pointer ${isSelected ? "bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] font-bold" : "bg-[#F9F8F4] border-[#E5E3DC] text-[#374151] hover:bg-[#EFECE6]"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[#1D4ED8] mr-1",
															children: "•"
														}),
														sIdx + 1,
														".",
														cIdx + 1,
														") ",
														con.conceptCode
													] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px]",
														children: [
															con.questions.length,
															"Q",
															" ",
															isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[#1D4ED8] font-bold ml-1",
																children: "[SELECTED]"
															}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-[#6B7280] ml-1",
																children: [Math.round(conMetrics.completionPct), "%"]
															})
														]
													})]
												}, con.conceptId);
											})
										})]
									}, st.subtopicId);
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-3 border-t border-[#E5E3DC] text-[10px] text-[#6B7280] italic leading-relaxed",
						children: "* Selection isolates accuracy marks (ARMNT) & temporal speeds (NTMS) strictly to that subtopic or concept/variant via Chained Unique IDs."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-9 space-y-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3 shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PRIMARY SCOPE RATIO" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-baseline gap-2.5 mt-1 font-mono",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight",
										children: "Completion ="
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `text-3xl sm:text-4xl font-extrabold ${scopeMetrics.completionPct < 0 ? "text-[#DC2626]" : "text-[#1D4ED8]"}`,
										children: [scopeMetrics.completionPct.toFixed(2), " %"]
									})]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "px-3.5 py-2 rounded bg-[#F9F8F4] border border-[#DFDDD4] text-xs font-mono",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[#6B7280]",
											children: "Formula: "
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[#1D4ED8] font-bold",
											children: "LTMS / MMS"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[#111827] font-bold",
											children: [
												" ",
												"= ",
												fmt(scopeMetrics.LTMS),
												" / ",
												scopeMetrics.MMS,
												" × 100"
											]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2.5 border-t border-[#E5E3DC] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[#4B5563]",
									children: [
										"Net Completion % • Lifetime Subtopic Marks (",
										fmt(scopeMetrics.LTMS),
										") / Max Marks Subtopic (",
										scopeMetrics.MMS,
										") × 100"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#B45309] font-semibold",
									children: "Notice: Represents solely the selected scope, not parent topic total."
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs font-mono",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] uppercase tracking-wider text-[#4B5563] font-semibold",
											children: "TOTAL MAX MARKS (MMS)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between mt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-3xl font-bold text-[#111827]",
												children: scopeMetrics.MMS
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] uppercase text-[#6B7280] bg-[#F5F4EF] px-1.5 py-0.5 rounded border border-[#DFDDD4]",
												children: "MAX CEILING"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-[#6B7280] mt-1",
											children: [scopeMetrics.scopeQuestionsCount, " questions × 3 marks"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white border border-[#BFDBFE] rounded-lg px-4 py-3.5 shadow-2xs font-mono",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] uppercase tracking-wider text-[#1D4ED8] font-semibold",
											children: "LIFETIME MARKS SUBTOPIC (LTMS)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between mt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-3xl font-bold text-[#1D4ED8]",
												children: fmt(scopeMetrics.LTMS)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]",
												children: [scopeMetrics.completionPct.toFixed(2), "% MMS"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-[#6B7280] mt-1",
											children: "Net earned (NTMS + ARMNT)"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs font-mono",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] uppercase tracking-wider text-[#4B5563] font-semibold",
											children: "AVAILABLE MARKS"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between mt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-3xl font-bold text-[#111827]",
												children: fmt(scopeMetrics.availableMarks)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] uppercase text-[#6B7280] bg-[#F5F4EF] px-1.5 py-0.5 rounded border border-[#DFDDD4]",
												children: scopeMetrics.MMS > 0 ? `${(scopeMetrics.availableMarks / scopeMetrics.MMS * 100).toFixed(2)}% REMAIN` : "0% REMAIN"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-[#6B7280] mt-1",
											children: [
												"MMS (",
												scopeMetrics.MMS,
												") - LTMS (",
												fmt(scopeMetrics.LTMS),
												")"
											]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between pb-2.5 border-b border-[#E5E3DC]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs font-bold text-[#111827]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 bg-[#1D4ED8] rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ACCURACY & SCORE DEDUCTIONS" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-[#1D4ED8] font-semibold uppercase",
										children: "ARMNT CALCULATION"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "divide-y divide-[#F0EFEA] text-xs mt-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "No. of questions correct (accuracy):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#111827]",
													children: [
														scopeMetrics.NQC,
														" /",
														" ",
														scopeMetrics.attemptedCount || scopeMetrics.scopeQuestionsCount
													]
												}),
												" ",
												"= ",
												scopeMetrics.accuracyPct.toFixed(2),
												"%"
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Correctness Marks (N+1):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												scopeMetrics.NQC,
												" × 1",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#15803D] ml-1",
													children: [
														"+",
														fmt(scopeMetrics.correctMarks),
														" marks"
													]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Wrong questions penalty (N-0.5):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												scopeMetrics.NQW,
												" × 0.5",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#DC2626] ml-1",
													children: [
														"-",
														scopeMetrics.wrongPenalty.toFixed(2),
														" marks"
													]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Skipped questions penalty (N-0.2):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												scopeMetrics.NQS,
												" × 0.2",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#D97706] ml-1",
													children: [
														"-",
														scopeMetrics.skipPenalty.toFixed(2),
														" marks"
													]
												})
											] })]
										})
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded bg-[#F9F8F4] border border-[#DFDDD4] flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase text-[#1D4ED8]",
										children: "ACCURACY REAL MARKS NET TOTAL (ARMNT)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-[#6B7280]",
										children: [
											fmt(scopeMetrics.correctMarks),
											" (Correct) - ",
											fmt(scopeMetrics.wrongPenalty),
											" ",
											"(Wrong) - ",
											fmt(scopeMetrics.skipPenalty),
											" (Skip)"
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-bold text-[#1D4ED8]",
										children: [
											"= ",
											fmt(scopeMetrics.ARMNT),
											" marks"
										]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between pb-2.5 border-b border-[#E5E3DC]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs font-bold text-[#111827]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 bg-[#1D4ED8] rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TIME LATENCY TIERS & SPEED SCORES" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-[#1D4ED8] font-semibold uppercase",
										children: "NTMS CALCULATION"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "divide-y divide-[#F0EFEA] text-xs mt-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-sans text-[#374151]",
												children: [
													"Questions under ",
													timing.fastLimit,
													"s (n",
													timing.fastLimit,
													"):"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												scopeMetrics.nFast,
												" × 2",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#1D4ED8] ml-1",
													children: [
														"+",
														fmt(scopeMetrics.fastMarks),
														" marks"
													]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-sans text-[#374151]",
												children: [
													"Questions under ",
													timing.fastLimit,
													"s-",
													timing.mediumLimit,
													"s (n",
													timing.mediumLimit,
													"):"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												scopeMetrics.nMed,
												" × 1",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#1D4ED8] ml-1",
													children: [
														"+",
														fmt(scopeMetrics.medMarks),
														" marks"
													]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-sans text-[#374151]",
												children: [
													"Questions under ",
													timing.mediumLimit,
													"s-",
													timing.slowLimit,
													"s (n",
													timing.slowLimit,
													"):"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												scopeMetrics.nSlow,
												" × 0.5",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#1D4ED8] ml-1",
													children: [
														"+",
														scopeMetrics.slowMarks.toFixed(1),
														" marks"
													]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#6B7280]",
												children: "Questions with 0 marks (n0):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[#6B7280]",
												children: [
													scopeMetrics.nZeroTime,
													" (skipped/wrong/>",
													timing.slowLimit,
													"s)"
												]
											})]
										})
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded bg-[#F9F8F4] border border-[#DFDDD4] flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase text-[#1D4ED8]",
										children: "NET TIME MARKS SUBTOPIC (NTMS)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-[#6B7280]",
										children: [
											fmt(scopeMetrics.fastMarks),
											" (<",
											timing.fastLimit,
											"s) +",
											" ",
											fmt(scopeMetrics.medMarks),
											" (",
											timing.fastLimit,
											"-",
											timing.mediumLimit,
											"s) +",
											" ",
											scopeMetrics.slowMarks.toFixed(1),
											" (",
											timing.mediumLimit,
											"-",
											timing.slowLimit,
											"s)"
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-bold text-[#1D4ED8]",
										children: [
											"= ",
											fmt(scopeMetrics.NTMS),
											" marks"
										]
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3 shadow-2xs font-mono",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between pb-2.5 border-b border-[#E5E3DC]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold uppercase tracking-wider text-[#111827]",
									children: "SYNTHESIZED SCOPE TOTALS & CROSS-TOPIC RELATIONS"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] uppercase text-[#6B7280]",
									children: "GLOBAL NORMALIZATION"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "divide-y divide-[#F0EFEA]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Life time Marks Subtopic (LTMS):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#111827]",
													children: [
														fmt(scopeMetrics.NTMS),
														" + ",
														fmt(scopeMetrics.ARMNT),
														" ="
													]
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#1D4ED8]",
													children: [fmt(scopeMetrics.LTMS), " marks"]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Total Topic Lifetime Marks (LTM):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "text-[#111827]",
												children: [fmt(topicMetrics.LTMS), " marks"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Questions in Scope / Topic Total:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "text-[#111827]",
												children: [
													scopeMetrics.scopeQuestionsCount,
													" / ",
													topicMetrics.scopeQuestionsCount,
													" items"
												]
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "divide-y divide-[#F0EFEA]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Completion %:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#111827]",
													children: [
														fmt(scopeMetrics.LTMS),
														" / ",
														scopeMetrics.MMS,
														" × 100 ="
													]
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#1D4ED8]",
													children: [scopeMetrics.completionPct.toFixed(2), "%"]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Shared Effective Contribution:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#111827]",
													children: [
														fmt(scopeMetrics.LTMS),
														" / ",
														fmt(topicMetrics.LTMS),
														" × 100 ="
													]
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#15803D]",
													children: [scopeMetrics.sharedEffectiveContributionPct.toFixed(2), "%"]
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "py-2 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-sans text-[#374151]",
												children: "Topic Weightage (W):"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#111827]",
													children: [
														scopeMetrics.scopeQuestionsCount,
														" / ",
														topicMetrics.scopeQuestionsCount,
														" × 100 ="
													]
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-[#D97706]",
													children: [scopeMetrics.topicWeightagePct.toFixed(2), "%"]
												})
											] })]
										})
									]
								})]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3.5 shadow-2xs font-mono",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-xs font-bold uppercase text-[#111827]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#16A34A]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TOP CONTRIBUTORS" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-[#6B7280] mt-0.5",
						children: [
							"Shared Effective Contribution = Scope LTMS / Global Topic LTM (",
							fmt(topicMetrics.LTMS),
							"m) × 100"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase text-[#6B7280]",
						children: "DYNAMIC MKML + MARKS.TEX SYNC"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[11px] border-b border-[#E5E3DC] pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-[#111827]",
								children: "1. SUBTOPICS CONTRIBUTION"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-[#6B7280]",
								children: "PARENT SUBTOPIC NODES"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: topContributors.subtopicRows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-sans font-bold text-[#111827]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-[10px] px-1.5 py-0.5 bg-white border border-[#DFDDD4] rounded text-[#4B5563] mr-2",
											children: ["#", idx + 1]
										}), row.name]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-[#15803D]",
										children: [row.sharedContributionPct.toFixed(2), "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full h-2 bg-[#E5E3DC] rounded-full overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-[#16A34A] rounded-full",
										style: { width: `${Math.min(100, Math.max(0, row.sharedContributionPct))}%` }
									})
								})]
							}, row.id))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[11px] border-b border-[#E5E3DC] pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-[#111827]",
								children: "2. VARIANTS CONTRIBUTION"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-[#6B7280]",
								children: "DISAGGREGATED CONCEPTS / VARIANTS"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: topContributors.variantRows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `font-sans font-bold ${row.isCurrent ? "text-[#1D4ED8]" : "text-[#111827]"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-[10px] px-1.5 py-0.5 bg-white border border-[#DFDDD4] rounded text-[#4B5563] mr-2",
												children: ["#", idx + 1]
											}),
											row.label,
											" ",
											row.isCurrent && "(Current)"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-[#1D4ED8]",
										children: [row.sharedContributionPct.toFixed(2), "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full h-2 bg-[#E5E3DC] rounded-full overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-full rounded-full ${row.isCurrent ? "bg-[#16A34A]" : "bg-[#1D4ED8]"}`,
										style: { width: `${Math.min(100, Math.max(0, row.sharedContributionPct))}%` }
									})
								})]
							}, row.id))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3.5 shadow-2xs font-mono",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-bold uppercase text-[#111827]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#1D4ED8]" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "MICRO CONCEPT / STEP-ID (T1, T2, T3) ACCURACY & WEAKNESS DIAGNOSTIC" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-2 py-0.5 text-[10px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold",
									children: "UNIQUE ID → STEP-ID ROLLUP"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-sans text-[#6B7280] mt-0.5",
							children: "Tracks every Unique Question ID where each Step-ID (Micro Concept) is involved, computing exact Correct : Wrong ratios and step-level accuracy percentages to spot which reasoning step you are weak at."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase text-[#6B7280] font-bold",
								children: "EVALUATE POOL:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex rounded border border-[#DFDDD4] bg-[#F9F8F4] p-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setMicroDiagnosticPoolMode("SCOPE"),
									className: `px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${microDiagnosticPoolMode === "SCOPE" ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
									children: [
										"Selected Scope (",
										activeScopeInfo.shortScopeCode,
										": ",
										activeScopeInfo.questions.length,
										" ",
										"Qs)"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setMicroDiagnosticPoolMode("TOPIC"),
									className: `px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${microDiagnosticPoolMode === "TOPIC" ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
									children: [
										"Entire Chapter (",
										scannedTree.allQuestions.length,
										" Qs)"
									]
								})]
							})]
						})]
					}),
					weakestMicroStep && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `px-3.5 py-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${weakestMicroStep.rawAccuracyPct < 60 || weakestMicroStep.wrongCount > 0 ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]" : "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${weakestMicroStep.rawAccuracyPct < 60 || weakestMicroStep.wrongCount > 0 ? "bg-[#DC2626] text-white" : "bg-[#15803D] text-white"}`,
								children: weakestMicroStep.rawAccuracyPct < 60 || weakestMicroStep.wrongCount > 0 ? "WEAKEST STEP SPOTTED" : "ALL STEPS STABLE"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-sans font-bold",
								children: [
									"Step ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "font-mono",
										children: weakestMicroStep.stepCode
									}),
									" (",
									weakestMicroStep.stepName,
									") — Involved in",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [weakestMicroStep.involvedQuestionsCount, " Qs"] }),
									" (",
									weakestMicroStep.attemptedQuestionsCount,
									" Attempted) · Ratio:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "font-mono",
										children: weakestMicroStep.correctToWrongRatioLabel
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-extrabold",
							children: [
								"Step Accuracy: ",
								weakestMicroStep.rawAccuracyPct.toFixed(2),
								"% (Error Rate:",
								" ",
								weakestMicroStep.wrongRatePct.toFixed(2),
								"%)"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto border border-[#DFDDD4] rounded-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase tracking-wider text-[#6B7280]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2.5 px-3",
										children: "STEP-ID / MICRO CONCEPT"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2.5 px-3",
										children: "INVOLVED UNIQUE QUESTION IDs"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2.5 px-3 text-center",
										children: "C / W / S / NA"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2.5 px-3 text-center",
										children: "CORRECT : WRONG RATIO"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2.5 px-3 text-right",
										children: "STEP ACCURACY %"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2.5 px-3 text-right",
										children: "NET VALUATION %"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2.5 px-3 text-center",
										children: "DIAGNOSTIC"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "divide-y divide-[#F0EFEA]",
								children: [microConceptDiagnostics.map((row) => {
									const badgeClass = row.diagnosticStatus === "WEAK STEP" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" : row.diagnosticStatus === "MODERATE" ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" : row.diagnosticStatus === "STRONG" ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : "bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-[#F9F8F4]/80",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-3 px-3 align-top",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-extrabold text-xs",
														children: row.stepCode
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-sans font-bold text-[#111827]",
														children: row.stepName
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-[#6B7280] mt-1",
													children: [
														"Registry ID: ",
														row.microConceptId,
														" · Involved in",
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
															className: "text-[#111827]",
															children: [row.involvedQuestionsCount, " Questions"]
														})
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 px-3 align-top",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex flex-wrap gap-1.5",
													children: row.involvedQuestions.map((iq) => {
														const chipColor = iq.status === "C" ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : iq.status === "W" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" : iq.status === "S" ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" : "bg-[#F9F8F4] text-[#6B7280] border-[#DFDDD4]";
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: `px-2 py-0.5 rounded border text-[10px] font-bold ${chipColor}`,
															title: `Path: ${iq.subtopicCode}-${iq.conceptCode} · Step Chain: ${iq.stepChainId} · Total Mark: ${iq.totalMark}`,
															children: [
																iq.uniqueId,
																" (",
																iq.status,
																") [",
																iq.stepChainId,
																"]"
															]
														}, `${row.stepCode}-${iq.uniqueId}`);
													})
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-3 px-3 align-top text-center font-bold",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[#15803D]",
														children: [row.correctCount, "C"]
													}),
													" / ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[#DC2626]",
														children: [row.wrongCount, "W"]
													}),
													" / ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[#D97706]",
														children: [row.skippedCount, "S"]
													}),
													" / ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[#6B7280]",
														children: [row.unattemptedCount, "NA"]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 px-3 align-top text-center font-extrabold text-[#111827]",
												children: row.correctToWrongRatioLabel
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-3 px-3 align-top text-right",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: `font-extrabold text-sm ${row.attemptedQuestionsCount === 0 ? "text-[#6B7280]" : row.rawAccuracyPct < 60 ? "text-[#DC2626]" : row.rawAccuracyPct < 80 ? "text-[#D97706]" : "text-[#15803D]"}`,
													children: [row.rawAccuracyPct.toFixed(2), "%"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-[#6B7280]",
													children: [
														row.correctCount,
														" / ",
														row.attemptedQuestionsCount,
														" Attempted"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-3 px-3 align-top text-right",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: `font-extrabold ${row.netAccuracyValuationPct < 50 ? "text-[#DC2626]" : "text-[#1D4ED8]"}`,
													children: [row.netAccuracyValuationPct.toFixed(2), "%"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] text-[#6B7280]",
													children: "+1C / -0.5W / -0.2S"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 px-3 align-top text-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold uppercase ${badgeClass}`,
													children: row.diagnosticStatus
												})
											})
										]
									}, row.stepCode);
								}), microConceptDiagnostics.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 7,
									className: "py-6 text-center text-xs text-[#6B7280]",
									children: "No Micro Concepts / Step-IDs found for this scope."
								}) })]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-4 shadow-2xs font-mono",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-bold uppercase text-[#111827]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#15803D]" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SPATIAL GRAPH QUESTION PLACEHOLDERS & CUSTOM SYNTAX (<box w>, <line d>, <math ==>)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-2 py-0.5 text-[10px] bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded font-bold",
									children: "MANUS UPGRADE PACKAGE READY IN /angles-local-upgrade/"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-sans text-[#6B7280] mt-0.5",
							children: [
								"Generic questions are removed from the graph canvas and replaced by Scoped Concept Placeholders below. Clicking ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Study Mode" }),
								" or",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Shallow Mode" }),
								" redirects directly into Question Cards pre-filtered strictly to that clicked Subtopic & Concept."
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowStorageModal("mkml"),
							className: "px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-bold cursor-pointer",
							children: "Edit <box w> / <line d> / <math ==> in [MKML Tags]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-bold uppercase tracking-wider text-[#4B5563]",
							children: "1. GRAPH QUESTION PLACEHOLDER NODES (CLICK TO REDIRECT DIRECTLY TO SCOPED STUDY OR SHALLOW MODE)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5",
							children: scannedTree.subtopics.map((st, sIdx) => st.concepts.map((con, cIdx) => {
								const isSelectedScope = effectiveScopeId === con.conceptId || effectiveScopeId === st.subtopicId;
								const pathLabel = `S${sIdx + 1}-V${cIdx + 1}`;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `p-3 rounded-lg border transition-colors flex flex-col justify-between gap-2.5 ${isSelectedScope ? "bg-[#EFF6FF]/60 border-[#1D4ED8]" : "bg-[#F9F8F4] border-[#DFDDD4]"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "px-2 py-0.5 text-[10px] font-extrabold bg-white border border-[#DFDDD4] rounded text-[#1D4ED8]",
												children: [
													"<Concept == ",
													con.conceptId,
													">"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-extrabold text-[#15803D]",
												children: [con.questions.length, " Qs"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-sans font-bold text-xs text-[#111827] mt-1.5",
											children: [
												st.subtopicName,
												" → ",
												con.conceptName,
												" (",
												pathLabel,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] text-[#6B7280] mt-0.5",
											children: "Graph Placeholder Node (No raw questions dumped on canvas)"
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-1.5 pt-1 border-t border-[#E5E3DC]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => onLaunchScopedQuestionsDirect(con.questions, pathLabel, "study"),
											className: "px-2.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-[11px] font-bold text-center transition-colors cursor-pointer",
											children: [
												"→ Study Mode (",
												con.questions.length,
												"Q)"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => onLaunchScopedQuestionsDirect(con.questions, pathLabel, "shallow"),
											className: "px-2.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded text-[11px] font-bold text-center transition-colors cursor-pointer",
											children: [
												"→ Shallow Mode (",
												con.questions.length,
												"Q)"
											]
										})]
									})]
								}, con.conceptId);
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-[#E5E3DC]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lg:col-span-7 bg-[#FBFBF7] border border-[#DFDDD4] rounded-lg p-3 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#4B5563] border-b border-[#E5E3DC] pb-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-[#111827]",
									children: "2. LIVE DIAGRAM CANVAS: <line d> (4mm ABOVE LINE, TOP Z-INDEX) & <box w> (25% BOTTOM BASELINE)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[#1D4ED8] font-bold",
									children: [
										parsedCustomSyntax.lineDItems.length,
										" <line d> ·",
										" ",
										parsedCustomSyntax.boxWItems.length,
										" <box w>"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full h-56 rounded border border-[#E5E3DC] overflow-hidden",
								style: {
									backgroundImage: "linear-gradient(to right, #ECEAE2 1px, transparent 1px), linear-gradient(to bottom, #ECEAE2 1px, transparent 1px)",
									backgroundSize: "20px 20px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute left-6 top-4 right-6 bottom-4 bg-[#F1F5F9]/80 border border-[#94A3B8] rounded px-3 py-2 z-10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold text-[#475569]",
										children: "Underlying <box> Layer (z-index: 20) — <line d> (z-index: 40) & <box w> (z-index: 35) render directly on top"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									viewBox: "0 0 520 210",
									className: "absolute inset-0 w-full h-full z-40 pointer-events-none",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "150",
											y1: "40",
											x2: "150",
											y2: "145",
											stroke: parsedCustomSyntax.lineDItems[0]?.lineColor || "#1D4ED8",
											strokeWidth: "2.5"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
											x: "135",
											y: "92",
											fill: parsedCustomSyntax.lineDItems[0]?.textColor || "#1E3A8A",
											fontSize: "11",
											fontWeight: "bold",
											textAnchor: "middle",
											transform: "rotate(-90 135 92)",
											children: parsedCustomSyntax.lineDItems[0]?.labelText || "oppo (O = 3) [4mm above line]"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "150",
											y1: "145",
											x2: "310",
											y2: "145",
											stroke: parsedCustomSyntax.lineDItems[1]?.lineColor || "#15803D",
											strokeWidth: "2.5"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
											x: "230",
											y: "130",
											fill: parsedCustomSyntax.lineDItems[1]?.textColor || "#14532D",
											fontSize: "11",
											fontWeight: "bold",
											textAnchor: "middle",
											children: parsedCustomSyntax.lineDItems[1]?.labelText || "Adj (M = 4) [4mm above line]"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "150",
											y1: "40",
											x2: "310",
											y2: "145",
											stroke: parsedCustomSyntax.lineDItems[2]?.lineColor || "#E11D48",
											strokeWidth: "2.5"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
											x: "238",
											y: "80",
											fill: parsedCustomSyntax.lineDItems[2]?.textColor || "#991B1B",
											fontSize: "11",
											fontWeight: "bold",
											textAnchor: "middle",
											transform: "rotate(33.3 238 80)",
											children: parsedCustomSyntax.lineDItems[2]?.labelText || "hypo (H = 5) [4mm above line]"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
												x: "115",
												y: "156",
												width: "240",
												height: "38",
												fill: parsedCustomSyntax.boxWItems[0]?.bgColor && parsedCustomSyntax.boxWItems[0]?.bgColor !== "transparent" ? parsedCustomSyntax.boxWItems[0].bgColor : "none",
												stroke: "#94A3B8",
												strokeDasharray: "3 3",
												strokeWidth: "0.75"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
												x1: "125",
												y1: "184.5",
												x2: "345",
												y2: "184.5",
												stroke: parsedCustomSyntax.boxWItems[0]?.textColor || "#000000",
												strokeWidth: "1.75"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
												x: "235",
												y: "180",
												fill: parsedCustomSyntax.boxWItems[0]?.textColor || "#000000",
												fontSize: "11",
												fontWeight: "bold",
												textAnchor: "middle",
												children: parsedCustomSyntax.boxWItems[0]?.rawText || "Right ΔABC (∠B = 90°, α at A, β at C)"
											})
										] })
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lg:col-span-5 bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3 space-y-2.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] border-b border-[#E5E3DC] pb-1.5",
								children: "3. NEW CUSTOM SYNTAX & <math == ...> COMPILER SPEC"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 text-[11px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 bg-white border border-[#DFDDD4] rounded",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-bold text-[#111827]",
											children: "A) <box w points = (x1,y1),(x2,y2),(x3,y3),(x4,y4)>text</box w>"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-sans text-[#4B5563] mt-0.5",
											children: [
												"Default: ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "bg-color: transparent" }),
												", ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "border: transparent" }),
												",",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "text-color: #000000" }),
												". Draws internal line parallel to bottom at",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "25% height" }),
												"; text sits centered directly on top of the line."
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 bg-white border border-[#DFDDD4] rounded",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-bold text-[#111827]",
											children: "B) <line d line-color=#hex text-color=#hex>(x1,y1),(x2,y2) text</line d>"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-sans text-[#4B5563] mt-0.5",
											children: [
												"Sits ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "on top of <box>" }),
												" (",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "z-index: 40" }),
												"). Inline text sits centered directly on top of the line ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "4 mm (~15px)" }),
												" ",
												"above the segment."
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2 bg-white border border-[#DFDDD4] rounded space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-bold text-[#111827]",
											children: "C) Compiled <math == ...> Expressions in Current Chapter:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "max-h-24 overflow-y-auto space-y-1 pr-1",
											children: parsedCustomSyntax.mathSamples.slice(0, 8).map((ms, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2 text-[10px] bg-[#F9F8F4] px-2 py-0.5 rounded border border-[#E5E3DC]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
													className: "text-[#6B7280] truncate",
													children: ms.raw
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-[#1D4ED8] shrink-0",
													dangerouslySetInnerHTML: { __html: ms.compiled }
												})]
											}, idx))
										})]
									})
								]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]",
					children: "PAGE 2 FORMULA ARCHITECTURE GUIDE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold text-[#1D4ED8]",
							children: "1. Completion %"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[#4B5563] text-[11px] mt-1 leading-relaxed",
							children: [
								"Net completion percentage within scope:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-[#111827] font-mono",
									children: [
										"LTMS (",
										fmt(scopeMetrics.LTMS),
										") / MMS (",
										scopeMetrics.MMS,
										") × 100 =",
										" ",
										scopeMetrics.completionPct.toFixed(2),
										"%"
									]
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold text-[#15803D]",
							children: "2. Shared Effective Contribution"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[#4B5563] text-[11px] mt-1 leading-relaxed",
							children: [
								"Score contribution to overall topic performance:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-[#111827] font-mono",
									children: [
										"LTMS (",
										fmt(scopeMetrics.LTMS),
										") / Topic LTM (",
										fmt(topicMetrics.LTMS),
										") × 100 =",
										" ",
										scopeMetrics.sharedEffectiveContributionPct.toFixed(2),
										"%"
									]
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold text-[#D97706]",
							children: "3. Topic Weightage (W)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[#4B5563] text-[11px] mt-1 leading-relaxed",
							children: [
								"Question bank representation:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-[#111827] font-mono",
									children: [
										"Scope Qs (",
										scopeMetrics.scopeQuestionsCount,
										") / Topic Qs (",
										topicMetrics.scopeQuestionsCount,
										") × 100 =",
										" ",
										scopeMetrics.topicWeightagePct.toFixed(2),
										"%"
									]
								})
							]
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBackToPartOne,
					className: "px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Part 1: Topic Overview" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onOpenQuestionIndex,
					className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Proceed to Question Index (Select & Launch Test)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })]
				})]
			}),
			showStorageModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white border border-[#DFDDD4] rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl text-[#111827] font-mono",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-4 py-3 bg-[#F9F8F4] border-b border-[#DFDDD4]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs font-bold",
								children: [
									showStorageModal === "mkml" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode, { className: "w-4 h-4 text-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Embedded MKML Identification Tags (<Domain>, <Chapter>, <Subtopic>, <Concept>, <MC>) — ", ledger.chapterCode] })] }),
									showStorageModal === "marks" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "w-4 h-4 text-[#15803D]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Separate marks.tex Storage File (Keyed by Chained Unique Question ID) —",
										" ",
										ledger.chapterCode
									] })] }),
									showStorageModal === "json" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "w-4 h-4 text-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Topic Ledger JSON Tree (",
										ledger.chapterCode,
										")"
									] })] })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShowStorageModal(null),
								className: "p-1 text-[#6B7280] hover:text-[#111827] rounded cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 max-h-[440px] overflow-y-auto bg-[#F5F4EF] text-xs",
							children: showStorageModal === "mkml" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-[#4B5563]",
									children: "Edit the MKML tags below (<Subtopic == ...>, <Concept == ...>, <Qn>) — the Subtopic Hierarchy & Question counts update live:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: rawChapterMkml,
									onChange: (e) => setCustomMkmlByChapter((prev) => ({
										...prev,
										[ledger.chapterCode]: e.target.value
									})),
									className: "w-full h-80 p-3 bg-white border border-[#DFDDD4] rounded text-xs text-[#111827] focus:outline-none focus:border-[#1D4ED8]",
									spellCheck: false
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "whitespace-pre-wrap break-all text-[#111827]",
								children: showStorageModal === "marks" ? marksTexContent : JSON.stringify(ledger, null, 2)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-4 py-2.5 bg-[#F9F8F4] border-t border-[#DFDDD4] text-[11px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[#6B7280]",
								children: [
									"Unique ID Format: <Domain-Chapter-Subtopic-Concept-x_n> (e.g.",
									" ",
									scannedTree.allQuestions[0]?.uniqueId || "QA-TD-BWR-V1-1",
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleCopyText(showStorageModal === "mkml" ? rawChapterMkml : showStorageModal === "marks" ? marksTexContent : JSON.stringify(ledger, null, 2)),
								className: "px-3 py-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded font-bold flex items-center gap-1 cursor-pointer",
								children: [copiedModal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copiedModal ? "Copied" : "Copy" })]
							})]
						})
					]
				})
			})
		]
	});
};
// src/components/TrackerQuestionIndex.tsx
function getLatestAttemptSummary(attempts, fastLimit, mediumLimit, slowLimit) {
	if (!attempts || attempts.length === 0) return {
		isAttempted: false,
		status: null,
		accMark: 0,
		timeMark: 0,
		totalMark: 0
	};
	const [status, seconds] = attempts[attempts.length - 1];
	if (status === "W") return {
		isAttempted: true,
		status: "W",
		accMark: -.5,
		timeMark: 0,
		totalMark: -.5
	};
	if (status === "S") return {
		isAttempted: true,
		status: "S",
		accMark: -.2,
		timeMark: 0,
		totalMark: -.2
	};
	let timeMark = 0;
	if (seconds <= fastLimit) timeMark = 2;
	else if (seconds <= mediumLimit) timeMark = 1;
	else if (seconds <= slowLimit) timeMark = .5;
	return {
		isAttempted: true,
		status: "C",
		accMark: 1,
		timeMark,
		totalMark: Number((1 + timeMark).toFixed(2))
	};
}
function formatSignedMark(val, decimals = 1) {
	if (val > 0) return `+${val.toFixed(decimals)}`;
	if (val < 0) return val.toFixed(decimals);
	return "0";
}
var TrackerQuestionIndex = ({ ledger, allLedgers, onSelectChapter, onLaunchQuestionCards, onBackToPartTwo, onGoToTrackerPageOne, domains, chapters, subtopics, concepts, microConcepts }) => {
	const scannedTree = (0, import_react.useMemo)(() => scanChapterStorageAndMarks(ledger.chapterCode, ledger, domains, chapters, subtopics, concepts, microConcepts), [
		ledger,
		domains,
		chapters,
		subtopics,
		concepts,
		microConcepts
	]);
	const allConceptIds = (0, import_react.useMemo)(() => {
		const ids = [];
		scannedTree.subtopics.forEach((st) => {
			st.concepts.forEach((con) => {
				ids.push(con.conceptId);
			});
		});
		return ids;
	}, [scannedTree]);
	const [deselectedConceptIds, setDeselectedConceptIds] = (0, import_react.useState)({});
	const [sortOrder, setSortOrder] = (0, import_react.useState)("high-to-low");
	const [poolPreference, setPoolPreference] = (0, import_react.useState)("full");
	const [executionModality, setExecutionModality] = (0, import_react.useState)("shallow");
	const [copiedPaths, setCopiedPaths] = (0, import_react.useState)(false);
	const activeConceptIdSet = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		allConceptIds.forEach((id) => {
			if (!deselectedConceptIds[id]) set.add(id);
		});
		return set;
	}, [allConceptIds, deselectedConceptIds]);
	const areAllSelected = activeConceptIdSet.size === allConceptIds.length && allConceptIds.length > 0;
	const handleToggleAllConcepts = () => {
		if (areAllSelected) {
			const next = {};
			allConceptIds.forEach((id) => {
				next[id] = true;
			});
			setDeselectedConceptIds(next);
		} else setDeselectedConceptIds({});
	};
	const handleToggleConcept = (conceptId) => {
		setDeselectedConceptIds((prev) => ({
			...prev,
			[conceptId]: !prev[conceptId]
		}));
	};
	const handleToggleSubtopic = (conceptIdsInSubtopic) => {
		const allActive = conceptIdsInSubtopic.every((id) => !deselectedConceptIds[id]);
		setDeselectedConceptIds((prev) => {
			const next = { ...prev };
			conceptIdsInSubtopic.forEach((id) => {
				next[id] = allActive;
			});
			return next;
		});
	};
	const formattedPathsString = `[${(0, import_react.useMemo)(() => {
		const list = [];
		scannedTree.subtopics.forEach((st) => {
			st.concepts.forEach((con) => {
				if (activeConceptIdSet.has(con.conceptId)) list.push(`${st.subtopicCode}-${con.conceptCode}`);
			});
		});
		return list;
	}, [scannedTree, activeConceptIdSet]).join(", ")}]`;
	const filteredAndSortedQuestions = (0, import_react.useMemo)(() => {
		const { fastLimit, mediumLimit, slowLimit } = ledger.timing;
		const matching = scannedTree.allQuestions.filter((q) => activeConceptIdSet.has(q.conceptId)).map((q) => {
			return {
				question: q,
				pathLabel: `${q.subtopicShortCode}-${q.conceptShortCode}`,
				...getLatestAttemptSummary(q.attempts, fastLimit, mediumLimit, slowLimit)
			};
		}).filter((item) => {
			if (poolPreference === "attempted") return item.isAttempted;
			return true;
		});
		matching.sort((a, b) => {
			if (a.isAttempted && !b.isAttempted) return -1;
			if (!a.isAttempted && b.isAttempted) return 1;
			if (!a.isAttempted && !b.isAttempted) return a.question.uniqueId.localeCompare(b.question.uniqueId);
			if (sortOrder === "high-to-low") return b.totalMark - a.totalMark;
			return a.totalMark - b.totalMark;
		});
		return matching;
	}, [
		scannedTree,
		activeConceptIdSet,
		poolPreference,
		sortOrder,
		ledger.timing
	]);
	const maxQuestionLimit = filteredAndSortedQuestions.length;
	const [questionLimitOverride, setQuestionLimitOverride] = (0, import_react.useState)(null);
	const effectiveQuestionCount = (0, import_react.useMemo)(() => {
		if (maxQuestionLimit === 0) return 0;
		if (questionLimitOverride === null || questionLimitOverride > maxQuestionLimit) return maxQuestionLimit;
		return Math.max(1, questionLimitOverride);
	}, [maxQuestionLimit, questionLimitOverride]);
	const displayedQuestions = (0, import_react.useMemo)(() => filteredAndSortedQuestions.slice(0, effectiveQuestionCount), [filteredAndSortedQuestions, effectiveQuestionCount]);
	const handleCopyPaths = () => {
		navigator.clipboard.writeText(formattedPathsString);
		setCopiedPaths(true);
		setTimeout(() => setCopiedPaths(false), 1600);
	};
	const handleConfirmAndProceed = () => {
		if (displayedQuestions.length === 0) return;
		onLaunchQuestionCards(displayedQuestions.map((item) => ({
			question: item.question,
			pathLabel: item.pathLabel
		})), executionModality);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full bg-[#F5F4EF] text-[#111827] space-y-2.5 font-mono select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl sm:text-3xl font-sans font-extrabold tracking-tight text-[#111827]",
						children: "Question Index"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: ledger.chapterCode,
						onChange: (e) => {
							onSelectChapter(e.target.value);
							setDeselectedConceptIds({});
							setQuestionLimitOverride(null);
						},
						className: "px-3 py-1 text-xs font-sans font-semibold bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] rounded-md focus:outline-none focus:border-[#1D4ED8] cursor-pointer",
						children: Object.values(allLedgers).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: l.chapterCode,
							children: [
								l.chapterName,
								" [",
								l.chapterCode,
								"]"
							]
						}, l.chapterCode))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-2 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] text-center min-w-[96px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider text-[#6B7280]",
							children: "TOTAL POOL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xl font-extrabold text-[#111827] mt-0.5",
							children: [
								scannedTree.allQuestions.length,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#1D4ED8]",
									children: "Q"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-center min-w-[96px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider text-[#15803D] font-bold",
							children: "SELECTED"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xl font-extrabold text-[#15803D] mt-0.5",
							children: [displayedQuestions.length, " Q"]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-3 bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between shadow-2xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2 pb-3 border-b border-[#E5E3DC]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-bold uppercase tracking-wider text-[#111827]",
									children: "SUBTOPIC MATRIX"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-wider text-[#6B7280] mt-0.5",
									children: "HIERARCHICAL SELECTION"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleToggleAllConcepts,
									className: "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#374151] border border-[#DFDDD4] rounded transition-colors cursor-pointer",
									children: areAllSelected ? "DESELECT ALL" : "SELECT ALL"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-4",
								children: scannedTree.subtopics.map((st, sIdx) => {
									const subtopicConceptIds = st.concepts.map((c) => c.conceptId);
									const isSubtopicChecked = subtopicConceptIds.length > 0 && subtopicConceptIds.some((id) => activeConceptIdSet.has(id));
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center justify-between gap-2 cursor-pointer group",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: isSubtopicChecked,
													onChange: () => handleToggleSubtopic(subtopicConceptIds),
													className: "w-4 h-4 accent-[#1D4ED8] rounded cursor-pointer"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs font-sans font-bold text-[#111827] group-hover:text-[#1D4ED8]",
													children: [
														sIdx + 1,
														") ",
														st.subtopicName
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] text-[#6B7280]",
												children: [
													"(",
													st.questions.length,
													" q)"
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "pl-6 space-y-1.5",
											children: st.concepts.map((con, cIdx) => {
												const isChecked = activeConceptIdSet.has(con.conceptId);
												const letter = String.fromCharCode(97 + cIdx);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex items-center justify-between gap-2 cursor-pointer py-0.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																type: "checkbox",
																checked: isChecked,
																onChange: () => handleToggleConcept(con.conceptId),
																className: "w-3.5 h-3.5 accent-[#1D4ED8] rounded cursor-pointer"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-xs text-[#374151]",
																children: [
																	sIdx + 1,
																	letter,
																	") ",
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																		className: "text-[#111827]",
																		children: con.conceptCode
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-[11px] text-[#6B7280]",
																children: [
																	"(",
																	con.questions.length,
																	" q)"
																]
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${isChecked ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : "bg-[#F9F8F4] text-[#9CA3AF] border-[#E5E3DC]"}`,
														children: isChecked ? "ACTIVE" : "OFF"
													})]
												}, con.conceptId);
											})
										})]
									}, st.subtopicId);
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-5 bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5E3DC]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-bold uppercase tracking-wider text-[#111827]",
										children: "QUESTION INDEX"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] uppercase tracking-wider text-[#6B7280] mt-0.5",
										children: [
											"POOL VIEW: ",
											displayedQuestions.length,
											" ITEMS LOADED"
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 text-[10px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[#6B7280] uppercase",
											children: "ORDER:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "inline-flex rounded-md border border-[#DFDDD4] bg-[#F9F8F4] p-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setSortOrder("high-to-low"),
												className: `px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${sortOrder === "high-to-low" ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
												children: "HIGH → LOW"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setSortOrder("low-to-high"),
												className: `px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${sortOrder === "low-to-high" ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
												children: "LOW → HIGH"
											})]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6B7280] pb-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "A = Accuracy • T = Time/Speed • Total = A + T" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-[#1D4ED8]",
										children: ["SORT: ", sortOrder === "high-to-low" ? "HIGH → LOW" : "LOW → HIGH"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-left border-collapse text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-[#E5E3DC] text-[10px] uppercase tracking-wider text-[#6B7280]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "py-2 pr-2",
													children: "S.NO"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "py-2 px-2",
													children: "UNIQUE ID"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "py-2 px-2",
													children: "PATH"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "py-2 pl-2 text-right",
													children: "MARKS (A, T) & TOTAL"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
											className: "divide-y divide-[#F0EFEA]",
											children: [displayedQuestions.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "hover:bg-[#F9F8F4]/70",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-2.5 pr-2 text-[#6B7280]",
														children: idx + 1
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-2.5 px-2 font-bold text-[#1D4ED8]",
														children: item.question.uniqueId
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-2.5 px-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "px-2 py-0.5 text-[10px] bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] rounded",
															children: item.pathLabel
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-2.5 pl-2 text-right",
														children: !item.isAttempted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "px-2 py-0.5 text-[10px] bg-[#F9F8F4] text-[#6B7280] border border-[#DFDDD4] rounded",
															children: "NIL (UNATTEMPTED)"
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "inline-flex items-center gap-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: `px-1.5 py-0.5 text-[10px] font-bold rounded border ${item.accMark > 0 ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"}`,
																	children: ["A: ", formatSignedMark(item.accMark)]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: `px-1.5 py-0.5 text-[10px] font-bold rounded border ${item.timeMark > 0 ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" : "bg-[#F9F8F4] text-[#6B7280] border-[#DFDDD4]"}`,
																	children: ["T: ", item.timeMark > 0 ? `+${item.timeMark.toFixed(1)}` : "0"]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: `px-1.5 py-0.5 text-[10px] font-bold rounded border ${item.totalMark > 0 ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"}`,
																	children: formatSignedMark(item.totalMark)
																})
															]
														})
													})
												]
											}, item.question.uniqueId)), displayedQuestions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												colSpan: 4,
												className: "py-8 text-center text-xs text-[#6B7280]",
												children: "No questions match the selected Subtopic Matrix / Pool filter."
											}) })]
										})]
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-3 mt-4 border-t border-[#E5E3DC] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6B7280]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"DISPLAYING ",
								displayedQuestions.length > 0 ? 1 : 0,
								" - ",
								displayedQuestions.length,
								" OF",
								" ",
								filteredAndSortedQuestions.length,
								" UNIQUE POOL NODES"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: true,
										className: "px-2 py-1 rounded border border-[#DFDDD4] bg-[#F9F8F4] text-[#9CA3AF] cursor-not-allowed",
										children: "< PREV"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-2.5 py-1 rounded border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] font-bold",
										children: "01 / 01"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: true,
										className: "px-2 py-1 rounded border border-[#DFDDD4] bg-[#F9F8F4] text-[#9CA3AF] cursor-not-allowed",
										children: "NEXT >"
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-4 bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2 pb-3 border-b border-[#E5E3DC]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-bold uppercase tracking-wider text-[#111827]",
										children: "QUESTION CARD ENTRY FORM"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-wider text-[#6B7280] mt-0.5",
										children: "EXECUTION PARAMETERS"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "w-4 h-4 text-[#1D4ED8]" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-wider text-[#6B7280] font-bold",
										children: "INPUT PATHS / COPY SELECTED SUBTOPIC MATRIX"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[#F9F8F4] border border-[#DFDDD4]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-bold text-[#15803D] truncate",
											children: formattedPathsString
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: handleCopyPaths,
											className: "p-1.5 rounded bg-white hover:bg-[#EFF6FF] text-[#374151] hover:text-[#1D4ED8] border border-[#DFDDD4] transition-colors cursor-pointer shrink-0",
											title: "Copy selected subtopic-concept paths",
											children: copiedPaths ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5 text-[#15803D]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" })
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between text-[10px] uppercase tracking-wider",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[#6B7280] font-bold",
												children: "INPUT QUESTION RANGE / COUNT"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[#1D4ED8] font-bold",
												children: [effectiveQuestionCount, " QUESTIONS"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between text-[11px] text-[#6B7280]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Range: ",
												effectiveQuestionCount > 0 ? "01" : "00",
												" - ",
												effectiveQuestionCount
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Limit: ",
												maxQuestionLimit,
												" Max"
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: maxQuestionLimit > 0 ? 1 : 0,
											max: maxQuestionLimit,
											value: effectiveQuestionCount,
											disabled: maxQuestionLimit === 0,
											onChange: (e) => setQuestionLimitOverride(parseInt(e.target.value, 10)),
											className: "w-full accent-[#1D4ED8] cursor-pointer"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] uppercase tracking-wider text-[#6B7280] font-bold",
											children: "QUESTION POOL PREFERENCE"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-1.5 p-1 rounded-md bg-[#F9F8F4] border border-[#DFDDD4]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setPoolPreference("attempted"),
												className: `py-2 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${poolPreference === "attempted" ? "bg-[#1D4ED8] text-white shadow-2xs" : "text-[#374151] hover:bg-white"}`,
												children: "Attempted Questions"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setPoolPreference("full"),
												className: `py-2 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${poolPreference === "full" ? "bg-[#1D4ED8] text-white shadow-2xs" : "text-[#374151] hover:bg-white"}`,
												children: "Full Question Pool"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] font-sans text-[#6B7280]",
											children: poolPreference === "full" ? "Prefers unattempted & high-entropy questions from full pool." : "Filters exclusively to previously attempted questions in storage."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] uppercase tracking-wider text-[#6B7280] font-bold",
											children: "EXECUTION MODALITY"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-1 p-1 rounded-md bg-[#F9F8F4] border border-[#DFDDD4]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setExecutionModality("study"),
													className: `py-1.5 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${executionModality === "study" ? "bg-[#1D4ED8] text-white shadow-2xs" : "text-[#374151] hover:bg-white"}`,
													children: "Study Mode"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setExecutionModality("shallow"),
													className: `py-1.5 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${executionModality === "shallow" ? "bg-[#1D4ED8] text-white shadow-2xs" : "text-[#374151] hover:bg-white"}`,
													children: "Shallow Test"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setExecutionModality("full"),
													className: `py-1.5 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${executionModality === "full" ? "bg-[#1D4ED8] text-white shadow-2xs" : "text-[#374151] hover:bg-white"}`,
													children: "Full Test"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2.5 rounded-md bg-[#F9F8F4] border border-[#DFDDD4] text-[11px] font-sans text-[#4B5563] flex items-start gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												executionModality === "shallow" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-[#111827]",
													children: "Shallow Test:"
												}), " Answers & explanation reveal upon clicking an option. Does not alter attempts."] }),
												executionModality === "study" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-[#111827]",
													children: "Study Mode:"
												}), " Shows full question cards with correct answers revealed for direct review."] }),
												executionModality === "full" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-[#111827]",
													children: "Full Test:"
												}), " Evaluates selected questions on submit and updates marks in Chapter Tracker Page 1."] })
											] })]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-4 mt-4 border-t border-[#E5E3DC]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: displayedQuestions.length === 0,
								onClick: handleConfirmAndProceed,
								className: "w-full py-2.5 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#9CA3AF] text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CONFIRM AND PROCEED" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBackToPartTwo,
					className: "px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back to Part 2: Subtopic Breakdown" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onGoToTrackerPageOne,
					className: "px-3.5 py-1.5 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#374151] border border-[#DFDDD4] rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Chapter Tracker (Page 1)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5 text-[#1D4ED8]" })]
				})]
			})
		]
	});
};
// src/components/TrackerQuestionCards.tsx
function parseQuestionCardData(raw, uniqueId) {
	const xmlTextMatch = raw.match(/<Text>([\s\S]*?)<\/Text>/i);
	const anglesTextMatch = raw.match(/<text\s*=\s*([^>]+)>/i);
	const extractedText = xmlTextMatch ? xmlTextMatch[1].trim() : anglesTextMatch ? anglesTextMatch[1].trim() : `Question ${uniqueId}`;
	const optionsMatch = raw.match(/<Options>([\s\S]*?)<\/Options>/i);
	const xmlAnswerMatch = raw.match(/<Answer>([\s\S]*?)<\/Answer>/i);
	const anglesAnswerMatch = raw.match(/<answer\s*=\s*([^>]+)>/i);
	const extractedAnswer = xmlAnswerMatch ? xmlAnswerMatch[1].trim().toUpperCase() : anglesAnswerMatch ? anglesAnswerMatch[1].trim().toUpperCase() : "A";
	const optionsRaw = optionsMatch ? optionsMatch[1].trim() : "";
	const parsedOptions = [];
	const anglesOptionRegex = /<([A-Da-d])\s*=\s*([^>]+)>/g;
	let aoMatch;
	while ((aoMatch = anglesOptionRegex.exec(optionsRaw)) !== null) parsedOptions.push({
		key: aoMatch[1].toUpperCase(),
		label: aoMatch[2].trim()
	});
	if (parsedOptions.length === 0 && optionsRaw) {
		const optionTokens = optionsRaw.split("|").map((s) => s.trim()).filter(Boolean);
		const defaultKeys = [
			"A",
			"B",
			"C",
			"D"
		];
		optionTokens.forEach((tok, idx) => {
			const m = tok.match(/^\(?([A-Da-d])\)?[\.\s:-]+([\s\S]+)$/);
			if (m) parsedOptions.push({
				key: m[1].toUpperCase(),
				label: m[2].trim()
			});
			else parsedOptions.push({
				key: defaultKeys[idx] || String(idx + 1),
				label: tok
			});
		});
	}
	return {
		text: extractedText,
		options: parsedOptions.length > 0 ? parsedOptions : [
			{
				key: "A",
				label: "First option"
			},
			{
				key: "B",
				label: "Second option"
			},
			{
				key: "C",
				label: "Third option"
			},
			{
				key: "D",
				label: "Fourth option"
			}
		],
		answer: extractedAnswer,
		defaultSteps: getQuestionExplanationSteps(uniqueId)
	};
}
function computeCardScoring(chosenOption, correctOption, seconds, fastLimit, mediumLimit, slowLimit) {
	if (!chosenOption) return {
		status: "S",
		accMark: -.2,
		timeMark: 0,
		totalMark: -.2,
		tierLabel: "Skipped (-0.2)"
	};
	if (chosenOption !== correctOption) return {
		status: "W",
		accMark: -.5,
		timeMark: 0,
		totalMark: -.5,
		tierLabel: "Wrong (-0.5)"
	};
	let timeMark = 0;
	let tierLabel = `Over ${slowLimit}s (+0.0)`;
	if (seconds <= fastLimit) {
		timeMark = 2;
		tierLabel = `Fast ≤ ${fastLimit}s (+2.0)`;
	} else if (seconds <= mediumLimit) {
		timeMark = 1;
		tierLabel = `Med ≤ ${mediumLimit}s (+1.0)`;
	} else if (seconds <= slowLimit) {
		timeMark = .5;
		tierLabel = `Slow ≤ ${slowLimit}s (+0.5)`;
	}
	return {
		status: "C",
		accMark: 1,
		timeMark,
		totalMark: Number((1 + timeMark).toFixed(2)),
		tierLabel
	};
}
var TrackerQuestionCards = ({ ledger, selectedItems, executionModality, stepsByQid, setStepsByQid, onRecordEvaluatedTest, onBackToQuestionIndex, onOpenTestAnalysis, onGoToTrackerPageOne, domains, chapters, subtopics, concepts, microConcepts }) => {
	const totalCards = selectedItems.length;
	const [currentIndex, setCurrentIndex] = (0, import_react.useState)(0);
	const [pickedOptions, setPickedOptions] = (0, import_react.useState)({});
	const [elapsedSecondsByQid, setElapsedSecondsByQid] = (0, import_react.useState)(() => {
		const init = {};
		selectedItems.forEach((item) => {
			init[item.question.uniqueId] = 0;
		});
		return init;
	});
	const [isTestSubmitted, setIsTestSubmitted] = (0, import_react.useState)(false);
	const activeItem = selectedItems[currentIndex] || selectedItems[0];
	const activeQid = activeItem?.question.uniqueId || "";
	const parsedCard = (0, import_react.useMemo)(() => {
		if (!activeItem) return {
			text: "No questions selected",
			options: [],
			answer: "A",
			defaultSteps: []
		};
		return parseQuestionCardData(activeItem.question.rawQnBody, activeItem.question.uniqueId);
	}, [activeItem]);
	const activePickedOption = pickedOptions[activeQid] || "";
	const activeElapsedSeconds = elapsedSecondsByQid[activeQid] || 0;
	const activeSteps = stepsByQid[activeQid] || parsedCard.defaultSteps;
	const structuralQuestionId = (0, import_react.useMemo)(() => {
		const ids = activeSteps.map((s) => s.stepId.trim()).filter(Boolean);
		return ids.length > 0 ? ids.join("-") : "T1";
	}, [activeSteps]);
	const isCurrentCardRevealed = executionModality === "study" || executionModality === "shallow" && Boolean(activePickedOption) || executionModality === "full" && isTestSubmitted;
	const isCurrentCardTimerRunning = Boolean(activeItem) && (executionModality === "shallow" && !activePickedOption || executionModality === "full" && !isTestSubmitted);
	(0, import_react.useEffect)(() => {
		if (!isCurrentCardTimerRunning || !activeQid) return;
		const interval = window.setInterval(() => {
			setElapsedSecondsByQid((prev) => ({
				...prev,
				[activeQid]: (prev[activeQid] || 0) + 1
			}));
		}, 1e3);
		return () => window.clearInterval(interval);
	}, [isCurrentCardTimerRunning, activeQid]);
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
			if (e.key === "ArrowLeft") setCurrentIndex((prev) => Math.max(0, prev - 1));
			else if (e.key === "ArrowRight") setCurrentIndex((prev) => Math.min(totalCards - 1, prev + 1));
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [totalCards]);
	const metadataNames = (0, import_react.useMemo)(() => {
		if (!activeItem) return {
			domainName: "Quantitative Aptitude",
			chapterName: ledger.chapterName,
			subtopicName: "Core Concepts",
			conceptName: "V1"
		};
		const q = activeItem.question;
		const chMeta = chapters.find((c) => c.code === q.chapterCode);
		const domMeta = domains.find((d) => d.code === (chMeta?.domainCode || q.domainCode));
		const stMeta = subtopics.find((s) => s.chapterCode === q.chapterCode && (s.code.toLowerCase().includes(q.subtopicShortCode.toLowerCase()) || s.code.split(/\s+/).map((w) => w[0]?.toUpperCase() || "").join("") === q.subtopicShortCode.toUpperCase()));
		const conMeta = concepts.find((c) => c.chapterCode === q.chapterCode && c.code.toLowerCase() === q.conceptShortCode.toLowerCase());
		return {
			domainName: domMeta ? domMeta.name : q.domainCode,
			chapterName: chMeta ? chMeta.name : ledger.chapterName,
			subtopicName: stMeta ? stMeta.code : q.subtopicShortCode,
			conceptName: conMeta ? conMeta.code : q.conceptShortCode
		};
	}, [
		activeItem,
		chapters,
		domains,
		subtopics,
		concepts,
		ledger.chapterName
	]);
	const availableStepIdOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set([
			"T1",
			"T2",
			"T3",
			"TG",
			"T4",
			"T5"
		]);
		microConcepts.forEach((mc) => {
			if (mc.shortCode) set.add(mc.shortCode);
		});
		return Array.from(set);
	}, [microConcepts]);
	const handleSelectOption = (optionKey) => {
		if (executionModality === "study") return;
		if (executionModality === "full" && isTestSubmitted) return;
		setPickedOptions((prev) => ({
			...prev,
			[activeQid]: optionKey
		}));
	};
	const handleSubmitFullTest = () => {
		if (executionModality !== "full" || isTestSubmitted) return;
		onRecordEvaluatedTest(selectedItems.map((item) => {
			const qid = item.question.uniqueId;
			const parsed = parseQuestionCardData(item.question.rawQnBody, qid);
			const chosenOpt = pickedOptions[qid] || "";
			const spentSec = Math.max(1, elapsedSecondsByQid[qid] || 1);
			const scoring = computeCardScoring(chosenOpt, parsed.answer, spentSec, ledger.timing.fastLimit, ledger.timing.mediumLimit, ledger.timing.slowLimit);
			return {
				uniqueId: qid,
				conceptKey: item.pathLabel,
				status: scoring.status,
				seconds: spentSec,
				option: chosenOpt || "-"
			};
		}));
		setIsTestSubmitted(true);
	};
	const handleUpdateStepText = (stepIdx, nextText) => {
		setStepsByQid((prev) => {
			const list = [...prev[activeQid] || parsedCard.defaultSteps];
			list[stepIdx] = {
				...list[stepIdx],
				text: nextText
			};
			return {
				...prev,
				[activeQid]: list
			};
		});
	};
	const handleUpdateStepId = (stepIdx, nextStepId) => {
		setStepsByQid((prev) => {
			const list = [...prev[activeQid] || parsedCard.defaultSteps];
			list[stepIdx] = {
				...list[stepIdx],
				stepId: nextStepId
			};
			return {
				...prev,
				[activeQid]: list
			};
		});
	};
	const handleAddExplanationStep = () => {
		setStepsByQid((prev) => {
			const list = [...prev[activeQid] || parsedCard.defaultSteps];
			const nextNum = list.length + 1;
			list.push({
				stepNumber: nextNum,
				text: `Step ${nextNum} explanation...`,
				stepId: `T${nextNum}`
			});
			return {
				...prev,
				[activeQid]: list
			};
		});
	};
	const handleDeleteExplanationStep = (stepIdx) => {
		setStepsByQid((prev) => {
			const list = (prev[activeQid] || parsedCard.defaultSteps).filter((_, idx) => idx !== stepIdx).map((s, idx) => ({
				...s,
				stepNumber: idx + 1
			}));
			return {
				...prev,
				[activeQid]: list
			};
		});
	};
	const activeScoring = (0, import_react.useMemo)(() => computeCardScoring(executionModality === "study" ? parsedCard.answer : activePickedOption, parsedCard.answer, Math.max(1, activeElapsedSeconds), ledger.timing.fastLimit, ledger.timing.mediumLimit, ledger.timing.slowLimit), [
		executionModality,
		parsedCard.answer,
		activePickedOption,
		activeElapsedSeconds,
		ledger.timing
	]);
	if (totalCards === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-6 text-center space-y-3 font-mono",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-bold text-[#111827]",
			children: "No questions selected in Question Index."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onBackToQuestionIndex,
			className: "px-4 py-2 bg-[#1D4ED8] text-white rounded-md text-xs font-bold cursor-pointer",
			children: "← Back to Question Index"
		})]
	});
	const isLastCard = currentIndex === totalCards - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full bg-[#F5F4EF] text-[#111827] space-y-3 font-sans select-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full bg-white border border-[#DFDDD4] rounded-xl shadow-2xs overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-[#F9F8F4] border-b border-[#DFDDD4] px-5 py-3 flex flex-wrap items-center justify-between gap-3 font-mono",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2.5 py-1 bg-[#1D4ED8] text-white text-xs font-bold rounded-md",
							children: [
								"Q.No ",
								currentIndex + 1,
								" of ",
								totalCards
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2.5 py-1 bg-white text-[#111827] border border-[#DFDDD4] text-xs font-bold rounded-md",
							title: "Chained Unique Question ID in storage",
							children: ["Unique ID: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#1D4ED8]",
								children: activeQid
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-bold rounded-md",
							title: "Structural Question ID derived from the explanation Step-IDs (used for finding similarity)",
							children: ["Question ID (Steps): ", structuralQuestionId]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 py-0.5 bg-[#F5F4EF] text-[#4B5563] border border-[#DFDDD4] text-[10px] font-bold uppercase rounded",
							children: executionModality === "study" ? "1) Studying Mode" : executionModality === "shallow" ? "2) Casual Mode" : isTestSubmitted ? "3) Test Mode (Submitted & Saved)" : "3) Test Mode (Records Marks)"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2.5",
					children: [executionModality !== "study" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `px-3 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 ${activeElapsedSeconds <= ledger.timing.fastLimit ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : activeElapsedSeconds <= ledger.timing.mediumLimit ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" : activeElapsedSeconds <= ledger.timing.slowLimit ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3.5 h-3.5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [activeElapsedSeconds, "s"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] opacity-80",
								children: [
									"(F≤",
									ledger.timing.fastLimit,
									"s · M≤",
									ledger.timing.mediumLimit,
									"s)"
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: currentIndex === 0,
								onClick: () => setCurrentIndex((prev) => Math.max(0, prev - 1)),
								className: "px-3 py-1 bg-white hover:bg-[#EFF6FF] disabled:opacity-40 text-[#111827] border border-[#DFDDD4] rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed",
								title: "Previous Question Card (Left Arrow Key)",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5 text-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prev" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden sm:flex items-center gap-1 px-1",
								children: selectedItems.map((item, idx) => {
									const qid = item.question.uniqueId;
									const hasPick = Boolean(pickedOptions[qid]);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setCurrentIndex(idx),
										className: `w-6 h-6 rounded text-[11px] font-bold transition-colors cursor-pointer ${idx === currentIndex ? "bg-[#1D4ED8] text-white" : hasPick ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]" : "bg-white text-[#4B5563] border border-[#DFDDD4] hover:bg-[#EFECE6]"}`,
										children: idx + 1
									}, qid);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: isLastCard,
								onClick: () => setCurrentIndex((prev) => Math.min(totalCards - 1, prev + 1)),
								className: "px-3 py-1 bg-white hover:bg-[#EFF6FF] disabled:opacity-40 text-[#111827] border border-[#DFDDD4] rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed",
								title: "Next Question Card (Right Arrow Key)",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Next" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5 text-[#1D4ED8]" })]
							})
						]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2.5 py-1 bg-[#1D4ED8] text-white font-mono text-xs font-bold rounded shrink-0 mt-0.5",
							children: ["Q.No ", currentIndex + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base sm:text-lg font-semibold text-[#111827] leading-relaxed",
							children: parsedCard.text
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs font-mono",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "uppercase tracking-wider text-[#6B7280] font-bold",
								children: "OPTIONS"
							}), isCurrentCardRevealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "px-2.5 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-bold",
								children: ["CORRECT: Option ", parsedCard.answer]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#6B7280]",
								children: executionModality === "shallow" ? "CORRECT: (Click Option to Reveal)" : "CORRECT: (Reveals After Submit on Last Card)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: parsedCard.options.map((opt) => {
								const isPicked = activePickedOption === opt.key;
								const isCorrect = parsedCard.answer === opt.key;
								let rowStyle = "bg-[#F9F8F4] border-[#DFDDD4] text-[#111827] hover:bg-[#EFF6FF]/60 hover:border-[#BFDBFE]";
								let badgeStyle = "bg-white border-[#D1CFC7] text-[#374151]";
								if (isCurrentCardRevealed) {
									if (isCorrect) {
										rowStyle = "bg-[#F0FDF4] border-[#16A34A] text-[#15803D] font-bold";
										badgeStyle = "bg-[#16A34A] border-[#16A34A] text-white";
									} else if (isPicked && !isCorrect) {
										rowStyle = "bg-[#FEF2F2] border-[#DC2626] text-[#DC2626] font-bold";
										badgeStyle = "bg-[#DC2626] border-[#DC2626] text-white";
									}
								} else if (isPicked) {
									rowStyle = "bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] font-bold";
									badgeStyle = "bg-[#1D4ED8] border-[#1D4ED8] text-white";
								}
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleSelectOption(opt.key),
									className: `w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${rowStyle}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `w-7 h-7 rounded-full border font-mono text-xs font-bold flex items-center justify-center shrink-0 ${badgeStyle}`,
												children: opt.key
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm",
												children: opt.label
											})]
										}),
										isCurrentCardRevealed && isCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1 text-xs font-mono font-bold text-[#15803D]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Correct" })]
										}),
										isCurrentCardRevealed && isPicked && !isCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1 text-xs font-mono font-bold text-[#DC2626]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Your Choice" })]
										}),
										!isCurrentCardRevealed && isPicked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-mono font-bold text-[#1D4ED8]",
											children: "Selected"
										})
									]
								}, opt.key);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#E5E3DC]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]",
										children: "TOPIC"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-bold text-[#111827] mt-0.5",
										children: metadataNames.domainName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs font-mono text-[#1D4ED8]",
										children: [
											metadataNames.chapterName,
											" [",
											ledger.chapterCode,
											"]"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]",
										children: "EXAM INFO"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-bold text-[#111827] mt-0.5",
										children: "Practice"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs font-mono text-[#6B7280]",
										children: ["Path: ", activeItem?.pathLabel]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]",
										children: "SUBTOPIC"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-bold text-[#111827] mt-0.5",
										children: metadataNames.subtopicName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs font-mono text-[#15803D]",
										children: ["Concept: ", metadataNames.conceptName]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `p-3 rounded-lg border ${isCurrentCardRevealed ? activeScoring.totalMark > 0 ? "bg-[#F0FDF4] border-[#BBF7D0]" : "bg-[#FEF2F2] border-[#FECACA]" : "bg-[#F9F8F4] border-[#DFDDD4]"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[10px] font-mono uppercase tracking-wider",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-[#4B5563]",
										children: "MARK SCORING"
									}), isCurrentCardRevealed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[#111827]",
										children: [
											"Time: ",
											Math.max(1, activeElapsedSeconds),
											"s"
										]
									})]
								}), isCurrentCardRevealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-lg font-mono font-extrabold mt-0.5 ${activeScoring.totalMark > 0 ? "text-[#15803D]" : "text-[#DC2626]"}`,
									children: activeScoring.totalMark > 0 ? `+${activeScoring.totalMark.toFixed(1)} Pts` : `${activeScoring.totalMark.toFixed(1)} Pts`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] font-mono text-[#4B5563]",
									children: [
										"Acc: ",
										activeScoring.accMark > 0 ? "+1.0" : activeScoring.accMark.toFixed(1),
										" | Speed Bonus: +",
										activeScoring.timeMark.toFixed(1)
									]
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-mono text-[#6B7280] mt-1.5",
									children: executionModality === "shallow" ? "Click an option to preview marks" : "Evaluated on Submit Test at last card"
								})]
							})
						]
					}),
					executionModality === "full" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3 font-mono ${isTestSubmitted ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]" : isLastCard ? "bg-[#EFF6FF] border-[#1D4ED8] text-[#111827]" : "bg-[#F9F8F4] border-[#DFDDD4] text-[#4B5563]"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs",
							children: isTestSubmitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 text-[#15803D]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Test Submitted! All ",
									totalCards,
									" question attempts & timers have been recorded into marks.tex and updated in Tracker Page 1."
								] })]
							}) : isLastCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-[#1D4ED8]",
									children: [
										"Last Question Card (",
										totalCards,
										" of ",
										totalCards,
										"):"
									]
								}),
								" ",
								"Click ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Submit Test" }),
								" to reveal all answers, explanations, and record your marks into Tracker Page 1."
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								"Answered",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
									Object.keys(pickedOptions).filter((k) => Boolean(pickedOptions[k])).length,
									" ",
									"/ ",
									totalCards
								] }),
								" ",
								"cards · Navigate to the last card (",
								totalCards,
								" of ",
								totalCards,
								") using",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Next →" }),
								" to submit test."
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [!isTestSubmitted && isLastCard && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleSubmitFullTest,
								className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Submit Test (",
									totalCards,
									" Qs)"
								] })]
							}), isTestSubmitted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onOpenTestAnalysis,
								className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Open Test Analysis (Attempts & Breakdown)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onGoToTrackerPageOne,
								className: "px-3.5 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Tracker Page 1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })]
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-[#DFDDD4] rounded-xl overflow-hidden bg-[#F9F8F4]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-3 bg-white border-b border-[#DFDDD4] flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-bold text-[#111827]",
										children: "Explanations"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "px-2 py-0.5 text-[11px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded",
										children: ["Question ID (Step Chain): ", structuralQuestionId]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-mono text-[#6B7280]",
										children: [
											"(Distinct from Unique ID ",
											activeQid,
											")"
										]
									})
								]
							}), isCurrentCardRevealed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleAddExplanationStep,
								className: "px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+ Add Step" })]
							})]
						}), !isCurrentCardRevealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 text-center space-y-1.5 font-mono",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 text-xs font-bold text-[#4B5563]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-4 h-4 text-[#D97706]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: executionModality === "shallow" ? "Casual Mode: Click any option above to reveal Step-by-Step Explanations & Step-IDs" : `Test Mode: Explanations & Step-IDs unlock after clicking Submit Test on Question ${totalCards} of ${totalCards}` })]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 space-y-3",
							children: activeSteps.map((step, sIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white border border-[#DFDDD4] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "px-2.5 py-1 bg-[#F5F4EF] border border-[#DFDDD4] rounded font-mono text-xs font-bold text-[#111827] shrink-0",
										children: ["Step - ", sIdx + 1]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: step.text,
										onChange: (e) => handleUpdateStepText(sIdx, e.target.value),
										className: "w-full px-2.5 py-1 text-sm bg-transparent border-b border-dashed border-[#D1CFC7] focus:outline-none focus:border-[#1D4ED8] text-[#111827]",
										placeholder: `Write Step - ${sIdx + 1} explanation...`
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 shrink-0 font-mono text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[#6B7280] font-bold",
											children: "— Step-ID:"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: step.stepId,
											onChange: (e) => handleUpdateStepId(sIdx, e.target.value),
											className: "px-2.5 py-1 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded font-bold focus:outline-none focus:border-[#15803D] cursor-pointer",
											children: availableStepIdOptions.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: code,
												children: code
											}, code))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: step.stepId,
											onChange: (e) => handleUpdateStepId(sIdx, e.target.value.toUpperCase()),
											className: "w-16 px-2 py-1 text-center font-bold bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]",
											title: "Custom Step-ID (e.g. T1, T2)"
										}),
										activeSteps.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => handleDeleteExplanationStep(sIdx),
											className: "p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded cursor-pointer",
											title: "Delete step",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5" })
										})
									]
								})]
							}, `${activeQid}-step-${sIdx}`))
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs font-mono",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onBackToQuestionIndex,
				className: "px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back to Question Index" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: currentIndex === 0,
						onClick: () => setCurrentIndex((prev) => Math.max(0, prev - 1)),
						className: "px-3 py-1.5 bg-[#F9F8F4] hover:bg-[#EFECE6] disabled:opacity-40 text-[#374151] border border-[#DFDDD4] rounded-md text-xs font-bold cursor-pointer disabled:cursor-not-allowed",
						children: ["← Card ", Math.max(1, currentIndex)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: isLastCard,
						onClick: () => setCurrentIndex((prev) => Math.min(totalCards - 1, prev + 1)),
						className: "px-3 py-1.5 bg-[#F9F8F4] hover:bg-[#EFECE6] disabled:opacity-40 text-[#374151] border border-[#DFDDD4] rounded-md text-xs font-bold cursor-pointer disabled:cursor-not-allowed",
						children: [
							"Card ",
							Math.min(totalCards, currentIndex + 2),
							" →"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onOpenTestAnalysis,
						className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Proceed to Test Analysis (Sub-page)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })]
					})
				]
			})]
		})]
	});
};
// src/components/TrackerTestAnalysis.tsx
function evaluateAttemptTuple(tuple, fastLimit, mediumLimit, slowLimit) {
	if (!tuple) return {
		exists: false,
		TM: 0,
		A: 0,
		T: 0,
		seconds: 0,
		status: "NA"
	};
	const [status, seconds] = tuple;
	if (status === "W") return {
		exists: true,
		TM: -.5,
		A: -.5,
		T: 0,
		seconds,
		status: "W"
	};
	if (status === "S") return {
		exists: true,
		TM: -.2,
		A: -.2,
		T: 0,
		seconds,
		status: "S"
	};
	let T = 0;
	if (seconds <= fastLimit) T = 2;
	else if (seconds <= mediumLimit) T = 1;
	else if (seconds <= slowLimit) T = .5;
	const A = 1;
	return {
		exists: true,
		TM: Number((A + T).toFixed(2)),
		A,
		T,
		seconds,
		status: "C"
	};
}
function fmtNum(n, maxDecimals = 2) {
	if (Number.isInteger(n)) return n.toString();
	return Number(n.toFixed(maxDecimals)).toString();
}
var TrackerTestAnalysis = ({ ledger, testSessions, activeTestSessionId, onSelectTestSession, onBackToQuestionCards, onGoToTrackerPageOne, domains, chapters, subtopics, concepts, microConcepts, stepsByQid }) => {
	const chapterSessions = (0, import_react.useMemo)(() => {
		const matching = testSessions.filter((s) => s.chapterCode === ledger.chapterCode);
		return matching.length > 0 ? matching : testSessions;
	}, [testSessions, ledger.chapterCode]);
	const currentSession = (0, import_react.useMemo)(() => chapterSessions.find((s) => s.id === activeTestSessionId) || chapterSessions[chapterSessions.length - 1] || null, [chapterSessions, activeTestSessionId]);
	const scannedTree = (0, import_react.useMemo)(() => scanChapterStorageAndMarks(ledger.chapterCode, ledger, domains, chapters, subtopics, concepts, microConcepts), [
		ledger,
		domains,
		chapters,
		subtopics,
		concepts,
		microConcepts
	]);
	const [speedMode, setSpeedMode] = (0, import_react.useState)("An");
	const [selectedSubtopicFilter, setSelectedSubtopicFilter] = (0, import_react.useState)("ALL");
	const [selectedVariantFilter, setSelectedVariantFilter] = (0, import_react.useState)("ALL");
	const [sortHighestFirst, setSortHighestFirst] = (0, import_react.useState)(true);
	const subtopicFilterOptions = (0, import_react.useMemo)(() => {
		return scannedTree.subtopics.map((st, idx) => ({
			key: st.subtopicId,
			shortLabel: `S${idx + 1}`,
			fullName: st.subtopicName,
			code: st.subtopicCode
		}));
	}, [scannedTree]);
	const variantFilterOptions = (0, import_react.useMemo)(() => {
		const seen = /* @__PURE__ */ new Set();
		const list = [];
		scannedTree.subtopics.forEach((st) => {
			st.concepts.forEach((con) => {
				if (!seen.has(con.conceptCode)) {
					seen.add(con.conceptCode);
					list.push({
						code: con.conceptCode,
						name: con.conceptName
					});
				}
			});
		});
		return list;
	}, [scannedTree]);
	const testQuestions = (0, import_react.useMemo)(() => {
		if (!currentSession || currentSession.questionUniqueIds.length === 0) return scannedTree.allQuestions;
		const idSet = new Set(currentSession.questionUniqueIds);
		const filtered = scannedTree.allQuestions.filter((q) => idSet.has(q.uniqueId));
		return filtered.length > 0 ? filtered : scannedTree.allQuestions;
	}, [currentSession, scannedTree]);
	const enrichedRows = (0, import_react.useMemo)(() => {
		const { fastLimit, mediumLimit, slowLimit } = ledger.timing;
		return testQuestions.map((q) => {
			const parentSt = scannedTree.subtopics.find((s) => s.subtopicId === q.subtopicId);
			const parentCon = parentSt?.concepts.find((c) => c.conceptId === q.conceptId);
			const attemptBreakdowns = q.attempts.map((tuple) => evaluateAttemptTuple(tuple, fastLimit, mediumLimit, slowLimit));
			const a1 = attemptBreakdowns[0] || evaluateAttemptTuple(void 0, fastLimit, mediumLimit, slowLimit);
			const an = attemptBreakdowns[attemptBreakdowns.length - 1] || evaluateAttemptTuple(void 0, fastLimit, mediumLimit, slowLimit);
			let activeTM = an.TM;
			let activeA = an.A;
			let activeT = an.T;
			let activeSeconds = an.seconds;
			let activeStatus = an.status;
			if (speedMode === "A1") {
				activeTM = a1.TM;
				activeA = a1.A;
				activeT = a1.T;
				activeSeconds = a1.seconds;
				activeStatus = a1.status;
			} else if (speedMode === "Avg" && attemptBreakdowns.length > 0) {
				const sumTM = attemptBreakdowns.reduce((acc, x) => acc + x.TM, 0);
				const sumA = attemptBreakdowns.reduce((acc, x) => acc + x.A, 0);
				const sumT = attemptBreakdowns.reduce((acc, x) => acc + x.T, 0);
				const sumSec = attemptBreakdowns.reduce((acc, x) => acc + x.seconds, 0);
				const count = attemptBreakdowns.length;
				activeTM = Number((sumTM / count).toFixed(2));
				activeA = Number((sumA / count).toFixed(2));
				activeT = Number((sumT / count).toFixed(2));
				activeSeconds = Math.round(sumSec / count);
			}
			const stepChainId = getStructuralQuestionIdFromSteps(stepsByQid[q.uniqueId] || getQuestionExplanationSteps(q.uniqueId));
			return {
				question: q,
				subtopicName: parentSt ? parentSt.subtopicName : q.subtopicShortCode,
				variantLabel: parentCon ? `${parentCon.conceptName} (${parentCon.conceptCode})` : q.conceptShortCode,
				stepChainId,
				attemptBreakdowns,
				activeTM,
				activeA,
				activeT,
				activeSeconds,
				activeStatus
			};
		});
	}, [
		testQuestions,
		scannedTree,
		ledger.timing,
		speedMode,
		stepsByQid
	]);
	const displayedRows = (0, import_react.useMemo)(() => {
		const filtered = enrichedRows.filter((row) => {
			if (selectedSubtopicFilter !== "ALL" && row.question.subtopicId !== selectedSubtopicFilter) return false;
			if (selectedVariantFilter !== "ALL" && row.question.conceptShortCode !== selectedVariantFilter) return false;
			return true;
		});
		filtered.sort((a, b) => {
			if (sortHighestFirst) return b.activeTM - a.activeTM;
			return a.activeTM - b.activeTM;
		});
		return filtered;
	}, [
		enrichedRows,
		selectedSubtopicFilter,
		selectedVariantFilter,
		sortHighestFirst
	]);
	const maxAttemptsCount = (0, import_react.useMemo)(() => {
		let max = 2;
		displayedRows.forEach((r) => {
			if (r.attemptBreakdowns.length > max) max = r.attemptBreakdowns.length;
		});
		return max;
	}, [displayedRows]);
	const topSummary = (0, import_react.useMemo)(() => {
		const { fastLimit, mediumLimit, slowLimit } = ledger.timing;
		const totalItems = displayedRows.length;
		const maxMarks = totalItems * 3;
		const maxAccuracyMarks = totalItems * 1;
		const maxTimeMarks = totalItems * 2;
		let totalTM = 0;
		let totalA = 0;
		let totalT = 0;
		let fastCount = 0;
		let slowMedCount = 0;
		let ultraSlowCount = 0;
		displayedRows.forEach((row) => {
			totalTM += row.activeTM;
			totalA += row.activeA;
			totalT += row.activeT;
			if (row.activeStatus === "C") {
				if (row.activeSeconds <= fastLimit) fastCount += 1;
				else if (row.activeSeconds <= mediumLimit) slowMedCount += 1;
				else if (row.activeSeconds <= slowLimit) ultraSlowCount += 1;
			}
		});
		totalTM = Number(totalTM.toFixed(2));
		totalA = Number(totalA.toFixed(2));
		totalT = Number(totalT.toFixed(2));
		const marksPct = maxMarks > 0 ? totalTM / maxMarks * 100 : 0;
		const accPct = maxAccuracyMarks > 0 ? totalA / maxAccuracyMarks * 100 : 0;
		const timePct = maxTimeMarks > 0 ? totalT / maxTimeMarks * 100 : 0;
		return {
			totalItems,
			maxMarks,
			maxAccuracyMarks,
			maxTimeMarks,
			totalTM,
			totalA,
			totalT,
			marksPct,
			accPct,
			timePct,
			fastCount,
			fastMarks: fastCount * 2,
			slowMedCount,
			slowMedMarks: slowMedCount * 1,
			ultraSlowCount,
			ultraSlowMarks: Number((ultraSlowCount * .5).toFixed(2))
		};
	}, [displayedRows, ledger.timing]);
	const testMicroDiagnostics = (0, import_react.useMemo)(() => computeMicroConceptDiagnostics(displayedRows.map((r) => r.question), microConcepts, scannedTree.chapterId, stepsByQid, speedMode === "A1" ? "first" : "latest"), [
		displayedRows,
		microConcepts,
		scannedTree.chapterId,
		stepsByQid,
		speedMode
	]);
	const weakestTestStep = (0, import_react.useMemo)(() => {
		const attempted = testMicroDiagnostics.filter((r) => r.attemptedQuestionsCount > 0);
		if (attempted.length === 0) return null;
		return [...attempted].sort((a, b) => a.rawAccuracyPct - b.rawAccuracyPct || b.wrongCount - a.wrongCount)[0];
	}, [testMicroDiagnostics]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full bg-[#F5F4EF] text-[#111827] space-y-3 font-mono select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-xl shadow-2xs overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-[#F9F8F4] border-b border-[#DFDDD4] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-xl sm:text-2xl font-sans font-extrabold tracking-tight text-[#111827]",
								children: "Test Analysis —"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: currentSession?.id || "",
								onChange: (e) => onSelectTestSession(e.target.value),
								className: "px-3 py-1.5 text-sm font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-md focus:outline-none focus:border-[#1D4ED8] cursor-pointer",
								children: chapterSessions.map((sess) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: sess.id,
									children: [
										sess.label,
										" (",
										sess.questionUniqueIds.length,
										" Qs)"
									]
								}, sess.id))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs font-mono text-[#6B7280]",
							children: [
								"Active Topic:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-[#111827]",
									children: [
										ledger.chapterName,
										" [",
										ledger.chapterCode,
										"]"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#DFDDD4] border-b border-[#DFDDD4] bg-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 text-center space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#6B7280]",
										children: "MARKS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm sm:text-base font-extrabold text-[#111827]",
										children: [
											fmtNum(topSummary.totalTM),
											"/",
											topSummary.maxMarks,
											" =",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[#1D4ED8]",
												children: [topSummary.marksPct.toFixed(2), "%"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-sans text-[#6B7280]",
										children: "Total Score Index"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 text-center space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#6B7280]",
										children: "ACCURACY"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm sm:text-base font-extrabold text-[#15803D]",
										children: [
											fmtNum(topSummary.totalA),
											"/",
											topSummary.maxAccuracyMarks,
											" =",
											" ",
											topSummary.accPct.toFixed(0),
											"%"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-sans text-[#6B7280]",
										children: "Valid / Total Items"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 text-center space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#6B7280]",
										children: "TIME MARKS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm sm:text-base font-extrabold text-[#111827]",
										children: [
											"= ",
											fmtNum(topSummary.totalT),
											"/",
											topSummary.maxTimeMarks,
											" =",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[#1D4ED8]",
												children: [topSummary.timePct.toFixed(0), "%"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-sans text-[#6B7280]",
										children: "Temporal Factor"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 text-center space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#15803D]",
										children: "FAST TIME MARKS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm sm:text-base font-extrabold text-[#15803D]",
										children: [
											topSummary.fastCount,
											"×2 = ",
											topSummary.fastMarks,
											" marks"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] font-sans text-[#6B7280]",
										children: [
											"< ",
											ledger.timing.fastLimit,
											"s threshold"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 text-center space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#6B7280]",
										children: "SLOW TIME MARKS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm sm:text-base font-extrabold text-[#111827]",
										children: [
											topSummary.slowMedCount,
											"×1 = ",
											topSummary.slowMedMarks,
											" marks"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] font-sans text-[#6B7280]",
										children: [
											ledger.timing.fastLimit,
											"s - ",
											ledger.timing.mediumLimit,
											"s window"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 text-center space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider text-[#6B7280]",
										children: "ULTRA SLOW MARKS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm sm:text-base font-extrabold text-[#111827]",
										children: [
											topSummary.ultraSlowCount,
											"×0.5 = ",
											fmtNum(topSummary.ultraSlowMarks),
											" marks"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px] font-sans text-[#6B7280]",
										children: [
											ledger.timing.mediumLimit,
											"s - ",
											ledger.timing.slowLimit,
											"s window"
										]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-[#F9F8F4] border-b border-[#DFDDD4] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 font-bold text-[#1D4ED8]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "In-Depth Analysis" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#4B5563] font-bold",
										children: "Speed = A1/An/Avg"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "inline-flex rounded border border-[#DFDDD4] bg-white p-0.5",
										children: [
											"A1",
											"An",
											"Avg"
										].map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSpeedMode(mode),
											className: `px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${speedMode === mode ? "bg-[#15803D] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
											children: mode
										}, mode))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[#4B5563] font-bold",
										children: [
											"S = ",
											subtopicFilterOptions.map((s) => s.shortLabel).join("/"),
											"/All"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex rounded border border-[#DFDDD4] bg-white p-0.5",
										children: [subtopicFilterOptions.map((stOpt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSelectedSubtopicFilter(stOpt.key),
											className: `px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${selectedSubtopicFilter === stOpt.key ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
											title: stOpt.fullName,
											children: stOpt.shortLabel
										}, stOpt.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSelectedSubtopicFilter("ALL"),
											className: `px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${selectedSubtopicFilter === "ALL" ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
											children: "All"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[#4B5563] font-bold",
										children: [
											"V = ",
											variantFilterOptions.map((v) => v.code).join("/"),
											"/All"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "inline-flex rounded border border-[#DFDDD4] bg-white p-0.5",
										children: [variantFilterOptions.map((vOpt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSelectedVariantFilter(vOpt.code),
											className: `px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${selectedVariantFilter === vOpt.code ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
											children: vOpt.code
										}, vOpt.code)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSelectedVariantFilter("ALL"),
											className: `px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${selectedVariantFilter === "ALL" ? "bg-[#1D4ED8] text-white" : "text-[#4B5563] hover:text-[#111827]"}`,
											children: "All"
										})]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#4B5563] font-bold",
								children: "SELECTION ="
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSortHighestFirst((prev) => !prev),
								className: "px-2.5 py-1 rounded bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[11px] font-bold transition-colors cursor-pointer",
								children: sortHighestFirst ? "Highest marks to lowest marks" : "Lowest marks to highest marks"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase tracking-wider text-[#6B7280]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4 w-16",
										children: "Q.NO"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "UNIQUE ID"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "STEP-ID CHAIN"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "SUBTOPIC"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-3 px-4",
										children: "VARIANT"
									}),
									Array.from({ length: maxAttemptsCount }).map((_, aIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										className: "py-3 px-4 text-center",
										children: [
											"ATTEMPT ",
											aIdx + 1,
											" ( TM , A , T )"
										]
									}, `attempt-col-${aIdx}`))
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "divide-y divide-[#F0EFEA]",
								children: [displayedRows.map((row, rIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-[#F9F8F4]/70",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3 px-4 font-bold text-[#6B7280]",
											children: [rIdx + 1, ")"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 font-bold text-[#1D4ED8]",
											children: row.question.uniqueId
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-extrabold",
												children: row.stepChainId
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 font-sans font-semibold text-[#111827]",
											children: row.subtopicName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-4 font-sans text-[#374151]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#16A34A]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.variantLabel })]
											})
										}),
										Array.from({ length: maxAttemptsCount }).map((_, aIdx) => {
											const attempt = row.attemptBreakdowns[aIdx];
											if (!attempt || !attempt.exists) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3 px-4 text-center font-bold text-[#9CA3AF]",
												children: "(0, 0, 0)"
											}, `${row.question.uniqueId}-att-${aIdx}`);
											const colorClass = attempt.TM >= 2.5 ? "text-[#15803D]" : attempt.TM > 0 ? "text-[#1D4ED8]" : "text-[#DC2626]";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: `py-3 px-4 text-center font-extrabold ${colorClass}`,
												children: [
													"(",
													fmtNum(attempt.TM),
													", ",
													fmtNum(attempt.A),
													", ",
													fmtNum(attempt.T),
													")"
												]
											}, `${row.question.uniqueId}-att-${aIdx}`);
										})
									]
								}, row.question.uniqueId)), displayedRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5 + maxAttemptsCount,
									className: "py-8 text-center text-xs text-[#6B7280]",
									children: "No questions match the selected Subtopic (S) or Variant (V) filter."
								}) })]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-xl p-4 space-y-3.5 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-xs font-bold uppercase text-[#111827]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#1D4ED8]" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "STEP-ID / MICRO CONCEPT (T1, T2, T3) ACCURACY & WEAKNESS BREAKDOWN" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "px-2 py-0.5 text-[10px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold",
								children: ["EVALUATED ATTEMPT: ", speedMode === "A1" ? "A1 (FIRST)" : "An (LATEST)"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-sans text-[#6B7280] mt-0.5",
						children: "Aggregates how many test questions involve each Step-ID (Micro Concept), the exact Correct : Wrong ratio, and accuracy percentage up to the micro-ID level to pinpoint your weakest solving step."
					})] }), weakestTestStep && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `px-3 py-1.5 rounded-md border text-xs font-bold flex items-center gap-2 ${weakestTestStep.rawAccuracyPct < 60 || weakestTestStep.wrongCount > 0 ? "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]" : "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Weakest Step:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "underline",
									children: weakestTestStep.stepCode
								}),
								" (",
								weakestTestStep.stepName,
								")"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: weakestTestStep.correctToWrongRatioLabel }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [weakestTestStep.rawAccuracyPct.toFixed(2), "% Accuracy"] })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto border border-[#DFDDD4] rounded-lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase tracking-wider text-[#6B7280]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3",
									children: "STEP-ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3",
									children: "MICRO CONCEPT NAME"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3",
									children: "INVOLVED UNIQUE QUESTION IDs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3 text-center",
									children: "INVOLVED Qs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3 text-center",
									children: "CORRECT : WRONG RATIO"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3 text-right",
									children: "STEP ACCURACY %"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3 text-right",
									children: "NET VALUATION %"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2.5 px-3 text-center",
									children: "STEP STATUS"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-[#F0EFEA]",
							children: testMicroDiagnostics.map((row) => {
								const statusBadge = row.diagnosticStatus === "WEAK STEP" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" : row.diagnosticStatus === "MODERATE" ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" : row.diagnosticStatus === "STRONG" ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : "bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-[#F9F8F4]/70",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-3 font-extrabold text-[#1D4ED8]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE]",
												children: row.stepCode
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-3 font-sans font-bold text-[#111827]",
											children: row.stepName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-1",
												children: row.involvedQuestions.map((iq) => {
													const chipStyle = iq.status === "C" ? "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]" : iq.status === "W" ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" : iq.status === "S" ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" : "bg-[#F9F8F4] text-[#6B7280] border-[#DFDDD4]";
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: `px-2 py-0.5 rounded border text-[10px] font-bold ${chipStyle}`,
														children: [
															iq.uniqueId,
															" (",
															iq.status,
															")"
														]
													}, `${row.stepCode}-${iq.uniqueId}`);
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3 px-3 text-center font-bold text-[#111827]",
											children: [
												row.involvedQuestionsCount,
												" Qs (",
												row.attemptedQuestionsCount,
												" Att)"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3 px-3 text-center font-extrabold text-[#111827]",
											children: [row.correctToWrongRatioLabel, row.skippedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] text-[#D97706] ml-1",
												children: [
													"(",
													row.skippedCount,
													"S)"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-3 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `font-extrabold text-sm ${row.attemptedQuestionsCount === 0 ? "text-[#6B7280]" : row.rawAccuracyPct < 60 ? "text-[#DC2626]" : row.rawAccuracyPct < 80 ? "text-[#D97706]" : "text-[#15803D]"}`,
												children: [row.rawAccuracyPct.toFixed(2), "%"]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3 px-3 text-right font-bold text-[#1D4ED8]",
											children: [row.netAccuracyValuationPct.toFixed(2), "%"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 px-3 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold uppercase ${statusBadge}`,
												children: row.diagnosticStatus
											})
										})
									]
								}, row.stepCode);
							})
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBackToQuestionCards,
					className: "px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← Back to Question Cards" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onGoToTrackerPageOne,
					className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Updated Marks in Chapter Tracker (Page 1)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })]
				})]
			})
		]
	});
};
// src/components/TrackerPageOne.tsx
function createSeededChapterLedger(chapterCode, chapterName, fastCorrectedCount, medCorrectedCount, notAskedCount, fastLimit = 45, mediumLimit = 75, slowLimit = 110) {
	const qMap = {};
	let qIdx = 1;
	for (let i = 0; i < fastCorrectedCount; i++) qMap[`${chapterCode}-C1-Qn${qIdx++}`] = [[
		"C",
		Math.max(10, fastLimit - 10),
		1,
		2,
		"A"
	]];
	for (let i = 0; i < medCorrectedCount; i++) qMap[`${chapterCode}-C1-Qn${qIdx++}`] = [[
		"C",
		fastLimit + 10,
		1,
		1,
		"B"
	]];
	for (let i = 0; i < notAskedCount; i++) qMap[`${chapterCode}-C1-Qn${qIdx++}`] = [];
	return {
		chapterCode,
		chapterName,
		evaluationDate: "19/11/2026",
		timing: {
			fastLimit,
			mediumLimit,
			slowLimit,
			locked: true
		},
		concepts: { C1: qMap }
	};
}
var INITIAL_LEDGERS = {
	TD: {
		chapterCode: "TD",
		chapterName: "Time and Distance",
		evaluationDate: "28/09/2026",
		timing: {
			fastLimit: 60,
			mediumLimit: 90,
			slowLimit: 120,
			locked: true
		},
		concepts: {
			"BWR-V1": {
				"QA-TD-BWR-V1-1": [[
					"C",
					52,
					1,
					2,
					"A"
				], [
					"C",
					41,
					1,
					2,
					"A"
				]],
				"QA-TD-BWR-V1-2": [[
					"C",
					72,
					1,
					1,
					"B"
				], [
					"W",
					75,
					-.5,
					0,
					"D"
				]]
			},
			"BWR-V2": { "QA-TD-BWR-V2-1": [[
				"C",
				54,
				1,
				2,
				"B"
			], [
				"C",
				48,
				1,
				2,
				"B"
			]] },
			"RST-V1": {
				"QA-TD-RST-V1-1": [[
					"C",
					50,
					1,
					2,
					"B"
				], [
					"C",
					74,
					1,
					1,
					"C"
				]],
				"QA-TD-RST-V1-2": [[
					"C",
					78,
					1,
					1,
					"B"
				], [
					"S",
					36,
					-.2,
					0,
					"-"
				]],
				"QA-TD-RST-V1-3": []
			}
		}
	},
	TRG: {
		chapterCode: "TRG",
		chapterName: "Trigonometry",
		evaluationDate: "19/11/2026",
		timing: {
			fastLimit: 45,
			mediumLimit: 75,
			slowLimit: 110,
			locked: true
		},
		concepts: { "BS-FR": {
			"QA-TRG-BS-FR-1": [[
				"C",
				28,
				1,
				2,
				"A"
			], [
				"C",
				22,
				1,
				2,
				"A"
			]],
			"QA-TRG-BS-FR-2": [[
				"C",
				38,
				1,
				2,
				"B"
			], [
				"C",
				31,
				1,
				2,
				"B"
			]],
			"QA-TRG-BS-FR-3": [[
				"C",
				62,
				1,
				1,
				"B"
			], [
				"C",
				41,
				1,
				2,
				"B"
			]],
			"QA-TRG-BS-FR-4": [[
				"W",
				68,
				-.5,
				0,
				"D"
			], [
				"C",
				44,
				1,
				2,
				"A"
			]],
			"QA-TRG-BS-FR-5": [[
				"C",
				30,
				1,
				2,
				"C"
			], [
				"C",
				25,
				1,
				2,
				"C"
			]],
			"QA-TRG-BS-FR-6": [[
				"C",
				35,
				1,
				2,
				"B"
			], [
				"C",
				29,
				1,
				2,
				"B"
			]],
			"QA-TRG-BS-FR-7": [[
				"C",
				33,
				1,
				2,
				"C"
			], [
				"C",
				27,
				1,
				2,
				"C"
			]],
			"QA-TRG-BS-FR-8": [[
				"C",
				42,
				1,
				2,
				"A"
			], [
				"C",
				36,
				1,
				2,
				"A"
			]],
			"QA-TRG-BS-FR-9": [[
				"C",
				58,
				1,
				1,
				"B"
			], [
				"C",
				43,
				1,
				2,
				"B"
			]],
			"QA-TRG-BS-FR-10": [[
				"C",
				64,
				1,
				1,
				"B"
			], [
				"C",
				40,
				1,
				2,
				"B"
			]],
			"QA-TRG-BS-FR-11": [[
				"C",
				34,
				1,
				2,
				"B"
			], [
				"C",
				26,
				1,
				2,
				"B"
			]],
			"QA-TRG-BS-FR-12": [[
				"W",
				74,
				-.5,
				0,
				"A"
			], [
				"C",
				52,
				1,
				1,
				"B"
			]],
			"QA-TRG-BS-FR-13": [[
				"C",
				82,
				1,
				.5,
				"A"
			], [
				"C",
				65,
				1,
				1,
				"A"
			]],
			"QA-TRG-BS-FR-14": [[
				"W",
				85,
				-.5,
				0,
				"A"
			], [
				"W",
				70,
				-.5,
				0,
				"C"
			]],
			"QA-TRG-BS-FR-15": [[
				"C",
				71,
				1,
				1,
				"A"
			], [
				"C",
				55,
				1,
				1,
				"A"
			]],
			"QA-TRG-BS-FR-16": [[
				"C",
				39,
				1,
				2,
				"C"
			], [
				"C",
				32,
				1,
				2,
				"C"
			]],
			"QA-TRG-BS-FR-17": [[
				"W",
				78,
				-.5,
				0,
				"B"
			], [
				"W",
				66,
				-.5,
				0,
				"B"
			]],
			"QA-TRG-BS-FR-18": [[
				"C",
				69,
				1,
				1,
				"A"
			], [
				"W",
				72,
				-.5,
				0,
				"B"
			]],
			"QA-TRG-BS-FR-19": [[
				"C",
				60,
				1,
				1,
				"A"
			], [
				"C",
				44,
				1,
				2,
				"A"
			]],
			"QA-TRG-BS-FR-20": [[
				"S",
				40,
				-.2,
				0,
				"-"
			], [
				"W",
				76,
				-.5,
				0,
				"C"
			]],
			"QA-TRG-BS-FR-21": [[
				"C",
				73,
				1,
				1,
				"A"
			], [
				"S",
				35,
				-.2,
				0,
				"-"
			]],
			"QA-TRG-BS-FR-22": [],
			"QA-TRG-BS-FR-23": []
		} }
	},
	PL: createSeededChapterLedger("PL", "Profit and Loss", 12, 0, 8, 45, 75, 110),
	ALG: createSeededChapterLedger("ALG", "Algebra", 10, 0, 10, 45, 75, 110),
	GEO: createSeededChapterLedger("GEO", "Geometry", 6, 0, 14, 50, 80, 120),
	TW: createSeededChapterLedger("TW", "Time and Work", 5, 0, 5, 45, 75, 110),
	PN: createSeededChapterLedger("PN", "Pronouns", 17, 0, 3, 25, 50, 80),
	VB: createSeededChapterLedger("VB", "Verbs & Tenses", 16, 0, 4, 25, 50, 80),
	ADJ: createSeededChapterLedger("ADJ", "Adjectives", 4, 0, 16, 25, 50, 80),
	VOC: createSeededChapterLedger("VOC", "Vocabulary & Cloze", 12, 0, 8, 20, 40, 60),
	SER: createSeededChapterLedger("SER", "Number & Letter Series", 16, 0, 4, 35, 60, 90),
	ANA: createSeededChapterLedger("ANA", "Analogy & Classification", 14, 0, 6, 30, 55, 85),
	COD: createSeededChapterLedger("COD", "Coding-Decoding", 12, 0, 8, 35, 60, 90),
	POL: createSeededChapterLedger("POL", "Indian Polity", 10, 0, 10, 20, 40, 60),
	HIS: createSeededChapterLedger("HIS", "History & Culture", 8, 0, 12, 20, 40, 60),
	SCI: createSeededChapterLedger("SCI", "General Science", 7, 0, 13, 20, 40, 60),
	BS: {
		chapterCode: "BS",
		chapterName: "Basics",
		evaluationDate: "16/11/2026",
		timing: {
			fastLimit: 30,
			mediumLimit: 60,
			slowLimit: 90,
			locked: false
		},
		concepts: { UN: {
			"BS-UN-Qn1": [],
			"BS-UN-Qn2": [],
			"BS-UN-Qn3": [],
			"BS-UN-Qn4": [],
			"BS-UN-Qn5": [],
			"BS-UN-Qn6": [],
			"BS-UN-Qn7": [],
			"BS-UN-Qn8": [],
			"BS-UN-Qn9": [],
			"BS-UN-Qn10": [],
			"BS-UN-Qn11": [],
			"BS-UN-Qn12": [],
			"BS-UN-Qn13": []
		} }
	}
};
function computeAttemptMarks(status, seconds, timing) {
	if (status === "W") return {
		accMark: -.5,
		timeMark: 0
	};
	if (status === "S") return {
		accMark: -.2,
		timeMark: 0
	};
	let timeMark = 0;
	if (seconds <= timing.fastLimit) timeMark = 2;
	else if (seconds <= timing.mediumLimit) timeMark = 1;
	else if (seconds <= timing.slowLimit) timeMark = .5;
	else timeMark = 0;
	return {
		accMark: 1,
		timeMark
	};
}
function formatNum(n, maxDecimals = 2) {
	if (Number.isInteger(n)) return n.toString();
	return Number(n.toFixed(maxDecimals)).toString();
}
var INITIAL_TEST_SESSIONS = [
	{
		id: "test-trg-1",
		label: "test id(1) — TRG Basics FR (23 Qs)",
		chapterCode: "TRG",
		questionUniqueIds: Array.from({ length: 23 }, (_, i) => `QA-TRG-BS-FR-${i + 1}`),
		createdAt: "19/11/2026"
	},
	{
		id: "test-trg-2",
		label: "test id(2) — TRG Dual-Angle & Triplets (10 Qs)",
		chapterCode: "TRG",
		questionUniqueIds: [
			"QA-TRG-BS-FR-1",
			"QA-TRG-BS-FR-2",
			"QA-TRG-BS-FR-4",
			"QA-TRG-BS-FR-12",
			"QA-TRG-BS-FR-16",
			"QA-TRG-BS-FR-17",
			"QA-TRG-BS-FR-18",
			"QA-TRG-BS-FR-19",
			"QA-TRG-BS-FR-20",
			"QA-TRG-BS-FR-21"
		],
		createdAt: "19/11/2026"
	},
	{
		id: "test-1",
		label: "test id(1)",
		chapterCode: "TD",
		questionUniqueIds: [
			"QA-TD-BWR-V1-1",
			"QA-TD-BWR-V1-2",
			"QA-TD-BWR-V2-1"
		],
		createdAt: "17/11/2026"
	},
	{
		id: "test-2",
		label: "test id(2)",
		chapterCode: "TD",
		questionUniqueIds: [
			"QA-TD-RST-V1-1",
			"QA-TD-RST-V1-2",
			"QA-TD-RST-V1-3"
		],
		createdAt: "18/11/2026"
	},
	{
		id: "test-3",
		label: "test id(3)",
		chapterCode: "TD",
		questionUniqueIds: [
			"QA-TD-BWR-V1-1",
			"QA-TD-BWR-V1-2",
			"QA-TD-BWR-V2-1",
			"QA-TD-RST-V1-1",
			"QA-TD-RST-V1-2",
			"QA-TD-RST-V1-3"
		],
		createdAt: "19/11/2026"
	}
];
var TrackerPageOne = () => {
	const [ledgers, setLedgers] = (0, import_react.useState)(INITIAL_LEDGERS);
	const [activeChapterKey, setActiveChapterKey] = (0, import_react.useState)("TRG");
	const [activeSectionView, setActiveSectionView] = (0, import_react.useState)("part-1");
	const [launchedCardItems, setLaunchedCardItems] = (0, import_react.useState)([]);
	const [launchedModality, setLaunchedModality] = (0, import_react.useState)("shallow");
	const [testSessions, setTestSessions] = (0, import_react.useState)(INITIAL_TEST_SESSIONS);
	const [activeTestSessionId, setActiveTestSessionId] = (0, import_react.useState)("test-trg-1");
	const [showJsonModal, setShowJsonModal] = (0, import_react.useState)(false);
	const [copiedJson, setCopiedJson] = (0, import_react.useState)(false);
	const [domains, setDomains] = (0, import_react.useState)(INITIAL_DOMAINS);
	const [chapters, setChapters] = (0, import_react.useState)(INITIAL_CHAPTERS);
	const [subtopics, setSubtopics] = (0, import_react.useState)(INITIAL_SUBTOPICS);
	const [concepts, setConcepts] = (0, import_react.useState)(INITIAL_CONCEPTS);
	const [microConcepts, setMicroConcepts] = (0, import_react.useState)(INITIAL_MICRO_CONCEPTS);
	const [stepsByQid, setStepsByQid] = (0, import_react.useState)(DEFAULT_STEPS_BY_UNIQUE_ID);
	const currentLedger = ledgers[activeChapterKey] || ledgers.TD;
	const [fastInput, setFastInput] = (0, import_react.useState)(String(currentLedger.timing.fastLimit));
	const [medInput, setMedInput] = (0, import_react.useState)(String(currentLedger.timing.mediumLimit));
	const [slowInput, setSlowInput] = (0, import_react.useState)(String(currentLedger.timing.slowLimit));
	const [timingError, setTimingError] = (0, import_react.useState)(null);
	const handleSelectChapter = (key) => {
		const target = ledgers[key];
		if (!target) return;
		setActiveChapterKey(key);
		setFastInput(String(target.timing.fastLimit));
		setMedInput(String(target.timing.mediumLimit));
		setSlowInput(String(target.timing.slowLimit));
		setTimingError(null);
	};
	(0, import_react.useEffect)(() => {
		const onTrackerCommand = (event) => {
			const detail = event?.detail || {};
			if (detail.chapterCode) {
				const code = String(detail.chapterCode).toUpperCase();
				if (ledgers[code]) {
					setActiveChapterKey(code);
					setFastInput(String(ledgers[code].timing.fastLimit));
					setMedInput(String(ledgers[code].timing.mediumLimit));
					setSlowInput(String(ledgers[code].timing.slowLimit));
				}
			}
			if (detail.action === "set-view" && detail.view) {
				setActiveSectionView(detail.view);
				return;
			}
			if (detail.action === "launch-scoped-cards") {
				const rawCode = String(detail.rootMid || detail.chapterCode || "TRG").toUpperCase();
				const targetCode = ledgers[rawCode] ? rawCode : rawCode.includes("PRONOUN") ? "PN" : "TRG";
				const targetLedger = ledgers[targetCode] || ledgers.TRG;
				setActiveChapterKey(targetCode);
				setFastInput(String(targetLedger.timing.fastLimit));
				setMedInput(String(targetLedger.timing.mediumLimit));
				setSlowInput(String(targetLedger.timing.slowLimit));
				const tree = scanChapterStorageAndMarks(targetCode, targetLedger, domains, chapters, subtopics, concepts, microConcepts);
				const requestedConcept = String(detail.conceptMid || "").trim().toUpperCase();
				let matchedQuestions = tree.allQuestions;
				let pathLabel = `${targetCode}-ALL`;
				if (requestedConcept) {
					const conceptFiltered = tree.allQuestions.filter((q) => q.conceptId.toUpperCase() === requestedConcept || q.conceptShortCode.toUpperCase() === requestedConcept || requestedConcept.endsWith(`-${q.conceptShortCode.toUpperCase()}`) || requestedConcept === "C1" && q.conceptShortCode.toUpperCase() === "FR");
					if (conceptFiltered.length > 0) {
						matchedQuestions = conceptFiltered;
						pathLabel = `${matchedQuestions[0].subtopicShortCode}-${matchedQuestions[0].conceptShortCode}`;
					}
				} else if (matchedQuestions.length > 0) pathLabel = `${matchedQuestions[0].subtopicShortCode}-${matchedQuestions[0].conceptShortCode}`;
				setLaunchedCardItems(matchedQuestions.map((question) => ({
					question,
					pathLabel: `${question.subtopicShortCode}-${question.conceptShortCode}` || pathLabel
				})));
				setLaunchedModality(detail.mode === "study" ? "study" : "shallow");
				setActiveSectionView("question-cards");
			}
		};
		window.addEventListener("angles:tracker-command", onTrackerCommand);
		return () => window.removeEventListener("angles:tracker-command", onTrackerCommand);
	}, [
		ledgers,
		domains,
		chapters,
		subtopics,
		concepts,
		microConcepts
	]);
	const handleJumpToChapterLedger = (chapterCode) => {
		if (!ledgers[chapterCode]) setLedgers((prev) => ({
			...prev,
			[chapterCode]: createSeededChapterLedger(chapterCode, chapterCode, 0, 0, 10)
		}));
		setActiveChapterKey(chapterCode);
		const target = ledgers[chapterCode];
		if (target) {
			setFastInput(String(target.timing.fastLimit));
			setMedInput(String(target.timing.mediumLimit));
			setSlowInput(String(target.timing.slowLimit));
		}
		setTimingError(null);
		setActiveSectionView("part-1");
	};
	const handleRegisterNewChapterLedger = (chapterCode, chapterName) => {
		setLedgers((prev) => {
			if (prev[chapterCode]) return prev;
			return {
				...prev,
				[chapterCode]: createSeededChapterLedger(chapterCode, chapterName, 0, 0, 10)
			};
		});
	};
	const handleSaveTiming = () => {
		const f = parseInt(fastInput, 10);
		const m = parseInt(medInput, 10);
		const s = parseInt(slowInput, 10);
		if (!Number.isInteger(f) || !Number.isInteger(m) || !Number.isInteger(s) || f <= 0 || !(f < m && m < s)) {
			setTimingError("Require integers: 0 < Fast < Med < Slow");
			return;
		}
		setTimingError(null);
		setLedgers((prev) => ({
			...prev,
			[activeChapterKey]: {
				...prev[activeChapterKey],
				timing: {
					fastLimit: f,
					mediumLimit: m,
					slowLimit: s,
					locked: true
				}
			}
		}));
	};
	const handleUnlockTiming = () => {
		setLedgers((prev) => ({
			...prev,
			[activeChapterKey]: {
				...prev[activeChapterKey],
				timing: {
					...prev[activeChapterKey].timing,
					locked: false
				}
			}
		}));
	};
	const stats = (0, import_react.useMemo)(() => {
		const { timing, concepts } = currentLedger;
		const allQuestions = [];
		Object.entries(concepts).forEach(([conceptMid, qMap]) => {
			Object.entries(qMap).forEach(([qid, history]) => {
				allQuestions.push({
					qid,
					conceptMid,
					history
				});
			});
		});
		const TQ = allQuestions.length;
		let NQC = 0;
		let NQW = 0;
		let NQS = 0;
		let NQNA = 0;
		let NQF = 0;
		let NQM = 0;
		let NQSl = 0;
		let NQOT = 0;
		allQuestions.forEach(({ history }) => {
			if (!history || history.length === 0) {
				NQNA += 1;
				return;
			}
			const [status, seconds] = history[history.length - 1];
			if (status === "C") {
				NQC += 1;
				if (seconds <= timing.fastLimit) NQF += 1;
				else if (seconds <= timing.mediumLimit) NQM += 1;
				else if (seconds <= timing.slowLimit) NQSl += 1;
				else NQOT += 1;
			} else if (status === "W") NQW += 1;
			else if (status === "S") NQS += 1;
		});
		const attemptedCount = NQC + NQW + NQS;
		const MM = TQ * 3;
		const correctMarks = NQC * 1;
		const wrongPenalty = NQW * .5;
		const skipPenalty = NQS * .2;
		const ARMNT = Number((correctMarks - wrongPenalty - skipPenalty).toFixed(2));
		const accuracyDenominator = attemptedCount > 0 ? attemptedCount : TQ;
		const accuracyRatioPct = accuracyDenominator > 0 ? ARMNT / accuracyDenominator * 100 : 0;
		const fastMarks = NQF * 2;
		const medMarks = NQM * 1;
		const slowMarks = NQSl * .5;
		const otMarks = NQOT * 0;
		const NTM = Number((fastMarks + medMarks + slowMarks + otMarks).toFixed(2));
		const timeCapAttempted = attemptedCount * 2;
		const timeCapPool = TQ * 2;
		const timeDenominator = timeCapAttempted > 0 ? timeCapAttempted : timeCapPool;
		const timeRatioPct = timeDenominator > 0 ? NTM / timeDenominator * 100 : 0;
		const LTM = Number((ARMNT + NTM).toFixed(2));
		const AM = Number((MM - LTM).toFixed(2));
		const completionPct = MM > 0 ? LTM / MM * 100 : 0;
		const inv1 = NQC + NQW + NQS + NQNA === TQ;
		const inv2 = NQF + NQM + NQSl + NQOT === NQC;
		const inv3 = NQF + NQM + NQSl + NQOT + NQW + NQS + NQNA === TQ;
		return {
			allQuestions,
			TQ,
			attemptedCount,
			NQC,
			NQW,
			NQS,
			NQNA,
			NQF,
			NQM,
			NQSl,
			NQOT,
			MM,
			correctMarks,
			wrongPenalty,
			skipPenalty,
			ARMNT,
			accuracyDenominator,
			accuracyRatioPct,
			fastMarks,
			medMarks,
			slowMarks,
			otMarks,
			NTM,
			timeDenominator,
			timeRatioPct,
			LTM,
			AM,
			completionPct,
			invariantsPass: inv1 && inv2 && inv3
		};
	}, [currentLedger]);
	const handleSimulateAttempt = (status, seconds, option = "A") => {
		setLedgers((prev) => {
			const target = prev[activeChapterKey];
			const nextConcepts = {};
			Object.entries(target.concepts).forEach(([cMid, qMap]) => {
				nextConcepts[cMid] = {};
				Object.entries(qMap).forEach(([qid, arr]) => {
					nextConcepts[cMid][qid] = [...arr];
				});
			});
			let targetCMid = Object.keys(nextConcepts)[0] || "C1";
			let targetQid = null;
			for (const [cMid, qMap] of Object.entries(nextConcepts)) {
				for (const [qid, arr] of Object.entries(qMap)) if (arr.length === 0) {
					targetCMid = cMid;
					targetQid = qid;
					break;
				}
				if (targetQid) break;
			}
			if (!targetQid) {
				const existingCount = Object.keys(nextConcepts[targetCMid] || {}).length;
				targetQid = `${target.chapterCode}-${targetCMid}-Qn${existingCount + 1}`;
				if (!nextConcepts[targetCMid]) nextConcepts[targetCMid] = {};
				nextConcepts[targetCMid][targetQid] = [];
			}
			const { accMark, timeMark } = computeAttemptMarks(status, seconds, target.timing);
			nextConcepts[targetCMid][targetQid].push([
				status,
				seconds,
				accMark,
				timeMark,
				option
			]);
			return {
				...prev,
				[activeChapterKey]: {
					...target,
					concepts: nextConcepts
				}
			};
		});
	};
	const handleResetSkeleton = () => {
		setLedgers((prev) => {
			const target = prev[activeChapterKey];
			const cleanConcepts = {};
			Object.entries(target.concepts).forEach(([cMid, qMap]) => {
				cleanConcepts[cMid] = {};
				Object.keys(qMap).forEach((qid) => {
					cleanConcepts[cMid][qid] = [];
				});
			});
			return {
				...prev,
				[activeChapterKey]: {
					...target,
					concepts: cleanConcepts
				}
			};
		});
	};
	const handleIngestBatch = (count) => {
		setLedgers((prev) => {
			const target = prev[activeChapterKey];
			const nextConcepts = {};
			Object.entries(target.concepts).forEach(([cMid, qMap]) => {
				nextConcepts[cMid] = { ...qMap };
			});
			const firstMid = Object.keys(nextConcepts)[0] || "C1";
			if (!nextConcepts[firstMid]) nextConcepts[firstMid] = {};
			const startIdx = Object.keys(nextConcepts[firstMid]).length + 1;
			for (let i = 0; i < count; i++) {
				const newQid = `${target.chapterCode}-${firstMid}-Qn${startIdx + i}`;
				nextConcepts[firstMid][newQid] = [];
			}
			return {
				...prev,
				[activeChapterKey]: {
					...target,
					concepts: nextConcepts
				}
			};
		});
	};
	const handleRestoreDemoData = () => {
		setLedgers(INITIAL_LEDGERS);
	};
	const handleCopyJson = () => {
		navigator.clipboard.writeText(JSON.stringify(currentLedger, null, 2));
		setCopiedJson(true);
		setTimeout(() => setCopiedJson(false), 1800);
	};
	const handleSimulateAttemptInScope = (targetUniqueIds, status, seconds, conceptKeyHint = "C1") => {
		setLedgers((prev) => {
			const target = prev[activeChapterKey];
			const nextConcepts = {};
			Object.entries(target.concepts).forEach(([cMid, qMap]) => {
				nextConcepts[cMid] = {};
				Object.entries(qMap).forEach(([qid, arr]) => {
					nextConcepts[cMid][qid] = [...arr];
				});
			});
			const { accMark, timeMark } = computeAttemptMarks(status, seconds, target.timing);
			const idSet = new Set(targetUniqueIds);
			for (const [cMid, qMap] of Object.entries(nextConcepts)) for (const [qid, arr] of Object.entries(qMap)) if (idSet.has(qid) && arr.length === 0) {
				nextConcepts[cMid][qid].push([
					status,
					seconds,
					accMark,
					timeMark,
					"A"
				]);
				return {
					...prev,
					[activeChapterKey]: {
						...target,
						concepts: nextConcepts
					}
				};
			}
			for (const [cMid, qMap] of Object.entries(nextConcepts)) for (const [qid] of Object.entries(qMap)) if (idSet.has(qid)) {
				nextConcepts[cMid][qid].push([
					status,
					seconds,
					accMark,
					timeMark,
					"A"
				]);
				return {
					...prev,
					[activeChapterKey]: {
						...target,
						concepts: nextConcepts
					}
				};
			}
			const fallbackMid = Object.keys(nextConcepts)[0] || conceptKeyHint;
			if (!nextConcepts[fallbackMid]) nextConcepts[fallbackMid] = {};
			const firstQid = Object.keys(nextConcepts[fallbackMid])[0] || targetUniqueIds[0] || `${target.chapterCode}-${fallbackMid}-1`;
			if (!nextConcepts[fallbackMid][firstQid]) nextConcepts[fallbackMid][firstQid] = [];
			nextConcepts[fallbackMid][firstQid].push([
				status,
				seconds,
				accMark,
				timeMark,
				"A"
			]);
			return {
				...prev,
				[activeChapterKey]: {
					...target,
					concepts: nextConcepts
				}
			};
		});
	};
	const handleRecordEvaluatedTest = (evaluations) => {
		setLedgers((prev) => {
			const target = prev[activeChapterKey];
			const nextConcepts = {};
			Object.entries(target.concepts).forEach(([cMid, qMap]) => {
				nextConcepts[cMid] = {};
				Object.entries(qMap).forEach(([qid, arr]) => {
					nextConcepts[cMid][qid] = [...arr];
				});
			});
			evaluations.forEach((ev) => {
				const { accMark, timeMark } = computeAttemptMarks(ev.status, ev.seconds, target.timing);
				let found = false;
				for (const [cMid, qMap] of Object.entries(nextConcepts)) if (qMap[ev.uniqueId]) {
					nextConcepts[cMid][ev.uniqueId].push([
						ev.status,
						ev.seconds,
						accMark,
						timeMark,
						ev.option
					]);
					found = true;
					break;
				}
				if (!found) {
					const cKey = ev.conceptKey || Object.keys(nextConcepts)[0] || "C1";
					if (!nextConcepts[cKey]) nextConcepts[cKey] = {};
					if (!nextConcepts[cKey][ev.uniqueId]) nextConcepts[cKey][ev.uniqueId] = [];
					nextConcepts[cKey][ev.uniqueId].push([
						ev.status,
						ev.seconds,
						accMark,
						timeMark,
						ev.option
					]);
				}
			});
			return {
				...prev,
				[activeChapterKey]: {
					...target,
					concepts: nextConcepts
				}
			};
		});
		const nextNum = testSessions.length + 1;
		const newSessionId = `test-${Date.now()}`;
		const newSession = {
			id: newSessionId,
			label: `test id(${nextNum})`,
			chapterCode: activeChapterKey,
			questionUniqueIds: evaluations.map((e) => e.uniqueId),
			createdAt: "19/11/2026"
		};
		setTestSessions((prev) => [...prev, newSession]);
		setActiveTestSessionId(newSessionId);
	};
	const { timing } = currentLedger;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full min-h-screen bg-[#F5F4EF] text-[#111827] px-2 py-2 space-y-2 font-sans select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveSectionView("part-1"),
							className: `px-3.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${activeSectionView === "part-1" || activeSectionView === "part-2" || activeSectionView === "question-index" || activeSectionView === "question-cards" || activeSectionView === "test-analysis" ? "bg-[#1D4ED8] text-white shadow-2xs" : "bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] hover:bg-[#EFECE6]"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "w-3.5 h-3.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1) Chapter Tracker" }),
								activeSectionView === "part-2" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded",
									children: "Sub-page: Part 2"
								}),
								activeSectionView === "question-index" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded",
									children: "Sub-page: Question Index"
								}),
								activeSectionView === "question-cards" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded",
									children: "Sub-page: Question Cards"
								}),
								activeSectionView === "test-analysis" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded",
									children: "Sub-page: Test Analysis"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveSectionView("exam-page-1"),
							className: `px-3.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${activeSectionView === "exam-page-1" || activeSectionView === "exam-page-2" ? "bg-[#1D4ED8] text-white shadow-2xs" : "bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] hover:bg-[#EFECE6]"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "w-3.5 h-3.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2) Exam Info" }),
								activeSectionView === "exam-page-2" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded",
									children: "Sub-page: Editor"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveSectionView("registry"),
							className: `px-3.5 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${activeSectionView === "registry" ? "bg-[#1D4ED8] text-white shadow-2xs" : "bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] hover:bg-[#EFECE6]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderTree, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3) Registry" })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-mono text-[#6B7280]",
					children: "3 Main Pages · Sub-pages accessible at the bottom of their parent page"
				})]
			}),
			activeSectionView === "part-2" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackerPageTwo, {
				ledger: currentLedger,
				allLedgers: ledgers,
				onSelectChapter: handleSelectChapter,
				onSimulateAttemptInScope: handleSimulateAttemptInScope,
				onBackToPartOne: () => setActiveSectionView("part-1"),
				onOpenQuestionIndex: () => setActiveSectionView("question-index"),
				onLaunchScopedQuestionsDirect: (questions, pathLabel, mode) => {
					setLaunchedCardItems(questions.map((q) => ({
						question: q,
						pathLabel
					})));
					setLaunchedModality(mode);
					setActiveSectionView("question-cards");
				},
				domains,
				chapters,
				subtopics,
				concepts,
				microConcepts,
				stepsByQid
			}),
			activeSectionView === "question-index" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackerQuestionIndex, {
				ledger: currentLedger,
				allLedgers: ledgers,
				onSelectChapter: handleSelectChapter,
				onLaunchQuestionCards: (items, mod) => {
					setLaunchedCardItems(items);
					setLaunchedModality(mod);
					setActiveSectionView("question-cards");
				},
				onBackToPartTwo: () => setActiveSectionView("part-2"),
				onGoToTrackerPageOne: () => setActiveSectionView("part-1"),
				domains,
				chapters,
				subtopics,
				concepts,
				microConcepts
			}),
			activeSectionView === "question-cards" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackerQuestionCards, {
				ledger: currentLedger,
				selectedItems: launchedCardItems,
				executionModality: launchedModality,
				stepsByQid,
				setStepsByQid,
				onRecordEvaluatedTest: handleRecordEvaluatedTest,
				onBackToQuestionIndex: () => setActiveSectionView("question-index"),
				onOpenTestAnalysis: () => setActiveSectionView("test-analysis"),
				onGoToTrackerPageOne: () => setActiveSectionView("part-1"),
				domains,
				chapters,
				subtopics,
				concepts,
				microConcepts
			}),
			activeSectionView === "test-analysis" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackerTestAnalysis, {
				ledger: currentLedger,
				testSessions,
				activeTestSessionId,
				onSelectTestSession: (id) => setActiveTestSessionId(id),
				onBackToQuestionCards: () => setActiveSectionView("question-cards"),
				onGoToTrackerPageOne: () => setActiveSectionView("part-1"),
				domains,
				chapters,
				subtopics,
				concepts,
				microConcepts,
				stepsByQid
			}),
			(activeSectionView === "registry" || activeSectionView === "exam-page-1" || activeSectionView === "exam-page-2") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExamRegistryDashboard, {
				ledgers,
				activeMode: activeSectionView,
				onSwitchMode: (m) => setActiveSectionView(m),
				onJumpToChapterLedger: handleJumpToChapterLedger,
				onRegisterNewChapterLedger: handleRegisterNewChapterLedger,
				domains,
				setDomains,
				chapters,
				setChapters,
				subtopics,
				setSubtopics,
				concepts,
				setConcepts,
				microConcepts,
				setMicroConcepts
			}),
			activeSectionView === "part-1" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-widest text-[#6B7280]",
								children: "TARGET SUBJECT CATEGORY · CHAPTER FOLDER POOL"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5 mt-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: activeChapterKey,
										onChange: (e) => handleSelectChapter(e.target.value),
										className: "text-xl font-bold tracking-tight text-[#111827] bg-transparent border-b border-dashed border-[#9CA3AF] focus:outline-none focus:border-[#2563EB] cursor-pointer pr-1",
										children: Object.values(ledgers).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: l.chapterCode,
											children: [
												l.chapterName,
												" [",
												l.chapterCode,
												"]"
											]
										}, l.chapterCode))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded",
										children: "MM = TQ × 3"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "hidden sm:flex items-center gap-1 ml-1",
										children: Object.entries(currentLedger.concepts).map(([cMid, qMap]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "px-1.5 py-0.5 text-[10px] font-mono bg-[#F5F4EF] text-[#374151] border border-[#DFDDD4] rounded",
											children: [
												cMid,
												": ",
												Object.keys(qMap).length,
												" Qs"
											]
										}, cMid))
									})
								]
							})] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 bg-[#F9F8F4] border border-[#E5E3DC] rounded-md px-3 py-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold mr-1",
									children: "PACE TIERS (s):"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-1 text-[11px] font-mono text-[#374151]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#6B7280]",
										children: "Fast≤"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 1,
										step: 1,
										disabled: timing.locked,
										value: fastInput,
										onChange: (e) => setFastInput(e.target.value.replace(/\D/g, "")),
										className: "w-12 px-1.5 py-0.5 text-center font-mono font-semibold bg-white border border-[#D1CFC7] rounded text-[#111827] disabled:bg-[#F3F2EE] disabled:text-[#6B7280]"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-1 text-[11px] font-mono text-[#374151]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#6B7280]",
										children: "Med≤"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 2,
										step: 1,
										disabled: timing.locked,
										value: medInput,
										onChange: (e) => setMedInput(e.target.value.replace(/\D/g, "")),
										className: "w-12 px-1.5 py-0.5 text-center font-mono font-semibold bg-white border border-[#D1CFC7] rounded text-[#111827] disabled:bg-[#F3F2EE] disabled:text-[#6B7280]"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-1 text-[11px] font-mono text-[#374151]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#6B7280]",
										children: "Slow≤"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 3,
										step: 1,
										disabled: timing.locked,
										value: slowInput,
										onChange: (e) => setSlowInput(e.target.value.replace(/\D/g, "")),
										className: "w-12 px-1.5 py-0.5 text-center font-mono font-semibold bg-white border border-[#D1CFC7] rounded text-[#111827] disabled:bg-[#F3F2EE] disabled:text-[#6B7280]"
									})]
								}),
								timing.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleUnlockTiming,
									className: "px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded flex items-center gap-1 hover:bg-[#DBEAFE] transition-colors",
									title: "Unlock to edit chapter timing thresholds",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "LOCKED" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleSaveTiming,
									className: "px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-[#1D4ED8] text-white rounded flex items-center gap-1 hover:bg-[#1E40AF] transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SAVE & LOCK" })]
								}),
								timingError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-mono text-[#DC2626]",
									children: timingError
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-mono uppercase tracking-widest text-[#6B7280]",
									children: "EVALUATION DATE"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-mono font-bold text-[#111827] mt-0.5",
									children: currentLedger.evaluationDate
								})]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 text-xs font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5 font-bold text-[#1D4ED8]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CHAPTER POOL (TQ):" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-bold",
								children: [
									"Total Qs: ",
									stats.TQ,
									" (MM = ",
									stats.TQ,
									" × 3 = ",
									stats.MM,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]",
								children: ["Attempted: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-[#16A34A]",
									children: stats.attemptedCount
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]",
								children: ["Not Asked: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-[#D97706]",
									children: stats.NQNA
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-1.5 text-[11px] font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleIngestBatch(10),
								className: "px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold transition-colors cursor-pointer",
								title: "Simulate adding a new batch of 10 mapped questions to this chapter folder",
								children: "+Batch (10 Qs)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => handleSimulateAttempt("C", Math.max(1, timing.fastLimit - 15), "A"),
								className: "px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] rounded font-semibold transition-colors cursor-pointer",
								children: [
									"+Correct (",
									Math.max(1, timing.fastLimit - 15),
									"s)"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => handleSimulateAttempt("C", Math.floor((timing.fastLimit + timing.mediumLimit) / 2), "B"),
								className: "px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold transition-colors cursor-pointer",
								children: [
									"+Med (",
									Math.floor((timing.fastLimit + timing.mediumLimit) / 2),
									"s)"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => handleSimulateAttempt("W", timing.mediumLimit - 15, "D"),
								className: "px-2.5 py-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded font-semibold transition-colors cursor-pointer",
								children: [
									"+Wrong (",
									timing.mediumLimit - 15,
									"s)"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleSimulateAttempt("S", 30, "-"),
								className: "px-2.5 py-1 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded font-semibold transition-colors cursor-pointer",
								children: "+Skip"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handleResetSkeleton,
								className: "px-2 py-1 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#4B5563] border border-[#DFDDD4] rounded flex items-center gap-1 transition-colors cursor-pointer",
								title: "Clear all attempts to 0 (Clean Skeleton)",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Clear" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleRestoreDemoData,
								className: "px-2 py-1 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#4B5563] border border-[#DFDDD4] rounded transition-colors cursor-pointer",
								title: "Restore sample evaluation state",
								children: "Reset"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setShowJsonModal(true),
								className: "px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold flex items-center gap-1 transition-colors cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ledger JSON" })]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TOTAL COMPLETION RATIO" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline gap-2.5 mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `text-4xl font-mono font-extrabold tracking-tight ${stats.completionPct < 0 ? "text-[#DC2626]" : "text-[#111827]"}`,
							children: [stats.completionPct.toFixed(3), "%"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-mono text-[#6B7280] uppercase",
							children: [
								"(LTM / MM = ",
								formatNum(stats.LTM),
								" / ",
								stats.MM,
								")"
							]
						})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full md:w-[420px] flex flex-col gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs font-mono",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#4B5563] font-medium",
									children: "Mastery Index"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-[#1D4ED8]",
									children: [
										formatNum(stats.LTM),
										" / ",
										stats.MM,
										" Marks"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full h-2.5 bg-[#EFECE6] rounded-full overflow-hidden border border-[#DFDDD4]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-full transition-all duration-300 rounded-full ${stats.completionPct < 0 ? "bg-[#DC2626]" : "bg-gradient-to-r from-[#1D4ED8] to-[#16A34A]"}`,
									style: { width: `${Math.min(100, Math.max(0, Math.abs(stats.completionPct)))}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[10px] font-mono text-[#6B7280]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0% (Floor)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"MM Ceiling: ",
									stats.MM,
									" (",
									stats.TQ,
									" Chapter Qs × 3)"
								] })]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold",
										children: "MAXIMUM MARK (CHAPTER POOL CAP)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F5F4EF] text-[#374151] border border-[#DFDDD4] rounded",
										children: "MM = TQ × 3"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline gap-2.5 mt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-3xl font-mono font-bold text-[#111827]",
										children: stats.MM
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-mono font-semibold text-[#1D4ED8]",
										children: [
											"(",
											stats.TQ,
											" Accumulated Qs × 3)"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono text-[#6B7280] mt-1",
									children: "All ingested chapter <Qn> blocks × 3 (1 Acc + 2 Time)"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white border border-[#BFDBFE] rounded-lg px-4 py-3.5 shadow-2xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-mono uppercase tracking-wider text-[#1D4ED8] font-semibold",
										children: "LIFETIME MARKS"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded",
										children: "LM"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-3xl font-mono font-bold mt-2 ${stats.LTM < 0 ? "text-[#DC2626]" : "text-[#1D4ED8]"}`,
									children: formatNum(stats.LTM)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono text-[#6B7280] mt-1",
									children: "ARMNT + NTM"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold",
										children: "AVAILABLE MARKS"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F5F4EF] text-[#374151] border border-[#DFDDD4] rounded",
										children: "AM"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-3xl font-mono font-bold text-[#111827] mt-2",
									children: formatNum(stats.AM)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono text-[#6B7280] mt-1",
									children: "MM - LTM"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E3DC]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111827]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ACCURACY OVERVIEW & BREAKDOWN" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-mono text-[#6B7280] mt-0.5",
							children: [
								"Accuracy Metric Formula: Accuracy = ",
								stats.NQC,
								" / ",
								stats.accuracyDenominator
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-[210px] bg-[#F9F8F4] border border-[#DFDDD4] rounded-md px-3 py-2 flex items-center justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[9px] font-mono uppercase tracking-wider text-[#6B7280]",
								children: "// ACCURACY RATIO"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-base font-mono font-bold ${stats.accuracyRatioPct < 0 ? "text-[#DC2626]" : "text-[#15803D]"}`,
								children: [stats.accuracyRatioPct.toFixed(2), "%"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-16 h-2 bg-[#E5E3DC] rounded-full overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-full rounded-full ${stats.accuracyRatioPct < 0 ? "bg-[#DC2626]" : "bg-[#16A34A]"}`,
									style: { width: `${Math.min(100, Math.max(0, Math.abs(stats.accuracyRatioPct)))}%` }
								})
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse font-mono text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-[#E5E3DC] text-[10px] uppercase tracking-wider text-[#6B7280]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 pr-4 font-semibold",
											children: "CLASSIFICATION"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-center font-semibold",
											children: "COUNT"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-center font-semibold",
											children: "MULTIPLICATION FORMULA"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 pl-4 text-right font-semibold",
											children: "NET VALUATION"
										})
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
									className: "divide-y divide-[#F0EFEA]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#111827]",
												children: [
													"No. of questions correct (lifetime)",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#1D4ED8] ml-1",
														children: "[NQC]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#111827]",
												children: stats.NQC
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#4B5563]",
												children: [stats.NQC, " × 1.0"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pl-4 text-right font-bold text-[#15803D]",
												children: [
													"+",
													formatNum(stats.correctMarks),
													" marks"
												]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#111827]",
												children: [
													"No. of questions wrong",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#DC2626] ml-1",
														children: "[NQW]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#111827]",
												children: stats.NQW
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#4B5563]",
												children: [stats.NQW, " × 0.5 (Penalty)"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pl-4 text-right font-bold text-[#DC2626]",
												children: [stats.wrongPenalty > 0 ? `-${formatNum(stats.wrongPenalty)}` : "0", " marks"]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#111827]",
												children: [
													"No. of questions skipped",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#D97706] ml-1",
														children: "[NQS]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#111827]",
												children: stats.NQS
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#4B5563]",
												children: [stats.NQS, " × 0.2 (Penalty)"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pl-4 text-right font-bold text-[#D97706]",
												children: [stats.skipPenalty > 0 ? `-${formatNum(stats.skipPenalty)}` : "0", " marks"]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#6B7280]",
												children: [
													"No. of questions not asked",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#6B7280] ml-1",
														children: "[NQNA]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#6B7280]",
												children: stats.NQNA
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#6B7280]",
												children: [stats.NQNA, " × 0.0"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 pl-4 text-right font-semibold text-[#6B7280]",
												children: "0 marks"
											})
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-[#F9F8F4] border-t border-[#DFDDD4]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											colSpan: 2,
											className: "py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]",
											children: "ACCURACY REAL MARKS NET TOTAL (ARMNT)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2.5 px-4 text-center font-bold text-[#111827]",
											children: [
												formatNum(stats.correctMarks),
												" - ",
												formatNum(stats.wrongPenalty),
												" -",
												" ",
												formatNum(stats.skipPenalty)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2.5 px-3 text-right font-bold text-sm text-[#1D4ED8]",
											children: [
												"= ",
												formatNum(stats.ARMNT),
												" Marks"
											]
										})
									]
								}) })
							]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E3DC]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111827]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 rounded-full bg-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TIME PERFORMANCE & SPEED TIER BREAKDOWN" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-mono text-[#6B7280] mt-0.5",
							children: [
								"Lifetime Marks (Time = ",
								formatNum(stats.NTM),
								" / ",
								stats.timeDenominator,
								")"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-[210px] bg-[#F9F8F4] border border-[#DFDDD4] rounded-md px-3 py-2 flex items-center justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[9px] font-mono uppercase tracking-wider text-[#6B7280]",
								children: "// LIFETIME TIME PERCENTAGE"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-base font-mono font-bold text-[#1D4ED8]",
								children: [stats.timeRatioPct.toFixed(2), "%"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-16 h-2 bg-[#E5E3DC] rounded-full overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-[#1D4ED8] rounded-full",
									style: { width: `${Math.min(100, Math.max(0, stats.timeRatioPct))}%` }
								})
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left border-collapse font-mono text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-[#E5E3DC] text-[10px] uppercase tracking-wider text-[#6B7280]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 pr-4 font-semibold",
											children: "LATENCY BAND"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-center font-semibold",
											children: "COUNT"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 px-4 text-center font-semibold",
											children: "MULTIPLIER STEP"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2.5 pl-4 text-right font-semibold",
											children: "NET VALUATION"
										})
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
									className: "divide-y divide-[#F0EFEA]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#111827]",
												children: [
													"No. of questions under ",
													timing.fastLimit,
													"s",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#1D4ED8] ml-1",
														children: "[NQF]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#111827]",
												children: stats.NQF
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#4B5563]",
												children: [stats.NQF, " × 2"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pl-4 text-right font-bold text-[#1D4ED8]",
												children: [
													"+",
													formatNum(stats.fastMarks),
													" marks"
												]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#111827]",
												children: [
													"No. of questions under ",
													timing.fastLimit,
													"s - ",
													timing.mediumLimit,
													"s",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#1D4ED8] ml-1",
														children: "[NQM]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#111827]",
												children: stats.NQM
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#4B5563]",
												children: [stats.NQM, " × 1"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pl-4 text-right font-bold text-[#1D4ED8]",
												children: [
													"+",
													formatNum(stats.medMarks),
													" marks"
												]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#111827]",
												children: [
													"No. of questions under ",
													timing.mediumLimit,
													"s - ",
													timing.slowLimit,
													"s",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#1D4ED8] ml-1",
														children: "[NQSl]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#111827]",
												children: stats.NQSl
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#4B5563]",
												children: [stats.NQSl, " × 0.5"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pl-4 text-right font-bold text-[#4B5563]",
												children: [stats.slowMarks > 0 ? `+${formatNum(stats.slowMarks)}` : "0", " marks"]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 pr-4 font-sans font-medium text-[#6B7280]",
												children: [
													"No. of questions over ",
													timing.slowLimit,
													"s",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-[10px] text-[#6B7280] ml-1",
														children: "[NQOT]"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 px-4 text-center font-bold text-[#6B7280]",
												children: stats.NQOT
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2.5 px-4 text-center text-[#6B7280]",
												children: [stats.NQOT, " × 0"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2.5 pl-4 text-right font-semibold text-[#6B7280]",
												children: "0 marks"
											})
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-[#F9F8F4] border-t border-[#DFDDD4]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											colSpan: 2,
											className: "py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]",
											children: "NET TIME MARKS (NTM)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2.5 px-4 text-center font-bold text-[#111827]",
											children: [
												formatNum(stats.fastMarks),
												" + ",
												formatNum(stats.medMarks),
												" +",
												" ",
												formatNum(stats.slowMarks)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2.5 px-3 text-right font-bold text-sm text-[#1D4ED8]",
											children: [
												"= ",
												formatNum(stats.NTM),
												" Marks"
											]
										})
									]
								}) })
							]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pb-3 border-b border-[#E5E3DC]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-mono font-bold uppercase tracking-wider text-[#111827]",
							children: "FINAL AGGREGATION & TOPIC SYNTHESIS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded",
								children: stats.invariantsPass ? "INVARIANTS VERIFIED" : "INVARIANT MISMATCH"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded",
								children: "SYNTHESIS"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]",
									children: "LIFETIME MARKS (LTM) FORMULA"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono text-[#4B5563] mt-0.5",
									children: "ARMNT + NTM"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xl font-mono font-bold text-[#111827] mt-2",
									children: [
										formatNum(stats.ARMNT),
										" + ",
										formatNum(stats.NTM),
										" =",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: stats.LTM < 0 ? "text-[#DC2626]" : "text-[#1D4ED8]",
											children: [formatNum(stats.LTM), " Marks"]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-mono uppercase tracking-wider text-[#6B7280]",
									children: "TOTAL COMPLETION PERCENTAGE"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono text-[#4B5563] mt-0.5",
									children: "LTM / MM"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xl font-mono font-bold text-[#111827] mt-2",
									children: [
										formatNum(stats.LTM),
										" / ",
										stats.MM,
										" =",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: stats.completionPct < 0 ? "text-[#DC2626]" : "text-[#15803D]",
											children: [stats.completionPct.toFixed(3), "%"]
										})
									]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-mono text-[#6B7280]",
						children: "Chapter Tracker Sub-Page · Inspect Subtopic & Concept Completion % via MKML Tag Scanner"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveSectionView("part-2"),
						className: "px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Proceed to Part 2: Subtopic Breakdown (Subtopic Analysis)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })]
					})]
				})
			] }),
			showJsonModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white border border-[#DFDDD4] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-4 py-3 bg-[#F9F8F4] border-b border-[#DFDDD4]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs font-mono font-bold text-[#111827]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "w-4 h-4 text-[#1D4ED8]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Topic Statistics Ledger JSON Tree (",
									currentLedger.chapterCode,
									")"
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowJsonModal(false),
								className: "p-1 text-[#6B7280] hover:text-[#111827] rounded",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 max-h-[420px] overflow-y-auto bg-[#F5F4EF] font-mono text-xs text-[#111827]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "whitespace-pre-wrap break-all",
								children: JSON.stringify(currentLedger, null, 2)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-4 py-2.5 bg-[#F9F8F4] border-t border-[#DFDDD4] text-[11px] font-mono",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[#6B7280]",
								children: [
									"Hierarchy: Chapter [",
									currentLedger.chapterCode,
									"] → Concept MID → Question ID → [[status, sec, acc, time, opt]]"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: handleResetSkeleton,
									className: "px-2.5 py-1 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] rounded font-semibold hover:bg-[#FEE2E2]",
									children: "Reset to Clean Skeleton"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleCopyJson,
									className: "px-3 py-1 bg-[#1D4ED8] text-white rounded font-semibold flex items-center gap-1 hover:bg-[#1E40AF]",
									children: [copiedJson ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copiedJson ? "Copied" : "Copy JSON" })]
								})]
							})]
						})
					]
				})
			})
		]
	});
};
// src/tracker-mount.tsx
var trackerRoot = null;
function ensureMounted() {
	const container = document.getElementById("tracker-root");
	if (!container) return false;
	if (!trackerRoot) {
		container.innerHTML = "";
		trackerRoot = (0, import_client.createRoot)(container);
		trackerRoot.render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackerPageOne, {}) }));
	}
	return true;
}
window.refreshTracker = async (preferredFolder) => {
	ensureMounted();
	if (preferredFolder) {
		const upper = preferredFolder.toUpperCase();
		const code = upper.includes("TRIG") ? "TRG" : upper.includes("PRONOUN") ? "PN" : upper.includes("TIME") ? "TD" : void 0;
		if (code) window.dispatchEvent(new CustomEvent("angles:tracker-command", { detail: {
			action: "select-chapter",
			chapterCode: code
		} }));
	}
};
window.openTrackerSection = (view, chapterCode) => {
	ensureMounted();
	setTimeout(() => {
		window.dispatchEvent(new CustomEvent("angles:tracker-command", { detail: {
			action: "set-view",
			view,
			chapterCode
		} }));
	}, 15);
};
window.openTrackerScopedCards = async (opts = {}) => {
	ensureMounted();
	setTimeout(() => {
		window.dispatchEvent(new CustomEvent("angles:tracker-command", { detail: {
			action: "launch-scoped-cards",
			folder: opts.folder,
			rootMid: opts.rootMid,
			conceptMid: opts.conceptMid,
			mode: opts.mode === "study" ? "study" : "shallow"
		} }));
	}, 20);
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => {
	ensureMounted();
});
else ensureMounted();

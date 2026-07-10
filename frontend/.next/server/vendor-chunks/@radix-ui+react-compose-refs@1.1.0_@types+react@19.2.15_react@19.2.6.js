"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-compose-refs@1.1.0_@types+react@19.2.15_react@19.2.6";
exports.ids = ["vendor-chunks/@radix-ui+react-compose-refs@1.1.0_@types+react@19.2.15_react@19.2.6"];
exports.modules = {

/***/ "(ssr)/../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.0_@types+react@19.2.15_react@19.2.6/node_modules/@radix-ui/react-compose-refs/dist/index.mjs":
/*!***********************************************************************************************************************************************************!*\
  !*** ../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.0_@types+react@19.2.15_react@19.2.6/node_modules/@radix-ui/react-compose-refs/dist/index.mjs ***!
  \***********************************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   composeRefs: () => (/* binding */ composeRefs),\n/* harmony export */   useComposedRefs: () => (/* binding */ useComposedRefs)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/../node_modules/.pnpm/next@15.0.6_react-dom@19.2.6_react@19.2.6__react@19.2.6/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js\");\n// packages/react/compose-refs/src/composeRefs.tsx\n\nfunction setRef(ref, value) {\n  if (typeof ref === \"function\") {\n    ref(value);\n  } else if (ref !== null && ref !== void 0) {\n    ref.current = value;\n  }\n}\nfunction composeRefs(...refs) {\n  return (node) => refs.forEach((ref) => setRef(ref, node));\n}\nfunction useComposedRefs(...refs) {\n  return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(composeRefs(...refs), refs);\n}\n\n//# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0ByYWRpeC11aStyZWFjdC1jb21wb3NlLXJlZnNAMS4xLjBfQHR5cGVzK3JlYWN0QDE5LjIuMTVfcmVhY3RAMTkuMi42L25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtY29tcG9zZS1yZWZzL2Rpc3QvaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQytCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsOENBQWlCO0FBQzFCO0FBSUU7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL3VzdWFyaW8vRGVza3RvcC9wcm9qZXRvcy9jYW9hLXZlbmRhLWNhbnRhZGEtZGFzaC9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LWNvbXBvc2UtcmVmc0AxLjEuMF9AdHlwZXMrcmVhY3RAMTkuMi4xNV9yZWFjdEAxOS4yLjYvbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC1jb21wb3NlLXJlZnMvZGlzdC9pbmRleC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gcGFja2FnZXMvcmVhY3QvY29tcG9zZS1yZWZzL3NyYy9jb21wb3NlUmVmcy50c3hcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuZnVuY3Rpb24gc2V0UmVmKHJlZiwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiByZWYgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJlZih2YWx1ZSk7XG4gIH0gZWxzZSBpZiAocmVmICE9PSBudWxsICYmIHJlZiAhPT0gdm9pZCAwKSB7XG4gICAgcmVmLmN1cnJlbnQgPSB2YWx1ZTtcbiAgfVxufVxuZnVuY3Rpb24gY29tcG9zZVJlZnMoLi4ucmVmcykge1xuICByZXR1cm4gKG5vZGUpID0+IHJlZnMuZm9yRWFjaCgocmVmKSA9PiBzZXRSZWYocmVmLCBub2RlKSk7XG59XG5mdW5jdGlvbiB1c2VDb21wb3NlZFJlZnMoLi4ucmVmcykge1xuICByZXR1cm4gUmVhY3QudXNlQ2FsbGJhY2soY29tcG9zZVJlZnMoLi4ucmVmcyksIHJlZnMpO1xufVxuZXhwb3J0IHtcbiAgY29tcG9zZVJlZnMsXG4gIHVzZUNvbXBvc2VkUmVmc1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXBcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.0_@types+react@19.2.15_react@19.2.6/node_modules/@radix-ui/react-compose-refs/dist/index.mjs\n");

/***/ })

};
;
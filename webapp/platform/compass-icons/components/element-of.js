"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ElementOfIcon = (_a) => {
    var { size, color } = _a, rest = __rest(_a, ["size", "color"]);
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: size || '1em', height: size || '1em', fill: color || 'currentColor', viewBox: "0 0 24 24" }, rest),
        react_1.default.createElement("path", { d: "M8.48482 8.26189C7.48374 9.13098 7.00004 10.4078 7 11.9995C7 13.5935 7.49291 14.87 8.49728 15.738C9.48938 16.5956 10.9175 17 12.6826 17H17V15.0214H12.4987C11.3699 15.0214 10.5356 14.7809 9.96869 14.3634C9.52592 14.0373 9.22106 13.5817 9.06629 12.981H17V11.0024H9.06534C9.21923 10.4026 9.52199 9.95111 9.96198 9.62869C10.5263 9.21525 11.3605 8.97764 12.4987 8.97764H17V7H12.6826C10.9031 7 9.47377 7.40337 8.48482 8.26189Z" })));
};
exports.default = ElementOfIcon;

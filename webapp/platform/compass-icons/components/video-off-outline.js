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
const VideoOffOutlineIcon = (_a) => {
    var { size, color } = _a, rest = __rest(_a, ["size", "color"]);
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: size || '1em', height: size || '1em', fill: color || 'currentColor', viewBox: "0 0 24 24" }, rest),
        react_1.default.createElement("path", { d: "M18 10.5V7.00002C18 5.70002 17.3 5.00002 16 5.00002H9.4L11.4 7.00002H16V11.6L22 17.5V6.50002L18 10.5ZM2 3.30002L3.8 5.00002C2.7 5.10002 2 5.90002 2 7.00002V17C2 18.2 2.9 19 4 19H16C16.5 19 17 18.9 17.3 18.6L19.7 21L21.1 19.6L3.4 1.90002L2 3.30002ZM4 7.00002H5.7L15.7 17H4V7.00002Z" })));
};
exports.default = VideoOffOutlineIcon;

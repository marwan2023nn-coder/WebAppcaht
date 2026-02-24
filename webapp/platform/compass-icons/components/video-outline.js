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
const VideoOutlineIcon = (_a) => {
    var { size, color } = _a, rest = __rest(_a, ["size", "color"]);
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: size || '1em', height: size || '1em', fill: color || 'currentColor', viewBox: "0 0 24 24" }, rest),
        react_1.default.createElement("path", { d: "M18,10.5V7c0-1.3-0.7-2-2-2H4C2.8,5,2,5.8,2,7v10c0,1.2,0.9,2,2,2h12c1.3,0,2-0.8,2-2v-3.5l4,4v-11L18,10.5z M16,17H4V7h12\nV17z" })));
};
exports.default = VideoOutlineIcon;

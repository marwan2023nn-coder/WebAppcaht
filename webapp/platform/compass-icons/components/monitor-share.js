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
const MonitorShareIcon = (_a) => {
    var { size, color } = _a, rest = __rest(_a, ["size", "color"]);
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: size || '1em', height: size || '1em', fill: color || 'currentColor', viewBox: "0 0 24 24" }, rest),
        react_1.default.createElement("path", { d: "M23,4v12c0,0.6-0.2,1-0.6,1.5C22,17.8,21.5,18,21,18h-6v-2h6V4H3v12h6v2H3c-0.6,0-1-0.2-1.5-0.6C1.2,17,1,16.6,1,16V4c0-0.5,0.2-1,0.6-1.4C2,2.2,2.5,2,3,2h18c0.6,0,1,0.2,1.4,0.6C22.8,3,23,3.4,23,4z M13,13h3l-4-4l-4,4h3v7H8v2h8v-2h-3V13z" })));
};
exports.default = MonitorShareIcon;

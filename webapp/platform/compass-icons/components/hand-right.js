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
const HandRightIcon = (_a) => {
    var { size, color } = _a, rest = __rest(_a, ["size", "color"]);
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: size || '1em', height: size || '1em', fill: color || 'currentColor', viewBox: "0 0 24 24" }, rest),
        react_1.default.createElement("path", { d: "M13.042,22c-2.717,0-5.158-1.667-6.167-4.167l-2.524-6.358c-0.258-0.658,0.358-1.317,1.033-1.1l0.658,0.217c0.467,0.158,0.85,0.508,1.034,0.966L8.251,14.5h0.625V4.708c0-0.575,0.467-1.042,1.042-1.042s1.042,0.467,1.042,1.042V12h0.833\n\tV3.042C11.792,2.467,12.259,2,12.834,2s1.042,0.467,1.042,1.042V12h0.833V4.292c0-0.575,0.467-1.042,1.042-1.042\n\ts1.042,0.467,1.042,1.042V12h0.833V6.792c0-0.575,0.467-1.042,1.042-1.042s1.042,0.467,1.042,1.042v8.542\n\tC19.709,19.017,16.726,22,13.042,22z" })));
};
exports.default = HandRightIcon;

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
const CreationOutlineIcon = (_a) => {
    var { size, color } = _a, rest = __rest(_a, ["size", "color"]);
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: size || '1em', height: size || '1em', fill: color || 'currentColor', viewBox: "0 0 24 24" }, rest),
        react_1.default.createElement("path", { d: "M12,7.534l0.84,2.519l0.277,0.83l0.83,0.277L16.466,12l-2.519,0.84l-0.83,0.277l-0.277,0.83L12,16.466l-0.84-2.519\n\tl-0.277-0.83l-0.83-0.277L7.534,12l2.519-0.84l0.83-0.277l0.277-0.83L12,7.534 M12,2L9.5,9.5L2,12l7.5,2.5L12,22l2.5-7.5L22,12\n\t\tl-7.5-2.5L12,2L12,2z M5,2L4.34,4.34L2,5l2.34,0.66L5,8l0.66-2.34L8,5L5.66,4.34L5,2L5,2z M19,16l-0.66,2.34L16,19l2.34,0.66L19,22\n\t\tl0.66-2.34L22,19l-2.34-0.66L19,16L19,16z" })));
};
exports.default = CreationOutlineIcon;

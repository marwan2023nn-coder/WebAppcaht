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
const AiSummarizeIcon = (_a) => {
    var { size, color } = _a, rest = __rest(_a, ["size", "color"]);
    return (react_1.default.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", version: "1.1", width: size || '1em', height: size || '1em', fill: color || 'currentColor', viewBox: "0 0 24 24" }, rest),
        react_1.default.createElement("path", { d: "M19.5264 4.47365C19.2192 4.15365 18.8416 3.99365 18.3936 3.99365H5.60639C5.15839 3.99365 4.77439 4.15365 4.45439 4.47365C4.14719 4.78085 3.99359 5.15845 3.99359 5.60645V20.0065L7.19999 16.8001H18.3936C18.8416 16.8001 19.2192 16.6465 19.5264 16.3393C19.8464 16.0321 20.0064 15.6545 20.0064 15.2065V5.60645C20.0064 5.15845 19.8464 4.78085 19.5264 4.47365ZM5.60639 6.4V5.60645H18.3936V15.2065H6.52799L5.60639 16.1281V14.4H5.59999V6.4H5.60639Z" }),
        react_1.default.createElement("path", { d: "M12 6.4L11.12 9.52L8 10.4L11.12 11.28L12 14.4L12.88 11.28L16 10.4L12.88 9.52L12 6.4Z" }),
        react_1.default.createElement("path", { d: "M16 11.2L15.648 12.448L14.4 12.8L15.648 13.152L16 14.4L16.352 13.152L17.6 12.8L16.352 12.448L16 11.2Z" }),
        react_1.default.createElement("path", { d: "M7.99999 6.4L7.64799 7.648L6.39999 8L7.64799 8.352L7.99999 9.6L8.35199 8.352L9.59999 8L8.35199 7.648L7.99999 6.4Z" })));
};
exports.default = AiSummarizeIcon;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.notFound = exports.success = exports.created = exports.unauthorized = exports.badRequest = void 0;
const badRequest = (res, message) => {
    return res.status(400).json({ success: false, message });
};
exports.badRequest = badRequest;
const unauthorized = (res, message) => {
    return res.status(401).json({ success: false, message });
};
exports.unauthorized = unauthorized;
const created = (res, data, message) => {
    return res.status(201).json({ success: true, data, message });
};
exports.created = created;
const success = (res, data, message) => {
    if (message) {
        return res.status(200).json({ success: true, data, message });
    }
    return res.status(200).json({ success: true, data });
};
exports.success = success;
const notFound = (res, message) => {
    return res.status(404).json({ success: false, message });
};
exports.notFound = notFound;
const error = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
};
exports.error = error;
//# sourceMappingURL=apiResponse.js.map
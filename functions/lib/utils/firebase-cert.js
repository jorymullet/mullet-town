"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
/**
 * TO GET THE CERT:
 *  We want to store the cert in our functions.config(). To do this, we have to replace all of the
 *  double quotes of the cert with single quotes. However, to parse it back out, we first need to
 *  replace all single quotes with double quotes so that it can be parsed by JSON.parse().
 */
exports.default = JSON.parse(functions.config().env.service_account.replace(new RegExp('\'', 'g'), '"'));
//# sourceMappingURL=firebase-cert.js.map
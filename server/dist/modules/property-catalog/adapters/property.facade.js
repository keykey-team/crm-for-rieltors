"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyFacade = void 0;
const property_service_1 = require("../services/property.service");
exports.propertyFacade = {
    listProperties: property_service_1.listProperties,
};

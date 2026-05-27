"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationFacade = void 0;
const communication_service_1 = require("../services/communication.service");
exports.communicationFacade = {
    listLeadCommunications: communication_service_1.listLeadCommunications,
};

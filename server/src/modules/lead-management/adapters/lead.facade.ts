import { findLeadRecord, updateLead, updateLeads } from '../repositories/lead.repository';

export const leadFacade = {
  getLeadRecord: findLeadRecord,
  updateLead,
  updateLeads,
};


import { findLeadRecord, updateLead } from '../repositories/lead.repository';

export const leadFacade = {
  getLeadRecord: findLeadRecord,
  updateLead,
};


import { Request } from 'express';
import { RequestAgencyContext } from '../middleware/agency.middleware';

export function currentAgency(req: Request): RequestAgencyContext {
  if (!req.agency) throw new Error('Agency context is missing');
  return req.agency;
}

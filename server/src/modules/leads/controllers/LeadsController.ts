import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { BaseController } from '../../../common/infrastructure/BaseController';
import { validateDto } from '../../../common/infrastructure/validation';
import { UnauthorizedError } from '../../../common/errors';
import { LeadService } from '../services/LeadService';
import { CreateLeadDto } from '../models/dto/CreateLeadDto';
import { UpdateLeadDto } from '../models/dto/UpdateLeadDto';

@injectable()
export class LeadsController extends BaseController {
  constructor(@inject(LeadService) private readonly leadService: LeadService) {
    super();
  }

  getAll = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();

    const data = await this.leadService.list({
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      source: req.query.source as string | undefined,
      userId: req.user.id,
      role: req.user.role,
    });

    return this.ok(res, data);
  };

  getOne = async (req: Request, res: Response) => {
    const data = await this.leadService.getById(req.params.id);
    return this.ok(res, data);
  };

  create = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();

    const dto = await validateDto(CreateLeadDto, req.body);
    const data = await this.leadService.create(dto, { id: req.user.id });
    return this.ok(res, data, 201);
  };

  update = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();

    const dto = await validateDto(UpdateLeadDto, req.body);
    const data = await this.leadService.update(req.params.id, dto, { id: req.user.id });
    return this.ok(res, data);
  };

  remove = async (req: Request, res: Response) => {
    const data = await this.leadService.remove(req.params.id);
    return this.ok(res, data);
  };
}

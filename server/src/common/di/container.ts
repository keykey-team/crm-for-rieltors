import 'reflect-metadata';
import { container } from 'tsyringe';
import { EventBus } from '../messaging';
import { UserRepository } from '../../modules/iam/repositories/UserRepository';
import { AuthService } from '../../modules/iam/services/AuthService';
import { AuthController } from '../../modules/iam/controllers/AuthController';
import { LeadRepository } from '../../modules/leads/repositories/LeadRepository';
import { LeadService } from '../../modules/leads/services/LeadService';
import { LeadsController } from '../../modules/leads/controllers/LeadsController';

container.registerSingleton(EventBus, EventBus);

container.registerSingleton(UserRepository, UserRepository);
container.registerSingleton(AuthService, AuthService);
container.registerSingleton(AuthController, AuthController);

container.registerSingleton(LeadRepository, LeadRepository);
container.registerSingleton(LeadService, LeadService);
container.registerSingleton(LeadsController, LeadsController);

export { container };

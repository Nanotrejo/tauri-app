export * from './controlsFunction.service';
import { ControlsFunctionService } from './controlsFunction.service';
export * from './profile.service';
import { ProfileService } from './profile.service';
export * from './softSensors.service';
import { SoftSensorsService } from './softSensors.service';
export * from './variables.service';
import { VariablesService } from './variables.service';
export * from './worker.service';
import { WorkerService } from './worker.service';
export const APIS = [ControlsFunctionService, ProfileService, SoftSensorsService, VariablesService, WorkerService];

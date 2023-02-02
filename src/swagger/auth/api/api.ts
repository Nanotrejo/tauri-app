export * from './adminCli.service';
import { AdminCliService } from './adminCli.service';
export * from './authFlow.service';
import { AuthFlowService } from './authFlow.service';
export * from './default.service';
import { DefaultService } from './default.service';
export * from './exampleUserRequest.service';
import { ExampleUserRequestService } from './exampleUserRequest.service';
export * from './groupManagement.service';
import { GroupManagementService } from './groupManagement.service';
export * from './roleManagement.service';
import { RoleManagementService } from './roleManagement.service';
export * from './userGroups.service';
import { UserGroupsService } from './userGroups.service';
export * from './userManagement.service';
import { UserManagementService } from './userManagement.service';
export * from './userRoles.service';
import { UserRolesService } from './userRoles.service';
export const APIS = [AdminCliService, AuthFlowService, DefaultService, ExampleUserRequestService, GroupManagementService, RoleManagementService, UserGroupsService, UserManagementService, UserRolesService];

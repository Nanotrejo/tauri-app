import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { AdminCliService } from './api/adminCli.service';
import { AuthFlowService } from './api/authFlow.service';
import { DefaultService } from './api/default.service';
import { ExampleUserRequestService } from './api/exampleUserRequest.service';
import { GroupManagementService } from './api/groupManagement.service';
import { RoleManagementService } from './api/roleManagement.service';
import { UserGroupsService } from './api/userGroups.service';
import { UserManagementService } from './api/userManagement.service';
import { UserRolesService } from './api/userRoles.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}

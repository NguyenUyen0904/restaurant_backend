import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module, Scope } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '../../common/exceptions.filter';
import { TransformInterceptor } from '../../common/transform.interceptor';
import { ProvinceService } from './services/province.service';
import { CommonController } from './common.controller';
import { DatabaseService } from '../../common/services/database.service';
import { Bank } from 'src/modules/common/entity/bank.entity';
import { CommonDropdownService } from './services/common-dropdown.service';
import { ConfigService } from '@nestjs/config';
import { Province } from '../user/entity/province.entity';
import { GlobalDataService } from './services/global-data.service';
import { BookingService } from '../booking/services/booking.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Province, Bank])],
    controllers: [CommonController],
    providers: [
        {
            provide: APP_FILTER,
            scope: Scope.REQUEST,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
        {
            provide: ConfigService,
            useValue: new ConfigService(),
        },
        ProvinceService,
        DatabaseService,
        CommonDropdownService,
        GlobalDataService,
        BookingService,
    ],
    exports: [ConfigService, ProvinceService, GlobalDataService],
})
export class CommonModule {}

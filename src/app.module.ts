import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './modules/common/common.module';
import { I18nModule } from './common/services/i18n.service';
import { WinstonModule } from './common/services/winston.service';
import { DatabaseModule } from './common/services/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AppController } from './app.controller';
import { SetttingModule } from './modules/setting/setting.module';
import envSchema from './common/config/validation-schema';
import { ConfigModule } from '@nestjs/config';
import { GlobalDataService } from './modules/common/services/global-data.service';
import { BookingModule } from './modules/booking/booking.module';
import { TableDiagramModule } from './modules/table-diagram/tableDiagram.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { MaterialModule } from './modules/material/material.module';
import { ConvertMaterialModule } from './modules/convert-material/convert_material.module';
import { ImportMaterialModule } from './modules/import-material/import_material.module';
import { ExportMaterialModule } from './modules/export-material/export_material.module';
import { ImportMaterialOrderModule } from './modules/import-material-order/import_material_order.module';
import { ExportMaterialOrderModule } from './modules/export-material-order/export_material_order.module';
import { CheckInventoryModule } from './modules/check-inventory/check_inventory.module';
import { CheckInventoryDetailModule } from './modules/check-inventory-detail/check_inventory_detail.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
            validationSchema: envSchema,
        }),
        WinstonModule,
        I18nModule,
        CommonModule,
        ScheduleModule.forRoot(),
        DatabaseModule,
        AuthModule,
        UserModule,
        SetttingModule,
        BookingModule,
        TableDiagramModule,
        SupplierModule,
        MaterialModule,
        ConvertMaterialModule,
        ImportMaterialModule,
        ExportMaterialModule,
        ImportMaterialOrderModule,
        ExportMaterialOrderModule,
        CheckInventoryModule,
        CheckInventoryDetailModule,
    ],
    controllers: [AppController],
    providers: [GlobalDataService],
})
export class AppModule {}

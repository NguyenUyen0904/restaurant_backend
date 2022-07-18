import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ExportMaterialService } from './service/export_material.service';
import { ExportMaterialController } from './export_material.controller';
import { CommonDropdownService } from '../common/services/common-dropdown.service';
import { ExportMaterialOrderService } from '../export-material-order/service/export_material_order.service';

@Module({
    controllers: [ExportMaterialController],
    providers: [
        ExportMaterialService,
        DatabaseService,
        CommonDropdownService,
        ExportMaterialOrderService,
    ],
})
export class ExportMaterialModule {}

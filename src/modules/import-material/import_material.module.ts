import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ImportMaterialService } from './service/import_material.service';
import { ImportMaterialController } from './import_material.controller';
import { ImportMaterialOrderService } from '../import-material-order/service/import_material_order.service';
import { CommonDropdownService } from '../common/services/common-dropdown.service';

@Module({
    controllers: [ImportMaterialController],
    providers: [
        ImportMaterialService,
        DatabaseService,
        ImportMaterialOrderService,
        CommonDropdownService,
    ],
})
export class ImportMaterialModule {}

import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ExportMaterialOrderService } from './service/export_material_order.service';
import { ExportMaterialOrderController } from './export_material_order.controller';

@Module({
    controllers: [ExportMaterialOrderController],
    providers: [ExportMaterialOrderService, DatabaseService],
})
export class ExportMaterialOrderModule {}

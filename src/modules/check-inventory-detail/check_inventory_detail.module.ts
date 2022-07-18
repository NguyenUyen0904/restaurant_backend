import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { CheckInventoryDetailService } from './service/check_inventory_detail.service';
import { CheckInventoryDetailController } from './check_inventory_detail.controller';

@Module({
    controllers: [CheckInventoryDetailController],
    providers: [CheckInventoryDetailService, DatabaseService],
})
export class CheckInventoryDetailModule {}

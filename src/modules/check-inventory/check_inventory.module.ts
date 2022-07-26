import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { CheckInventoryService } from './service/check_inventory.service';
import { CheckInventoryController } from './check_inventory.controller';
import { CheckInventoryDetailService } from '../check-inventory-detail/service/check_inventory_detail.service';
import { CommonDropdownService } from '../common/services/common-dropdown.service';

@Module({
    controllers: [CheckInventoryController],
    providers: [
        CheckInventoryService,
        DatabaseService,
        CheckInventoryDetailService,
        CommonDropdownService,
    ],
})
export class CheckInventoryModule {}

import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { CheckInventoryService } from './service/check_inventory.service';
import { CheckInventoryController } from './check_inventory.controller';

@Module({
    controllers: [CheckInventoryController],
    providers: [CheckInventoryService, DatabaseService],
})
export class CheckInventoryModule {}

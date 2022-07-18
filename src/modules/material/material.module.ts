import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { MaterialService } from './service/material.service';
import { MaterialController } from './material.controller';

@Module({
    controllers: [MaterialController],
    providers: [MaterialService, DatabaseService],
})
export class MaterialModule {}

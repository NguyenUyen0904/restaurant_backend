import { MaterialService } from './../material/service/material.service';
import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { ConvertMaterialService } from './service/convert_material.service';
import { ConvertMaterialController } from './convert_material.controller';

@Module({
    controllers: [ConvertMaterialController],
    providers: [ConvertMaterialService, MaterialService, DatabaseService],
})
export class ConvertMaterialModule {}

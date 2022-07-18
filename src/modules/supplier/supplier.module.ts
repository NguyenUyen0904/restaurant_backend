import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { SupplierService } from './service/supplier.service';
import { SupplierController } from './supplier.controller';

@Module({
    controllers: [SupplierController],
    providers: [SupplierService, DatabaseService],
})
export class SupplierModule {}

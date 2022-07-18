import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingImportMaterial1720963593406 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const importMaterials = [
            {
                supplierId: 1,
                warehouseStaffId: 1,
                totalPaymentImport: 2500000,
                note: '123',
                status: 'APPROVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.ImportMaterials)
            .insert(importMaterials);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.ImportMaterials)
            .delete({});
    }
}

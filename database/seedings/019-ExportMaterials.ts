import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingExportMaterial1720963593408 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const exportMaterials = [
            {
                transporters: 'Transporters 1',
                warehouseStaffId: 1,
                totalPaymentExport: 2500000,
                note: '123',
                status: 'APPROVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.ExportMaterials)
            .insert(exportMaterials);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.ExportMaterials)
            .delete({});
    }
}

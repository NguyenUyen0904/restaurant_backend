import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingExportMaterialOrder1720963593409
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        const exportMaterialOrders = [
            {
                materialId: 1,
                quantity: 1,
                pricePerUnit: 2500000,
                exportMaterialId: 1,
                note: '123',
                status: 'APPROVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.ExportMaterialOrders)
            .insert(exportMaterialOrders);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.ExportMaterialOrders)
            .delete({});
    }
}

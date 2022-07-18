import { CheckInventoryDetail } from './../../src/modules/check-inventory-detail/entity/check_inventory_detail.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingCheckInventoryDetail1720963593409
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        const CheckInventoryDetails = [
            {
                materialId: 1,
                inventoryQuantity: 1,
                damagedQuantity: 10,
                checkInventoryId: 1,
                note: '123',
                status: 'APPROVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.CheckInventoryDetails)
            .insert(CheckInventoryDetails);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.CheckInventoryDetails)
            .delete({});
    }
}

import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingCheckInventory1720963593410 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const checkInventories = [
            {
                warehouseStaffId: 1,
                note: '123',
                status: 'APPROVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.CheckInventories)
            .insert(checkInventories);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.CheckInventories)
            .delete({});
    }
}

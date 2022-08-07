import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingMaterial1720963593404 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const materials = [
            {
                material: 'Chicken',
                unit: 'kg',
                quantity: 99,
                limitOver: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
            {
                material: 'Vegestable',
                unit: 'box',
                quantity: 12,
                limitOver: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.Materials)
            .insert(materials);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.Materials)
            .delete({});
    }
}

import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingConvertMaterial1720963593405 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const convertHistories = [
            {
                idMaterialFrom: 1,
                idMaterialTo: 1,
                note: '123',
                quantityBeforeConvertFrom: 25,
                quantityBeforeConvertTo: 25,
                quantityFrom: 12,
                quantityTo: 11,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.ConvertHistories)
            .insert(convertHistories);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.ConvertHistories)
            .delete({});
    }
}

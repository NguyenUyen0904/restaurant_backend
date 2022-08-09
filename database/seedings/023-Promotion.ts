import { Promotion } from './../../src/modules/promotion/entity/promotion.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingPromotion1720963593410 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const promotions = [
            {
                name: 'Khai trương',
                percent: 50,
                node: 'check',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
            {
                name: 'Quốc khánh',
                percent: 30,
                node: 'check',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.Promotions)
            .insert(promotions);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.Promotions)
            .delete({});
    }
}

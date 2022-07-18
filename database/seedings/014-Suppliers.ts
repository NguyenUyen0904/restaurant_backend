import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { TABLE_NAME } from '../constant';
dotenv.config();

export class SeedingSupplier1720963593403 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const suppliers = [
            {
                name: 'Beefsteak',
                phone: '123321122',
                address: '99 Dai La',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
            {
                name: 'Winmart',
                phone: '1299665122',
                address: '99 Hai Ba Trung',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
            {
                name: 'BMart',
                phone: '123325651',
                address: '1 Truong Chinh',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 1,
                updatedBy: 1,
            },
        ];
        await queryRunner.manager
            .getRepository(TABLE_NAME.Suppliers)
            .insert(suppliers);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager
            .getRepository(TABLE_NAME.Suppliers)
            .delete({});
    }
}

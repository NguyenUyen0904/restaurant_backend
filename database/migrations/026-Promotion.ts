import { PromotionStatus } from './../../src/modules/promotion/promotion.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TABLE_NAME } from '../constant';

export class Promotion1632891593050 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME.Promotions,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'percent',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: Object.values(PromotionStatus),
                        isNullable: true,
                    },
                    {
                        name: 'note',
                        type: 'varchar',
                        length: '2000',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'createdBy',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'updatedBy',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'deletedBy',
                        type: 'int',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(TABLE_NAME.Promotions);
    }
}

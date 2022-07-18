import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TABLE_NAME } from '../constant';

export class ConvertHistory1632891593041 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME.ConvertHistories,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'idMaterialFrom',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'quantityBeforeConvertFrom',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'quantityFrom',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'idMaterialTo',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'quantityBeforeConvertTo',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'quantityTo',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'note',
                        type: 'varchar',
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
        await queryRunner.dropTable(TABLE_NAME.ConvertHistories);
    }
}

import { UserGender, UserStatus } from '../../src/modules/user/user.constant';
import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';
import { TABLE_NAME } from '../constant';

export class User1632891593011 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME.Users,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'fullName',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'birthday',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'phoneNumber',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'address',
                        type: 'varchar',
                        length: '2000',
                        isNullable: true,
                    },
                    {
                        name: 'hometownAddress',
                        type: 'varchar',
                        length: '2000',
                        isNullable: true,
                    },
                    {
                        name: 'gender',
                        type: 'enum',
                        enum: Object.values(UserGender),
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: Object.values(UserStatus),
                        default: `'${UserStatus.WAITING_FOR_APPROVAL}'`,
                    },
                    {
                        name: 'fingerId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'lastLoginAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'avatarId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'roleId',
                        type: 'int',
                    },
                    {
                        name: 'provinceId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'idCardIssuePlace',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'taxCode',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'socialInsurance',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'bank',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'bankAccount',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'citizenId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'citizenIdIssuedAt',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'note',
                        type: 'varchar',
                        length: '2500',
                        isNullable: true,
                    },
                    {
                        name: 'position',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'isSuperAdmin',
                        type: 'int',
                        default: 0,
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

        await queryRunner.createForeignKey(
            TABLE_NAME.Users,
            new TableForeignKey({
                columnNames: ['roleId'],
                referencedTableName: TABLE_NAME.Roles,
                referencedColumnNames: ['id'],
            }),
        );

        await queryRunner.createForeignKey(
            TABLE_NAME.Users,
            new TableForeignKey({
                columnNames: ['provinceId'],
                referencedTableName: TABLE_NAME.Provinces,
                referencedColumnNames: ['id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(TABLE_NAME.Users);
    }
}

import { TABLE_NAME } from '../constant';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedingPermissions1720963593398 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`insert into ${TABLE_NAME.Permissions} (actionId, resourceId, createdBy) values
        (1, 1, 1), (2, 1, 1), (3, 1, 1), (4, 1, 1),
        (1, 2, 1), (2, 2, 1), (3, 2, 1), (4, 2, 1), (5, 2, 1), (6, 2, 1),
        (1, 3, 1), (3, 3, 1), 
        (1, 4, 1), (2, 4, 1), (3, 4, 1), 
        (1, 5, 1), (2, 5, 1), (3, 5, 1), (4, 5, 1),
        (1, 6, 1), (2, 6, 1), (3, 6, 1), (4, 6, 1),
        (1, 7, 1), (2, 7, 1), (3, 7, 1), (4, 7, 1), (7, 7, 1),
        (1, 8, 1), (2, 8, 1), (7, 8, 1), (8, 8, 1),
        (1, 9, 1), (2, 9, 1), (3, 9, 1), (4, 9, 1),
        (1, 10, 1), (2, 10, 1), (3, 10, 1), (8, 10, 1),
        (1, 11, 1), (2, 11, 1), (3, 11, 1), 
        (1, 12, 1), (2, 12, 1), (3, 12, 1),(8, 12, 1),
        (1, 13, 1), (2, 13, 1), (3, 13, 1), (8, 13, 1),
        (1, 14, 1), (3, 14, 1),
        (1, 15, 1), (3, 15, 1),
        (1, 16, 1), (2, 16, 1), (3, 16, 1), (4, 16, 1),
        (1, 17, 1), (2, 17, 1), (3, 17, 1), (4, 17, 1),
        (1, 18, 1), (2, 18, 1), (3, 18, 1), (4, 18, 1)
        ;`);
    }

    public async down(queryRunner: QueryRunner) {
        const ids = [];
        for (let i = 1; i <= 60; i++) {
            ids.push(i);
        }
        await queryRunner.query(
            `delete from ${TABLE_NAME.Permissions} where id in (${ids.join(
                ',',
            )})`,
        );
    }
}

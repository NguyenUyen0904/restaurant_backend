import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { AcceptStatus } from 'src/modules/common/common.constant';

@Entity({ name: 'check_inventories' })
export class CheckInventory extends BaseEntity {
    @Column({ nullable: true })
    warehouseStaffId: number;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'warehouseStaffId',
    })
    warehouseStaff: User;

    @Column({ length: 2000, nullable: true })
    note: string;

    @Column({ nullable: true })
    status: AcceptStatus;
}

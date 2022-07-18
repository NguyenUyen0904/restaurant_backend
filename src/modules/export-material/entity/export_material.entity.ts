import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { AcceptStatus } from 'src/modules/common/common.constant';

@Entity({ name: 'export_materials' })
export class ExportMaterial extends BaseEntity {
    @Column({ length: 2000, nullable: true })
    transporters: string;

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
    totalPaymentExport: number;

    @Column({ nullable: true })
    status: AcceptStatus;
}

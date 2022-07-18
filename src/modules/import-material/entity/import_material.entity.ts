import { User } from 'src/modules/user/entity/user.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Supplier } from 'src/modules/supplier/entity/supplier.entity';
import { AcceptStatus } from 'src/modules/common/common.constant';

@Entity({ name: 'import_materials' })
export class ImportMaterial extends BaseEntity {
    @Column({ nullable: true })
    supplierId: number;

    @ManyToOne(() => Supplier)
    @JoinColumn({
        name: 'supplierId',
    })
    supplier: Supplier;

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
    totalPaymentImport: number;

    @Column({ nullable: true })
    status: AcceptStatus;
}

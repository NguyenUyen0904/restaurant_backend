import { CheckInventory } from './../../check-inventory/entity/check_inventory.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Material } from 'src/modules/material/entity/material.entity';
import { AcceptStatus } from 'src/modules/common/common.constant';

@Entity({ name: 'check_inventory_details' })
export class CheckInventoryDetail extends BaseEntity {
    @Column({ nullable: true })
    materialId: number;

    @ManyToOne(() => Material)
    @JoinColumn({
        name: 'materialId',
    })
    material: Material;

    @Column({ nullable: true })
    inventoryQuantity: number;

    @Column({ nullable: true })
    damagedQuantity: number;

    @Column({ length: 2000, nullable: true })
    note: string;

    @Column({ nullable: true })
    checkInventoryId: number;

    @ManyToOne(() => CheckInventory)
    @JoinColumn({
        name: 'checkInventoryId',
    })
    checkInventory: CheckInventory;

    @Column({ nullable: true })
    status: AcceptStatus;
}

import { ImportMaterial } from './../../import-material/entity/import_material.entity';
import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Material } from 'src/modules/material/entity/material.entity';
import { AcceptStatus } from 'src/modules/common/common.constant';

@Entity({ name: 'import_material_orders' })
export class ImportMaterialOrder extends BaseEntity {
    @Column({ nullable: true })
    materialId: number;

    @ManyToOne(() => Material)
    @JoinColumn({
        name: 'materialId',
    })
    material: Material;

    @Column({ nullable: true })
    pricePerUnit: number;

    @Column({ nullable: true })
    quantity: number;

    @Column({ length: 2000, nullable: true })
    note: string;

    @Column({ nullable: true })
    importMaterialId: number;

    @ManyToOne(() => ImportMaterial)
    @JoinColumn({
        name: 'importMaterialId',
    })
    importMaterial: ImportMaterial;

    @Column({ nullable: true })
    status: AcceptStatus;
}

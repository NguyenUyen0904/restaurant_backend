import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Material } from 'src/modules/material/entity/material.entity';
import { ExportMaterial } from 'src/modules/export-material/entity/export_material.entity';
import { AcceptStatus } from 'src/modules/common/common.constant';

@Entity({ name: 'export_material_orders' })
export class ExportMaterialOrder extends BaseEntity {
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
    exportMaterialId: number;

    @ManyToOne(() => ExportMaterial)
    @JoinColumn({
        name: 'exportMaterialId',
    })
    exportMaterial: ExportMaterial;

    @Column({ nullable: true })
    status: AcceptStatus;
}

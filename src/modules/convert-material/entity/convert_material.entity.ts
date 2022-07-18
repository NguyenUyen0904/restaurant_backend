import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';
import { Material } from 'src/modules/material/entity/material.entity';
import { User } from 'src/modules/user/entity/user.entity';

@Entity({ name: 'convert_histories' })
export class ConvertMaterial extends BaseEntity {
    @Column({ nullable: true })
    idMaterialFrom: number;

    @ManyToOne(() => Material)
    @JoinColumn({
        name: 'idMaterialFrom',
    })
    materialFrom: Material;

    @Column({ nullable: true })
    quantityBeforeConvertFrom: number;

    @Column({ nullable: true })
    quantityFrom: number;

    @Column({ nullable: true })
    idMaterialTo: number;

    @ManyToOne(() => Material)
    @JoinColumn({
        name: 'idMaterialTo',
    })
    materialTo: Material;

    @Column({ nullable: true })
    quantityBeforeConvertTo: number;

    @Column({ nullable: true })
    quantityTo: number;

    @Column({ length: 255, nullable: true })
    note: string;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'createdBy',
    })
    performer: User;
}

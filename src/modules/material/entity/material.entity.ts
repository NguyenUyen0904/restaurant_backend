import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'materials' })
export class Material extends BaseEntity {
    @Column({ length: 255, nullable: true })
    material: string;

    @Column({ nullable: true })
    limitOver: number;

    @Column({ length: 2000, nullable: true })
    unit: string;

    @Column({ nullable: true })
    quantity: number;
}

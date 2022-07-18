import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'suppliers' })
export class Supplier extends BaseEntity {
    @Column({ length: 255, nullable: true })
    name: string;

    @Column({ length: 2000, nullable: true })
    phone: string;

    @Column({ length: 2000, nullable: true })
    address: string;
}

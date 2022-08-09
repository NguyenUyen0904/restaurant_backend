import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'promotions' })
export class Promotion extends BaseEntity {
    @Column({ length: 2000, nullable: true })
    name: string;

    @Column({ nullable: true })
    percent: number;

    @Column({ length: 2000, nullable: true })
    note: string;
}

import { TableStatus } from '../tableDiagram.constant';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/BaseEntity';

@Entity({ name: 'tables_restaurants' })
export class TablesRestaurant extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column({
        type: 'enum',
        enum: TableStatus,
        nullable: true,
    })
    status: TableStatus;

    @Column({ length: 255, nullable: false })
    nameCustomer: string;

    @Column({ length: 255, nullable: true })
    phone: string;

    @Column({ type: 'datetime', nullable: true })
    arrivalTime: Date;

    @Column({ nullable: true })
    numberSeat: number;
}

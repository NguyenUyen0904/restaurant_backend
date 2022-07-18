import { TableStatus } from './../../../booking/booking.constant';
export interface TableDetailResponseDto {
    id: number;
    nameCustomer: string;
    status?: TableStatus;
}

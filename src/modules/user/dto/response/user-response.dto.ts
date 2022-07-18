import { Province } from 'src/modules/user/entity/province.entity';
import { UserGender, UserStatus } from '../../user.constant';
import { Role } from 'src/modules/role/entity/role.entity';

export class UserResponseDto {
    id: number;
    email: string;
    fullName: string;
    birthday?: Date;
    phoneNumber?: string;
    bank?: string;
    bankAccount?: string;
    taxCode?: string;
    citizenId?: string;
    socialInsurance?: string;
    note?: string;
    address?: string;
    hometownAddress?: string;
    gender?: UserGender;
    role?: Role;
    province?: Province;
    status?: UserStatus;
    position: string;
    lastLoginAt?: Date;
    citizenIdIssuedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
    idCardIssuePlace?: string;
    avatar?: Record<string, string>;
    fingerId?: number;
}

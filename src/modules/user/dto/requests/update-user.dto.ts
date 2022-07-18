import * as Joi from 'joi';
import { userFields, UserGender } from '../../user.constant';

export const UpdateUserSchema = Joi.object().keys({
    ...userFields,
    gender: Joi.string()
        .valid(...Object.values(UserGender))
        .required()
        .label('auth.fields.gender'),
});

export class UpdateUserDto {
    fullName: string;
    phoneNumber: string;
    birthday: Date;
    citizenIdIssuedAt: Date;
    address: string;
    bank: string;
    bankAccount: string;
    note: string;
    taxCode: string;
    socialInsurance: string;
    citizenId: string;
    hometownAddress: string;
    idCardIssuePlace: string;
    gender: UserGender;
    roleId: number;
    provinceId: number;
    position?: string;
}

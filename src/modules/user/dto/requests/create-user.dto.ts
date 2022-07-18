import { userFields, UserGender } from '../../user.constant';

import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import {
    DATE_TIME_FORMAT,
    INPUT_MIN_DATE,
    INPUT_PHONE_MAX_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    MAX_BANK_ACCOUNT_LENGTH,
    MAX_CITIZEN_ID_LENGTH,
    MAX_INTEGER,
    MAX_SOCIAL_INSURANCE_LENGTH,
    MAX_TAX_CODE_LENGTH,
    MIN_BANK_ACCOUNT_LENGTH,
    MIN_CITIZEN_ID_LENGTH,
    MIN_SOCIAL_INSURANCE_LENGTH,
    MIN_TAX_CODE_LENGTH,
    REGEX,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';
export const CreateUserSchema = Joi.object().keys({
    ...userFields,
    email: Joi.string()
        .regex(REGEX.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('user.fields.email'),
    password: Joi.string()
        .allow(null)
        .min(8)
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .label('user.fields.password'),
    gender: Joi.string()
        .valid(...Object.values(UserGender))
        .required()
        .label('user.fields.gender'),
});

export const ImportUserSchema = Joi.object().keys({
    importUsers: Joi.array()
        .items(
            Joi.object().keys({
                index: Joi.number().min(0).max(MAX_INTEGER).required(),
                email: Joi.string()
                    .regex(REGEX.EMAIL)
                    .max(INPUT_TEXT_MAX_LENGTH)
                    .required(),
                fullName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
                phoneNumber: Joi.string()
                    .allow(null)
                    .regex(RegExp(REGEX.PHONE_NUMBER))
                    .max(INPUT_PHONE_MAX_LENGTH)
                    .required(),
                birthday: Joi.date()
                    .allow(null)
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                    .min(INPUT_MIN_DATE)
                    .less('now')
                    .required(),
                gender: Joi.string()
                    .allow(null)
                    .valid(...Object.values(UserGender))
                    .required(),
                position: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
                role: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
                bankAccount: Joi.string()
                    .max(MAX_BANK_ACCOUNT_LENGTH)
                    .min(MIN_BANK_ACCOUNT_LENGTH)
                    .required(),
                bank: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
                citizenId: Joi.string()
                    .max(MAX_CITIZEN_ID_LENGTH)
                    .min(MIN_CITIZEN_ID_LENGTH)
                    .required(),
                citizenIdIssuedAt: Joi.date()
                    .allow(null)
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                    .min(INPUT_MIN_DATE)
                    .less('now')
                    .required(),
                idCardIssuePlace: Joi.string()
                    .max(INPUT_TEXT_MAX_LENGTH)
                    .required(),
                address: Joi.string()
                    .allow(null)
                    .allow('')
                    .max(TEXTAREA_MAX_LENGTH)
                    .optional(),
                hometownAddress: Joi.string()
                    .allow(null, '')
                    .max(TEXTAREA_MAX_LENGTH)
                    .optional(),
                taxCode: Joi.string()
                    .allow(null, '')
                    .max(MAX_TAX_CODE_LENGTH)
                    .min(MIN_TAX_CODE_LENGTH),
                socialInsurance: Joi.string()
                    .allow(null, '')
                    .max(MAX_SOCIAL_INSURANCE_LENGTH)
                    .min(MIN_SOCIAL_INSURANCE_LENGTH),
                note: Joi.string()
                    .allow(null, '')
                    .max(TEXTAREA_MAX_LENGTH)
                    .optional(),
                province: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
            }),
        )
        .unique('email')
        .unique('taxCode')
        .unique('bankAccount')
        .unique('citizenId')
        .unique('socialInsurance', { ignoreUndefined: true }),
});
export class CreateUserDto {
    email: string;
    fullName: string;
    password?: string;
    phoneNumber: string;
    birthday?: Date;
    citizenIdIssuedAt?: Date;
    address?: string;
    bank?: string;
    bankAccount?: string;
    note?: string;
    taxCode?: string;
    socialInsurance?: string;
    citizenId?: string;
    hometownAddress?: string;
    idCardIssuePlace?: string;
    gender?: UserGender;
    roleId?: number;
    provinceId?: number;
    position?: string;
    createdBy: number;
}

export interface ImportUserDto {
    email: string;
    fullName: string;
    phoneNumber: string;
    birthday: Date;
    gender: UserGender;
    position: string;
    role: string;
    roleId: number;
    bankAccount: string;
    bank: string;
    citizenId: string;
    citizenIdIssuedAt: Date;
    idCardIssuePlace: string;
    address?: string;
    hometownAddress?: string;
    taxCode?: string;
    note?: string;
    province?: string;
    provinceId?: number;
    socialInsurance?: string;
    index: number;
}

export class ImportUsersDto {
    importUsers: ImportUserDto[];
}

import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
import {
    INPUT_TEXT_MAX_LENGTH,
    REGEX,
    MAX_INTEGER,
    DATE_TIME_FORMAT,
    INPUT_PHONE_MAX_LENGTH,
} from '../../common/constants';

const Joi = BaseJoi.extend(JoiDate);

export enum TableOrderBy {
    NAME = 'name',
    CREATED_AT = 'createdAt',
}

export enum TableStatus {
    BOOKED = 'booked',
    USED = 'used',
    READY = 'ready',
}

export const TableSchema = {
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH),
    status: Joi.string()
        .allow(null)
        .valid(TableStatus.BOOKED, TableStatus.USED, TableStatus.READY)
        .optional()
        .label('booking.fields.status'),
    nameCustomer: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('booking.fields.name'),
    phone: Joi.string()
        .allow(null)
        .regex(RegExp(REGEX.PHONE_NUMBER))
        .max(INPUT_PHONE_MAX_LENGTH)
        .optional()
        .label('user.fields.phoneNumber'),
    arrivalTime: Joi.date()
        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
        .label('recruitment.fields.candidateInterview.dateTime'),
    numberSeat: Joi.number()
        .positive()
        .max(MAX_INTEGER)
        .label('user.fields.role'),
};

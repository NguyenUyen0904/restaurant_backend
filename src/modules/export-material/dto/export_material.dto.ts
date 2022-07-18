import { MAX_INTEGER } from '../../../common/constants';
import * as BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import {
    INPUT_TEXT_MAX_LENGTH,
    MAX_PAGE,
    MAX_PAGE_SIZE,
    MIN_PAGE,
    MIN_PAGE_SIZE,
    ORDER_DIRECTION,
} from 'src/common/constants';
import { OrderBy } from '../export_material.constant';
import { AcceptStatus } from 'src/modules/common/common.constant';

export const ExportMaterialListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    orderBy: Joi.string()
        .optional()
        .allow(null, '')
        .valid(...Object.values(OrderBy)),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .allow(null, ''),
});

export const ExportMaterialSchema = {
    note: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    transporters: Joi.string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .allow(null, ''),
    warehouseStaffId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    totalPaymentExport: Joi.number()
        .max(MAX_INTEGER)
        .optional()
        .allow(null, ''),
    status: Joi.string()
        .valid(...Object.values(AcceptStatus))
        .optional()
        .allow(null, ''),
};

export const CreateExportMaterialSchema = Joi.object().keys({
    ...ExportMaterialSchema,
});

export const UpdateExportMaterialSchema = Joi.object().keys({
    ...ExportMaterialSchema,
});

export class ExportMaterialQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
}

export class CreateExportMaterialDto {
    transporters: string;
    warehouseStaffId: number;
    totalPaymentExport: number;
    status: AcceptStatus;
    note: string;
    createdBy?: number;
}

export class UpdateExportMaterialDto {
    status?: AcceptStatus;
    updatedBy?: number;
}

export class ExportMaterialDetailResponseDto {
    id: number;
    transporters: string;
    warehouseStaffId: number;
    totalPaymentExport: number;
    status: AcceptStatus;
    note: string;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

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
import { OrderBy } from '../export_material_order.constant';
import { AcceptStatus } from 'src/modules/common/common.constant';

export const ExportMaterialOrderListQueryStringSchema = Joi.object().keys({
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional(),
    limit: Joi.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).optional(),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    exportMaterialId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    orderBy: Joi.string()
        .optional()
        .allow(null, '')
        .valid(...Object.values(OrderBy)),
    orderDirection: Joi.string()
        .valid(...Object.values(ORDER_DIRECTION))
        .optional()
        .allow(null, ''),
});

export const ExportMaterialOrderSchema = {
    materialId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    pricePerUnit: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    quantity: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    note: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    exportMaterialId: Joi.number().max(MAX_INTEGER).optional().allow(null, ''),
    status: Joi.string()
        .valid(...Object.values(AcceptStatus))
        .optional()
        .allow(null, ''),
};

export const CreateExportMaterialOrderSchema = Joi.object().keys({
    ...ExportMaterialOrderSchema,
});

export const UpdateExportMaterialOrderSchema = Joi.object().keys({
    ...ExportMaterialOrderSchema,
});

export class ExportMaterialOrderQueryStringDto {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: OrderBy;
    orderDirection?: ORDER_DIRECTION;
    exportMaterialId?: number;
}

export class CreateExportMaterialOrderDto {
    materialId: number;
    pricePerUnit: number;
    quantity: number;
    note: string;
    exportMaterialId: number;
    status: AcceptStatus;
    createdBy?: number;
}

export class UpdateExportMaterialOrderDto {
    status?: AcceptStatus;
    updatedBy?: number;
}

export class ExportMaterialOrderDetailResponseDto {
    id: number;
    materialId: number;
    pricePerUnit: number;
    quantity: number;
    note: string;
    exportMaterialId: number;
    status: AcceptStatus;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

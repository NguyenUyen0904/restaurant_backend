import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { DatabaseService } from 'src/common/services/database.service';
import {
    ErrorResponse,
    SuccessResponse,
} from 'src/common/helpers/api.response';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { HttpStatus } from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import {
    CreateExportMaterialOrderDto,
    CreateExportMaterialOrderSchema,
    ExportMaterialOrderListQueryStringSchema,
    ExportMaterialOrderQueryStringDto,
    UpdateExportMaterialOrderDto,
    UpdateExportMaterialOrderSchema,
} from './dto/export_material_order.dto';
import { ExportMaterialOrder } from './entity/export_material_order.entity';
import { ExportMaterialOrderService } from './service/export_material_order.service';
import { AcceptStatus } from '../common/common.constant';

@Controller('export-material-order')
@UseGuards(JwtGuard, AuthorizationGuard)
export class ExportMaterialOrderController {
    constructor(
        private readonly exportMaterialOrderService: ExportMaterialOrderService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    async getExportMaterialOrders(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(ExportMaterialOrderListQueryStringSchema),
        )
        query: ExportMaterialOrderQueryStringDto,
    ) {
        try {
            const materialList =
                await this.exportMaterialOrderService.getExportMaterialOrderList(
                    query,
                );
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getExportMaterialOrder(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.exportMaterialOrderService.getExportMaterialOrderDetail(
                    id,
                );
            if (!material) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    async createExportMaterialOrder(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateExportMaterialOrderSchema),
        )
        body: CreateExportMaterialOrderDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            body.status = AcceptStatus.WAITING_APPROVE;
            const newExportMaterialOrder =
                await this.exportMaterialOrderService.createExportMaterialOrder(
                    body,
                );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newExportMaterialOrder },
            });
            return new SuccessResponse(newExportMaterialOrder);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    async updateExportMaterialOrderStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateExportMaterialOrderSchema),
        )
        body: UpdateExportMaterialOrderDto,
    ) {
        try {
            const oldExportMaterialOrder =
                await this.databaseService.getDataById(ExportMaterialOrder, id);
            if (!oldExportMaterialOrder) {
                const message = await this.i18n.translate(
                    'material.message.materialNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const material =
                await this.exportMaterialOrderService.updateExportMaterialOrderStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                ExportMaterialOrder,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldExportMaterialOrder },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

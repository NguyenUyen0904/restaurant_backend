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
    CreateExportMaterialDto,
    CreateExportMaterialSchema,
    ExportMaterialListQueryStringSchema,
    ExportMaterialQueryStringDto,
    UpdateExportMaterialDto,
    UpdateExportMaterialSchema,
} from './dto/export_material.dto';
import { ExportMaterial } from './entity/export_material.entity';
import { ExportMaterialService } from './service/export_material.service';
import { AcceptStatus } from '../common/common.constant';
import { CommonDropdownService } from '../common/services/common-dropdown.service';
import { ExportMaterialOrderService } from '../export-material-order/service/export_material_order.service';
import { CreateExportMaterialOrderDto } from '../export-material-order/dto/export_material_order.dto';

@Controller('export-material')
@UseGuards(JwtGuard, AuthorizationGuard)
export class ExportMaterialController {
    constructor(
        private readonly commonDropdownService: CommonDropdownService,
        private readonly exportMaterialOrderService: ExportMaterialOrderService,
        private readonly exportMaterialService: ExportMaterialService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    async getExportExportMaterials(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(ExportMaterialListQueryStringSchema),
        )
        query: ExportMaterialQueryStringDto,
    ) {
        try {
            const materialList =
                await this.exportMaterialService.getExportMaterialList(query);
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getExportMaterial(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.exportMaterialService.getExportMaterialDetail(id);
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
    async createExportMaterial(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateExportMaterialSchema),
        )
        body: CreateExportMaterialDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            body.warehouseStaffId = req.loginUser.id;
            body.status = AcceptStatus.WAITING_APPROVE;
            const newExportMaterial =
                await this.exportMaterialService.createExportMaterial(body);
            // const materials = this.commonDropdownService.getListMaterial({});
            // const exportBody = (await materials).items.map(
            //     (item) =>
            //         ({
            //             materialId: item.id,
            //             pricePerUnit: 0,
            //             quantity: 0,
            //             note: '',
            //             exportMaterialId: newExportMaterial.id,
            //             status: AcceptStatus.APPROVE,
            //         } as CreateExportMaterialOrderDto),
            // );
            // await this.exportMaterialOrderService.bulkCreateImportMaterialOrders(
            //     exportBody,
            // );
            return new SuccessResponse(newExportMaterial);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    async updateExportMaterialStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateExportMaterialSchema),
        )
        body: UpdateExportMaterialDto,
    ) {
        try {
            const oldExportMaterial = await this.databaseService.getDataById(
                ExportMaterial,
                id,
            );
            if (!oldExportMaterial) {
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
                await this.exportMaterialService.updateExportMaterialStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                ExportMaterial,
                id,
            );
            if (
                body.status === AcceptStatus.APPROVE &&
                oldExportMaterial.status != AcceptStatus.APPROVE
            ) {
                this.exportMaterialService.updateQuantityMaterialInWareHouse(
                    id,
                );
                this.exportMaterialService.updateTotalPayment(id);
            }
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldExportMaterial },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

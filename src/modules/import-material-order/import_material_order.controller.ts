import { ImportMaterial } from './../import-material/entity/import_material.entity';
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
import {
    AuthorizationGuard,
    Permissions,
} from 'src/common/guards/authorization.guard';
import {
    PermissionResources,
    PermissionActions,
} from 'src/modules/role/role.constants';
import { HttpStatus } from 'src/common/constants';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/remove.empty.query.pipe';
import { TrimObjectPipe } from 'src/common/pipes/trim.object.pipe';
import {
    CreateImportMaterialOrderDto,
    CreateImportMaterialOrderSchema,
    ImportMaterialDetailExcelDto,
    ImportMaterialDetailExcelSchema,
    ImportMaterialDetailExcelsDto,
    ImportMaterialOrderListQueryStringSchema,
    ImportMaterialOrderQueryStringDto,
    UpdateImportMaterialOrderDto,
    UpdateImportMaterialOrderSchema,
} from './dto/import_material_order.dto';
import { ImportMaterialOrder } from './entity/import_material_order.entity';
import { ImportMaterialOrderService } from './service/import_material_order.service';
import { AcceptStatus } from '../common/common.constant';
import { ImportMaterialService } from '../import-material/service/import_material.service';
import { uniq } from 'lodash';
import { ImportMaterialDetailExcelService } from './service/import_material_order.import_excel.service';

@Controller('import-material-order')
@UseGuards(JwtGuard, AuthorizationGuard)
export class ImportMaterialOrderController {
    constructor(
        private readonly importMaterialOrderService: ImportMaterialOrderService,
        private readonly importMaterialDetailExcelService: ImportMaterialDetailExcelService,
        private readonly importMaterialService: ImportMaterialService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getImportMaterialOrders(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(ImportMaterialOrderListQueryStringSchema),
        )
        query: ImportMaterialOrderQueryStringDto,
    ) {
        try {
            const materialList =
                await this.importMaterialOrderService.getImportMaterialOrderList(
                    query,
                );
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.READ}`,
    ])
    async getImportMaterialOrder(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.importMaterialOrderService.getImportMaterialOrderDetail(
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
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.CREATE}`,
    ])
    async createImportMaterialOrder(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateImportMaterialOrderSchema),
        )
        body: CreateImportMaterialOrderDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            body.status = AcceptStatus.WAITING_APPROVE;
            const newImportMaterialOrder =
                await this.importMaterialOrderService.createImportMaterialOrder(
                    body,
                );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newImportMaterialOrder },
            });
            return new SuccessResponse(newImportMaterialOrder);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.UPDATE}`,
    ])
    async updateImportMaterialOrderStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateImportMaterialOrderSchema),
        )
        body: UpdateImportMaterialOrderDto,
    ) {
        try {
            const oldImportMaterialOrder =
                await this.databaseService.getDataById(ImportMaterialOrder, id);
            if (!oldImportMaterialOrder) {
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
                await this.importMaterialOrderService.updateImportMaterialOrderStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                ImportMaterialOrder,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldImportMaterialOrder },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('bulk-create')
    @Permissions([
        `${PermissionResources.STORE_IMPORT_MATERIAL}_${PermissionActions.CREATE}`,
    ])
    async importMaterialDetailExcel(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(ImportMaterialDetailExcelSchema),
        )
        body: ImportMaterialDetailExcelsDto,
    ) {
        try {
            const materialList =
                await this.importMaterialDetailExcelService.getMaterials(
                    uniq(
                        body.importMaterialDetailExcelDto.map(
                            (item) => item.material,
                        ),
                    ),
                );

            const validationResults = await Promise.all(
                body.importMaterialDetailExcelDto.map((item) =>
                    this.importMaterialDetailExcelService.validateImportMaterialDetailExcel(
                        item,
                        materialList,
                    ),
                ),
            );

            let importAssetResults;
            validationResults.forEach((validationResult) => {
                importAssetResults = {
                    ...importAssetResults,
                    [validationResult.index]: validationResult.validationResult,
                };
            });

            if (
                !validationResults.some(
                    (validationResult) =>
                        !validationResult.validationResult.isValid,
                )
            ) {
                this.importMaterialDetailExcelService.bulkCreateImportMaterialOrders(
                    body.importMaterialDetailExcelDto.map((item) => {
                        return this.importMaterialDetailExcelService.mapImportMaterialDetailExcel(
                            item,
                            materialList,
                            req.loginUser?.id,
                        );
                    }),
                );
            }

            return new SuccessResponse({
                results: importAssetResults,
            });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

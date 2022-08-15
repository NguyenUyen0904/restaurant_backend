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
    CreateCheckInventoryDto,
    CreateCheckInventorySchema,
    CheckInventoryListQueryStringSchema,
    CheckInventoryQueryStringDto,
    UpdateCheckInventoryDto,
    UpdateCheckInventorySchema,
} from './dto/check_inventory.dto';
import { CheckInventory } from './entity/check_inventory.entity';
import { CheckInventoryService } from './service/check_inventory.service';
import { AcceptStatus } from '../common/common.constant';
import { CommonDropdownService } from '../common/services/common-dropdown.service';
import { CreateCheckInventoryDetailDto } from '../check-inventory-detail/dto/check_inventory_detail.dto';
import { CheckInventoryDetailService } from '../check-inventory-detail/service/check_inventory_detail.service';

@Controller('check-inventory')
@UseGuards(JwtGuard, AuthorizationGuard)
export class CheckInventoryController {
    constructor(
        private readonly checkInventoryService: CheckInventoryService,
        private readonly checkInventoryDetailService: CheckInventoryDetailService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
        private readonly commonDropdownService: CommonDropdownService,
    ) {}

    @Get()
    async getExportCheckInventorys(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(CheckInventoryListQueryStringSchema),
        )
        query: CheckInventoryQueryStringDto,
    ) {
        try {
            const materialList =
                await this.checkInventoryService.getCheckInventoryList(query);
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getCheckInventory(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.checkInventoryService.getCheckInventoryDetail(id);
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
    async createCheckInventory(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateCheckInventorySchema),
        )
        body: CreateCheckInventoryDto,
    ) {
        try {
            if (await this.checkInventoryService.checkCanCreateInventory()) {
                body.createdBy = req.loginUser.id;
                body.warehouseStaffId = req.loginUser.id;
                body.status = AcceptStatus.WAITING_APPROVE;
                const newCheckInventory =
                    await this.checkInventoryService.createCheckInventory(body);
                const materials = this.commonDropdownService.getListMaterial(
                    {},
                );
                const importBody = (await materials).items.map(
                    (item) =>
                        ({
                            materialId: item.id,
                            inventoryQuantity: 0,
                            damagedQuantity: 0,
                            note: '',
                            checkInventoryId: newCheckInventory.id,
                            status: AcceptStatus.WAITING_APPROVE,
                        } as CreateCheckInventoryDetailDto),
                );
                await this.checkInventoryDetailService.bulkCreateCheckInventoryDetail(
                    importBody,
                );
                return new SuccessResponse(newCheckInventory);
            } else {
                const message = await this.i18n.translate(
                    'check_inventory.message.error.statusExists',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_ALREADY_EXIST,
                    message,
                    [],
                );
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    async updateCheckInventoryStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateCheckInventorySchema),
        )
        body: UpdateCheckInventoryDto,
    ) {
        try {
            const oldCheckInventory = await this.databaseService.getDataById(
                CheckInventory,
                id,
            );
            if (!oldCheckInventory) {
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
                await this.checkInventoryService.updateCheckInventoryStatus(
                    id,
                    body,
                );

            if (
                body?.status === AcceptStatus.APPROVE &&
                !(await this.checkInventoryService.checkCanApproveInventory(id))
            ) {
                const message = await this.i18n.translate(
                    'check_inventory.message.error.itemNotApprove',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_APPROVE,
                    message,
                    [],
                );
            } else {
                this.checkInventoryService.updateQuantityMaterialInWareHouse(
                    id,
                );
            }

            const newValue = await this.databaseService.getDataById(
                CheckInventory,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldCheckInventory },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

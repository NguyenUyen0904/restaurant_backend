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
    CreateCheckInventoryDetailDto,
    CreateCheckInventoryDetailSchema,
    CheckInventoryDetailListQueryStringSchema,
    CheckInventoryDetailQueryStringDto,
    UpdateCheckInventoryDetailDto,
    UpdateCheckInventoryDetailSchema,
} from './dto/check_inventory_detail.dto';
import { CheckInventoryDetail } from './entity/check_inventory_detail.entity';
import { CheckInventoryDetailService } from './service/check_inventory_detail.service';

@Controller('check-inventory-detail')
@UseGuards(JwtGuard, AuthorizationGuard)
export class CheckInventoryDetailController {
    constructor(
        private readonly checkInventoryDetailService: CheckInventoryDetailService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    async getCheckInventoryDetails(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(CheckInventoryDetailListQueryStringSchema),
        )
        query: CheckInventoryDetailQueryStringDto,
    ) {
        try {
            const materialList =
                await this.checkInventoryDetailService.getCheckInventoryDetailList(
                    query,
                );
            return new SuccessResponse(materialList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getCheckInventoryDetail(@Param('id', ParseIntPipe) id: number) {
        try {
            const material =
                await this.checkInventoryDetailService.getCheckInventoryDetailDetail(
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
    async createCheckInventoryDetail(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreateCheckInventoryDetailSchema),
        )
        body: CreateCheckInventoryDetailDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            const newCheckInventoryDetail =
                await this.checkInventoryDetailService.createCheckInventoryDetail(
                    body,
                );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newCheckInventoryDetail },
            });
            return new SuccessResponse(newCheckInventoryDetail);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    async updateCheckInventoryDetailStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdateCheckInventoryDetailSchema),
        )
        body: UpdateCheckInventoryDetailDto,
    ) {
        try {
            const oldCheckInventoryDetail =
                await this.databaseService.getDataById(
                    CheckInventoryDetail,
                    id,
                );
            if (!oldCheckInventoryDetail) {
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
                await this.checkInventoryDetailService.updateCheckInventoryDetailStatus(
                    id,
                    body,
                );
            const newValue = await this.databaseService.getDataById(
                CheckInventoryDetail,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldCheckInventoryDetail },
                newValue: { ...newValue },
            });
            return new SuccessResponse(material);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

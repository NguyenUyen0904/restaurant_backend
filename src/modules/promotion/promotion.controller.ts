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
    Delete,
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
    CreatePromotionDto,
    CreatePromotionSchema,
    PromotionListQueryStringSchema,
    PromotionQueryStringDto,
    UpdatePromotionDto,
    UpdatePromotionSchema,
} from './dto/promotion.dto';
import { Promotion } from './entity/promotion.entity';
import { PromotionService } from './service/promotion.service';
import { PromotionStatus } from './promotion.constant';

@Controller('promotion')
@UseGuards(JwtGuard, AuthorizationGuard)
export class PromotionController {
    constructor(
        private readonly promotionService: PromotionService,
        private readonly i18n: I18nRequestScopeService,
        private readonly databaseService: DatabaseService,
    ) {}

    @Get()
    async getPromotions(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(PromotionListQueryStringSchema),
        )
        query: PromotionQueryStringDto,
    ) {
        try {
            const promotionList = await this.promotionService.getPromotionList(
                query,
            );
            return new SuccessResponse(promotionList);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getPromotion(@Param('id', ParseIntPipe) id: number) {
        try {
            const promotion = await this.promotionService.getPromotionDetail(
                id,
            );
            if (!promotion) {
                const message = await this.i18n.translate(
                    'promotion.message.promotionNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            return new SuccessResponse(promotion);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post()
    async createPromotion(
        @Request() req,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(CreatePromotionSchema),
        )
        body: CreatePromotionDto,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            body.status = PromotionStatus.ACTIVE;
            const newPromotion = await this.promotionService.createPromotion(
                body,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: {},
                newValue: { ...newPromotion },
            });
            return new SuccessResponse(newPromotion);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    async updatePromotionStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body(
            new TrimObjectPipe(),
            new JoiValidationPipe(UpdatePromotionSchema),
        )
        body: UpdatePromotionDto,
    ) {
        try {
            const oldPromotion = await this.databaseService.getDataById(
                Promotion,
                id,
            );
            if (!oldPromotion) {
                const message = await this.i18n.translate(
                    'promotion.message.promotionNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const promotion = await this.promotionService.updatePromotionStatus(
                id,
                body,
            );
            const newValue = await this.databaseService.getDataById(
                Promotion,
                id,
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldPromotion },
                newValue: { ...newValue },
            });
            return new SuccessResponse(promotion);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    async deletePromotion(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ) {
        try {
            const oldPromotion = await this.databaseService.getDataById(
                Promotion,
                id,
            );
            if (!oldPromotion) {
                const message = await this.i18n.translate(
                    'promotion.message.promotionNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            await this.promotionService.deletePromotion(id, req.loginUser.id);

            const message = await this.i18n.translate(
                'promotion.message.deleteSuccess',
            );
            await this.databaseService.recordUserLogging({
                userId: req.loginUser?.id,
                route: req.route,
                oldValue: { ...oldPromotion },
                newValue: {},
            });
            return new SuccessResponse({ id }, message);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

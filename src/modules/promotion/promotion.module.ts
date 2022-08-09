import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './service/promotion.service';

@Module({
    controllers: [PromotionController],
    providers: [PromotionService, DatabaseService],
})
export class PromotionModule {}

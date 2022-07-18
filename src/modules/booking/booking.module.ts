import { Global, Module } from '@nestjs/common';
import { DatabaseService } from 'src/common/services/database.service';
import { TableDiagramService } from '../table-diagram/services/tableDiagram.service';
import { BookingController } from './booking.controller';
import { UpdateBookingStatusJob } from './cron-job/updateBookingStatus.job';
import { BookingService } from './services/booking.service';
@Global()
@Module({
    imports: [],
    providers: [
        BookingService,
        DatabaseService,
        TableDiagramService,
        UpdateBookingStatusJob,
    ],
    controllers: [BookingController],
})
export class BookingModule {}

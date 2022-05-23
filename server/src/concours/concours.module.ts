import { Module } from '@nestjs/common';
import { ConcoursService } from './concours.service';
import { ConcoursController } from './concours.controller';
import { MulterModule } from '@nestjs/platform-express';
import { CONCOURS_FOLDER } from 'src/const';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Concours, ConcoursSchema } from './schema/concours.schema';
import { ConcoursWeek, ConcoursWeekSchema } from './schema/concours-week.schema';
import { ConcoursEntry, ConcoursEntrySchema } from './schema/concours-entry.schema';
import { DrawingsModule } from 'src/drawings/drawings.module';
import { ImageGeneratorModule } from 'src/image-generator/image-generator.module';

@Module({
    imports:[
        MulterModule.register({dest: CONCOURS_FOLDER}),
        MongooseModule.forFeature([{name: Concours.name, schema: ConcoursSchema}]),
        MongooseModule.forFeature([{name: ConcoursWeek.name, schema: ConcoursWeekSchema}]),
        MongooseModule.forFeature([{name: ConcoursEntry.name, schema: ConcoursEntrySchema}]),   
        UsersModule,
        DrawingsModule,
        ImageGeneratorModule
    ],
    providers: [ConcoursService],
    controllers: [ConcoursController],
    exports: [ConcoursService],
})
export class ConcoursModule {}

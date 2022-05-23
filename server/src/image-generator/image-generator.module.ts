import { Module } from '@nestjs/common';
import { DrawingsModule } from 'src/drawings/drawings.module';
import { ImageGeneratorService } from './image-generator.service';

@Module({
    imports: [DrawingsModule],
    providers: [ImageGeneratorService],
    exports: [ImageGeneratorService]
})
export class ImageGeneratorModule {}

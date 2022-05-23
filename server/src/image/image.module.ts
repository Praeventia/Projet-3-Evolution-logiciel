import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { DrawingsModule } from 'src/drawings/drawings.module';
import { ImageGeneratorModule } from 'src/image-generator/image-generator.module';
import { GifModule } from 'src/gif/gif.module';

@Module({
    imports: [DrawingsModule, ImageGeneratorModule, GifModule],
    controllers: [ImageController]
})
export class ImageModule {}

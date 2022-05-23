import { Module } from '@nestjs/common';
import { GifService } from './gif.service';
import { DrawingsModule } from 'src/drawings/drawings.module';

@Module({
    imports: [DrawingsModule],
    providers: [GifService],
    exports: [GifService]
})
export class GifModule {}

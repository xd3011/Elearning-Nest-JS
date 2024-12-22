import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { GroupModule } from '@modules/group/group.module';
import { SubPostController } from './controllers/subPost.controller';
import { SubPostService } from './services/subPost.service';
import { SubPost } from './entities/subPost.entity';
import { ScheduleModule } from '@modules/schedule/schedule.module';
import { WSModule } from '@src/ws/ws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, SubPost]),
    GroupModule,
    ScheduleModule,
    forwardRef(() => WSModule),
  ],
  controllers: [PostController, SubPostController],
  providers: [PostService, SubPostService],
  exports: [PostService, SubPostService],
})
export class PostModule {}

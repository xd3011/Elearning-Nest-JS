import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubPost } from '../entities/subPost.entity';
import { Repository } from 'typeorm';
import { CreateSubPostDto } from '../dto/create-sub-post.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { PostService } from './post.service';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { CBadRequestException } from '@shared/custom-http-exception';
import { UpdateSubPostDto } from '../dto/update-sub-post.dto';

@Injectable()
export class SubPostService {
  constructor(
    @InjectRepository(SubPost)
    private readonly subPostRepository: Repository<SubPost>,
    private readonly postService: PostService,
  ) {}

  async create(createSubPostDto: CreateSubPostDto, user: IUser) {
    await this.postService.findOne(createSubPostDto.postId, user);
    if (createSubPostDto?.reply) {
      await this.findOne(createSubPostDto.reply, user);
    }
    return await this.subPostRepository.save({
      ...createSubPostDto,
      user: { id: user.id },
      post: { id: createSubPostDto.postId },
      reply: createSubPostDto?.reply ? { id: createSubPostDto.reply } : null,
    });
  }

  async findAll(
    postId: number,
    user: IUser,
    offset = 1,
    limit = 10,
    startId?: number,
  ) {
    const skip = (offset - 1) * limit;
    const take = limit;
    // Check post exists and user is member
    await this.postService.findOne(postId, user);

    const query = this.subPostRepository
      .createQueryBuilder('subPost')
      .innerJoinAndSelect('subPost.user', 'user')
      .innerJoinAndSelect('subPost.post', 'post')
      .leftJoinAndSelect('subPost.reply', 'reply')
      .select([
        'subPost',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .addSelect([
        'post.id',
        'post.message',
        'reply.id',
        'reply.message',
        'reply.type',
      ])
      .where('post.id = :postId', { postId });
    if (startId) {
      query.andWhere('subPost.id < :startId', { startId });
    }
    let [subPosts, total] = await query
      .skip(skip)
      .take(take)
      .orderBy('subPost.createdAt', 'DESC')
      .getManyAndCount();
    subPosts.reverse();
    return {
      total,
      page: offset,
      pageSize: limit,
      data: subPosts,
    };
  }

  async findOne(id: number, user: IUser) {
    const query = this.subPostRepository
      .createQueryBuilder('subPost')
      .innerJoinAndSelect('subPost.user', 'user')
      .innerJoinAndSelect('subPost.post', 'post')
      .leftJoinAndSelect('subPost.reply', 'reply')
      .select([
        'subPost',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .addSelect([
        'post.id',
        'post.message',
        'reply.id',
        'reply.message',
        'reply.type',
      ])
      .where('subPost.id = :id', { id });
    const subPost = await query.getOne();
    if (!subPost) {
      throw new CBadRequestException(
        SubPostService.name,
        'Sub post not found',
        ApiResponseCode.SUB_POST_NOT_FOUND,
      );
    }
    return subPost;
  }

  async update(id: number, updateSubPost: UpdateSubPostDto, user: IUser) {
    const subPost = await this.findOne(id, user);
    if (subPost.user.id !== user.id) {
      throw new CBadRequestException(
        SubPostService.name,
        'Cannot update a message from another user',
        ApiResponseCode.SUB_POST_NOT_PERMISSION,
      );
    }
    return await this.subPostRepository.update(
      { id },
      { message: updateSubPost.message },
    );
  }

  async remove(id: number, user: IUser) {
    const subPost = await this.findOne(id, user);
    if (subPost.user.id !== user.id) {
      throw new CBadRequestException(
        SubPostService.name,
        'Cannot delete a message from another user',
        ApiResponseCode.SUB_POST_NOT_PERMISSION,
      );
    }
    return await this.subPostRepository.delete(id);
  }
}

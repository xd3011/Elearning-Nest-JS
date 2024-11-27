import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository, In } from 'typeorm';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const permission = await this.permissionRepository.findOne({
      where: {
        path: createPermissionDto.path,
        method: createPermissionDto.method,
      },
    });
    if (permission) {
      throw new CBadRequestException(
        PermissionService.name,
        'Permission already exists',
        ApiResponseCode.PERMISSION_EXISTED,
      );
    }
    return await this.permissionRepository.save({
      ...createPermissionDto,
    });
  }

  async findAll() {
    const permissions = await this.permissionRepository.find();
    if (!permissions) {
      throw new CBadRequestException(
        PermissionService.name,
        'Permission not found',
        ApiResponseCode.PERMISSION_NOT_FOUND,
      );
    }
    return permissions;
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new CBadRequestException(
        PermissionService.name,
        'Permission not found',
        ApiResponseCode.PERMISSION_NOT_FOUND,
      );
    }
    return permission;
  }

  async findManyByIds(ids: number[]) {
    const [permissions, count] = await this.permissionRepository.findAndCount({
      where: {
        id: In(ids),
      },
    });

    if (count !== ids.length) {
      throw new CBadRequestException(
        PermissionService.name,
        'Permission not found',
        ApiResponseCode.PERMISSION_NOT_FOUND,
      );
    }
    return permissions;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.findOne(id);
    const permission = await this.permissionRepository.findOne({
      where: {
        method: updatePermissionDto.method,
        path: updatePermissionDto.path,
      },
    });
    if (permission) {
      throw new CBadRequestException(
        PermissionService.name,
        'Permission already exists',
        ApiResponseCode.PERMISSION_EXISTED,
      );
    }
    return this.permissionRepository.update(id, updatePermissionDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.permissionRepository.update(
      {
        id,
      },
      {
        deletedAt: new Date(),
      },
    );
  }
}

import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { Permission } from '@modules/permission/entities/permission.entity';
import { PermissionService } from '@modules/permission/permission.service';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { CBadRequestException } from '@shared/custom-http-exception';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionService: PermissionService,
  ) {}

  async checkRoleExist(permissions: number[]) {
    const roles =
      (await this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.permission', 'permission')
        .getMany()) || [];

    if (
      roles.some((existingRole) => {
        if (existingRole.permission.length === permissions.length) {
          return existingRole.permission.every((per) => {
            return permissions.includes(per.id);
          });
        }
      })
    ) {
      throw new CBadRequestException(
        RoleService.name,
        'Role already exists',
        ApiResponseCode.ROLE_EXISTED,
      );
    }
  }
  async create(createRoleDto: CreateRoleDto) {
    const { permissions, ...data } = createRoleDto;
    const getPermissions = await this.permissionService.findManyByIds(
      permissions,
    );

    await this.checkRoleExist(permissions);

    return await this.roleRepository.save({
      ...data,
      permission: getPermissions,
    });
  }

  async findAll() {
    const [roles, count] = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permission', 'permission')
      .getManyAndCount();
    if (count === 0) {
      throw new CBadRequestException(
        RoleService.name,
        'Role not found',
        ApiResponseCode.ROLE_NOT_FOUND,
      );
    }
    return roles;
  }

  async findOne(id: number) {
    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permission', 'permission')
      .where('role.id = :id', { id })
      .getOne();
    if (!roles) {
      throw new CBadRequestException(
        RoleService.name,
        'Role not found',
        ApiResponseCode.ROLE_NOT_FOUND,
      );
    }
    return roles;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new CBadRequestException(
        RoleService.name,
        'Role not found',
        ApiResponseCode.ROLE_NOT_FOUND,
      );
    }

    const { permissions, ...data } = updateRoleDto;
    const getPermissions = await this.permissionService.findManyByIds(
      permissions,
    );
    await this.checkRoleExist(permissions);
    console.log(getPermissions);

    role.name = data.name;
    role.description = data.description;
    role.permission = getPermissions;

    return await this.roleRepository.save(role);
    // return await this.roleRepository.update(
    //   { id },
    //   {
    //     ...data,
    //     permission: getPermissions,
    //   },
    // );
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.roleRepository.update(id, {
      deletedAt: new Date(),
    });
  }
}

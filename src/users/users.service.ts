import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ILike, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async search(query: string) {
    return this.userRepository.find({
      where: { username: ILike(`%${query}%`) },
      select: ['id', 'username'],
      take: 20,
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.save(
      this.userRepository.create({
        username: dto.username,
        password: hashedPassword,
        role: dto.role,
      }),
    );

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async findAll() {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'role', 'createdAt'],
      order: { createdAt: 'ASC' },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'createdAt'],
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    if (dto.username && dto.username !== user.username) {
      const existing = await this.userRepository.findOne({
        where: { username: dto.username },
      });
      if (existing) throw new ConflictException('Username already exists');
      user.username = dto.username;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.role) {
      user.role = dto.role;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);
  }
}

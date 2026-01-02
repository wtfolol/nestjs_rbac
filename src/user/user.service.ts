import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // async update(email: string, password: string) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async validateUserEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('User id / password not found or incorrect.');
    }
    return user;
  }

  async getUserDetailsById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('User id / password not found or incorrect.');
    }
    const verify = await bcrypt.compareSync(password, user.password);
    if (!verify) {
      throw new NotFoundException('User id / password not found or incorrect.');
    }
    return user;
  }

  async updateRefreshToken(
    email: string,
    password: string,
    refresh_token: string,
    prev_refresh_token?: string,
  ) {
    const user = await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        hashedtoken: refresh_token,
        prevhashedtoken: prev_refresh_token,
      },
    });
    if (!user) {
      throw new NotFoundException('Failed to update');
    }
    return user;
  }
}

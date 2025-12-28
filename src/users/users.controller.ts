import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as protobuf from 'protobufjs';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  @Get('stats/last-7-days')
  async getStats() {
    return this.usersService.getStatsLast7Days();
  }

  @Get('export')
  async exportProtobuf(@Res() res: Response) {
    try {
      const users = await this.usersService.exportProtobuf();
      
      const protoDefinition = `
        syntax = "proto3";
        message User {
          string id = 1;
          string email = 2;
          string role = 3;
          string status = 4;
          string emailHash = 5;
          string signature = 6;
          string createdAt = 7;
        }
        message UserList {
          repeated User users = 1;
        }
      `;

      const root = protobuf.parse(protoDefinition).root;
      const UserList = root.lookupType('UserList');

      const payload = {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          status: u.status,
          emailHash: u.emailHash,
          signature: u.signature,
          createdAt: u.createdAt.toISOString(),
        })),
      };

      const message = UserList.create(payload);
      const buffer = UserList.encode(message).finish();

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename=users.bin');
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Export failed' });
    }
  }

  @Get('public-key')
  getPublicKey() {
    return { publicKey: this.usersService.getPublicKey() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}

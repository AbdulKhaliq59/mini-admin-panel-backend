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
  DefaultValuePipe,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as protobuf from 'protobufjs';
import { join } from 'path';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get('stats/last-7-days')
  async getStats() {
    return this.usersService.getStatsLast7Days();
  }

  @Get('export')
  async exportProtobuf(@Res() res: Response) {
    try {
      const users = await this.usersService.exportProtobuf();
      const root = await protobuf.load(join(__dirname, 'user.proto'));
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
      this.logger.error('Export error:', error);
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

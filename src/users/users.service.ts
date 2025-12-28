import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, generateKeyPairSync, sign, verify } from 'crypto';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private privateKey: string;
  private publicKey: string;

  constructor(private repository: UsersRepository) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  private hashEmail(email: string): string {
    return createHash('sha384').update(email).digest('hex');
  }

  private signHash(hash: string): string {
    const signature = sign('sha384', Buffer.from(hash), {
      key: this.privateKey,
      padding: 1,
    });
    return signature.toString('base64');
  }

  verifySignature(hash: string, signature: string): boolean {
    try {
      return verify(
        'sha384',
        Buffer.from(hash),
        { key: this.publicKey, padding: 1 },
        Buffer.from(signature, 'base64'),
      );
    } catch {
      return false;
    }
  }

  async create(dto: CreateUserDto) {
    if (!dto.email || !dto.fullName) {
      throw new BadRequestException('Email and full name are required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      throw new BadRequestException('Invalid email format');
    }
    const emailHash = this.hashEmail(dto.email);
    const signature = this.signHash(emailHash);
    return this.repository.create({ ...dto, emailHash, signature });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return this.repository.findAll(skip, limit);
  }

  async findOne(id: string) {
    const user = await this.repository.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const updateData: any = { ...dto };
    if (dto.email) {
      updateData.emailHash = this.hashEmail(dto.email);
      updateData.signature = this.signHash(updateData.emailHash);
    }
    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.repository.delete(id);
  }

  async getStatsLast7Days() {
    return this.repository.getUserStatsLast7Days();
  }

  async exportProtobuf() {
    return this.repository.findAllForExport();
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}

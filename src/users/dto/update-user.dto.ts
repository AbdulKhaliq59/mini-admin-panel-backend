import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsIn(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';

  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}

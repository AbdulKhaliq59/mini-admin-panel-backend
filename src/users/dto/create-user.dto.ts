import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsIn(['admin', 'user'])
  @IsNotEmpty()
  role: 'admin' | 'user';

  @IsIn(['active', 'inactive'])
  @IsNotEmpty()
  status: 'active' | 'inactive';
}

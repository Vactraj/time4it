import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsIn, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';


export class ListOrdersDto {
    @IsString()
    tenantId!: string;

    @IsOptional()
    @IsIn(['PENDING', 'PAID', 'CANCELLED'])
    status?: 'PENDING' | 'PAID' | 'CANCELLED';

    @IsOptional()
    @IsEmail()
    buyerEmail?: string;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    limit: number = 10;
}
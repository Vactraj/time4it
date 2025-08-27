import { IsArray, IsEmail, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BuyerDto {
    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    name?: string;
}

class ItemDto {
    @IsString()
    sku!: string;

    @IsNumber()
    @Min(1)
    qty!: number;

    @IsNumber()
    @Min(0)
    price!: number;
}

class AttachmentDto {
    @IsString()
    filename!: string;

    @IsString()
    contentType!: string;

    @IsNumber()
    @Min(1)
    @Max(1024 * 1024 * 5)
    size!: number;

    @IsString()
    storageKey!: string;
}

export class CreateOrderDto {
    @IsString()
    requestId!: string;

    @IsString()
    tenantId!: string;

    @ValidateNested()
    @Type(() => BuyerDto)
    buyer!: BuyerDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemDto)
    items!: ItemDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => AttachmentDto)
    attachment?: AttachmentDto;
}
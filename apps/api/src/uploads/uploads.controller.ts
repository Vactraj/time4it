import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
    constructor(private readonly service: UploadsService) {}

    @Post('presign')
    presign(@Body() body: { tenantId: string; filename: string; contentType: string; size: number }) {
        try {
            const { tenantId, filename, contentType, size } = body;
            if (!tenantId || !filename || !contentType || !size) {
                throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
            }
            return this.service.presign(tenantId, filename, contentType, size);
        } catch (e: any) {
            throw new HttpException(e.message || 'Presign error', HttpStatus.BAD_REQUEST);
        }
    }
}
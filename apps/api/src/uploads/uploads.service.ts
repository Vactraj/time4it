import { Injectable } from '@nestjs/common';


@Injectable()
export class UploadsService {
    presign(tenantId: string, filename: string, contentType: string, size: number) {
        // Walidacje wstępne
        const maxMb = 5;

        if (size > maxMb * 1024 * 1024) {
            throw new Error(`File too large (>${maxMb} MB)`);
        }
        const allowed = (process.env.ALLOWED_MIME || 'application/pdf,image/png,image/jpeg').split(',');
        if (!allowed.includes(contentType)) {
            throw new Error(`Unsupported contentType: ${contentType}`);
        }


        // Wygeneruj storageKey – klient wstawi go potem do POST /api/orders
        const orderPlaceholder = '001'; // w MVP: klient może ustalić katalog; w v2 generuj po orderId.
        const storageKey = `tenants/${tenantId}/orders/${orderPlaceholder}/${filename}`;


        // MOCK presign URL (serwer testowy, który przyjmuje PUT). W realu: S3/MinIO pre-signed PUT.
        const base = process.env.PRESIGN_BASE_URL || 'http://localhost:3333/mock-upload';
        const ttl = Number(process.env.PRESIGN_TTL_SECONDS || 120);
        const url = `${base}?key=${encodeURIComponent(storageKey)}&expires=${ttl}`;


        return {
            url,
            storageKey,
            expiresInSeconds: ttl,
            headers: { 'Content-Type': contentType },
        };
    }
}
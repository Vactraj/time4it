# 📦 Orders API (NestJS)

MVP backend dla modułu **Zamówienia** w architekturze **CQRS +
projekcje + WebSocket + presign (mock)**.\
Technologie: **NestJS 10, MongoDB, WebSocket (socket.io), in-memory
event bus**.

------------------------------------------------------------------------

## ⚙️ Instalacja i uruchomienie

``` bash
# 1. Przejdź do katalogu infra
cd apps/infra

# 4. Uruchom docker-compose w trybie dev
docker compose --profile dev up --build
```

------------------------------------------------------------------------

## 🌍 Endpointy

### 1. Create Order (Command)

`POST /api/orders`

Request:

``` json
{
  "requestId": "r1",
  "tenantId": "t-123",
  "buyer": { "email": "alice@example.com", "name": "Alice" },
  "items": [{ "sku": "SKU-1", "qty": 2, "price": 49.99 }],
  "attachment": {
    "filename": "invoice.pdf",
    "contentType": "application/pdf",
    "size": 123456,
    "storageKey": "tenants/t-123/orders/001/invoice.pdf"
  }
}
```

Response `201`:

``` json
{ "orderId": "ord_abc123" }
```

✅ **Idempotencja**: `(tenantId, requestId)` ma unikalny indeks --
ponowny request zwróci ten sam `orderId`.

------------------------------------------------------------------------

### 2. List Orders (Query)

`GET /api/orders?tenantId=t-123&status=PAID&buyerEmail=alice@example.com&page=1&limit=10`

Response `200`:

``` json
{
  "items": [
    {
      "orderId": "ord_abc123",
      "status": "PAID",
      "createdAt": "2025-08-22T09:00:00.000Z",
      "buyerEmail": "alice@example.com",
      "total": 99.98,
      "attachment": {
        "filename": "invoice.pdf",
        "storageKey": "tenants/t-123/orders/001/invoice.pdf"
      }
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

------------------------------------------------------------------------

### 3. Realtime (WebSocket)

-   Namespace: `/ws`
-   Event: `order.updated`

Autoryzacja: prosty JWT w cookie `token` (payload zawiera `tenantId`).\
Po utworzeniu zamówienia status zmienia się z **PENDING → PAID** w ciągu
2--5 s.\
Event wysyłany jest **dopiero po aktualizacji projekcji**.

Payload:

``` json
{
  "type": "order.updated",
  "payload": { "orderId": "ord_abc123", "status": "PAID" }
}
```

------------------------------------------------------------------------

### 4. Upload -- presign (mock)

`POST /api/uploads/presign`

Request:

``` json
{ "tenantId": "t-123", "filename": "invoice.pdf", "contentType": "application/pdf", "size": 123456 }
```

Response:

``` json
{
  "url": "http://localhost:3333/mock-upload?key=tenants/t-123/orders/001/invoice.pdf&expires=120",
  "storageKey": "tenants/t-123/orders/001/invoice.pdf",
  "expiresInSeconds": 120,
  "headers": { "Content-Type": "application/pdf" }
}
```

Flow: 1. Klient pobiera `url` 2. Robi `PUT` pliku → presigned URL 3.
Wysyła `POST /api/orders` z `storageKey`

------------------------------------------------------------------------

## 🗄️ Modele i indeksy

-   **Write model**: `orders_write`
    -   unikalny indeks `(tenantId, requestId)` → idempotencja
-   **Read model**: `orders_read`
    -   indeks `(tenantId, status, createdAt desc)`
    -   indeks `(tenantId, buyerEmail)`

------------------------------------------------------------------------

## 🔑 Kryteria akceptacji (cURL)

### 1. Idempotencja

``` bash
# Create
curl -s -XPOST http://localhost:3000/api/orders -H 'Content-Type: application/json' -d '{"requestId":"r1","tenantId":"t-123","buyer":{"email":"alice@example.com"},"items":[{"sku":"SKU-1","qty":2,"price":49.99}]}'

# Powtórz ten sam requestId – brak duplikatu
```

### 2. Lista

``` bash
curl -s 'http://localhost:3000/api/orders?tenantId=t-123&status=PENDING&page=1&limit=10'
```

### 3. Presign

``` bash
curl -s -XPOST http://localhost:3000/api/uploads/presign -H 'Content-Type: application/json' -d '{"tenantId":"t-123","filename":"invoice.pdf","contentType":"application/pdf","size":123456}'
```

------------------------------------------------------------------------

## 📝 Kompromisy (MVP)

-   **Event bus**: in-memory (łatwo wymienić na Kafkę w v2)\
-   **Upload**: mock presign URL, brak realnego S3/MinIO\
-   **Auth**: prosty JWT z `tenantId` (brak pełnego
    logowania/registracji)

------------------------------------------------------------------------

## 🚀 TODO (v2)

-   Prawdziwy presign S3/MinIO (`@aws-sdk/s3-request-presigner`)\
-   Redis cache listy (cache key = zapytanie, invalidacja po
    `orders.status.v1`)\
-   E2E testy (supertest)\
-   Retry/outbox dla eventów (odporność na awarie)\
-   JWT + RBAC per user

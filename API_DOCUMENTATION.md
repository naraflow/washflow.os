# API Documentation

## Create Order Endpoint

### Endpoints
`POST /create_order`  
`POST /orders` (alternative endpoint, same functionality)

### Description
Creates a new order in the Washflow OS system. The endpoint accepts order data in a simplified format and transforms it to the internal Order format before storing it in Supabase.

### Request Format

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (optional, for future authentication)
```

#### Body
```json
{
  "customer_id": 1,                    // Optional: Customer ID
  "customer_name": "John Doe",         // Optional: Customer name (defaults to "Customer")
  "customer_phone": "+1234567890",     // Optional: Customer phone
  "service_type": "Washing",           // Required: Service type (Washing, Wash & Iron, Iron Only, Express, Dry Clean)
  "pickup_date": "2023-10-25",         // Optional: Pickup date
  "delivery_date": "2023-10-27",      // Optional: Delivery date
  "items": [                            // Required: Array of items
    {
      "name": "Shirt",                 // Item name
      "quantity": 2,                    // Quantity
      "price": 5.0                      // Price per unit
    },
    {
      "name": "Pants",
      "quantity": 1,
      "price": 10.0
    }
  ]
}
```

### Response Format

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "ORD-1234567890-123",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "service_type": "regular",
    "total_amount": 20.0,
    "status": "pending",
    "created_at": "2023-10-25T10:00:00.000Z"
  },
  "message": "Order created successfully"
}
```

#### Error Response (400 Bad Request) - Single Error
```json
{
  "success": false,
  "error": "service_type is required"
}
```

#### Error Response (400 Bad Request) - Validation Errors
When multiple validation errors occur, the API returns a detailed error response:
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "service_id cannot be empty",
    "customer_id cannot be empty",
    "pickup_date must be in YYYY-MM-DD format",
    "items array cannot be empty"
  ],
  "message": "service_id cannot be empty; customer_id cannot be empty; pickup_date must be in YYYY-MM-DD format; items array cannot be empty"
}
```

### Validation Rules

The API performs the following validations:

1. **service_type or service_id**: At least one must be provided and non-empty
2. **customer_id**: If provided, must not be an empty string
3. **items**: Must be a valid array and cannot be empty
4. **pickup_date**: If provided, must be in `YYYY-MM-DD` format and be a valid date
5. **delivery_date**: If provided, must be in `YYYY-MM-DD` format and be a valid date

#### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Error stack trace (only in development)"
}
```

### Service Type Mapping

The API maps service types as follows:
- `"Washing"` → `"regular"`
- `"Wash & Iron"` → `"wash_iron"`
- `"Iron Only"` → `"iron_only"`
- `"Express"` → `"express"`
- `"Dry Clean"` → `"dry_clean"`
- Unknown types → `"regular"` (default)

## Edit Order Endpoint

### Endpoint
`POST /orders/edit`  
`PUT /orders/edit` (alternative method, same functionality)

### Description
Updates an existing order in the Washflow OS system. The endpoint validates the order ID exists before processing the update request.

### Request Format

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (optional, for future authentication)
```

#### Body
```json
{
  "order_id": "ORD-1234567890-123",  // Required: Order ID to update
  "status": "completed",              // Optional: New status (pending, processing, ready, completed, cancelled)
  "customer_name": "John Doe",        // Optional: Updated customer name
  "customer_phone": "+1234567890",    // Optional: Updated customer phone
  "notes": "Updated notes",           // Optional: Updated notes
  "total_amount": 25.0,               // Optional: Updated total amount
  "payment_method": "cash"            // Optional: Updated payment method
}
```

### Response Format

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "ORD-1234567890-123",
    "order_id": "ORD-1234567890-123",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "status": "completed",
    "total_amount": 25.0,
    "payment_method": "cash",
    "notes": "Updated notes",
    "updated_at": "2023-10-25T10:00:00.000Z"
  },
  "message": "Order updated successfully"
}
```

#### Error Response (400 Bad Request - Missing Order ID)
```json
{
  "success": false,
  "error": "order_id is required"
}
```

#### Error Response (400 Bad Request - Empty Order ID)
```json
{
  "success": false,
  "error": "order_id cannot be empty"
}
```

#### Error Response (404 Not Found - Invalid Order ID)
```json
{
  "success": false,
  "error": "Order not found",
  "order_id": "invalid_order_id",
  "message": "No order found with ID: invalid_order_id"
}
```

#### Error Response (400 Bad Request - Invalid Status)
```json
{
  "success": false,
  "error": "Invalid status",
  "message": "Status must be one of: pending, processing, ready, completed, cancelled"
}
```

### Validation Rules

The API performs the following validations:

1. **order_id**: Required and cannot be empty
2. **order_id existence**: The order must exist in the database (returns 404 if not found)
3. **status**: If provided, must be one of: `pending`, `processing`, `ready`, `completed`, `cancelled`

### Example Usage

#### Using cURL
```bash
curl -X POST http://localhost:7000/orders/edit \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-1234567890-123",
    "status": "completed"
  }'
```

#### Using Python (requests)
```python
import requests
import json

url = "http://localhost:7000/create_order"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token-here"
}
data = {
    "customer_id": 1,
    "service_type": "Washing",
    "pickup_date": "2023-10-25",
    "delivery_date": "2023-10-27",
    "items": [
        {"name": "Shirt", "quantity": 2, "price": 5.0},
        {"name": "Pants", "quantity": 1, "price": 10.0}
    ]
}

response = requests.post(url, headers=headers, json=data)
print("Status Code:", response.status_code)
print("Response:", response.json())
```

### Testing

Run the test script:
```bash
npm run test:api
```

Or start the dev server and test manually:
```bash
npm run dev
# Server runs on http://localhost:7000
```

### Health Check

Check if the API server is running:
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2023-10-25T10:00:00.000Z"
}
```

## Get Customer Details Endpoint

### Endpoint
`GET /customers/details?id=<customer_id>`

or

`GET /customers/details/<customer_id>`

### Description
Retrieves detailed information about a specific customer by their ID.

### Request Format

#### Headers
```
Authorization: Bearer <token> (optional, for future authentication)
```

#### Query Parameters
- `id` (required): The customer ID

### Response Format

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cust-123",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St",
    "total_orders": 5,
    "total_spent": 250.0,
    "last_order_date": "2023-10-20T10:00:00.000Z",
    "created_at": "2023-01-01T00:00:00.000Z",
    "notes": "Prefers express service",
    "preferences": {
      "preferredService": "service-1",
      "preferredPaymentMethod": "cash",
      "membershipTier": "gold",
      "discountEligible": true
    }
  },
  "message": "Customer details retrieved successfully"
}
```

#### Error Response (400 Bad Request - Missing ID)
```json
{
  "success": false,
  "error": "Customer ID is required. Use ?id=<customer_id> or /customers/details/<customer_id>"
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": "Customer with ID 'cust-123' not found"
}
```

### Example Usage

#### Using cURL
```bash
curl -X GET "http://localhost:7000/customers/details?id=cust-123" \
  -H "Authorization: Bearer your-token-here"
```

#### Using Python (requests)
```python
import requests

url = "http://localhost:7000/customers/details"
headers = {
    "Authorization": "Bearer your-token-here"
}
params = {
    "id": "cust-123"
}

response = requests.get(url, headers=headers, params=params)
print("Status Code:", response.status_code)
print("Response:", response.json())
```

### Notes

1. The endpoint supports both query parameter (`?id=...`) and path parameter (`/customers/details/<id>`) formats
2. If no customer ID is provided, the endpoint returns a 400 error with a helpful message
3. All responses are in JSON format to prevent JSONDecodeError

## Create Customer Endpoint

### Endpoint
`POST /customers`

### Description
Creates a new customer in the system. The endpoint validates input data and checks for duplicate emails and phone numbers.

### Request Format

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (optional, for future authentication)
```

#### Body
```json
{
  "name": "John Doe",              // Required: Customer name
  "phone": "1234567890",           // Required: Customer phone number
  "email": "john.doe@example.com", // Optional: Customer email
  "address": "123 Main St",        // Optional: Customer address
  "notes": "Prefers express",      // Optional: Customer notes
  "preferences": {                 // Optional: Customer preferences
    "preferredService": "service-1",
    "preferredPaymentMethod": "cash",
    "membershipTier": "gold"
  }
}
```

### Response Format

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "cust-1234567890-123",
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john.doe@example.com",
    "address": "123 Main St",
    "total_orders": 0,
    "total_spent": 0,
    "created_at": "2023-10-25T10:00:00.000Z"
  },
  "message": "Customer created successfully"
}
```

#### Error Response (400 Bad Request - Missing Required Fields)
```json
{
  "success": false,
  "error": "name is required"
}
```

#### Error Response (409 Conflict - Duplicate Email)
```json
{
  "success": false,
  "error": "A customer with this email already exists",
  "details": {
    "email": "john.doe@example.com",
    "existing_customer_id": "cust-123"
  }
}
```

#### Error Response (409 Conflict - Duplicate Phone)
```json
{
  "success": false,
  "error": "A customer with this phone number already exists",
  "details": {
    "phone": "1234567890",
    "existing_customer_id": "cust-123"
  }
}
```

### Example Usage

#### Using cURL
```bash
curl -X POST http://localhost:7000/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890"
  }'
```

#### Using Python (requests)
```python
import requests
import json

url = "http://localhost:7000/customers"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token-here"
}
data = {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890"
}

response = requests.post(url, headers=headers, json=data)
print("Status Code:", response.status_code)
print("Response:", response.json())
```

### Notes

1. The endpoint automatically generates a unique customer ID in the format `cust-<timestamp>-<random>`
2. Email addresses are checked for duplicates (case-insensitive)
3. Phone numbers are checked for duplicates
4. Both email and phone duplicate checks return a 409 Conflict status code
5. All responses are in JSON format to prevent JSONDecodeError

## Update Service Endpoint

### Endpoint
`PUT /update_service`

### Description
Updates an existing service's information. The endpoint validates the service ID and updates only the provided fields.

### Request Format

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (optional, for future authentication)
```

#### Body
```json
{
  "service_id": "svc-123",              // Required: Service ID to update
  "service_name": "Updated Service",     // Optional: New service name
  "price": 25.00,                        // Optional: New price (maps to unitPrice)
  "description": "Updated description"   // Optional: New description
}
```

### Response Format

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "svc-123",
    "service_id": "svc-123",
    "service_name": "Updated Service",
    "name": "Updated Service",
    "price": 25.00,
    "unit_price": 25.00,
    "description": "Updated description",
    "type": "regular",
    "unit": "kg",
    "is_active": true,
    "is_default": false,
    "created_at": "2023-01-01T00:00:00.000Z"
  },
  "message": "Service updated successfully"
}
```

#### Error Response (400 Bad Request - Missing Service ID)
```json
{
  "success": false,
  "error": "service_id is required"
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "error": "Service with ID 'svc-123' not found"
}
```

### Example Usage

#### Using cURL
```bash
curl -X PUT http://localhost:7000/update_service \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "service_id": "svc-123",
    "service_name": "Updated Laundry Service",
    "price": 20.00,
    "description": "Updated service description"
  }'
```

#### Using Python (requests)
```python
import requests
import json

url = "http://localhost:7000/update_service"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token-here"
}
payload = {
    "service_id": "svc-123",
    "service_name": "Updated Laundry Service",
    "price": 20.00,
    "description": "Updated service description"
}

response = requests.put(url, headers=headers, json=payload)
print("Status Code:", response.status_code)
print("Response:", response.json())
```

### Notes

1. The endpoint only updates fields that are provided in the request
2. The `price` field maps to `unitPrice` in the database
3. If the service ID doesn't exist, a 404 error is returned
4. All responses are in JSON format to prevent JSONDecodeError
5. The endpoint validates that the service exists before attempting to update

## Get Pickup Status Endpoint

### Endpoint
`GET /pickup-status`

### Description
Retrieves the status of a scheduled pickup. If no pickup ID is provided, returns the status of the most recent pickup.

### Request Format

#### Headers
```
Authorization: Bearer <token> (optional, for future authentication)
```

#### Query Parameters (Optional)
- `pickup_id` or `id`: The pickup ID to query (if not provided, returns most recent pickup)

### Response Format

#### Success Response (200 OK)
```json
{
  "status": "pending",
  "pickup_id": "pd-123",
  "order_id": "ORD-123",
  "customer_name": "John Doe",
  "scheduled_date": "2023-10-25T10:00:00.000Z",
  "courier_name": "Courier Name",
  "address": "123 Main St",
  "created_at": "2023-10-20T10:00:00.000Z"
}
```

#### Response When No Pickups Found (200 OK)
```json
{
  "status": "pending",
  "message": "No scheduled pickups found."
}
```

#### Response When Pickup Not Found (200 OK)
```json
{
  "status": "not_found",
  "message": "Pickup with ID 'pd-123' not found"
}
```

### Pickup Status Values

- `pending` - Pickup is scheduled but not yet assigned
- `assigned` - Pickup has been assigned to a courier
- `enroute` - Courier is on the way
- `arrived` - Courier has arrived at the location
- `picked` - Items have been picked up
- `transit` - Items are in transit
- `completed` - Pickup is completed
- `not_found` - Pickup ID was not found

### Example Usage

#### Using cURL
```bash
curl -X GET "http://localhost:7000/pickup-status" \
  -H "Authorization: Bearer your-token-here"
```

#### Using Python (requests)
```python
import requests

url = "http://localhost:7000/pickup-status"
headers = {
    "Authorization": "Bearer your-token-here"
}

response = requests.get(url, headers=headers)
print("Status Code:", response.status_code)
print("Response:", response.json())
```

### Notes

1. The endpoint always returns status code 200 with a `status` field
2. If no pickup_id is provided, returns the most recent pickup status
3. All responses are in JSON format to prevent JSONDecodeError
4. The endpoint filters for pickup type only (not delivery)

## Create Service Endpoint

### Endpoint
`POST /service`

### Description
Creates a new laundry service in the system. The endpoint validates input data and stores the service in the database.

### Request Format

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (optional, for future authentication)
```

#### Body
```json
{
  "name": "Laundry Service",              // Required: Service name
  "price": 50000,                          // Required: Service price (maps to unitPrice)
  "description": "Standard laundry service including washing and drying.", // Optional: Service description
  "type": "regular",                        // Optional: Service type (default: "regular")
  "unit": "kg",                            // Optional: Unit of measurement (default: "kg")
  "isActive": true,                        // Optional: Whether service is active (default: true)
  "isDefault": false                       // Optional: Whether service is default (default: false)
}
```

### Response Format

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "svc-1234567890-123",
    "name": "Laundry Service",
    "description": "Standard laundry service including washing and drying.",
    "type": "regular",
    "price": 50000,
    "unit_price": 50000,
    "unit": "kg",
    "is_active": true,
    "is_default": false,
    "created_at": "2023-10-25T10:00:00.000Z"
  },
  "message": "Service created successfully"
}
```

#### Error Response (400 Bad Request - Single Error)
```json
{
  "success": false,
  "error": "name is required"
}
```

#### Error Response (400 Bad Request - Validation Errors)
When multiple validation errors occur, the API returns a detailed error response:
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "name is required and cannot be empty",
    "price must be a positive number"
  ],
  "message": "name is required and cannot be empty; price must be a positive number"
}
```

### Validation Rules

The API performs the following validations:

1. **name**: Required and cannot be empty (whitespace-only strings are considered empty)
2. **price or unitPrice**: Required, must be a valid number, must be positive (greater than zero), and cannot be negative

### Example Usage

#### Using cURL
```bash
curl -X POST http://localhost:7000/service \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "name": "Laundry Service",
    "price": 50000,
    "description": "Standard laundry service including washing and drying."
  }'
```

#### Using Python (requests)
```python
import requests
import json

url = "http://localhost:7000/service"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token-here"
}
payload = {
    "name": "Laundry Service",
    "price": 50000,
    "description": "Standard laundry service including washing and drying."
}

response = requests.post(url, headers=headers, json=payload)
print("Status Code:", response.status_code)
print("Response:", response.json())
```

### Notes

1. The endpoint automatically generates a unique service ID in the format `svc-<timestamp>-<random>`
2. The `price` field maps to `unitPrice` in the database
3. Default values: `type` = "regular", `unit` = "kg", `isActive` = true, `isDefault` = false
4. All responses are in JSON format to prevent JSONDecodeError
5. Service types: 'regular', 'wash_iron', 'iron_only', 'express', 'dry_clean', 'custom'
6. Unit types: 'kg', 'piece', 'item'

## Get All Services Endpoint

### Endpoint
`GET /services`

### Description
Retrieves a list of all available laundry services in the system.

### Request Format

#### Headers
```
Authorization: Bearer <token> (optional, for future authentication)
```

### Response Format

#### Success Response (200 OK)
Returns an array of services directly (not wrapped in an object):

```json
[
  {
    "id": "svc-123",
    "name": "Laundry Service",
    "description": "Standard laundry service",
    "type": "regular",
    "price": 50000,
    "unit_price": 50000,
    "unit": "kg",
    "is_active": true,
    "is_default": false,
    "created_at": "2023-10-25T10:00:00.000Z"
  },
  {
    "id": "svc-456",
    "name": "Express Service",
    "description": "Fast laundry service",
    "type": "express",
    "price": 75000,
    "unit_price": 75000,
    "unit": "kg",
    "is_active": true,
    "is_default": false,
    "created_at": "2023-10-24T10:00:00.000Z"
  }
]
```

#### Empty Response (200 OK)
If no services are found or database is not configured:

```json
[]
```

### Example Usage

#### Using cURL
```bash
curl -X GET "http://localhost:7000/services" \
  -H "Authorization: Bearer your-token-here"
```

#### Using Python (requests)
```python
import requests

url = "http://localhost:7000/services"
headers = {
    "Authorization": "Bearer your-token-here"
}

response = requests.get(url, headers=headers)
print("Status Code:", response.status_code)
services = response.json()
print("Services:", services)
print("Number of services:", len(services))
```

### Notes

1. The endpoint returns a JSON array directly (not wrapped in an object)
2. Returns an empty array `[]` if no services are found
3. All responses are in JSON format to prevent JSONDecodeError
4. Services are ordered by creation date (newest first)

## General Notes

1. The endpoint automatically generates a unique order ID in the format `ORD-<timestamp>-<random>`
2. Orders are created with status `"pending"` by default
3. The endpoint calculates totals automatically from the items array
4. If `customer_id` is provided but `customer_name` and `customer_phone` are not, default values are used
5. The endpoint creates workflow logs automatically for audit purposes
6. All orders require tagging by default (`taggingRequired: true`)


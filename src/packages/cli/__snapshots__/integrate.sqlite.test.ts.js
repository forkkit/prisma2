exports['findOne where PK_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int    @id
  name String @unique
}
`

exports['findOne where PK_warnings'] = []

exports['findOne where PK with select_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}
`

exports['findOne where PK with select_warnings'] = []

exports['findOne where PK with include_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model users {
  email String  @unique
  id    Int     @default(autoincrement()) @id
  posts posts[]
}

model posts {
  id      Int    @default(autoincrement()) @id
  title   String
  user_id Int
  users   users  @relation(fields: [user_id], references: [id])
}
`

exports['findOne where PK with include_warnings'] = []

exports['create with data_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int    @default(autoincrement()) @id
  name String @unique
}
`

exports['create with data_warnings'] = []

exports['create with empty data and SQL default_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int    @default(autoincrement()) @id
  name String @default("alice")
}
`

exports['create with empty data and SQL default_warnings'] = []

exports['update where with numeric data_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int    @default(autoincrement()) @id
  name String @unique
}
`

exports['update where with numeric data_warnings'] = []

exports['update where with boolean data_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  active Boolean @default(true)
  id     Int     @default(autoincrement()) @id
  name   String  @unique
}
`

exports['update where with boolean data_warnings'] = []

exports['update where with boolean data and select_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  active Boolean @default(true)
  id     Int     @default(autoincrement()) @id
  name   String  @unique
}
`

exports['update where with boolean data and select_warnings'] = []

exports['update where with string data_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int    @default(autoincrement()) @id
  name String @unique
}
`

exports['update where with string data_warnings'] = []

exports['updateMany where with string data - check returned count_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int    @default(autoincrement()) @id
  name String
}
`

exports['updateMany where with string data - check returned count_warnings'] = []

exports['updateMany where with string data - check findMany_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int    @default(autoincrement()) @id
  name String
}
`

exports['updateMany where with string data - check findMany_warnings'] = []

exports['findOne where unique_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model users {
  email String @unique
  id    Int    @default(autoincrement()) @id
}
`

exports['findOne where unique_warnings'] = []

exports['findMany - email text_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model users {
  email String?
  id    Int     @default(autoincrement()) @id
}
`

exports['findMany - email text_warnings'] = []

exports['findMany where unique_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model users {
  email String @unique
  id    Int    @default(autoincrement()) @id
}
`

exports['findMany where unique_warnings'] = []

exports['findMany - email varchar(50) not null unique_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model users {
  email String @unique
  id    Int    @default(autoincrement()) @id
}
`

exports['findMany - email varchar(50) not null unique_warnings'] = []

exports['findOne where unique with foreign key and unpack_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model users {
  email String  @unique
  id    Int     @default(autoincrement()) @id
  posts posts[]
}

model posts {
  id      Int    @default(autoincrement()) @id
  title   String
  user_id Int
  users   users  @relation(fields: [user_id], references: [id])
}
`

exports['findOne where unique with foreign key and unpack_warnings'] = []

exports['findMany where contains and boolean_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
}
`

exports['findMany where contains and boolean_warnings'] = []

exports['findMany where OR[contains, contains] _datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
}
`

exports['findMany where OR[contains, contains] _warnings'] = []

exports['upsert (update)_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
}
`

exports['upsert (update)_warnings'] = []

exports['upsert (create)_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
}
`

exports['upsert (create)_warnings'] = []

exports['findMany orderBy asc_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
}
`

exports['findMany orderBy asc_warnings'] = []

exports['findMany orderBy desc_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  id        Int     @default(autoincrement()) @id
  published Boolean @default(false)
  title     String
}
`

exports['findMany orderBy desc_warnings'] = []

exports['findMany where contains_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model crons {
  frequency String?
  id        Int     @default(autoincrement()) @id
  job       String  @unique
}
`

exports['findMany where contains_warnings'] = []

exports['findMany where startsWith_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model crons {
  frequency String?
  id        Int     @default(autoincrement()) @id
  job       String  @unique
}
`

exports['findMany where startsWith_warnings'] = []

exports['findMany where endsWith_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model crons {
  frequency String?
  id        Int     @default(autoincrement()) @id
  job       String  @unique
}
`

exports['findMany where endsWith_warnings'] = []

exports['findMany where in[string]_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model crons {
  frequency String?
  id        Int     @default(autoincrement()) @id
  job       String  @unique
}
`

exports['findMany where in[string]_warnings'] = []

exports['findMany where datetime lte - check instanceof Date_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  created_at DateTime @default(now())
  id         Int      @default(autoincrement()) @id
  title      String
}
`

exports['findMany where datetime lte - check instanceof Date_warnings'] = []

exports['findMany where timestamp gte than now_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  created_at DateTime @default(now())
  id         Int      @default(autoincrement()) @id
  title      String
}
`

exports['findMany where timestamp gte than now_warnings'] = []

exports['findMany where timestamp gt than now_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  created_at DateTime @default(now())
  id         Int      @default(autoincrement()) @id
  title      String
}
`

exports['findMany where timestamp gt than now_warnings'] = []

exports['findMany where timestamp lt than now_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model posts {
  created_at DateTime @default(now())
  id         Int      @default(autoincrement()) @id
  title      String
}
`

exports['findMany where timestamp lt than now_warnings'] = []

exports['update where integer data_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id    Int @default(autoincrement()) @id
  token Int @unique
}
`

exports['update where integer data_warnings'] = []

exports['findMany where datetime exact_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model events {
  id   Int       @default(autoincrement()) @id
  time DateTime?
}
`

exports['findMany where datetime exact_warnings'] = []

exports['findMany where datetime gt_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model events {
  id   Int       @default(autoincrement()) @id
  time DateTime?
}
`

exports['findMany where datetime gt_warnings'] = []

exports['findMany where datetime gte_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model events {
  id   Int       @default(autoincrement()) @id
  time DateTime?
}
`

exports['findMany where datetime gte_warnings'] = []

exports['findMany where datetime lt_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model events {
  id   Int       @default(autoincrement()) @id
  time DateTime?
}
`

exports['findMany where datetime lt_warnings'] = []

exports['findMany where datetime lte_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model events {
  id   Int       @default(autoincrement()) @id
  time DateTime?
}
`

exports['findMany where datetime lte_warnings'] = []

exports['findMany where datetime not_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model events {
  id   Int       @default(autoincrement()) @id
  time DateTime?
}
`

exports['findMany where datetime not_warnings'] = []

exports['findMany where empty in[]_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id    Int    @default(autoincrement()) @id
  name  String
  token Int    @unique
}
`

exports['findMany where empty in[]_warnings'] = []

exports['findMany where id empty in[] and token in[]_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id    Int    @default(autoincrement()) @id
  name  String
  token Int    @unique
}
`

exports['findMany where id empty in[] and token in[]_warnings'] = []

exports['findMany where in[integer]_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id    Int    @default(autoincrement()) @id
  name  String
  token Int    @unique
}
`

exports['findMany where in[integer]_warnings'] = []

exports['findMany where notIn[]_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id    Int    @default(autoincrement()) @id
  name  String
  token Int    @unique
}
`

exports['findMany where notIn[]_warnings'] = []

exports['findMany where empty notIn[]_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id    Int    @default(autoincrement()) @id
  name  String
  token Int    @unique
}
`

exports['findMany where empty notIn[]_warnings'] = []

exports['findMany where - case insensitive field_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model users {
  email String @unique
  id    Int    @default(autoincrement()) @id
}
`

exports['findMany where - case insensitive field_warnings'] = []

exports['findMany where decimal_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model exercises {
  distance Float
  id       Int   @default(autoincrement()) @id
}
`

exports['findMany where decimal_warnings'] = []

exports['findOne where decimal_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model exercises {
  distance Float @unique
  id       Int   @default(autoincrement()) @id
}
`

exports['findOne where decimal_warnings'] = []

exports['findOne where decimal - default value_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model exercises {
  distance Float @default(12.3) @unique
  id       Int   @default(autoincrement()) @id
}
`

exports['findOne where decimal - default value_warnings'] = []

exports['create bigint data_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model migrate {
  version Int @id
}
`

exports['create bigint data_warnings'] = []

exports['findOne where composite PK_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model variables {
  email String
  key   String
  name  String
  value String

  @@id([name, key])
}
`

exports['findOne where composite PK_warnings'] = []

exports['update where composite PK_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model variables {
  email String
  key   String
  name  String
  value String

  @@id([name, key])
}
`

exports['update where composite PK_warnings'] = []

exports['upsert where composite PK - update_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model variables {
  email String
  key   String
  name  String
  value String

  @@id([name, key])
}
`

exports['upsert where composite PK - update_warnings'] = []

exports['upsert where composite PK - create_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model variables {
  email String
  key   String
  name  String
  value String

  @@id([name, key])
}
`

exports['upsert where composite PK - create_warnings'] = []

exports['delete where composite PK_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model variables {
  email String
  key   String
  name  String
  value String

  @@id([name, key])
}
`

exports['delete where composite PK_warnings'] = []

exports['findOne where unique composite_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model variables {
  email String
  id    Int    @default(autoincrement()) @id
  key   String
  name  String
  value String

  @@unique([name, key], name: "sqlite_autoindex_variables_1")
}
`

exports['findOne where unique composite_warnings'] = []

exports['findOne where unique composite (PK is a composite)_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model variables {
  email String
  key   String
  name  String
  value String

  @@id([name, key])
  @@unique([value, email], name: "sqlite_autoindex_variables_2")
}
`

exports['findOne where unique composite (PK is a composite)_warnings'] = []

exports['findOne where composite PK with foreign key_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model a {
  one Int
  two Int
  b   b[]

  @@id([one, two])
}

model b {
  id  Int @default(autoincrement()) @id
  one Int
  two Int
  a   a   @relation(fields: [one, two], references: [one, two])
}
`

exports['findOne where composite PK with foreign key_warnings'] = []

exports['updateMany where null - check findMany_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  id   Int     @default(autoincrement()) @id
  name String?
}
`

exports['updateMany where null - check findMany_warnings'] = []

exports['findMany on column_name_that_becomes_empty_string_datamodel'] = `
generator client {
  provider = "prisma-client-js"
  output = "***"
}

datasource sqlite {
  provider = "sqlite"
  url = "***"
}

model teams {
  email String @unique
  id    Int    @id
  name  String @unique
}

model column_name_that_becomes_empty_string {
  // This field was commented out because of an invalid name. Please provide a valid one that matches [a-zA-Z][a-zA-Z0-9_]*
  // 12345 Int? @map("12345")
  field1   Int  @default(autoincrement()) @id
}

// The underlying table does not contain a unique identifier and can therefore currently not be handled.
// model no_unique_identifier {
  // This type is currently not supported.
  // field1 integer key
  // field2 Int?
// }

model unsupported_type {
  field1         Int         @default(autoincrement()) @id
  // This type is currently not supported.
  // unsupported binary(50)?
}
`

exports['findMany on column_name_that_becomes_empty_string_warnings'] = [
  {
    "code": 1,
    "message": "These models do not have a unique identifier or id and are therefore commented out.",
    "affected": [
      {
        "model": "no_unique_identifier"
      }
    ]
  },
  {
    "code": 2,
    "message": "These fields were commented out because of invalid names. Please provide valid ones that match [a-zA-Z][a-zA-Z0-9_]*.",
    "affected": [
      {
        "model": "column_name_that_becomes_empty_string",
        "field": "12345"
      }
    ]
  },
  {
    "code": 3,
    "message": "These fields were commented out because we currently do not support their types.",
    "affected": [
      {
        "model": "no_unique_identifier",
        "field": "field1",
        "tpe": "integer key"
      },
      {
        "model": "unsupported_type",
        "field": "unsupported",
        "tpe": "binary(50)"
      }
    ]
  }
]

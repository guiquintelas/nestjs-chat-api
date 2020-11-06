require("dotenv").config();

const DB_DATABASE = process.env.NODE_ENV === 'test' ? '' : process.env.DB_DATABASE;

module.exports = {
  type: "mongodb",
  url: `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${DB_DATABASE}?authSource=admin`,
  useNewUrlParser: true,
  entities: process.env.NODE_ENV === 'test' ?
    ["src/**/**.entity{.ts,.js}"] :
    ["dist/**/*.entity{.ts,.js}"],
  logging: true,
  logger: "file",
  syncronize: false,
  useUnifiedTopology: true
}

require("dotenv").config();

module.exports = {
  type: "mongodb",
  url: `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`,
  useNewUrlParser: true,
  entities: process.env.NODE_ENV === 'test' ?
    ["src/**/**.entity{.ts,.js}"] :
    ["dist/**/*.entity{.ts,.js}"],
  logging: true,
  logger: "file",
  syncronize: false,
  useUnifiedTopology: true
}

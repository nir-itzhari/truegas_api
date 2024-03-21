

class Config { }

class DevelopmentConfig extends Config {
    public isDevelopment = true;
    public connectionString = "mongodb://18.212.195.66:27017/truegas"
    public dockerConnectionString = "mongodb://db:27017/truegas"

}

class ProductionConfig extends Config {
    public isDevelopment = false;
    public connectionString = "mongodb://db:27017/truegas"
    public dockerConnectionString = "mongodb://db:27017/truegas"

}

const config = process.env.NODE_ENV === "production" ? new ProductionConfig() : new DevelopmentConfig();

export default config;

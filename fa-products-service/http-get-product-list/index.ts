import { CosmosClient } from "@azure/cosmos";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppConfigurationClient } from '@azure/app-configuration';

// Create an App Config Client to interact with the service
// const connection_string = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;
// const appConfigClient = new AppConfigurationClient(connection_string);

// Create DB connection
const endpoint  = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = 'test-db';
const productContainerId = 'products';
const stockContainerId = 'stocks';

const dbClient = new CosmosClient({ endpoint, key });

const database = dbClient.database(databaseId);
const productContainer = database.container(productContainerId);
const stockContainer = database.container(stockContainerId);

const httpTrigger: AzureFunction = async function (context: Context, _: HttpRequest): Promise<void> {
    // const configs = await appConfigClient.getConfigurationSetting({ key: 'DATA_FROM_APP_CONFIG' });
    // context.log(configs);

    context.log('Getting all products');

    try {
        const { resources: products } = await productContainer.items.query('SELECT * FROM c').fetchAll();
        const stocks = await Promise.all(products.map(async product => {
            const { resources: [stock] } = await stockContainer.items.query(`SELECT * FROM c WHERE c.product_id = "${product.id}"`).fetchAll();
            return { ...product, stock: stock.count };
        }));

        context.res = {
            status: 200,
            body: stocks
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: "Error fetching products: " + err.message
        };
    }
};

export default httpTrigger;

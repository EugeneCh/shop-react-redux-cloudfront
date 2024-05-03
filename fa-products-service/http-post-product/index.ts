import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";
import { faker } from "@faker-js/faker";

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

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const { title, description, price, count } = req.body;

    context.log('Payload', title, description, price, count);

    if (title == null || description == null || price == null || count == null) {
        context.res = {
            status: 400,
            body: "Invalid request body"
        };
        return;
    }

    const productId = faker.string.uuid();
    const product = {
        id: productId,
        title,
        description,
        price
    };

    const stock = {
        product_id: productId,
        count
    };

    try {
        await productContainer.items.create(product);
        await stockContainer.items.create(stock);

        context.res = {
            status: 201,
            body: { ...product, stock: count }
        };
    } catch (err) {
        context.log(err, 'ERROR caught');
        context.res = {
            status: 500,
            body: "Error creating product: " + err.message
        };
    }
};

export default httpTrigger;

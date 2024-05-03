import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

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
    const id = req.params.id;

    context.log(`product id ${id} to find`);

    if (!id) {
        context.res = {
            statusCode: 404,
            body: 'Item not found, please provide an id.'
        };
        return;
    }

    try {
        const { resource: product } = await productContainer.item(id, id).read();

        if (!product) {
            context.res = {
                status: 404,
                body: "Product not found"
            };
            return;
        }

        const { resources: [stock] } = await stockContainer.items.query(`SELECT * FROM c WHERE c.product_id = "${id}"`).fetchAll();

        if (!stock) {
            context.res = {
                status: 404,
                body: "Stock not found for product"
            };
            return;
        }

        context.res = {
            status: 200,
            body: { ...product, count: stock.count }
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: "Error fetching product: " + err.message
        };
    }

};

export default httpTrigger;

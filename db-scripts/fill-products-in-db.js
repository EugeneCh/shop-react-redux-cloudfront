const { CosmosClient } = require('@azure/cosmos');
const { faker } = require('@faker-js/faker');

require('dotenv').config();

const endpoint  = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = "test-db";
const productContainerId = "products";
const stockContainerId = "stocks";

const client = new CosmosClient({ endpoint, key });

const database = client.database(databaseId);
const productContainer = database.container(productContainerId);
const stockContainer = database.container(stockContainerId);

async function run() {
  for (let i = 0; i < 10; i++) {
    const productId = faker.string.uuid();
    const product = {
      id: productId,
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price()
    };
    await productContainer.items.upsert(product);

    const stock = {
      product_id: productId,
      count: faker.number.int({ min: 1, max: 100 })
    };
    await stockContainer.items.upsert(stock);
  }

  console.log('Test data added to CosmosDB');
}

run().catch(err => {
  console.error(err);
});

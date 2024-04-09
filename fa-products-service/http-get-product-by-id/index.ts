import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { products, Product } from "../mocks/data";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const id = req.params.id;

    if (!id) {
        context.res = {
            statusCode: 404,
            body: 'Item not found, please provide an id.'
        };
        return;
    }

    const product: Product = products.find(product => product.id === id);

    if (!product) {
        context.res = {
            statusCode: 404,
            body: `Item with id ${id} not found, please provide a valid id.`
        };
        return;
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: product
    };

};

export default httpTrigger;

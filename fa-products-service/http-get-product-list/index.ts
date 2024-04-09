import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AppConfigurationClient } from '@azure/app-configuration';
import { products } from "../mocks/data";

// Create an App Config Client to interact with the service
const connection_string = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;
const client = new AppConfigurationClient(connection_string);

const httpTrigger: AzureFunction = async function (context: Context, _: HttpRequest): Promise<void> {
    const configs = await client.getConfigurationSetting({ key: 'DATA_FROM_APP_CONFIG' });
    context.log(configs);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: products
    };

};

export default httpTrigger;

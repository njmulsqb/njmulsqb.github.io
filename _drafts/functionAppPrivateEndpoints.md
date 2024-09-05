The concept of private endpoint though have been out there for over [4 years now](https://azure.microsoft.com/en-us/updates/private-endpoints-for-azure-storage/) but for some reason I don't see a lot of adoption in the wild. I see private endpoint as a beneficial feature to just say NO to public access.

I won't be going into the details of what private endpoint is, rather today we'll see how can we implement it between a function app and storage account. If you want to study about what private endpoint is, you can check [this](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview)

Let's dive in! I assume you've have created storage account and function app already.

### Deployment Steps

Here are the steps to create private endpoint between the two Azure resources:

1. Go to the storage account that you want to connect with function app in Azure Portal and select the "Networking" tab from the left sidebar.
2. Select the "Private Endpoint" column and click on "Private endpoint connections"
3. Fill in some basic details e.g. subscription, resource group etc. Just make sure that the region you select for your private endpoint is same as of the virtual network (we'll be connecting the private endpoint to a VNet).
4. 
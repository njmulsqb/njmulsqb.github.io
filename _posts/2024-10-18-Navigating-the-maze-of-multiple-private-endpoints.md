---
layout: post
title: "Navigating the Maze of Multiple Private Endpoints on Single Resource in Azure"
categories: [Azure security]
tags: [cloud security, azure, private endpoints]
assets: /assets/Navigating-the-maze-of-multiple-private-endpoints/
author: Najam Ul Saqib
comments: true
description: "Configuring multiple private endpoints on a single resource in Azure though sounds simple but it can quickly become complex and get out of the hand. I discuss in this post of case where I overcame this challenge."
---

Private endpoints is an interesting concept to secure your workloads in cloud. This post is going to discuss architectural challenges and their solutions when implementing private endpoints (PEs) so if you don't know the basics then it might be a good option to first understand the basic concepts of PEs in Azure and how they work.

I was working to implement PEs in an Azure subscription where multiple web apps, function apps and AKS needs to connect with SQL server privately, so the target resource was SQL server. Earlier, I had implemented PEs to connect web apps with storage accounts but that was 1:1 mapping and it worked without any issue. Here, I have my AKS cluster in West US 2 region, app services in West US region and SQL server in East US region.

![Initial Architecture](/assets/Navigating-the-maze-of-multiple-private-endpoints/Initial-architecture.drawio.png){: .center-image }

Pardon my bad drawing skills but above is the initial architecture, I believe its better to explain via diagram instead of textual explanation. We have two resource groups, one contains all the VNets, PEs and app services, we'll call this one as "RG1" and the other one just contained some AKS resources, its name will be "RG2".

When I created these private endpoints, I created a VM in each VNet to check resolution of SQL server's FQDN and performed `nslookup` on the FQDN, despite having PE connected to VNet A, it was still resolving to the public IP address of the SQL server.

![Public IP](/assets/Navigating-the-maze-of-multiple-private-endpoints/publicIP.png){: .center-image }

Upon some troubleshooting, I hoped onto the "private DNS zone" in RG1 and when I checked the virtual network links in it, so the VNet A and B were not in there but just the AKS's VNet i.e. VNet C. I added the missing VNets went to the virtual network links, ran `nslookup` again and it resolved to the private IP address \***\*sigh\*\***

![Private IP](/assets/Navigating-the-maze-of-multiple-private-endpoints/privateIP.png){: .center-image }

But, that was not it. I kept receiving the complains from development team that their apps are not able to access the SQL server when we disabled public access on it and it was getting to my nerves because I could clearly see private IP resolution.

I researched around to get some help and found [this post](https://www.jannemattila.com/azure/2024/01/29/multiple-private-endpoints.html) but that didn't discuss the solution and it only discusses the problem of multiple PEs over-writing the A records, it was helpful piece of information though that came in handy down the road.

## The role of Private DNS Zones in PEs

For your FQDN to resolve to private IP you need to have the A record configured in the private DNS zone, so that the incoming request can route to the proper private endpoint so if the FQDN is `tecvity.database.windows.net` it will resolve to a private IP address of the private endpoint which will be configured in the recordset of the private DNS zone (PDS).

When I added multiple VNets to the Virtual Network Links of the PDS, all of them started to point requests to `tecvity.database.windows.net` to the same private IP which means all of the VNets started pointing to the same PE. But each VNet had its own PE and if 172.16.1.4 is private IP in one VNet, it wont resolve to the SQL server in another VNet, I noticed this when my VM in VNet A had private IP of 10.x.x.x pattern whereas 172.x.x.x pattern was in VNet B.

But we want multiple PEs to direct traffic to SQL server, right? Can we add multiple A records for `tecvity.database.windows.net` and point them to different private IPs? Obviously not, it doesn't make sense to have one A record for multiple IPs.

Here comes few options that I got from Microsoft QnA platform (huge shoutout to them):

1. Enable VNet peering between all the VNets that will mean any resource in these VNets can access other VNet's resource privately. We could use only one PE, one PDS.
2. Create three different PDS integrated to the three respective VNets and now each will have its own A record pointing to its PE

Going with #1 though minimizes the effort but for VNet peering to be enabled subnets cannot overlap between the VNet which was the case for me and trying to fix it may produce other problems in the infrastructure so I went with #2 with a slightly modified approach.

Here are the architectural changes I made:

- Instead of creating 3 PDs, I created 2, one in RG1 and other in RG2
- I noticed that VNet A and VNet B can be merged, so I removed VNet B and just integrated function apps with VNet A, after all they're in same region
- I moved VNet C and PE 3 to RG2, why not? Cleaner architecture.

The resultant architecture looked something like this:

![Final Architecture](/assets/Navigating-the-maze-of-multiple-private-endpoints/final-arch.drawio.png){: .center-image }

Now, each VNet has its own private DNS resulting in unique A record for each private endpoint, VM now was able to resolve to the correct private IP and whole infrastructure worked properly with PEs.

Fun fact, Microsoft support also liked this :D
![MS Support](/assets/Navigating-the-maze-of-multiple-private-endpoints/support.png){: .center-image }

### The Takeaways

1. Always create multiple private DNS zones manually as this is not handled by Azure if you create a new private endpoint.
2. If you create a new PE, it will overwrite the A record that can stop your previous PE from working in that resource group as well.
3. If creating multiple PDSs is not an option for you, consider VNet peering.

To troubleshoot PEs, I found [this](https://learn.microsoft.com/en-us/azure/private-link/troubleshoot-private-endpoint-connectivity) documentation from Microsoft to be very helpful so must check out if stuck with PEs.

This was my first time configuring multiple PEs on a single resource so I might have made some mistakes, if you know of a better approach or just want to share your experience, comments section is below.

Happy securing cloud!

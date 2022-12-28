---
layout: post
title: "Utilizing Data from Azure Defender for Cloud to Maximize Cloud Security with Resource Graph Explorer: A Step-by-Step Guide"
tags:
  - Cloud Security
  - Azure
  - KQL
  - Defender for Cloud
  - Resource Graph Explorer
author: "Najam Ul Saqib"
comments: true
description: "Learn how to extract security findings and recommendations from Azure Defender for Cloud using Resource Graph Explorer. This tutorial provides step-by-step instructions and a sample query to help you get started with analyzing your Azure environment for potential security issues and receiving recommendations for how to address them."
---

Cloud security has become increasingly important as more organizations migrate their infrastructure and applications to the cloud. The benefits of the cloud, such as scalability, flexibility, and cost-effectiveness, make it an attractive option for businesses of all sizes. However, with the move to the cloud comes the need to ensure that data and systems are secure. Security analysts play a critical role in helping organizations protect their assets in the cloud. As such, it is important for security analysts to stay up-to-date on the latest cloud security best practices and tools, such as Azure Defender for Cloud and Resource Graph Explorer, to ensure that their organization's cloud environment is secure.

As a security engineer, I was asked to provide an Excel sheet of all the security findings from Azure Defender for Cloud. However, I quickly realized that there was no apparent functionality in the Azure portal to do this. I was faced with the daunting task of manually generating a list of findings, which was time-consuming and not very productive. I was stuck and didn't know how to proceed.

Upon searching online for solutions, I came across different articles, and most of them referred to [Azure Resource Graph](https://learn.microsoft.com/en-us/azure/governance/resource-graph/overview) but I kept on digging for some time. That's when I discovered Resource Graph Explorer and learned about the power of Resource Graph queries.

It was apparent that by writing queries in the RGE (Resource Graph Explorer) I can extract data but the language used for these queries was KQL [Kusto Query Language](https://learn.microsoft.com/en-us/azure/data-explorer/data-explorer-overview) was something I never saw before. The documentation was good enough to teach me the basics of it.

I looked online for the already written queries that the community might have shared, after all its Azure and people would definitely have felt the need to export the data from defender for cloud. All I could find is [this list of samples](https://learn.microsoft.com/en-us/azure/defender-for-cloud/resource-graph-samples?tabs=azure-cli) though it provided some samples but it did not contain what I was looking for.

I was looking for the ability to extract the list that is displayed under "Remediate security configurations" and "Machines should have vulnerability findings resolved" in the recommendations section of Microsoft Defender for Cloud. The list should contain all the effected resources along with the security issues on them mentioned individually with the severity,impact,remediation,etc. I believe this is a very basic requirement and people have written queries for it but never thought about sharing it with community and thats the purpose of writing this post.

There was no documentation that mentioned what are the data sources from which I can fetch the defender related data. Obviously when you need to query the data from a table you need to know what are the columns present in it and what nature of data is stored there. There was no documentation on Microsoft that mentioned it (at least none I could find).

After some research, couple of things were clear, the name of data source that contained the defender for cloud data is `SecurityResources` came to know this from the samples link shared above. So what if I could list all the resources in this table? Here's the query

```kql
SecurityResources
| distinct type
```
The results will be something like this
<p align="center">
<img src="/assets/images/posts/resource-graph-explorer-azure/types.png" >
</p>
This list provides some insight into what kind of data is present under `SecurityResources` the one that intrigued me was `microsoft.security/assessments/subassessments` so I wrote a query that outputs the data in it.
```kql
SecurityResources
| where type == "microsoft.security/assessments/subassessments"
```
It returned a huge data set containing 30 thousand items
<p align="center">
<img src="/assets/images/posts/resource-graph-explorer-azure/subassessments.png" >
</p>
But upon close inspection of the `properties` column which looked something like
```json
{
    "description": "SMB Signing Disabled or SMB Signing Not Required",
    "resourceDetails": {
        "id": "redacted",
        "source": "Azure"
    },
    "displayName": "SMB Signing Disabled or SMB Signing Not Required",
    "additionalData": {
        "assessedResourceType": "ServerVulnerability",
        "vendorReferences": [],
        "publishedTime": "1999-01-01T08:00:00.0000000Z",
        "source": "Built-in Qualys vulnerability assessment",
        "patchable": false,
        "type": "VirtualMachine",
        "cvss": {
            "2.0": {
                "base": 7.3
            }
        },
        "cve": [],
        "threat": "This host does not seem to be using SMB (Server Message Block) signing. SMB signing is a security mechanism in the SMB protocol and is also known as security signatures. SMB signing is designed to help improve the security of the SMB protocol.\n<P>\nSMB signing adds security to a network using NetBIOS, avoiding man-in-the-middle attacks.\n<P>\nWhen SMB signing is enabled on both the client and server SMB sessions are authenticated between the machines on a packet by packet basis.<P>\n\nQID Detection Logic:<BR>\nThis checks from the registry value of RequireSecuritySignature and EnableSecuritySignature from HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Services\\LanmanWorkStation\\Parameters for client and HKEY_LOCAL_MACHINE\\System\\CurrentControlSetServices\\LanmanServer\\Parameters for servers to check if SMB signing is required or enabled or disabled.<P>\n\nNote: On 5/28/2020 the QID was updated to check for client SMB signing behavior via the registry key HKEY_LOCAL_MACHINE\\SystemCurrent\\ControlSetServices\\LanmanWorkStation\\Parameters. The complete detection logic is explained above.<P> "
    },
    "timeGenerated": "2022-12-22T09:36:00.0420000Z",
    "status": {
        "severity": "Medium",
        "code": "Unhealthy"
    },
    "remediation": "Without SMB signing, a device could intercept SMB network packets from an originating computer, alter their contents, and broadcast them to the destination computer. Since, digitally signing the packets enables the recipient of the packets to confirm their point of origination and their authenticity, it is recommended that SMB signing is enabled and required.\n<P>\nPlease refer to Microsoft's article <A HREF=\"http://support.microsoft.com/kb/887429\" TARGET=\"_blank\">887429</A> and <A HREF=\"https://docs.microsoft.com/en-us/archive/blogs/josebda/the-basics-of-smb-signing-covering-both-smb1-and-smb2\" TARGET=\"_blank\">The Basics of SMB Signing (covering both SMB1 and SMB2)</A>  for information on enabling SMB signing. \n<P>\nFor Windows Server 2008 R2, Windows Server 2012, please refer to Microsoft's article <A HREF=\"http://technet.microsoft.com/en-us/library/cc731957.aspx\" TARGET=\"_blank\">Require SMB Security Signatures</A> for information on enabling SMB signing. For group policies please refer to Microsoft's article <A HREF=\"http://technet.microsoft.com/en-us/library/cc731654\" TARGET=\"_blank\">Modify Security Policies in Default Domain Controllers Policy</A>\n<P>\nFor UNIX systems<P>\n\nTo require samba clients running \"smbclient\" to use packet signing, add the following to the \"[global]\" section of the Samba configuration file: <P>\n\nclient signing = mandatory\n<P>\n",
    "id": "90043",
    "category": "Windows",
    "impact": "Unauthorized users sniffing the network could catch many challenge/response exchanges and replay the whole thing to grab particular session keys, and then authenticate on the Domain Controller."
}
```
It definitely looked like the vulnerabilies I was trying to fetch, so I further refined the query to separate out the vulnerabilities from the security misconfiguration/system hardening issues. Here are the two queries I wrote

### For fetching list of all the effected resources with the vulnerability information (Machines should have vulnerability findings resolved)
```kql

SecurityResources
| where type == "microsoft.security/assessments/subassessments" and properties.additionalData.assessedResourceType == "ServerVulnerability" and properties.status.code == "Unhealthy"
| extend vulnerability=properties.displayName,
    description=properties.description,
    severity=properties.status.severity,
    threat=properties.additionalData.threat,
    impact=properties.impact,
    fix=properties.remediation,
    vulnId=properties.id
| project id,vulnId,vulnerability,severity,description,threat,impact,fix

```
I was listing only the open issues by specifying the code to be "Unhealthy", I came to know the structure of the data returned by analyzing the `properties` JSON mentioned above and carved the query accordingly. This query returns all the vulnerabilities but here's a catch. I noticed that there are still some findings missing from the output, and realized that there are some other `assessedResourceTypes` as well so to list all the available resource types, I ran
```kql
SecurityResources
| where type == "microsoft.security/assessments/subassessments"   and properties.status.code == "Unhealthy"
| summarize count() by Type = tostring(properties.["additionalData"].["assessedResourceType"])

```
The output was
<p align="center">
<img src="/assets/images/posts/resource-graph-explorer-azure/resourcetypes.png" >
</p>
So now I was clear what different types of resources existed and could modify the query accordingly.
```kql
SecurityResources
| where type == "microsoft.security/assessments/subassessments" and properties.additionalData.assessedResourceType == "ServerVulnerability" or properties.additionalData.assessedResourceType == "ServerVulnerabilityTvm"  and properties.status.code == "Unhealthy"
| extend vulnerability=properties.displayName,
    description=properties.description,
    severity=properties.status.severity,
    threat=properties.additionalData.threat,
    impact=properties.impact,
    fix=properties.remediation,
    vulnId=properties.id
| project id,vulnId,vulnerability,severity,description,threat,impact,fix
```
This served the purpose pretty well. You can modify the query according to your needs.

### To fetch the list of security misconfigurations (Remediate Security Configurations)
The security configurations are present under the `GeneralVulnerability` category, hence the query would become
```kql
SecurityResources
| where type == "microsoft.security/assessments/subassessments" and properties.additionalData.assessedResourceType == "GeneralVulnerability"  and properties.status.code == "Unhealthy"
| extend Title=properties.displayName,
    Description=properties.description,
    Impact=properties.impact,
    Fix=properties.remediation
| project id,Title,Description,Impact,Fix
```
After fetching the results, I downloaded it as CSV with button "Download as CSV" and life became beautiful again :)

By using Resource Graph queries, I was able to automate the process of extracting security findings and recommendations from Defender for Cloud and generate an Excel sheet with the results. This saved me a lot of time and effort and made it much easier for me to meet the needs of my stakeholders.

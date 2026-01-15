---
layout: post
title: "Privilege Escalation in Azure using Automation Accounts"
categories: [Azure security]
tags: [cloud security, azure, automation accounts, managed identity]
assets: /assets/Automation-account-privilege-escalation/
author: Najam Ul Saqib
comments: true
description: "You can raise your privileges in Azure if you have automation accounts and managed identities configured in a specific way. Read the post to learn more."
---

# Is Privilege Escalation a thing in Azure?

Yes. Usually penetration testers know about priv-esc in operating systems e.g. Linux, Windows, etc but it is equally (if not more) critical in cloud environments as well.

There are numerous pathways to escalate the privileges in a cloud environment, and I am going to discuss the method via automation accounts here.

# Current Resources/Work

There are multiple good resources out there on the internet on the topic of privilege escalation via managed identities in Azure.

- [Azure Privilege Escalation Using Managed Identities - Karl Fosaaen](https://www.netspi.com/blog/technical-blog/cloud-pentesting/azure-privilege-escalation-using-managed-identities/)
- [Managed Identity Attack Paths, Part 1: Automation Accounts](https://posts.specterops.io/managed-identity-attack-paths-part-1-automation-accounts-82667d17187a)
- [Pivoting with Azure Automation Account Connections - Karl Fosaaen](https://www.netspi.com/blog/technical-blog/cloud-pentesting/azure-automation-account-connections/)

I don't want to reinvent the wheel, therefore I will write this post about the peculiar case I found in my work and how I was able to escalate to "Contributor" role in Azure; I will explain the steps I took and tools I used so one can follow along if you have something similar.

# How to know that Azure account is vulnerable to this PE vector?

Before diving into it straightaway, we need to assess whether or not this applies to our Azure environment as well, right?

You may-be assessing the security of your client's environment or may-be you just want to assess your own environment. You might have different roles assigned to your user e.g. Owner, Contributor or some low-privileged [job function role](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles)

The best bet will be to start with "Get-AzPasswords" cmdlet of [MicroBurst](https://github.com/NetSPI/MicroBurst), first you need to connect your Azure account in Powershell using "Connect-AzAccount" then you can run this.

This module will scan various Azure resources i.e. KeyVaults, Storage Accounts, etc but to save time and focus on automation accounts only here's the command that you can use.

`Get-AzPasswords -StorageAccounts N  -AppServices N  -Keys N -ACR N -CosmosDB N -AKS N -CognitiveServices N -BatchAccounts N -AppConfiguration N -ServiceBus N -APIManagement N -ContainerApps N -FunctionApps N -Verbose
`

Basically, disabling every other scan but automation account. This module will perform different checks on the automation account, but in the scenario I faced, it tackled following situation:

- Automation Accounts had system assignedmanaged identity enabled on them
- Current user had the privileges to run jobs in automation account _(so for this attack vector the minimum role you should've is **"Automation Job Operator"** or some role that allows you to run jobs.)_

The "Get-AzPasswords" cmdlet used runbooks to fetch the token of system-assigned MI of the automation account. In the background, it uploads, publishes, executes and then removes the automation account returning the token of MI.

![Get-AzPasswords Output](/assets/Automation-account-privilege-escalation/azpassword-output.png){: .center-image }

So clearly we have a token of an automation account (probably used for patching work), that can be utilized further. This is the point you should investigate what can you do with this token in your environment.

# Analyzing the token

When you analyze the token returned in tools like jwt.io, the output looks something like
![JWT Output](/assets/Automation-account-privilege-escalation/jwt-decoded.png){: .center-image }

There are a lot of unknowns but the fact that this token is for Azure management API and is issued by STS which is Entra's Token Service explains that this token is an access token. The "iat","nbf",and "exp" entries reveal that this token is short-lived. All these characteristics are of "Access Tokens", references to Microsoft docs can be found at the end of this post

## Authtenticating via the token

Now, we need to use this token to authenticate to Azure and we can use "Connect-AzAccount" cmdlet available in [Az](https://docs.microsoft.com/en-us/powershell/azure/new-azureps-module-az?view=azps-3.6.1) module by Microsoft supplying the `-AccessToken` parameter in the command like this

`Connect-AzAccount -AccessToken "<insert-token-here>"`

![Authenticating via token](/assets/Automation-account-privilege-escalation/authentication.png){: .center-image }

In this case, I was able to authenticate and fetch the list of resource groups in the subscription.

## What permissions do we have with this token?

The most important part of this engagement is, we need to see the roles assigned to this managed identity, and to do so we have two methods

### 1. Decode the JWT and get "oid" (Manual Way)

oid is actually the ObjectId of the token and you need it to find role assignments, so you can copy the "oid" value (see the JWT screenshot up in the post) and pass to `Get-AzRoleAssignment -ObjectId $oid`

### 2. Use the power of shell (Powershell)

You can run following code in your Powershell where you've authenticated using access token and list the roles

```
# Get token in system.security.securestring format and decode it
$securestring = (Get-AzAccessToken).token
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
$plaintext = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

$token = $plaintext.Split(".")[1].Replace('-', '+').Replace('_', '/')

while ($token.Length % 4) {$token += "="}
# Decode the token, and match the ObjectIds returned by Get-AzRoleAssignment with oid section of JWT. You can also manually decode the JWT and pass oid to Get-AzRoleAssignment -ObjectId $oid
Get-AzRoleAssignment | where ObjectId -EQ ([System.Text.Encoding]::ASCII.GetString([System.Convert]::FromBase64String($token)) | ConvertFrom-Json).oid
```

Gist URL: [https://gist.github.com/njmulsqb/536e052aec5aa3d1f3f28fd5bdc1eb7e](https://gist.github.com/njmulsqb/536e052aec5aa3d1f3f28fd5bdc1eb7e) (Inspired from Karl's [Gist](https://gist.github.com/kfosaaen/e9a77a15ea7f26c05fd0f1a8ad85b0fd))

The output will look like this:
![Role Assignments](/assets/Automation-account-privilege-escalation/roles.png){: .center-image }

This token originally had three roles assigned to it:

1. Contributor
2. Scheduled Patching Contributor
3. Virtual Machine Contributor

Once issue was reported, Contributor was removed immediately before this post was drafted that's why it's not visible in screenshot.

Now, given that we had Contributor access on the token, we were able to create new resources, modify or delete the existing ones using Azure Powershell cmdlets. The resource group on which we had the Contributor access contained production workloads so we could've done anything to them and in the logs it would say "Patching-Automation-Account" did that.

Even though they didn't remove "Virtual Machine Contributor" role on subscription level, that too can be devastating given that they've most of their servers running on virtual machines. A simple powershell script and all of them can be deleted.

# Conclusion

Avoid giving high privileged roles to identities in your cloud.

# References

- https://learn.microsoft.com/en-us/entra/identity/devices/concept-tokens-microsoft-entra-id
- https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens
- https://learn.microsoft.com/en-us/entra/identity-platform/security-tokens
- For complete list of Az cmdlets, refer to this [article](https://learn.microsoft.com/en-us/powershell/module/?view=azps-14.0.0).

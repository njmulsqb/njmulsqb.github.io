---
layout: post
title: "The Blitzkrieg Effect: Infiltrating an Enterprise Active Directory Environment"
tags:
  - Active Directory
  - Penetration Test
  - Offensive Security
author: "Najam Ul Saqib"
comments: true
description: "Explore real-world insights from a successful penetration test on an enterprise Active Directory environment. Learn how the domain controllers were compromised within just a few hours using multiple attack vectors. From initial recon to privilege escalation and lateral movement, this case study offers a comprehensive guide to Active Directory security weaknesses and how to fortify them."
---
Fix the comments section before pushing this post in prod

Active directory environments have always intrigued me but for some reasons I never got the chance to get my hands dirty on an enterprise level AD environment until this one. I was asked by a company (which we will refer to as "EvilCorp" -- {inspired by Mr. Robot} to not disclose their real identity here) to perform penetration test on their active directory environment. As I mentioned I had no experience with such large scale AD environment before so it involved lots of learning on the run so you might feel that I wasted some time or my approach wasn't straightforward but I am sharing it anyway so that you can learn from my mistakes and hopefully do better than me.

# Scope Details

The AD environment of evilcorp was completely hosted on Azure cloud. The scope quite obviously was to compromise the domain controllers. I was given the address spaces as there were multiple subnets that contained the AD environment. The scope was limited to the AD environment only and I was not allowed to perform any attacks on the Azure cloud infrastructure.

For testing I was given a domain-joined user account and also a Kali VM in the network so that I could try both credentialed and non-credential approach.

# Initial Recon

Given my weak concepts of networking (I dont really love learning about subnets and stuff, but strong networking skills would've greatly helped me here) I started with the basics. I started with the subnet that contained the Kali VM and the domain controller. I ran a simple nmap scan to sweep the network, find live hosts and DC IPs. Soon I realized that my Kali VM is in different subnet whereas the domain-joined windows VM is in different one but nevertheless I scanned the subnet that contained the Windows VM and it brought me some information about the domain controllers.

You can detect the domain controllers by looking for the LDAP port (389) and Kerberos port (88) open on the host. There were other common ports among the DC's as well. I used Zenmap for larger networks as I like the way it displays the results.

![LDAP Ports](/assets/images/posts/ad-pentest/ldap.png){:style="display:block; margin-left:auto; margin-right:auto"}

![Kerberos Ports](/assets/images/posts/ad-pentest/kerberos.png){:style="display:block; margin-left:auto; margin-right:auto"}

Here's how one of the DC looked like in Zenmap:

![DC03 Zenmap Output](/assets/images/posts/ad-pentest/port-scan-zenmap.png){:style="display:block; margin-left:auto; margin-right:auto"}

The fact that the DC was named like DC03 and the other DC was DC04 (10.174.14.19), so there should be DC01 and DC02, right?
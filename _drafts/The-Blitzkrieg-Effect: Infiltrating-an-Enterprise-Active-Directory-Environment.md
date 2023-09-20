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

The AD environment of evilcorp was completely hosted on Azure cloud. The scope quite obviously was to compromise the domain controllers. I was given the address spaces as there were multiple subnets that contained the AD environment. The scope was limited to the AD environment only and I was not allowed to perform any attacks on the Azure cloud infrastructure. All the VMs in the environment were running CrowdStrike Falcon XDR.

For testing I was given a domain-joined user account and also a Kali VM in the network so that I could try both credentialed and non-credential approach.

# Initial Recon

Given my weak concepts of networking (I dont really love learning about subnets and stuff, but strong networking skills would've greatly helped me here) I started with the basics. I started with the subnet that contained the Kali VM and the domain controller. I ran a simple nmap scan to sweep the network, find live hosts and DC IPs. Soon I realized that my Kali VM is in different subnet whereas the domain-joined windows VM is in different one but nevertheless I scanned the subnet that contained the Windows VM and it brought me some information about the domain controllers.

You can detect the domain controllers by looking for the LDAP port (389) and Kerberos port (88) open on the host. There were other common ports among the DC's as well. I used Zenmap for larger networks as I like the way it displays the results.

![LDAP Ports](/assets/images/posts/ad-pentest/ldap.png){:style="display:block; margin-left:auto; margin-right:auto"}

![Kerberos Ports](/assets/images/posts/ad-pentest/kerberos.png){:style="display:block; margin-left:auto; margin-right:auto"}

Here's how one of the DC looked like in Zenmap:

![DC03 Zenmap Output](/assets/images/posts/ad-pentest/port-scan-zenmap.png){:style="display:block; margin-left:auto; margin-right:auto"}

The fact that the DC was named like DC03 and the other DC was DC04 (10.174.14.19), so there should be DC01 and DC02, right?

I scanned the other address spaces and there they were! DC01 and DC02; so in total we had 4 domain controllers across 2 different VNets.

# Going non-credentialed first

I first tried to see if I can break into the domain; tried to get the foothold using just Kali.

Began with LLMNR poisoning. I used Responder to poison the LLMNR and NBT-NS requests. After I ran LLMNR poisoning, I was hoping for hashes flying around in my terminal which usually happens in big environments, but I got nothing. Absolute silence! I left the the responder running over night expecting to get some hashes but the next day there was nothing on the terminal ☹️

I logged into the domain-joined machine to see if I can invoke the LLMNR poisoning manually, wrote some non-existent shares into the file explorer hoping that it will invoke LLMNR and Responder will catch the hash but nothing happened. The responder was not entertaining the LLMNR queries and it only worked when I manually entered the IP of the attacker machine like \\attacker-IP-address in the file explorer, in that case I was getting the hashes but that was not what I wanted. I wanted to get the hashes by just running responder and waiting for the hashes to come in.

Did lots of digging, spent numerous hours in it but it was not working. LLMNR was enabled on the hosts, I was able to ping all the DCs from Kali and Kali was reachable in the network too but it was not working. Everything looked fine on my end, upon running the responder in analyze mode I observed a DNS IP which I wasn't aware of

![Responder Output](/assets/images/posts/ad-pentest/responder-analyze.png){:style="display:block; margin-left:auto; margin-right:auto"}
and after consulting with the IT team, I came to know that all the DCs are further utilizing another (different) DNS server which is not accessible from my Kali VM. I was able to ping the DCs because they were in the same subnet but I was not able to resolve the hostnames because the DNS server was not accessible from my Kali VM. I was able to resolve the hostnames from the domain-joined machine because it was using the DNS server that was accessible from it. The DCs were further communicating with DCs in a separate network and organization that was not part of the scope.

<img src="https://media.giphy.com/media/AjYsTtVxEEBPO/giphy.gif" alt="LLMNR Poisoning" style="display:block; margin-left:auto; margin-right:auto">

I don't know the reason behind this complex configuration but my DNS and LLMNR queries were being lost or not reachable to me. I was not able to get the hashes using LLMNR poisoning. For similar reason, IPv6 poisoning and SMB relay were also not working (IPv6 was enabled and SMB signing was disabled). This demanded more digging into the DNS services and network design (curse my weak networking concepts again) and the other network was not in scope as well so I couldnt enumerate/attack it hence without wasting more time with the uncredentialed approach, I decided to move on to the credentialed approach.



---
layout: post
title: "The Blitzkrieg Effect: Infiltrating an Enterprise Active Directory Environment Twice"
tags:
  - Active Directory
  - Penetration Test
  - Offensive Security
author: "Najam Ul Saqib"
comments: true
description: "Explore real-world insights from a successful penetration test on an enterprise Active Directory environment. Learn how the domain controllers were compromised within just a few hours using multiple attack vectors. From initial recon to privilege escalation and lateral movement, this case study offers a comprehensive guide to Active Directory security weaknesses and how to fortify them."
date: "2023-09-23"
---

Active directory environments have always intrigued me but for some reasons I never got the chance to get my hands dirty on an enterprise level AD environment until this one. I was asked by a company (which we will refer to as "EvilCorp" -- {inspired by Mr. Robot} to not disclose their real identity here) to perform penetration test on their active directory environment. As I mentioned I had no experience with such large scale AD environment before so it involved lots of learning on the run so you might feel that I wasted some time or my approach wasn't straightforward but I am sharing it anyway so that you can learn from my mistakes and hopefully do better than me.

# Scope Details

The AD environment of Evilcorp was completely hosted on Azure cloud. The goal quite obviously was to compromise the domain controllers. I was given the address spaces as there were multiple subnets that contained the AD environment. The scope was limited to the AD environment only and I was not allowed to perform any attacks on the Azure cloud infrastructure. All the VMs in the environment were running CrowdStrike Falcon XDR.

For testing I was given a domain-joined user account and also a Kali VM in the network so that I could try both credentialed and non-credential approach.

# Initial Recon

Given my weak concepts of networking (I dont really love learning about subnets and stuff, but strong networking skills would've greatly helped me here) I started with the basics. I started with the subnet that contained the Kali VM and the domain controller. I ran a simple nmap scan to sweep the network, find live hosts and DC IPs. Soon I realized that my Kali VM is in different subnet whereas the domain-joined windows VM is in different one but nevertheless I scanned the subnet that contained the Windows VM and it brought me some information about the domain controllers.

You can detect the domain controllers by looking for the LDAP port (389) and Kerberos port (88) open on the host. There were other common ports among the DC's as well. I use Zenmap for larger networks as I like the way it displays the results.

![LDAP Ports](/assets/images/posts/ad-pentest/ldap.png){:style="display:block; margin-left:auto; margin-right:auto"}

![Kerberos Ports](/assets/images/posts/ad-pentest/kerberos.png){:style="display:block; margin-left:auto; margin-right:auto"}

Here's how one of the DC looked like in Zenmap:

![DC03 Zenmap Output](/assets/images/posts/ad-pentest/port-scan-zenmap.png){:style="display:block; margin-left:auto; margin-right:auto"}

The fact that the DC was named like DC03 and the other DC was DC04 (10.174.14.19), so there should be DC01 and DC02, right?

I scanned the other address spaces and there they were! DC01 and DC02; so in total we had 4 domain controllers across 2 different VNets.

# Going non-credentialed first

I first tried to see if I can break into the domain; tried to get the foothold using just Kali.

Began with LLMNR poisoning. I used Responder to poison the LLMNR and NBT-NS requests. After I ran LLMNR poisoning, I was hoping for hashes flying around in my terminal which usually happens in big environments, but I got nothing. Absolute silence! I left the the responder running over night expecting to get some hashes but the next day there was nothing on the terminal ☹️

I logged into the domain-joined machine to see if I can invoke the LLMNR poisoning manually, wrote some non-existent shares into the file explorer hoping that it will invoke LLMNR and Responder will catch the hash but nothing happened. The responder was not entertaining the LLMNR queries and it only worked when I manually entered the IP of the attacker machine like `\\attacker-IP-address` in the file explorer, in that case I was getting the hashes but that was not what I wanted. I wanted to get the hashes by just running responder and wait for users to invoke LLMNR queries.

Did lots of digging, spent numerous hours in it but it was not working. LLMNR was enabled on the hosts, I was able to ping all the DCs from Kali and Kali was reachable in the network too but it was not working. Everything looked fine on my end, upon running the responder in analyze mode I observed a DNS IP which I wasn't aware of

![Responder Output](/assets/images/posts/ad-pentest/responder-analyze.png){:style="display:block; margin-left:auto; margin-right:auto"}
and after consulting with the IT team, I came to know that all the DCs are further utilizing another (different) DNS server which is not accessible from my Kali VM. I was able to ping the DCs because they were in the same subnet but I was not able to resolve the hostnames because the DNS server was not accessible from my Kali VM. I was able to resolve the hostnames from the domain-joined machine because it was using the DNS server that was accessible from it. The DCs were further communicating with DCs in a separate network and organization that was not part of the scope.

<img src="https://media.giphy.com/media/AjYsTtVxEEBPO/giphy.gif" alt="LLMNR Poisoning" style="display:block; margin-left:auto; margin-right:auto">

I don't know the reason behind this complex configuration but my DNS and LLMNR queries were being lost or not reachable to me. I was not able to get the hashes using LLMNR poisoning. For similar reason, IPv6 poisoning and SMB relay were also not working (IPv6 was enabled and SMB signing was disabled). This demanded more digging into the DNS services and network design (curse my weak networking concepts again) and the other network was not in scope as well so I couldnt enumerate/attack it hence without wasting more time with the uncredentialed approach, I decided to move on to the credentialed approach.

# Going credentialed with the domain-joined VM

I logged into the windows VM with the user credentials given to me and first thing I did was that I ran [PingCastle](https://pingcastle.com) on the VM; I will highly suggest this tool once you've got foothold as it really gives lots of information. Here's how the output summary looked like
![Ping Castle Summary](/assets/images/posts/ad-pentest/pingcastle.png)
It showed 100/100 risk level and some kerberoastable users, but there was something very shocking, among the administrators list I found that the user account given to me was also a member of the domain admins group. I was like "What the hell? How can a user account be a member of domain admins group?". I was not expecting this at all. I was expecting to get a low privileged user account and then I would have to escalate the privileges to domain admin but I was already a domain admin. I was not sure if this was a mistake or it was intentionally done by the IT team but I was not complaining. I was happy that I was already a domain admin and I didn't have to escalate the privileges. I was able to do anything I wanted to do in the domain. There was huge numbers of users with admin rights and mine was one of them (maybe they gave the users these rights by default?) **I logged into all 4 of the DCs and I was in so at this point I can claim that I compromised the AD environment.**

<img src="https://media.giphy.com/media/jsZIN7jaaFLvbjPy7l/giphy.gif" alt="LLMNR Poisoning" style="display:block; margin-left:auto; margin-right:auto">

Well, it was indeed a catch but felt like a cheatcode so I without informing the company, created a low-privileged user to try compromising the AD again (the new user alone should've rang the bells but it didn't) so I forgot about the domain admin account and started working on the low-privileged user account.

## Compromising the AD environment (again) with low-privileged user

The user I created was given the username "test" and password was given the same as the previous user's password i.e. "ChangeMe!" and role of Domain User only.

With this user, I ran bloodhound via the Kali VM to map out the AD environment and it gave lots of information. Strangely, I was able to run bloodhound on DC01 and DC02 but not on DC03 and DC04 and supposedly those DNS configurations were to be blamed here too.

```bash
sudo bloodhound-python -d evilCorp.local -u test -p ChangeMe! -ns 10.175.14.22 -c all
```

The bloodhound was also revealing the kerberoastable users that were in high value groups, I ran Plumhound on bloodhound results and it gave some interesting results. I tried ldapdomaindump but it didn't work and infact it was not required since Bloodhound and Plumhound did a great job

```bash
sudo python3 PlumhHound.py -x tasks/default.tasks -p 8118
```

So it made total sense to try kerberoasting first.

### Kerberoasting

I requested the kerberos tickets using the following command from the DC

```bash
impacket-GetUserSPNs evilCorp.local/test:ChangeMe! -dc-ip 10.175.14.22 -request
```

and guess what? I got the kerberos hashes for four accounts that were part of the admin group. The hashes were of type `Kerberos 5, etype 23, TGS-REP` as detected by hashes.com and module for that in hashcat is [13100](https://hashcat.net/wiki/doku.php?id=example_hashes). I used rockyou wordlist to crack the hashes.

```bash
hashcat -a 0 -m 13100 kerberoasting-hashes.txt ~/rockyou.txt
```

but nah! In a desperate attempt, I made a single wordlist by combining all the password wordlists in Seclists (the resultant file became hugeeee) and used it to crack the hashes but unfortunately it also didn't work.

```bash
find . -name '*.txt' -exec cat {} + | awk '!x[$0]++' > allPasswords.txt #The command that I ran in Seclists directory (Thanks ChatGPT)
```

The passwords were very strong for those accounts or if not strong they were not in my wordlist at least.

### Trying to steal credentials (and getting caught by XDR)

After not being able to crack the Kerberos hashes; I thought of going for mimikatz and see if I can steal the credentials somehow. Running it instantly was blocked by the XDR on the host machine. I without wasting time, moved forward to _Token Impersonation_ and tried to get the tokens from the logged in sessions on different machines. I opted for Metasploit for this attack but it failed too
![MSFConsole](/assets/images/posts/ad-pentest/token-imper.png){:style="display:block; margin-left:auto; margin-right:auto"}

it was failing with the domain admin account as well so definitely XDR was blocking everything now and soon enough I got email from the IT dept that they have identified a breach attempt asking if that was me.
![CrowdStrike Falcon Alert](/assets/images/posts/ad-pentest/falcon-alert.png){:style="display:block; margin-left:auto; margin-right:auto"}
So now some of the tools (mimikatz, msfconsole) was being caught straightaway and I had to try something else.
<img src="https://media.giphy.com/media/w89ak63KNl0nJl80ig/giphy.gif" alt="LLMNR Poisoning" style="display:block; margin-left:auto; margin-right:auto">

### Let's take one step back

It was time to get back to basics because by then I had tried lots of stuff and nothing seemed to work. Got back to the PingCastle report and started looking at the risks one by one, that's when one of the risks intrigued me

![Old Admin Passwords](/assets/images/posts/ad-pentest/admin-passwords.png){:style="display:block; margin-left:auto; margin-right:auto"}

So apparently 13 admins have not changed their passwords in last 3 years, which means password expiration doesnt exist. Ping Castle report verified this.

![No Password Expiration](/assets/images/posts/ad-pentest/password-policy.png){:style="display:block; margin-left:auto; margin-right:auto"}

Let's try spraying common passwords using domain admin usernames (got those from Plumhound results) but common passwords lists are huge and they will produce lots of noise and cause account lockouts, right? So what if we first try the password that was supplied to us with the user account i.e. ChangeMe!? This is the password that is being used in the organization and it seems like IT admin creates account with this password and given the fact that the password expiration is not enabled, and the user is not enforced to change the password on first login (basic practice but huge impact) I decided to gave it a try.

```bash
crackmapexec smb 10.174.14.30 -u domain-admin-usernames.txt -p ChangeMe! -d EVILCORP.LOCAL --continue-on-success
```

I ran it on a single machine only because this is a domain joined VM so if credential works on one machine, it will on others so running it on whole subnet was not required. I got the following output

![Crackmapexec Output](/assets/images/posts/ad-pentest/cme.png){:style="display:block; margin-left:auto; margin-right:auto"}

Yes yes yes! The hypothesis was right; got many domain admins with the same password. I tried the same password to crack the kerberos hashes just to see if I was doing it the right way and this time I was able to crack one of the hashes as well. So the hashes were not that strong, it was just that my wordlist didn't contain the mighty `ChangeMe!`

I got into all 4 domain controllers AGAIN, dumped the NTDS.dit file using secretsdump and got the hashes of all the users on the domain, turned out that many other users also had the same password.

 <img src="https://media.giphy.com/media/3og0ILLVvPp8d64Jd6/giphy.gif" alt="LLMNR Poisoning" style="display:block; margin-left:auto; margin-right:auto">

as a side note; I also tried PrintNightmare and the servers were vulnerable as well but the exploit wasn't working I guess it was XDR again. XDR interestingly didn't catch the password spray and us exfiltrating data and secrets out of the DC.

I used enum4linux in the process and that produced lots of information from SPNs to users and workstations but I guess bloodhound earlier did a neat job with plumhound so I didn't use the enum4linux results. Often lots of informations also overwhelms you and you get lost in it so I decided to stick to bloodhound results only. Here is the list of tools that I used in the process

- Bloodhound
- Plumhound
- Crackmapexec
- Impacket
- Hashcat
- Responder
- Mimikatz
- Metasploit
- Enum4linux
- PingCastle
- Nmap
- Zenmap
- LDAPDomainDump
- SecretsDump
- MITM6
- SMBClient
- SMBMap
- Wadcoms

# Summary

So in summary, the organization who spent thousands of dollars in XDR and other security solutions, got their AD compromised because of a very common best practice that was not being enforced. I believe there were many more areas that could've been looked into to compromise the AD but I skipped them; and why should I focus on them when I can compromise the AD with single password. I wanted to move forward and try compromise the AD third time but you know time is always limited on such engagements so I had to stop there.

There will be cases when traditional attacks like LLMNR, SMB, MITMv6 etc won't work so don't give up, just stick to basics and you'll be able to find something that will work.

I hope you enjoyed reading this case study and I would love to read your feedback down in the comments. If you're looking for any type of pentest services, you can reach me out on [LinkedIn](https://www.linkedin.com/in/njmulsqb/) or via email on hello@tecvity.co

---
layout: post
title: "Hunting Sourcemaps On Steroids"
tags:
  - Source Code Analysis
  - Hacking
  - Bug Hunting
author: "Najam Ul Saqib"
comments: true
description: "How can you fetch JS code in original form that is non minified from any target? I have explained my methodology in this post"
---

JavaScript code analysis has got some hype shortly after people have found critical bugs like Auth Bypass, RCE, etc using JS analysis. Sourcemaps can be proved gold mine for security engineers, as they are used for reverse engineering minified client-side javascript and converting it from ugly-looking and horrible-to-read JS code to its original state which is comparatively hell lot easier to understand and finding security vulnerabilities then becomes easier.

Though, sourcemaps decoding feature is built into modern browsers e.g Firefox, Chromium, etc but it requires manual analysis, as you would need to go into developer console each time and if there are different URLs hosting JS files you would need to visit each URL one by one in browser, if you're unfamiliar of this technique, check this video out: [Improve your hacking skills using Devtools](https://www.youtube.com/watch?v=Y1S5s3FmFsI&list)

I had an option to fetch all the JS files using something like `wget` but in that case files having their sourcemaps wont be utilized and all we will get at the end is minified webpacked JS. So my goal was to not only fetch the JS files from the web server but also utilize their sourcemaps and reverse engineer them so that I can download original source code of all the client-side JS.

I started searching if some tool already exist for this purpose and found [Sourcemapper](https://github.com/denandz/sourcemapper) . This tool decodes the sourcemap given the sourcemap URL and outputs the original source. The syntax looks something like

`sourcemapper -url https://www.example.com/file.js.map -output dirName`

This tool was very handy and can be essential part of fetching all JS files with original source in mass quantity

For fetching `.js` files in mass quantity, you can use various methods, and tools are available to fetch `.js` links from a target. I used `gau` for this purpose and grepped JS results from it
`gau --subs example.com | grep [.]js`
This will fetch all the links ending with `.js` which will apparently be javascript files

Now, quite obviously these files will be minified so to convert them into their original form we need to check if they have sourcemaps or not. Only those JS files can be reverted to their original source that has their respective sourcemap available.

So to check which of the JS files have sourcemaps I thought of a way. If the JS filename is `file.js` then its sourcemap's name will be `file.js.map` so to check the existence of sourcemaps I need to first edit the filename and concatenate `.map` at the end and then check the URL if it returns sourcemap or not.

To solve the first challenge, i.e concatenating `.map` at the end of each URL, I turned to `sed` which is a stream editor and can be really powerful. I usually avoid regex stuff but in this case I had to learn a bit of it to use sed, and I think I should be using it more often as it makes life easier when it comes to stream editing on terminal.

Here's the sed command I used to replace every occurence of `.js` with `.js.map`

```
sed 's/[.]js/.js.map/'
```

Since explaining this command will get a bit out of topic so if you want to learn about it you can check this article out: [Beginners Guide to Sed](https://www.maketecheasier.com/beginners-guide-to-sed-linux/)

Now we can use this command with our gau results, its up to you, you can store the gau results in file and then sed the file content,

```
gau --subs example.com | grep [.]js | tee -a jsFiles.txt
cat jsFiles.txt | sed 's/[.]js/.js.map/'
```

or you can directly pipe the gau output to sed

```
gau --subs example.com | grep [.]js | sed 's/[.]js/.js.map/' --> Piping gau results to sed
```

I recommend storing gau output to file and then using it for text manipulation as its faster.

Now we need to check if the sourcemaps are available or not and for this purpose I used [HTTPx](https://github.com/projectdiscovery/httpx) from Project Discovery.

```
cat jsFiles.txt | sed 's/[.]js/.js.map/' | httpx -silent -mc 200
```

This will give us the sourcemaps that are available and waiting to be reverse engineered but here comes the tricky part that took most of my time.

I wanted to carve a single command that does all of the work, we have got the file URLs but how can we pass these to sourcemapper tool? Let me introduce you to our savior `xargs`, a shell command used to pass stdin as arguments to any command. Since we are getting sourcemap URLs via stdin so we can use xargs to pass these as arguments to sourcemapper tool. Here's how the command looked like

```
cat file.txt | sed 's/[.]js/.js.map/' | httpx -silent -mc 200 | xargs -I {} sourcemapper -url {} -output {}
```

Apparently, now each JS URL from file will be passed to sed first, sed will replace `.js` with `.js.map` which will then be probed by httpx by looking only for 200 status code, the output produced by httpx will be live sourcemaps which then will be passed to sourcemapper using xargs as arguments and we will get the source code in the output directory defined. Neat?

Unfortunately, there's one more challenge to solve before the solution is complete. Since the URL will look something like `https://www.example.com/file.js.map` and we are passing this as argument for both `-url` and `-output` to sourcemapper but no directory can be named like URL since the URL contains slashes that are used to define directory structure in Linux so sourcemapper threw error on this.

Therefore, I needed to edit the directory name being passed to `-output` flag, despite putting in so much time I could not figure out how can I edit only one of the argument being passed to xargs and not the one being passed to `-url` flag. At the end, I wrote a workaround in Python, that strips out the invalid characters from the URL so that it can be passed to directory name.

Yes, there was an easier solution, i.e to pass some random string like UUID or date to `-output` flag but then I wont be able to know the origin of source code.

The python code looked something like this:

<script src="https://gist.github.com/njmulsqb/1e78fceee4598734401e79aa7781a7d3.js"></script>

You can find it on Github here: [SourcemapWrapper](https://gist.github.com/njmulsqb/1e78fceee4598734401e79aa7781a7d3)

The script did the job well, and the final command was:

```
cat file.txt | sed 's/[.]js/.js.map/' | httpx -silent -mc 200 | xargs -I {} python3 sourcemapWrapper.py {}
```

This command will fetch you all the source code available with sourcemaps on target, if you believe that this approach can be improved in anyway, dont hesitate to reach out. Happy JS hunting!

---
title: "Interesting behavior of innerHTML on simple script XSS payload"
categories: [secure coding]
tags: [XSS, reactJS, secure coding]
assets: /assets/My-Transition-To-More-Privacy-Focused-Internet/
author: Najam Ul Saqib
comments: true
description: "Often times, while finding XSS we come across perfect payloads that don't fire, in this post I discuss one such scenario where an apparently malicious payload gets passed to the backend but still for some reason it doesn't work. Find out why?"
---

While going through the secure coding practices for ReactJS I pondered on how can an application built in ReactJS be vulnerable to XSS, came to know that ReactJS inherently is pretty secure against XSS attacks and that its JSX escapes the inputs pretty well. Apart from all this, ReactJS allows a way through which user input can be parsed into the DOM and that is through the `dangerouslySetInnerHTML` tag. Let's see how?

For example, consider this piece of code.

```javascript
export class BadXSS extends React.Component {
  state = {
    searchTerm: "",
    submittedSearch: "",
  };

  handleChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.setState({ submittedSearch: this.state.searchTerm });
  };

  render() {
    return (
      <div style={containerStyle}>
        <h2 style={headingStyle}>Bad Example</h2>
        <form onSubmit={this.handleSubmit}>
          <label style={labelStyle} htmlFor="searchInput">
            Search
          </label>
          <input
            name="searchInput"
            id="searchInput"
            placeholder="Search"
            value={this.state.searchTerm}
            onChange={this.handleChange}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Go
          </button>
        </form>
        {this.state.submittedSearch && (
          <p style={searchResultsStyle}>
            You searched for:{" "}
            <b>
              <span
                dangerouslySetInnerHTML={{ __html: this.state.submittedSearch }}
              />
            </b>
          </p>
        )}
      </div>
    );
  }
}
```

Here in this code you can see that the user input is directly being placed in the `span` using `dangerouslySetInnerHTML` which means that any user input will be parsed and reflected on the DOM, like this:

![User Input Getting Reflected](/assets/interesting-behavior-of-innerHTML-on-simple-script-XSS-payload/Simple-Input-Reflection.png)

> _Note_: dangerouslySetInnerHTML is actually a wrapper over innerHTML which is already available in DOM and can be accessed directly. React appended 'dangerously' with it to clearly discourage its use as it can make the app vulnerable to XSS through event handlers

{% include inArticleAds.html %}

The user input of "Hello World" under Bad Example is being reflected on the page with "You searched for:" and in the DOM on dev tools on the right you can see that it is being loaded within `<span>` tags meaning that if we insert some HTML in the search bar it will get parsed as the infamous `innerHTML` is being used in the backend. Let's test this out by giving some `<p>` tags and see how that gets reflected and parsed.

![p Tag Getting Reflected](/assets/interesting-behavior-of-innerHTML-on-simple-script-XSS-payload/p-tag-reflection.png)

So, this shows that `innerHTML` can be dangerous as it's parsing anything that's being given to it, so technically the app is vulnerable to XSS attacks as we can execute scripts through innerHTML.

When I tried executing `<script>alert(1)</script>` payload on this application something interesting happened. The resulting DOM looked something like this

![script Tag in InnerHTML](/assets/interesting-behavior-of-innerHTML-on-simple-script-XSS-payload/script-in-innerHTML.png)

```html
<p style="margin-bottom: 0px;">
  You searched for:
  <b>
    <span>
      <script>
        alert(1);
      </script>
    </span>
  </b>
</p>
```

It is clear here that, our payload has made to the DOM without getting encoded by HTML entities and it should technically fire, but it didn't. Yes. The `<script>` tag didn't execute even if the syntax is perfectly alright, the alert pop up didn't appear. This is really very confusing, why it didn't? 🤯

Though W3C states that innerHTML doesn't allows execution of scripts.

**According to World Wide Web Consortium (W3C)**

> **_script elements inserted using innerHTML do not execute when they are inserted._**

But for me this is not enough, how can innerHTML stop the parser from executing the injected script tags when rest of the script tags are being executed without any issue? That's the main problem.

Whenever innerHTML is used it re-renders the DOM tree

> It can also potentially be slow, since every time you change a node’s innerHTML property the browser must completely scrap and recreate its entire DOM tree. If you (for example) keep appending to innerHTML in a loop you’ll cause a lot of unnecessary re-renders.
> Source: https://learn.foundersandcoders.com/workshops/dom-rendering/

It means that whenever we call innerHTML, it first injects the value of innerHTML in to the DOM and then renders the entire DOM again, but somehow it recognizes the script that is being injected through innerHTML and doesn't executes it and executes all the rest of the scripts, I've made a rough sketch of this process.

![script Tag in InnerHTML](/assets/interesting-behavior-of-innerHTML-on-simple-script-XSS-payload/parser-execution.jpg){: .center-image }

HTML Code:

```html
<html>
  <!-- Some HTML Code here -->
  <p>Hello World</p>
  <div>
    <b> Some random text </b>
  </div>
  <script>
    alert("What's my fault?");
  </script>
  <!-- The script injected by the innerHTML gets ignored by the parser :( -->

  <!-- Rest of the scripts got the attention from the parser and got executed -->
  <script>
    alert("We're special");
  </script>
  <script>
    alert("We're special");
  </script>
  <script>
    alert("We're special");
  </script>
</html>
```

So this behavior is pretty strange, when the DOM got rendered and HTML parser parsed the lines one by one from top to bottom, how it came to know which script tag to ignore and which ones to execute when the syntax is exact same for both. Interestingly, if you copies this whole HTML structure and paste it into a separate HTML file, all the scripts will execute by that same parser. Why this hypocrisy? 😏

It's pretty clear that script tags will never ever get executed whenever the HTML is injected using the `innerHTML` property or `dangerouslySetInnerHTML` in case of ReactJS. It's the standard set by W3C that whenever _HTML Parser_ runs and parses the string within innerHTML, it parses every HTML tag and ignores if `<script>` tag appears, how is this happening? How the parser comes to know about all this? Enough of the suspense! 🧐

Here things get's complex, get ready for a deeper dive! 🌊

Unfortunately, surface level documentations do not include details about this behavior rather just a note saying that scripts wont work with innerHTML to lessen the chances of XSS and even the answers on StackOverFlow were vague, so I read loads of documentation and came to following conclusion

First, let's clear some concepts, whenever a _Document_ is created, a html parser gets associated for it and each _Document_ object has some environment variables that define the working and behavior of that parser.

In those environment variables, a **scripting flag** exist, which is a boolean variable, whenever it is set to **false** the HTML parser will ignore the `<script>` tags and they won't execute, opposite is the case when flag is set to **true**

Whenever `innerHTML` is called, a separate _Document_ is created which has its own html parser associated with it that has nothing to do with the main Document's parser and obviously the temporary document created by `innerHTML` has its own set of environment variables.

Upon creation of a separate document, `innerHTML` by default sets the **scripting flag** as **false** means that the HTML parser will ignore the scripts included as value in `innerHTML`

It means the `innerHTML`'s document will be parsed separately and because its **scripting flag** is **false** it will not execute the scripts and the main document's will be parsed separately and scripts will be executed because its **scripting flag** is set to **true**. I tried to visualize this process in the following diagram

![Behavior of InnerHTML](/assets/interesting-behavior-of-innerHTML-on-simple-script-XSS-payload/creation-of-document.jpg){: .center-image }

That's the reason why, if you copies this whole HTML (with injected script) and place it to some other file then the ignored script will also execute because then that will be parsed by the single HTML parser with scripting flag set to true. 😌

## Conclusion

On every call to innerHTML, a new Document node is temporarily created which has its own separate HTML parser and its own set of enivronment variables, whereas our original document has a separate parser and variables, because the orignal document's scripting flag is set to true therefore all the scripts within the original document are executed on the other hand because the new temporary document's scripting flag is set to false therefore even it contains valid script tags, the parser wont put those tags into the JS execution context and thus the scripts in the new temporary document won't be executed, because to us this whole process is abstracted under the layer of innerHTML so it seems confusing that how the HTML parser ignores the script tags whereas in reality that parser never really parses the scripts injected through innerHTML, they're parsed using a separate parser.

If you still have any questions about this behavior or you think that I went wrong somewhere than I am open for discussion and I will appreciate your contribution to this research.

### Resources

- [Element.innerHTML - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
- [script tag create with innerHTML of a div doesn't work - StackOverFlow](https://stackoverflow.com/questions/13390588/script-tag-create-with-innerhtml-of-a-div-doesnt-work)
- [Parsing HTML Fragments](https://html.spec.whatwg.org/multipage/parsing.html#parsing-html-fragments)
- [Parsing State Flags](https://html.spec.whatwg.org/multipage/parsing.html#scripting-flag)

### Credits

- [Vulnerable to XSS, React Code](https://github.com/thawkin3/xss-demo) by @thawkin3

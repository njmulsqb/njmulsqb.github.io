---
title: Writeups
---

## root@najam-ul-saqib:/home/writeups$

<ul>
  {% for post in site.posts %}
    <li> cd
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

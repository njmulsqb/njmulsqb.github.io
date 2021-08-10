---
title: Blog
---

## root@najam-ul-saqib:/home/blog$

<ul>
  {% for post in site.posts %}
    <li> cd
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

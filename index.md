---
layout: default
title: Najam Ul Saqib
---

<section class="intro">
  <h1>Security engineer. Builder. Writer.</h1>
  <p>
    I work on secure systems, cloud security, and practical engineering. I write
    about software, security, privacy, and how teams can build with less noise.
  </p>
</section>

<section class="home-section">
  <h2>Recent notes</h2>
  <ul class="minimal-list">
    {% for post in site.posts limit: 5 %}
    <li>
      <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%b %d, %Y' }}</time>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
    {% endfor %}
  </ul>
</section>


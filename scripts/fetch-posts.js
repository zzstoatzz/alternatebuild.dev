document.addEventListener('DOMContentLoaded', function() {
  fetch('posts/posts.json')
    .then(response => response.json())
    .then(data => {
      const posts = document.getElementById('blog-posts');
      data.forEach(post => {
        const postElement = document.createElement('article');
        postElement.id = `post-${post.filename}`;
        postElement.innerHTML = `
          <h2>${post.title}</h2>
          <p>${post.date}</p>
          <a href="/posts/html/${post.filename}.html">Read more</a>
        `;
        posts.appendChild(postElement);
      });
    })
    .catch(error => console.error('Error loading post index:', error));
});

document.addEventListener('DOMContentLoaded', (event) => {
    async function fetchFromGitHub() {
      const url = 'https://raw.githubusercontent.com/zzstoatzz/alternatebuild.dev/main/README.md';
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const text = await response.text();
        document.getElementById('readme').innerHTML = marked.parse(text);
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    }
    fetchFromGitHub();
  });
  
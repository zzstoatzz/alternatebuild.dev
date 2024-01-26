from pathlib import Path
from datetime import datetime
import json
import markdown2

markdown_dir = Path('posts')
html_dir = markdown_dir / 'html'
html_dir.mkdir(exist_ok=True)
posts = []

for file_path in markdown_dir.glob('*.md'):
    print(f"Found {file_path}")
    title = file_path.stem
    date = datetime.fromtimestamp(file_path.stat().st_mtime).strftime('%Y-%m-%d')

    with open(file_path, 'r') as md_file:
        md_content = md_file.read()

    html_content = markdown2.markdown(md_content)

    html_file_path = html_dir / f"{title}.html"
    with open(html_file_path, 'w') as html_file:
        html_file.write(html_content)

    posts.append({"title": title, "filename": title, "date": date})

with open('posts/posts.json', 'w') as json_file:
    json.dump(posts, json_file, indent=4)

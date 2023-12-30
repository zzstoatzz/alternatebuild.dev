import subprocess
from datetime import datetime
from pathlib import Path

from prefect import flow, task

def archive_today_content(readme_lines: list[str], archive_dir: Path) -> str:
    start = readme_lines.index('# Today\'s Content') + 2
    end = readme_lines.index('# Archive') if '# Archive' in readme_lines else len(readme_lines)
    today_content = '\n'.join(readme_lines[start:end]).strip()
    
    if not today_content:
        return ""
    
    datetime_string = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    archive_file = archive_dir / f"{datetime_string}.md"
    archive_file.write_text(today_content, encoding='utf-8')
    return datetime_string

def update_archive_section(readme_lines: list[str], datetime_string: str, archive_dir: Path) -> None:
    archive_link = f"- [{datetime_string}]({archive_dir / datetime_string}.md)"
    if '# Archive' not in readme_lines:
        readme_lines.append('# Archive\n')
    archive_idx = readme_lines.index('# Archive') + 1
    readme_lines.insert(archive_idx, archive_link)

@task
def update_readme(new_content: str, readme_path: str = 'README.md', archive_dir_name: str = 'archive') -> None:
    readme = Path(readme_path)
    archive_dir = Path(archive_dir_name)
    archive_dir.mkdir(parents=True, exist_ok=True)

    readme_lines = readme.read_text(encoding='utf-8').splitlines()
    datetime_string = archive_today_content(readme_lines, archive_dir)
    
    if datetime_string:
        update_archive_section(readme_lines, datetime_string, archive_dir)
    
    today_idx = readme_lines.index('# Today\'s Content') + 2
    archive_idx = readme_lines.index('# Archive')
    readme_lines[today_idx:archive_idx] = [new_content.strip()] + ['']

    readme.write_text('\n'.join(readme_lines) + '\n', encoding='utf-8')


@task(task_run_name="Run command: `{command}`")
def run_command(command: str):
    process = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if process.returncode != 0:
        print(f"Error executing '{command}': {process.stderr.decode().strip()}")
        exit(process.returncode)
    return process.stdout.decode().strip()


@flow(log_prints=True)
def update_and_merge_readme(
    new_content: str,
    readme_path: str = 'README.md',
    archive_dir_name: str = 'archive'
):
    if not new_content:
        raise ValueError("New content cannot be empty")
    
    update_readme(new_content, readme_path, archive_dir_name)
    
    branch_name = f"content-update-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    run_command(f"git checkout -b {branch_name}")
    run_command(f"git add {readme_path} {archive_dir_name}")
    run_command("git commit -m 'Update README with new content'")
    run_command(f"git push origin {branch_name}")

    pr_title = "Automated README update for {}".format(datetime.now().strftime("%Y-%m-%d"))
    pr_body = "This is an automated update of the README content."
    
    run_command(f"gh pr create --title '{pr_title}' --body '{pr_body}' --base main --head {branch_name}")
    run_command(f"gh pr merge {branch_name} --auto --squash")

if __name__ == "__main__":
    update_and_merge_readme.from_source(
        source="https://github.com/zzstoatzz/alternatebuild.dev.git",
        entrypoint="update_readme.py:update_and_merge_readme",
    ).serve(
        name="Update and Merge README",
        # work_pool_name="managed",
        # job_variables={
        #     "env": {
        #         "GITHUB_TOKEN": "{{ prefect.blocks.secret.alternatebuild-gh-token }}",
        #         "GH_USER_NAME": "zzstoatzz",
        #         "GH_USER_EMAIL": "thrast36@gmail.com",
        #     }
        # }
    )
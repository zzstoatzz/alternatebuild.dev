import React from 'react';
import styles from './About.module.css';
import ProjectCard from './ProjectCard';

const projects = [
    {
        title: "marvin",
        description: "Structured LLM outputs with native and pydantic types.",
        link: "https://github.com/prefecthq/marvin",
    },
    {
        title: "prefect",
        description: "pythonic, functional orchestrator and observability tool.",
        link: "https://github.com/prefecthq/prefect",
    },
    {
        title: "raggy",
        description: "Document parsing, embedding and querying for LLMs.",
        link: "https://github.com/zzstoatzz/raggy",
    },
];

export default function About() {
    return (
        <main className={styles.content}>
            <h1>About Me</h1>
            <p>
                Hello! I'm Nate - software engineer and ChE grad from the University of Michigan.
            </p>
            <p>
                Feel free to <a href="/contact">get in touch</a> if you have an idea for a project or just want to chat!
            </p>
            <h2>Featured Projects</h2>
            <div className={styles.projectGrid}>
                {projects.map((project, index) => (
                    <ProjectCard key={index} {...project} />
                ))}
            </div>
        </main>
    );
}
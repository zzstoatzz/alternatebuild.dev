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
                Hello! I'm Nate - software engineer and ChE grad from the University of Michigan. I grew up in the Upper Peninsula of Michigan and currently live in Logan Square, Chicago.
            </p>

            <p>I am a physicist at heart and love graph theory. I want to build an evolutionary, ant-colony-ish network of LLMs that I can defer my most annoying tasks to.</p>

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
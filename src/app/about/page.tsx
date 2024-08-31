import React from 'react';
import Link from 'next/link';
import ProjectCard from '@/app/components/ProjectCard';

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
        <main className="about-container content-container">
            <h1 className="about-title">About Me</h1>
            <div className="space-y-4 about-text">
                <p>
                    Hello! My name is Nate - software engineer and ChE grad from the University of Michigan. I grew up in the Upper Peninsula of Michigan and currently live in Logan Square, Chicago.
                </p>
                <p>
                    I am a physicist at heart and love graph theory. I want to build an evolutionary, ant-colony-ish network of LLMs that I can defer my most annoying tasks to.
                </p>
                <p>
                    Feel free to <Link href="/contact" className="about-link">get in touch</Link> if you have an idea for a project or just want to chat!
                </p>
            </div>

            <h2 className="project-section-title">Featured Projects</h2>
            <div className="project-grid">
                {projects.map((project, index) => (
                    <ProjectCard key={index} {...project} />
                ))}
            </div>
        </main>
    );
}

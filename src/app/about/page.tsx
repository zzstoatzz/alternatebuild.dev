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
        <main className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-cyan-400 mb-6">About Me</h1>
            <div className="space-y-4 text-gray-300 mb-8">
                <p>
                    Hello! I'm Nate - software engineer and ChE grad from the University of Michigan. I grew up in the Upper Peninsula of Michigan and currently live in Logan Square, Chicago.
                </p>
                <p>
                    I am a physicist at heart and love graph theory. I want to build an evolutionary, ant-colony-ish network of LLMs that I can defer my most annoying tasks to.
                </p>
                <p>
                    Feel free to <Link href="/contact" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300">get in touch</Link> if you have an idea for a project or just want to chat!
                </p>
            </div>

            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                    <ProjectCard key={index} {...project} />
                ))}
            </div>
        </main>
    );
}
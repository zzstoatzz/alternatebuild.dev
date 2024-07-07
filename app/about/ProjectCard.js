import React from 'react';
import styles from './About.module.css';

const ProjectCard = ({ title, description, link }) => {
    return (
        <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>{title}</h3>
            <p className={styles.projectDescription}>{description}</p>
            <a href={link} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                <span className={styles.projectLinkText}>View on GitHub</span>
            </a>
        </div>
    );
};

export default ProjectCard;
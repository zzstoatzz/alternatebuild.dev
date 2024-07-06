import React from 'react';
import styles from './About.module.css';

const ProjectCard = ({ title, description, link }) => {
    return (
        <div className={styles.projectCard}>
            <h3>{title}</h3>
            <p>{description}</p>
            <a href={link} target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </div>
    );
};

export default ProjectCard;
'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import styles from './GithubInfo.module.css';

const GithubInfo = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={styles.githubInfo}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Info size={24} />
            {isHovered && (
                <div className={styles.infoContent}>
                    <p>This site is open source.</p>
                    <a href="https://github.com/zzstoatzz/alternatebuild.dev" target="_blank" rel="noopener noreferrer">
                        View the code on GitHub
                    </a>
                </div>
            )}
        </div>
    );
};

export default GithubInfo;
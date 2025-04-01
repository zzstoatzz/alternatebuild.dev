import type React from "react";

interface LinkCardProps {
	title: string;
	description: string;
	link: string;
	source: string;
}

const LinkCard: React.FC<LinkCardProps> = ({
	title,
	description,
	link,
	source,
}) => {
	return (
		<div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-cyan-900/50 transition-all duration-300 transform hover:-translate-y-1">
			<h3 className="text-2xl font-bold text-cyan-400 mb-3">{title}</h3>
			<p className="text-gray-300 mb-4">{description}</p>
			<a
				href={link}
				className="inline-block bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
				target="_blank"
				rel="noopener noreferrer"
			>
				View on {source}
			</a>
		</div>
	);
};

export default LinkCard;

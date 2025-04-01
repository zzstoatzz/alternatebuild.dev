// Helper class for disjoint-set operations (Union-Find)
export class UnionFind {
	constructor(size) {
		this.parent = Array(size)
			.fill(0)
			.map((_, i) => i);
		this.rank = Array(size).fill(0);
		this.count = size;
	}

	find(x) {
		if (this.parent[x] !== x) {
			this.parent[x] = this.find(this.parent[x]); // Path compression
		}
		return this.parent[x];
	}

	union(x, y) {
		const rootX = this.find(x);
		const rootY = this.find(y);

		if (rootX === rootY) return false;

		// Union by rank
		if (this.rank[rootX] < this.rank[rootY]) {
			this.parent[rootX] = rootY;
		} else if (this.rank[rootX] > this.rank[rootY]) {
			this.parent[rootY] = rootX;
		} else {
			this.parent[rootY] = rootX;
			this.rank[rootX]++;
		}

		this.count--;
		return true;
	}
}

// Detect clusters of particles that are within interaction radius
export function detectClusters(particles, interactionRadius) {
	const n = particles.length;
	const uf = new UnionFind(n);

	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			const dx = particles[i].position.x - particles[j].position.x;
			const dy = particles[i].position.y - particles[j].position.y;
			const distSquared = dx * dx + dy * dy;

			if (distSquared < interactionRadius * interactionRadius) {
				uf.union(i, j);
			}
		}
	}

	// Assign cluster IDs
	const clusters = new Map();
	let nextClusterId = 0;

	for (let i = 0; i < n; i++) {
		const root = uf.find(i);

		if (!clusters.has(root)) {
			clusters.set(root, nextClusterId++);
		}

		particles[i].cluster = clusters.get(root);
	}

	return uf;
}

// Apply visual properties based on cluster membership
export function applyClusterProperties(particles, uf, settings) {
	const clusterSizes = new Map();
	const clusterVelocities = new Map();

	// Calculate sizes and average velocities of clusters
	for (let i = 0; i < particles.length; i++) {
		const root = uf.find(i);

		if (!clusterSizes.has(root)) {
			clusterSizes.set(root, 0);
			clusterVelocities.set(root, { x: 0, y: 0 });
		}

		clusterSizes.set(root, clusterSizes.get(root) + 1);

		const vx = clusterVelocities.get(root).x + particles[i].velocity.x;
		const vy = clusterVelocities.get(root).y + particles[i].velocity.y;
		clusterVelocities.set(root, { x: vx, y: vy });
	}

	// Normalize velocities and apply colors
	for (let i = 0; i < particles.length; i++) {
		const root = uf.find(i);
		const size = clusterSizes.get(root);

		// Skip "clusters" of single particles
		if (size <= 1) {
			particles[i].color = particles[i].originalColor;
			continue;
		}

		// Calculate average velocity for the cluster
		const avgVelX = clusterVelocities.get(root).x / size;
		const avgVelY = clusterVelocities.get(root).y / size;
		const avgSpeed = Math.sqrt(avgVelX * avgVelX + avgVelY * avgVelY);

		// Heat factor from 0 to 1 based on cluster size and speed
		const sizeFactor = Math.min(1, size / 50);
		const speedFactor = Math.min(1, avgSpeed / 300);
		const heatFactor = Math.min(
			1,
			((sizeFactor + speedFactor) / 2) * settings.MAX_HEAT_FACTOR,
		);

		// Apply color based on heat - from blue (cold) to red (hot)
		const r = Math.round(heatFactor * 255);
		const g = Math.round((1 - heatFactor) * 100);
		const b = Math.round((1 - heatFactor) * 255);

		particles[i].color = `rgba(${r}, ${g}, ${b}, 0.6)`;
	}
}

// Convert hex color to RGBA
export function hexToRgba(hex, alpha = 1) {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

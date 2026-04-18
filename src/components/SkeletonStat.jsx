import React from 'react';
import './SkeletonLoader.css';

const SkeletonCard = () => (
    <div className="skeleton-card" />
);

const SkeletonStat = () => (
    <div className="skeleton-stat">
        <div className="stat-item" />
        <div className="stat-item" />
        <div className="stat-item" />
        <div className="stat-item" />
    </div>
);

const SkeletonList = () => (
    <div className="skeleton-list">
        {[...Array(5)].map((_, index) => (
            <div className="skeleton-list-item" key={index}>
                <div className="avatar" />
                <div className="text-line" />
                <div className="text-line" />
            </div>
        ))}
    </div>
);

const SkeletonChart = () => (
    <div className="skeleton-chart" />
);

const SkeletonNewsList = () => (
    <div className="skeleton-news-list">
        {[...Array(5)].map((_, index) => (
            <div className="skeleton-news-card" key={index}>
                <div className="thumbnail" />
                <div className="news-title" />
                <div className="news-description" />
            </div>
        ))}
    </div>
);

const SkeletonPortfolio = () => (
    <div className="skeleton-portfolio">
        <div className="portfolio-hero" />
        <div className="portfolio-holdings">
            {[...Array(4)].map((_, index) => (
                <div className="holding" key={index}>
                    <div className="holding-name" />
                    <div className="holding-value" />
                </div>
            ))}
        </div>
    </div>
);

export { SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio };
export default SkeletonCard;

// SkeletonLoader.css
.skeleton-card {
    height: 80px;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
}

.skeleton-stat {
    display: flex;
    justify-content: space-between;
}

.stat-item {
    width: 60px;
    height: 20px;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-list {
    display: flex;
    flex-direction: column;
}

.skeleton-list-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 50%;
    margin-right: 10px;
}

.text-line {
    height: 10px;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 5px;
}

.skeleton-chart {
    height: 200px;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-news-list {
    display: flex;
    flex-direction: column;
}

.skeleton-news-card {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
}

.thumbnail {
    width: 80px;
    height: 60px;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
    margin-right: 10px;
}

.news-title {
    height: 15px;
    width: 100%;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 5px;
}

.news-description {
    height: 10px;
    width: 80%;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-portfolio {
    display: flex;
    flex-direction: column;
}

.portfolio-hero {
    height: 120px;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 10px;
}

.portfolio-holdings {
    display: flex;
    flex-direction: column;
}

.holding {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.holding-name {
    height: 10px;
    width: 70%;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.holding-value {
    height: 10px;
    width: 20%;
    background: linear-gradient(90deg, var(--bg2), var(--bg3), var(--bg2));
    background-size: 200%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: 0 0;
    }
}
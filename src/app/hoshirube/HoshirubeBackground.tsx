import styles from './hoshirube-background.module.css';

interface Star {
    left: number;
    top: number;
    size: number;
    opacity: number;
    delay: number;
}

let seed = 20261128;
const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};

const stars: Star[] = Array.from({ length: 90 }, () => ({
    left: random() * 100,
    top: random() * 100,
    size: random() * 2 + 1,
    opacity: 0.3 + random() * 0.6,
    delay: random() * 4,
}));

export default function HoshirubeBackground() {

    return (
        <div className={styles.sky} aria-hidden="true">
            <div className={styles.stars}>
                {stars.map((star, index) => (
                    <span
                        key={index}
                        className={styles.star}
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: star.size,
                            height: star.size,
                            opacity: star.opacity,
                            animationDelay: `${star.delay}s`,
                        }}
                    />
                ))}
            </div>
            <span className={styles.meteor} />
        </div>
    );
}

import { useState } from 'react';

const StarRating = ({ value = 0, onChange, readonly = false, size = 24 }) => {
    const [hover, setHover] = useState(0);

    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    onClick={() => !readonly && onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    style={{
                        fontSize: size,
                        cursor: readonly ? 'default' : 'pointer',
                        color: star <= (hover || value) ? '#F59E0B' : '#D1D5DB',
                        transition: 'color 0.1s',
                        userSelect: 'none',
                        lineHeight: 1
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;

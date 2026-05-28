export default function StarRating({ value, onChange, readonly = false, size = 'normal' }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="stars">
      {stars.map((n) => (
        <span
          key={n}
          className={`star ${n <= value ? 'active' : ''} ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && onChange && onChange(n)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

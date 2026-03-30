export default function FormInput({
  id,
  label,
  type = "number",
  value,
  onChange,
  min,
  step,
  placeholder
}) {
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">{label}</label>
      <input
        id={id}
        type={type}
        className="field-input"
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
}

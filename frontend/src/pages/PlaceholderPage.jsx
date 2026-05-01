export default function PlaceholderPage({ title, description, children }) {
  return (
    <section className="placeholder-page">
      <p className="eyebrow">Foundation placeholder</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </section>
  );
}

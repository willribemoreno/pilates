export default function Benefits() {
  return (
    <section
      className="section mx-auto my-14 max-w-6xl px-5"
      aria-label="Benefícios"
    >
      <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Por que escolher nosso estúdio
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Avaliação Personalizada",
            text: "Planejamento individual para suas metas, histórico e bem-estar.",
          },
          {
            title: "Turmas Reduzidas",
            text: "Atenção próxima do instrutor, postura correta e segurança.",
          },
          {
            title: "Ambiente Aconchegante",
            text: "Espaço silencioso, limpo e climatizado para você relaxar e evoluir.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-blue-900/10 bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,.12)]
                       dark:border-blue-200/10 dark:bg-gray-900"
          >
            <h3 className="mb-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
              {card.title}
            </h3>
            <p className="text-[0.97rem] text-gray-600 dark:text-gray-400">
              {card.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

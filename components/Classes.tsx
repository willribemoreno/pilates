export default function Classes() {
  const classes = [
    {
      title: "Treinamento para Força e Resistência",
      text: "Aprimore sua força, flexibilidade e resistência com exercícios dinâmicos e eficazes.",
    },
    {
      title: "Fisioterapia com Pilates",
      text: "Recupere-se com movimentos precisos e terapêuticos, reduzindo dores e restaurando a mobilidade.",
    },
    {
      title: "Emagrecimento e Definição",
      text: "Queime calorias, reduza medidas e tonifique seu corpo com treinos direcionados.",
    },
    {
      title: "Treinamento Personalizado",
      text: "Desenvolva um plano exclusivo, adaptado às suas necessidades e objetivos individuais.",
    },
  ];

  return (
    <section
      id="aulas"
      className="mx-auto my-14 max-w-6xl px-5"
      aria-label="Nossas aulas"
    >
      <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Nossas aulas
      </h2>

      <div className="grid gap-4 md:grid-cols-4">
        {classes.map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-blue-900/10 bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,.12)]
                       dark:border-blue-200/10 dark:bg-gray-900"
          >
            <h3 className="mb-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
              {c.title}
            </h3>
            <p className="text-[0.97rem] text-gray-600 dark:text-gray-400">
              {c.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

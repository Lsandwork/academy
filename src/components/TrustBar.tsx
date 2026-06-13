export function TrustBar() {
  const items = [
    { icon: "🎓", title: "Created by Certified Trainers", body: "CPDT-KA® certified" },
    { icon: "🐾", title: "Positive & Science-Based", body: "Ethical training methods" },
    { icon: "✓", title: "Results You Can See", body: "Real training. Real life." },
    { icon: "❤", title: "Loved by Dog Parents", body: "25,000+ happy students" }
  ];

  return (
    <section className="bg-dark py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">{item.icon}</div>
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-white/70">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

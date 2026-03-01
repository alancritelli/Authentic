"use client";

import { FormEvent, useMemo, useState } from "react";

type AppointmentStatus = "pending" | "confirmed" | "rejected";

type Appointment = {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: AppointmentStatus;
};

const availableTimes = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const services = [
  "Lavagem simples",
  "Lavagem completa",
  "Higienização interna",
  "Polimento",
];

export default function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [service, setService] = useState(services[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(availableTimes[0]);
  const [feedback, setFeedback] = useState("");

  const blockedTimes = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === date && appointment.status !== "rejected")
        .map((appointment) => appointment.time),
    [appointments, date],
  );

  function requestAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerName.trim() || !date) {
      setFeedback("Preencha nome e data para solicitar o agendamento.");
      return;
    }

    if (blockedTimes.includes(time)) {
      setFeedback("Esse horário já foi solicitado. Escolha outro horário.");
      return;
    }

    setAppointments((current) => [
      ...current,
      {
        id: Date.now(),
        customerName: customerName.trim(),
        service,
        date,
        time,
        status: "pending",
      },
    ]);

    setFeedback("Solicitação enviada! Aguarde confirmação do estabelecimento.");
    setCustomerName("");
  }

  function updateStatus(id: number, status: AppointmentStatus) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Agenda do Lava Rápido</h1>
          <p className="mt-2 text-sm text-slate-600">
            Escolha o serviço, data e horário para enviar uma solicitação.
          </p>

          <form className="mt-6 space-y-4" onSubmit={requestAppointment}>
            <label className="block text-sm font-medium">
              Nome do cliente
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Ex.: João Silva"
              />
            </label>

            <label className="block text-sm font-medium">
              Serviço
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                value={service}
                onChange={(event) => setService(event.target.value)}
              >
                {services.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Data
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>

              <label className="block text-sm font-medium">
                Horário
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                >
                  {availableTimes.map((item) => (
                    <option key={item} value={item} disabled={blockedTimes.includes(item)}>
                      {item} {blockedTimes.includes(item) ? "(indisponível)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
              type="submit"
            >
              Solicitar agendamento
            </button>
          </form>

          {feedback && (
            <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{feedback}</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Painel do estabelecimento</h2>
          <p className="mt-2 text-sm text-slate-600">
            Confira as solicitações e confirme ou recuse cada agendamento.
          </p>

          <div className="mt-6 space-y-3">
            {appointments.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nenhuma solicitação ainda.
              </p>
            )}

            {appointments
              .slice()
              .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
              .map((appointment) => (
                <article key={appointment.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{appointment.customerName}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        appointment.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : appointment.status === "rejected"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {appointment.status === "pending"
                        ? "Pendente"
                        : appointment.status === "confirmed"
                          ? "Confirmado"
                          : "Recusado"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {appointment.service} • {appointment.date} às {appointment.time}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
                      onClick={() => updateStatus(appointment.id, "confirmed")}
                      disabled={appointment.status === "confirmed"}
                    >
                      Confirmar
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
                      onClick={() => updateStatus(appointment.id, "rejected")}
                      disabled={appointment.status === "rejected"}
                    >
                      Recusar
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

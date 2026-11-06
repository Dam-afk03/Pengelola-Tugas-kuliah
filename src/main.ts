import "./style.css";
import type { Tugas, Prioritas } from "./types";
import { muatTugas, simpan } from "./storage";

const namaApp: string = import.meta.env.VITE_APP_NAME;
const versiApp: string = import.meta.env.VITE_APP_VERSION;
document.getElementById("judul-app")!.textContent = namaApp;
document.getElementById("versi-app")!.textContent = `v${versiApp}`;

let tugas: Tugas[] = muatTugas();                             // array
let sedangEdit = false;                                       // boolean

const form = document.getElementById("form-tugas") as HTMLFormElement;
const daftar = document.getElementById("daftar") as HTMLUListElement;
const el = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

function render(): void {
  daftar.innerHTML = "";
  tugas.forEach((t) => {
    const li = document.createElement("li");
    li.className = t.status === "Selesai" ? "selesai" : "";
    li.innerHTML = `
      <div class="info">
        <strong>${t.judul}</strong>
        <span>${t.matkul} • ${t.deadline} • ${t.prioritas}</span>
        <span class="badge ${t.status === "Selesai" ? "ok" : "pending"}">${t.status}</span>
      </div>
      <div class="aksi">
        <button data-aksi="toggle" data-id="${t.id}">✔</button>
        <button data-aksi="edit" data-id="${t.id}">✏️</button>
        <button data-aksi="hapus" data-id="${t.id}">🗑</button>
      </div>`;
    daftar.appendChild(li);
  });
}

function resetForm(): void {
  form.reset();
  el<HTMLInputElement>("id").value = "";
  el<HTMLButtonElement>("btn-simpan").textContent = "Tambah";
  el<HTMLButtonElement>("btn-batal").hidden = true;
  sedangEdit = false;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const idLama = el<HTMLInputElement>("id").value;
  const data = {
    judul: el<HTMLInputElement>("judul").value.trim(),
    matkul: el<HTMLInputElement>("matkul").value.trim(),
    deadline: el<HTMLInputElement>("deadline").value,
    prioritas: el<HTMLSelectElement>("prioritas").value as Prioritas,
  };
  if (sedangEdit) {
    tugas = tugas.map((t) => (t.id === Number(idLama) ? { ...t, ...data } : t));
  } else {
    tugas.push({ id: Date.now(), status: "Belum Selesai", ...data });
  }
  simpan<Tugas>(tugas);
  resetForm();
  render();
});

el<HTMLButtonElement>("btn-batal").addEventListener("click", resetForm);

daftar.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const t = tugas.find((x) => x.id === id);
  if (!t) return;

  if (btn.dataset.aksi === "toggle") {
    t.status = t.status === "Selesai" ? "Belum Selesai" : "Selesai";
  } else if (btn.dataset.aksi === "hapus") {
    tugas = tugas.filter((x) => x.id !== id);
  } else if (btn.dataset.aksi === "edit") {
    el<HTMLInputElement>("id").value = String(t.id);
    el<HTMLInputElement>("judul").value = t.judul;
    el<HTMLInputElement>("matkul").value = t.matkul;
    el<HTMLInputElement>("deadline").value = t.deadline;
    el<HTMLSelectElement>("prioritas").value = t.prioritas;
    el<HTMLButtonElement>("btn-simpan").textContent = "Simpan";
    el<HTMLButtonElement>("btn-batal").hidden = false;
    sedangEdit = true;
    return;
  }
  simpan<Tugas>(tugas);
  render();
});

render();
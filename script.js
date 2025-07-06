document.addEventListener("DOMContentLoaded", () => {
  const diaryForm = document.getElementById("diaryForm");
  const diaryEntriesContainer = document.getElementById(
    "diaryEntriesContainer"
  );
  const loadingMessage = document.getElementById("loadingMessage");
  const noEntriesMessage = document.getElementById("noEntriesMessage");
  const messageArea = document.getElementById("messageArea");
  const sentimentChartCanvas = document.getElementById("sentimentChart");
  const noChartDataMessage = document.getElementById("noChartDataMessage");

  const API_BASE_URL = "https://amiable-playfulness-production.up.railway.app/api"; // Pastikan ini sesuai dengan port backend Anda

  let sentimentChartInstance = null; // Variabel untuk menyimpan instance Chart.js
  let emotionChartInstance = null; // Variabel untuk menyimpan instance Chart.js untuk emosi

  // --- Fungsi Bantuan ---

  // Menampilkan pesan feedback ke pengguna
  function showMessage(msg, type = "success") {
    messageArea.textContent = msg;
    messageArea.classList.remove(
      "hidden",
      "bg-green-100",
      "text-green-800",
      "bg-red-100",
      "text-red-800",
      "bg-blue-100",
      "text-blue-800"
    );

    if (type === "success") {
      messageArea.classList.add("bg-green-100", "text-green-800");
    } else if (type === "error") {
      messageArea.classList.add("bg-red-100", "text-red-800");
    } else if (type === "info") {
      messageArea.classList.add("bg-blue-100", "text-blue-800");
    }
    messageArea.classList.remove("hidden");

    // Sembunyikan pesan setelah 5 detik
    setTimeout(() => {
      messageArea.classList.add("hidden");
    }, 5000);
  }

  // Fungsi untuk mendapatkan emoji berdasarkan emosi/sentimen
  function getEmotionEmoji(emotion) {
    switch (emotion.toLowerCase()) {
      case "joy":
        return "😊";
      case "sadness":
        return "😢";
      case "anger":
        return "😡";
      case "fear":
        return "😨";
      case "surprise":
        return "😮";
      case "disgust":
        return "🤢";
      case "positive":
        return "😀";
      case "negative":
        return "😔";
      case "neutral":
        return "😐";
      default:
        return "🤔"; // Unknown
    }
  }

  // --- Fungsi Utama Fetching & Rendering ---

  // Fungsi untuk mengambil dan menampilkan entri diary
  async function fetchDiaryEntries() {
    loadingMessage.classList.remove("hidden");
    noEntriesMessage.classList.add("hidden"); // Sembunyikan pesan "belum ada entri" saat loading
    diaryEntriesContainer.innerHTML = ""; // Kosongkan container sebelum memuat ulang

    try {
      const response = await fetch(`${API_BASE_URL}/diary-entries`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const entries = await response.json();

      loadingMessage.classList.add("hidden"); // Sembunyikan pesan loading setelah data diambil

      if (entries.length === 0) {
        noEntriesMessage.classList.remove("hidden"); // Tampilkan pesan "belum ada entri"
        renderSentimentChart([]); // Hancurkan chart jika tidak ada data
        return;
      } else {
        noEntriesMessage.classList.add("hidden");
      }

      // Urutkan entri dari terbaru ke terlama
      entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      entries.forEach((entry) => {
        const entryElement = document.createElement("div");
        entryElement.className =
          "diary-paper diary-entry bg-gray-50 shadow-md border border-gray-200";
        entryElement.innerHTML = `
                    <h3 class="text-xl font-semibold text-pink-400 mb-2">${
                      entry.title
                    }</h3>
                    <p class="diary-handwriting mb-3 whitespace-pre-wrap">${
                      entry.content
                    }</p>
                    <div class="flex flex-wrap items-center justify-between text-sm text-gray-600 mt-2">
                        <p class="mr-4">
                            <span class="font-medium text-indigo-700">Emosi:</span> ${
                              entry.emotion
                                ? getEmotionEmoji(entry.emotion) +
                                  " " +
                                  entry.emotion
                                : "Tidak diketahui 🤔"
                            }
                        </p>
                        <p>
                            <span class="font-medium text-purple-700">Sentimen:</span> ${
                              entry.sentiment
                                ? getEmotionEmoji(entry.sentiment) +
                                  " " +
                                  entry.sentiment
                                : "Tidak diketahui 🤔"
                            }
                        </p>
                        <p class="text-right w-full mt-2">
                            <span class="font-light">${new Date(
                              entry.created_at
                            ).toLocaleString("id-ID", {
                              dateStyle: "long",
                              timeStyle: "short",
                            })}</span>
                        </p>
                    </div>
                `;
        diaryEntriesContainer.appendChild(entryElement);
      });

      renderSentimentChart(entries); // Panggil fungsi untuk membuat/memperbarui grafik
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      loadingMessage.classList.add("hidden");
      showMessage("Gagal memuat entri diary. Silakan coba lagi.", "error");
      renderSentimentChart([]); // Hancurkan chart jika terjadi error
    }
  }

  // Fungsi untuk merender grafik sentimen
  function renderSentimentChart(entries) {
    if (entries.length < 1) {
      // Perlu minimal 1 entri untuk grafik
      if (sentimentChartInstance) {
        sentimentChartInstance.destroy();
        sentimentChartInstance = null;
      }
      sentimentChartCanvas.classList.add("hidden");
      noChartDataMessage.classList.remove("hidden");
      return;
    }

    sentimentChartCanvas.classList.remove("hidden");
    noChartDataMessage.classList.add("hidden");

    const dates = [];
    const sentimentDataMap = {}; // Map untuk mengumpulkan sentimen per tanggal

    // Kumpulkan data sentimen per tanggal
    entries.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleDateString("id-ID", {
        month: "2-digit",
        day: "2-digit",
      });
      const sentiment = entry.sentiment
        ? entry.sentiment.toLowerCase()
        : "unknown";

      if (!sentimentDataMap[date]) {
        sentimentDataMap[date] = {
          positive: 0,
          negative: 0,
          neutral: 0,
          unknown: 0,
        };
        dates.push(date);
      }
      if (sentimentDataMap[date][sentiment] !== undefined) {
        sentimentDataMap[date][sentiment]++;
      } else {
        sentimentDataMap[date].unknown++;
      }
    });

    // Urutkan tanggal secara kronologis
    dates.sort((a, b) => {
      const [monthA, dayA] = a.split("/").map(Number);
      const [monthB, dayB] = b.split("/").map(Number);
      return (
        new Date(2000, monthA - 1, dayA) - new Date(2000, monthB - 1, dayB)
      );
    });

    // Siapkan dataset untuk Chart.js
    const positiveData = dates.map((date) => sentimentDataMap[date].positive);
    const negativeData = dates.map((date) => sentimentDataMap[date].negative);
    const neutralData = dates.map((date) => sentimentDataMap[date].neutral);
    const unknownData = dates.map((date) => sentimentDataMap[date].unknown);

    const ctx = sentimentChartCanvas.getContext("2d");

    // Hancurkan chart sebelumnya jika ada
    if (sentimentChartInstance) {
      sentimentChartInstance.destroy();
    }

    // Buat chart baru
    sentimentChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Positif",
            data: positiveData,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            tension: 0.3,
            fill: false,
          },
          {
            label: "Negatif",
            data: negativeData,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            tension: 0.3,
            fill: false,
          },
          {
            label: "Netral",
            data: neutralData,
            borderColor: "rgb(201, 203, 207)",
            backgroundColor: "rgba(201, 203, 207, 0.5)",
            tension: 0.3,
            fill: false,
          },
          {
            label: "Tidak Diketahui",
            data: unknownData,
            borderColor: "rgb(153, 102, 255)",
            backgroundColor: "rgba(153, 102, 255, 0.5)",
            tension: 0.3,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Tren Sentimen Diary dari Waktu ke Waktu",
            font: { size: 16 },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Jumlah Entri",
            },
            ticks: {
              precision: 0, // Pastikan sumbu Y adalah bilangan bulat
            },
          },
          x: {
            title: {
              display: true,
              text: "Tanggal",
            },
          },
        },
      },
    });
  }

  // Fungsi untuk merender grafik emosi
  function renderEmotionChart(entries) {
    const emotionChartCanvas = document.getElementById("emotionChart");
    if (!emotionChartCanvas) return;
    if (entries.length < 1) {
      if (emotionChartInstance) {
        emotionChartInstance.destroy();
        emotionChartInstance = null;
      }
      emotionChartCanvas.classList.add("hidden");
      return;
    }
    emotionChartCanvas.classList.remove("hidden");

    const dates = [];
    const emotionDataMap = {};
    const emotionTypes = [
      "joy",
      "sadness",
      "anger",
      "fear",
      "surprise",
      "disgust",
      "neutral",
      "unknown",
    ];
    // Kumpulkan data emosi per tanggal
    entries.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleDateString("id-ID", {
        month: "2-digit",
        day: "2-digit",
      });
      const emotion = entry.emotion ? entry.emotion.toLowerCase() : "unknown";
      if (!emotionDataMap[date]) {
        emotionDataMap[date] = {
          joy: 0,
          sadness: 0,
          anger: 0,
          fear: 0,
          surprise: 0,
          disgust: 0,
          neutral: 0,
          unknown: 0,
        };
        dates.push(date);
      }
      if (emotionDataMap[date][emotion] !== undefined) {
        emotionDataMap[date][emotion]++;
      } else {
        emotionDataMap[date].unknown++;
      }
    });
    // Urutkan tanggal secara kronologis
    dates.sort((a, b) => {
      const [monthA, dayA] = a.split("/").map(Number);
      const [monthB, dayB] = b.split("/").map(Number);
      return (
        new Date(2000, monthA - 1, dayA) - new Date(2000, monthB - 1, dayB)
      );
    });
    // Siapkan dataset untuk Chart.js
    const emotionColors = {
      joy: "#fbbf24",
      sadness: "#60a5fa",
      anger: "#f87171",
      fear: "#a78bfa",
      surprise: "#34d399",
      disgust: "#6ee7b7",
      neutral: "#a3a3a3",
      unknown: "#d1d5db",
    };
    const datasets = emotionTypes.map((emotion) => ({
      label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      data: dates.map((date) => emotionDataMap[date][emotion]),
      borderColor: emotionColors[emotion],
      backgroundColor: emotionColors[emotion] + "80", // transparan
      tension: 0.3,
      fill: false,
    }));
    const ctx = emotionChartCanvas.getContext("2d");
    if (emotionChartInstance) {
      emotionChartInstance.destroy();
    }
    emotionChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Tren Emosi Diary dari Waktu ke Waktu",
            font: { size: 16 },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Jumlah Entri",
            },
            ticks: {
              precision: 0,
            },
          },
          x: {
            title: {
              display: true,
              text: "Tanggal",
            },
          },
        },
      },
    });
  }

  // --- Event Listener untuk Form Submit ---
  if (diaryForm) {
    diaryForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Mencegah refresh halaman

      const title = document.getElementById("title").value;
      const content = document.getElementById("content").value;

      if (!title.trim() || !content.trim()) {
        showMessage("Judul dan isi diary tidak boleh kosong!", "info");
        return;
      }

      // Tampilkan feedback loading di tombol
      const submitButton = diaryForm.querySelector('button[type="submit"]');
      submitButton.textContent = "Menyimpan...";
      submitButton.disabled = true;
      submitButton.classList.add("opacity-50", "cursor-not-allowed");

      try {
        const response = await fetch(`${API_BASE_URL}/diary-entries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${
              errorData.message || "Unknown error"
            }`
          );
        }

        const newEntry = await response.json();
        console.log("New entry created:", newEntry);

        // Bersihkan form
        diaryForm.reset();
        // Hanya tampilkan pesan sukses, tidak perlu fetchDiaryEntries di index.html
        showMessage("Entri diary berhasil disimpan!", "success");
      } catch (error) {
        console.error("Error creating diary entry:", error);
        showMessage(
          `Gagal menyimpan entri diary: ${error.message}. Periksa konsol untuk detail.`,
          "error"
        );
      } finally {
        // Kembalikan tombol ke keadaan semula
        submitButton.textContent = "Simpan Entri";
        submitButton.disabled = false;
        submitButton.classList.remove("opacity-50", "cursor-not-allowed");
      }
    });
  }

  // Panggil fetchDiaryEntries sesuai halaman
  if (diaryEntriesContainer && loadingMessage && noEntriesMessage) {
    // Untuk riwayat.html
    fetchDiaryEntries();
  } else if (sentimentChartCanvas && noChartDataMessage) {
    // Untuk tren.html
    // Ambil data dan render chart saja
    async function fetchAndRenderChart() {
      try {
        const response = await fetch(`${API_BASE_URL}/diary-entries`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const entries = await response.json();
        renderSentimentChart(entries);
        renderEmotionChart(entries);
      } catch (error) {
        renderSentimentChart([]);
        renderEmotionChart([]);
      }
    }
    fetchAndRenderChart();
  } else if (diaryForm) {
    // Untuk index.html, hanya form, tidak perlu fetch entri
  }
});

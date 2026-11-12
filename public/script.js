
const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const totalStudents = document.getElementById("totalStudents");
const searchInput = document.getElementById("search");

let students = [];

// Bazadan talabalarni yuklash
async function loadStudents() {
    try {
        const response = await fetch("/api/talabalar");

        if (!response.ok) {
            throw new Error("Ma'lumotlarni yuklashda xatolik");
        }

        students = await response.json();
        renderStudents(students);

    } catch (error) {
        console.error(error);
        studentList.innerHTML =
            '<tr><td colspan="3">Ma’lumotlarni yuklab bo‘lmadi.</td></tr>';
    }
}

// Jadvalga chiqarish
function renderStudents(data) {
    studentList.innerHTML = "";

    totalStudents.textContent = data.length;

    if (data.length === 0) {
        studentList.innerHTML =
            '<tr><td colspan="3">Talabalar topilmadi.</td></tr>';
        return;
    }

    data.forEach((student) => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = student.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = student.ism;

        const groupCell = document.createElement("td");
        groupCell.textContent = student.guruh;

        row.append(idCell, nameCell, groupCell);
        studentList.appendChild(row);
    });
}

// Yangi talaba qo‘shish
studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const ism = document.getElementById("ism").value.trim();
    const guruh = document.getElementById("guruh").value.trim();

    if (!ism || !guruh) {
        alert("Barcha maydonlarni to‘ldiring!");
        return;
    }

    try {
        const response = await fetch("/api/talabalar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ism, guruh })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Talabani qo‘shib bo‘lmadi");
        }

        studentForm.reset();
        await loadStudents();

        alert("Talaba muvaffaqiyatli qo‘shildi!");

    } catch (error) {
        alert(error.message);
    }
});

// Qidiruv
searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();

    const filteredStudents = students.filter((student) =>
        student.ism.toLowerCase().includes(searchText) ||
        student.guruh.toLowerCase().includes(searchText)
    );

    renderStudents(filteredStudents);
});

// Sahifa ochilganda ma'lumotlarni yuklash
loadStudents();
